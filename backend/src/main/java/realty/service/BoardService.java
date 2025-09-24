package realty.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import realty.apicommunication.FileComponent;
import realty.domain.dto.PostSentimentAnalysisDTO;
import realty.domain.dto.BoardDTOs.*;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.ContractDTO.FileStorageMetadataDTO;
import realty.domain.model.CommunityComment;
import realty.domain.model.FileStorageMetadata;
import realty.domain.model.Post;
import realty.domain.model.PostLike;
import realty.domain.model.PostSentimentAnalysis;
import realty.domain.model.User;
import realty.domain.repository.CommunityCommentRepository;
import realty.domain.repository.FileStorageMetadataRepository;
import realty.domain.repository.PostLikeRepository;
import realty.domain.repository.PostRepository;
import realty.domain.repository.PostSentimentAnalysisRepository;
import realty.domain.repository.UserRepository;
import realty.exception.AccessDeniedException;
import jakarta.persistence.EntityNotFoundException;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : BoardService.java
 */

/**
 * @file BoardService.java
 * @description 커뮤니티 게시판 기능의 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);

    private final PostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;
    private final FileComponent fileComponent;
    private final ContractService contractService;
    private final FileStorageMetadataRepository fileStorageMetadataRepository;
    private final PostSentimentAnalysisRepository postSentimentAnalysisRepository;
    private final RestTemplate restTemplate;

    /**
     * 게시글 목록을 조건에 따라 조회합니다.
     */
    @Transactional(readOnly = true)
    public Page<PostListResponseDTO> findPosts(PostSearchCondition condition, Pageable pageable) {
        logger.info("Searching for posts with condition: {} and pageable: {}", condition, pageable);
        Page<Post> postPage = postRepository.findAll(PostSpecifications.withCondition(condition), pageable);
        logger.info("Found {} posts from DB for page {}", postPage.getNumberOfElements(), pageable.getPageNumber());
        Page<PostListResponseDTO> dtoPage = postPage.map(post -> {
                                            String postType = calculatePostType(post); // 조회 시점 계산
                                            return mapToPostListDTO(post, postType);
                                    });

        return dtoPage;
    }

    private String calculatePostType(Post post) {
        int likeWeight = post.getLikesCount() * 3;
        int commentWeight = post.getCommentsCount() * 2;
        int viewWeight = post.getViews();

        int totalScore = likeWeight + commentWeight + viewWeight;

        if(totalScore >= 1000) return "인기";
        else return post.getPostType();
    }

    /**
     * 게시글 상세 정보를 조회합니다.
     */
    @Transactional
    public PostDetailResponseDTO getPostDetailResponseDTOByPostIdAndUserCode(Long postId, String userCode) {
        Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new EntityNotFoundException("Post not found with postId: " + postId));

        String postCode = post.getPostCode();
        boolean likedByMe = postLikeRepository.existsByPostCodeAndUserCode(postCode, userCode);
        return mapToPostDetailDTO(post, likedByMe);
    }

    /**
     * 새 게시글을 생성합니다.
     */
    @Transactional
    public PostDetailResponseDTO createPost(PostCreateRequestDTO requestDTO, String currentUserCode) {
        logger.info("Creating post with title '{}' by userCode {}", requestDTO.getTitle(), currentUserCode);
        User author = userRepository.findByUserCode(currentUserCode)
                .orElseThrow(() -> new EntityNotFoundException("User not found with code: " + currentUserCode));

        logger.info("user_code: {}", author.getUserCode());


        Post post = Post.builder()
                .postCode("not-set")
                .boardType(Post.BoardType.valueOf(requestDTO.getBoard().toUpperCase()))
                .postType(requestDTO.getPostType())
                .title(requestDTO.getTitle())
                .content("not-set")
                .tags(requestDTO.getTags() != null ? String.join(",", requestDTO.getTags()) : null)
                .author(author)
                .build();

        Post savedEntity = postRepository.save(post);
        postRepository.flush();

        String generatedCode = "P" + String.format("%08d", savedEntity.getId());
        savedEntity.setPostCode(generatedCode);

        String saveHTML = requestDTO.getContent();
        saveHTML = uploadImageBase64ToURL(saveHTML, generatedCode);
        logger.info("저장 HTML : {}", saveHTML);
        savedEntity.setContent(saveHTML);

        Post resultEntity = postRepository.save(savedEntity);
        logger.info("resultPostEntity : {}", resultEntity);
        logger.info("Successfully created post with code: {}", resultEntity.getPostCode());

        PostDetailResponseDTO response = mapToPostDetailDTO(resultEntity, false);
        logger.info("PostDetailResponseDTO response : {}", response);
        return response;
    }

   /**
     * 게시글 수정/작성 시 content 내 base64 이미지를 서버에 저장하고 URL로 변환
     * 기존 URL 이미지는 그대로 유지
     */
    private String uploadImageBase64ToURL(String content, String entityCode) {
        try {
            // <img> 태그 찾기
            Pattern pattern = Pattern.compile("<img[^>]+src=\"([^\"]+)\"[^>]*>");
            Matcher matcher = pattern.matcher(content);

            while (matcher.find()) {
                String imgTag = matcher.group();
                String src = matcher.group(1);

                // 이미 URL이면 건너뛰기
                if (src.startsWith("http") || src.startsWith(fileComponent.getPathURL())) {
                    continue;
                }

                // alt 추출 (없으면 기본 파일명)
                Matcher altMatcher = Pattern.compile("alt=\"([^\"]+)\"").matcher(imgTag);
                String fileName = altMatcher.find() ? altMatcher.group(1)
                        : entityCode + "_" + System.currentTimeMillis() + ".png";
                String safeFileName = fileName.replace(" ", "_");

                // base64 분리
                String[] parts = src.split(",");
                if (parts.length != 2) continue;

                String mimeTypePart = parts[0]; // data:image/png;base64
                String imageString = parts[1];

                String fileType = mimeTypePart.split(";")[0].replace("data:", "");

                byte[] imageBytes = Base64.getDecoder().decode(imageString);
                int fileSizeKb = (int) (imageBytes.length / 1024);

                // 파일 URL 생성
                String storedPath = fileComponent.getStoredPath();

                // 파일 메타데이터 저장
                FileStorageMetadataDTO fileStorageMetadataDTO = FileStorageMetadataDTO.builder()
                        .fileSizeKb(fileSizeKb)
                        .fileType(fileType)
                        .originalName(safeFileName)
                        .storedPath(storedPath)
                        .isEncrypted(false)
                        .build();

                logger.info("originalName : {}", safeFileName);

                String resultFilename = contractService.fileStorageMetadataSave(fileStorageMetadataDTO, entityCode);
                String fileUrl = fileComponent.getPathURL() + resultFilename;

                // 실제 파일 저장
                Path path = Paths.get(storedPath, resultFilename);
                Files.write(path, imageBytes);

                // content 내 base64 -> URL로 교체
                content = content.replace(src, fileUrl);
            }
        } catch (Exception e) {
            logger.error("이미지 업로드 중 오류 발생", e);
        }

        return content;
    }


    /**
     * 게시글을 수정합니다. 작성자 본인만 수정할 수 있도록 권한 검사가 필요합니다.
     */
    public PostDetailResponseDTO updatePost(PostUpdateRequestDTO requestDTO, String postCode, String currentUserCode) {
            Post post = getPostByCode(postCode);

            logger.info("requestDTO 확인 : {}", requestDTO.getContent());

            if(false == post.getAuthor().getUserCode().equals(currentUserCode)){
                throw new AccessDeniedException("게시글 작성자만 수정할 수 있습니다.");
            }

            clearPreviousFile(postCode, requestDTO.getContent());
            String content = uploadImageBase64ToURL(requestDTO.getContent(), postCode);

            post.setTitle(requestDTO.getTitle());
            post.setContent(content);
            post.setPostType(requestDTO.getPostType());
            post.setTags(String.join(",", requestDTO.getTags()));

            boolean likedByMe = postLikeRepository.existsByPostCodeAndUserCode(postCode, currentUserCode);
            
            return mapToPostDetailDTO(post, likedByMe);
    }
	
    /**
     * 게시글을 삭제합니다. 작성자 본인만 삭제할 수 있도록 권한 검사가 필요합니다.
     */
    @Transactional
    public void deletePost(String postCode, String currentUserCode) {
        Post post = getPostByCode(postCode);

        if(post == null) {
            throw new EntityNotFoundException("User not found with code: " + currentUserCode);
        }

        if(false == post.getAuthor().getUserCode().equals(currentUserCode)){
            throw new AccessDeniedException("게시글 작성자만 수정할 수 있습니다.");
        }
        postLikeRepository.findByPostCode(postCode).stream().forEach(postLike -> {postLikeRepository.delete(postLike);});
        commentRepository.findByPost(post).stream().forEach(comment -> {commentRepository.delete(comment);});

        deleteRelativeFile(postCode);
        postRepository.delete(post);
    }

    public LikeResponseDTO likePost(String postCode, String currentUserCode) {
        PostLike postLike = PostLike.builder()
                                    .postCode(postCode)
                                    .userCode(currentUserCode)
                                    .build();

        postLikeRepository.save(postLike);

        long likes = postLikeRepository.countByPostCode(postCode);
        boolean likedByMe = true;

        return LikeResponseDTO.builder()
                        .likes((int)likes)
                        .likedByMe(likedByMe)
                        .build();


    }

    public LikeResponseDTO unlikePost(String postCode, String currentUserCode) {
        postLikeRepository.deleteByPostCodeAndUserCode(postCode, currentUserCode);

        long likes = postLikeRepository.countByPostCode(postCode);
        boolean likedByMe = false;

        return LikeResponseDTO.builder()
                        .likes((int)likes)
                        .likedByMe(likedByMe)
                        .build(); 
    }

    @Transactional
    public CommentResponseDTO addComment(CommentCreateRequestDTO requestDTO, String postCode, String currentUserCode) {
        Post post = getPostByCode(postCode);
        User user = userRepository.findByUserCode(currentUserCode).orElseThrow(
                            () -> new EntityNotFoundException("Post not found with currentUserCode: " + currentUserCode));
        
        CommunityComment communityComment = CommunityComment.builder()
                                                        .post(post)
                                                        .author(user)
                                                        .commentCode("not-set")
                                                        .content(requestDTO.getContent())
                                                        .build();   

        commentRepository.save(communityComment);

        return mapToCommentDTO(communityComment);
    }

    public CommentResponseDTO updateComment(CommentUpdateRequestDTO requestDTO, String postCode, String commentCode, String userCode) {
        Post post = getPostByCode(postCode);
        if(false == post.getAuthor().getUserCode().equals(userCode)) {
            throw new AccessDeniedException("게시글 작성자만 수정할 수 있습니다.");
         }

        CommunityComment communityComment = getCommunityCommentByCommentCode(commentCode);
        communityComment.setContent(requestDTO.getContent());

        return mapToCommentDTO(communityComment);
    }

    public void deleteComment(Long commentId) {
        CommunityComment communityComment = commentRepository.findById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));
        commentRepository.delete(communityComment);
    }

    @Transactional(readOnly = true)
    public List<MyPostResponseDTO> findMyPosts(String userCode) {
        User user = userRepository.findByUserCode(userCode)
                .orElseThrow(() -> new EntityNotFoundException("User not found with code: " + userCode));
        List<Post> posts = postRepository.findByAuthor(user);
        return posts.stream()
                .map(this::mapToMyPostResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MyCommentResponseDTO> findMyComments(String userCode) {
        User user = userRepository.findByUserCode(userCode)
                .orElseThrow(() -> new EntityNotFoundException("User not found with code: " + userCode));
        List<CommunityComment> comments = commentRepository.findByAuthor(user);
        return comments.stream()
                .map(this::mapToMyCommentResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MyLikedPostResponseDTO> findMyLikedPosts(String userCode) {
        List<PostLike> likedPosts = postLikeRepository.findByUserCode(userCode);
        List<String> postCodes = likedPosts.stream()
                .map(PostLike::getPostCode)
                .collect(Collectors.toList());

        if (postCodes.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<Post> posts = postRepository.findByPostCodeIn(postCodes);
        return posts.stream()
                .map(this::mapToMyLikedPostResponseDTO)
                .collect(Collectors.toList());
    }

    // --- Mapper-like helper methods ---
    private PostListResponseDTO mapToPostListDTO(Post post, String postType) {
        return new PostListResponseDTO(
                post.getId(),
                post.getBoardType().name().toLowerCase(),
                postType,
                post.getTitle(),
                post.getAuthor().getUserNickname(),
                formatDate(post.getCreatedAt()),
                post.getViews(),
                post.getLikesCount(),
                post.getCommentsCount()
        );
    }

    private PostDetailResponseDTO mapToPostDetailDTO(Post post, boolean likedByMe) {
        return new PostDetailResponseDTO(
                post.getId(),
                post.getBoardType().name().toLowerCase(),
                post.getTitle(),
                post.getAuthor().getUserNickname(),
                post.getAuthor().getUserId(),
                formatDate(post.getCreatedAt()),
                post.getContent(),
                post.getViews(),
                post.getLikesCount(),
                likedByMe,
                post.getTags() != null ? Arrays.asList(post.getTags().split(",")) : java.util.Collections.emptyList(),
                post.getComments().stream().map(this::mapToCommentDTO).collect(Collectors.toList())
        );
    }

    private CommentResponseDTO mapToCommentDTO(CommunityComment comment) {
        return new CommentResponseDTO(
                comment.getId(),
                comment.getAuthor().getUserNickname(),
                comment.getAuthor().getUserId(),
                formatDate(comment.getCreatedAt()),
                comment.getContent()
        );
    }

    private MyPostResponseDTO mapToMyPostResponseDTO(Post post) {
        return new MyPostResponseDTO(
                post.getId(),
                post.getTitle(),
                formatDate(post.getCreatedAt()),
                post.getLikesCount(),
                post.getCommentsCount()
        );
    }

    private MyCommentResponseDTO mapToMyCommentResponseDTO(CommunityComment comment) {
        return new MyCommentResponseDTO(
                comment.getId(),
                comment.getContent(),
                comment.getPost().getTitle(),
                formatDate(comment.getCreatedAt()),
                comment.getPost().getId()
        );
    }

    private MyLikedPostResponseDTO mapToMyLikedPostResponseDTO(Post post) {
        return new MyLikedPostResponseDTO(
                post.getId(),
                post.getTitle(),
                post.getAuthor().getUserNickname(),
                formatDate(post.getCreatedAt()),
                post.getLikesCount(),
                post.getCommentsCount()
        );
    }

    // 게시물의 조회수를 1 올립니다.
    public void PostViewIncrease(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(
            () -> new EntityNotFoundException("Post not found with postId: " + postId));
        post.incrementViews();
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
    }

    public String getPostCodeById(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(
            () -> new EntityNotFoundException("Post not found with postId: " + postId));

        return post.getPostCode();
    }

    public Post getPostByCode(String postCode) {
        Post post = postRepository.findByPostCode(postCode).orElseThrow(
            () -> new EntityNotFoundException("Post not found with postCode: " + postCode));

        return post;
    }

    public CommunityComment getCommunityCommentById(Long commentId){
        CommunityComment communityComment =  commentRepository.findById(commentId).orElseThrow(
            ()-> new EntityNotFoundException("CommunityComment not found with CommentId: " + commentId)
        );

        return communityComment;
    }

    public CommunityComment getCommunityCommentByCommentCode(String commentCode){
        CommunityComment communityComment =  commentRepository.findByCommentCode(commentCode).orElseThrow(
            ()-> new EntityNotFoundException("CommunityComment not found with commentCode: " + commentCode)
        );

        return communityComment;
    }

    /**
     * 사용자 활동 요약 정보 조회
     * @param userCode 사용자 코드
     * @return 게시글, 댓글, 좋아요 수
     */
    public Map<String, Long> getActivitySummary(String userCode) {
        logger.debug("사용자 활동 요약 조회 시작. userCode: {}", userCode);
        long postCount = postRepository.countByAuthorUserCode(userCode);
        long commentCount = commentRepository.countByAuthorUserCode(userCode);
        long likeCount = postLikeRepository.countByUserCode(userCode);

        Map<String, Long> summary = new HashMap<>();
        summary.put("postCount", postCount);
        summary.put("commentCount", commentCount);
        summary.put("likeCount", likeCount);
        return summary;
    }

    public Path getPath(String fileName) {
        return fileComponent.getPath(fileName);
    }

    /**
     * 기존 파일 삭제: content에서 사용 중인 파일은 유지
     */
    public void clearPreviousFile(String postCode, String content) {
        List<FileStorageMetadata> fileStorageMetadatas = fileStorageMetadataRepository.findByEntityCode(postCode);

        for (FileStorageMetadata fileStorageMetadata : fileStorageMetadatas) {
            String fileUrl = fileComponent.getPathURL() + fileStorageMetadata.getOriginalName();

            // content에 사용 중이면 삭제하지 않음
            if (content.contains(fileUrl)) {
                continue;
            }

            String filePath = fileComponent.getStoredPath() + "\\" + fileStorageMetadata.getOriginalName();
            logger.info("삭제 시도: {}", filePath);

            File file = new File(filePath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (!deleted) {
                    logger.warn("파일 삭제 실패: {}", filePath);
                }
            }

            // DB에서도 삭제
            fileStorageMetadataRepository.delete(fileStorageMetadata);
        }
    }

    public void deleteRelativeFile(String postCode) {
        List<FileStorageMetadata> fileStorageMetadatas = fileStorageMetadataRepository.findByEntityCode(postCode);

        for (FileStorageMetadata fileStorageMetadata : fileStorageMetadatas) {
            String filePath = fileComponent.getStoredPath() + "\\"+ fileStorageMetadata.getOriginalName();
            logger.info("파일 삭제 시도: {}", filePath);

            File file = new File(filePath);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (!deleted) {
                    // 삭제 실패 시 로깅
                    String errorLog = "파일 삭제 실패: " + filePath;
                    logger.info(errorLog);
                }
            } else {
                logger.info("파일이 존재하지 않습니다: {}", filePath);
            }
        }

        // DB에서도 해당 entityCode 레코드 삭제
        fileStorageMetadataRepository.deleteByEntityCode(postCode);
    }

    public PostSentimentAnalysisDTO getPostSentimentAnalysisByPostCode(String postCode) {
        PostSentimentAnalysis postSentimentAnalysis = postSentimentAnalysisRepository.findByPostCode(postCode)
                                                            .orElseThrow(() -> new EntityNotFoundException("PostSentimentAnalysis not found with postCode: " + postCode));

        return PostSentimentAnalysisDTO.builder()
                                        .analyzedAt(postSentimentAnalysis.getAnalyzedAt())
                                        .sentimentCategory(postSentimentAnalysis.getSentimentCategory())
                                        .sentimentEmoji(postSentimentAnalysis.getSentimentEmoji())
                                        .sentimentScore(postSentimentAnalysis.getSentimentScore())
                                        .summary(postSentimentAnalysis.getSummary())
                                        .build();
                                        
    }

    public void sentimentAnalyze() {
        logger.info("FastAPI post_emotion_analysis 트리거를 활성화합니다.");
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", "post_emotion_analysis");
        restTemplate.postForEntity("http://localhost:8000/trigger", triggerBody, Void.class);


        restTemplate.exchange("http://localhost:8000/post_emotion_analysis", HttpMethod.POST, null, Void.class);
    }

    public void deleteSentimentAnalysis(String postCode) {
        postSentimentAnalysisRepository.deleteByPostCode(postCode);
    }

    public void updateSentimentAnalysis(String postCode) {
        deleteSentimentAnalysis(postCode);
        sentimentAnalyze();
    }
}
