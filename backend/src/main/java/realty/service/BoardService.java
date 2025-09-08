package realty.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import org.springframework.data.domain.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import realty.domain.dto.BoardDTOs.*;
import realty.domain.model.CommunityComment;
import realty.domain.model.Post;
import realty.domain.model.PostLike;
import realty.domain.model.User;
import realty.domain.repository.CommunityCommentRepository;
import realty.domain.repository.PostLikeRepository;
import realty.domain.repository.PostRepository;
import realty.domain.repository.UserRepository;
import realty.exception.AccessDeniedException;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
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

    private static final Logger log = LoggerFactory.getLogger(BoardService.class);

    private final PostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;

    /**
     * 게시글 목록을 조건에 따라 조회합니다.
     */
    @Transactional(readOnly = true)
    public Page<PostListResponseDTO> findPosts(PostSearchCondition condition, Pageable pageable) {
        log.info("Searching for posts with condition: {} and pageable: {}", condition, pageable);
        Page<Post> postPage = postRepository.findAll(PostSpecifications.withCondition(condition), pageable);
        log.info("Found {} posts from DB for page {}", postPage.getNumberOfElements(), pageable.getPageNumber());
        return postPage.map(this::mapToPostListDTO);
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
        log.info("Creating post with title '{}' by userCode {}", requestDTO.getTitle(), currentUserCode);
        User author = userRepository.findByUserCode(currentUserCode)
                .orElseThrow(() -> new EntityNotFoundException("User not found with code: " + currentUserCode));

        log.info("user_code: {}", author.getUserCode());

        Post post = Post.builder()
                .postCode("not-set")
                .boardType(Post.BoardType.valueOf(requestDTO.getBoard().toUpperCase()))
                .title(requestDTO.getTitle())
                .content(requestDTO.getContent())
                .tags(requestDTO.getTags() != null ? String.join(",", requestDTO.getTags()) : null)
                .author(author)
                .build();

        Post savedEntity = postRepository.save(post);
        postRepository.flush();

        String generatedCode = "P" + String.format("%08d", savedEntity.getId());
        savedEntity.setPostCode(generatedCode);

        Post resultEntity = postRepository.save(savedEntity);
        
        log.info("Successfully created post with code: {}", resultEntity.getPostCode());
        return mapToPostDetailDTO(resultEntity, false);
    }

    /**
     * 게시글을 수정합니다. 작성자 본인만 수정할 수 있도록 권한 검사가 필요합니다.
     */
    public PostDetailResponseDTO updatePost(PostUpdateRequestDTO requestDTO, String postCode, String currentUserCode) {
            Post post = getPostByCode(postCode);

            if(false == post.getAuthor().getUserCode().equals(currentUserCode)){
                throw new AccessDeniedException("게시글 작성자만 수정할 수 있습니다.");
            }

            post.setTitle(requestDTO.getTitle());
            post.setContent(requestDTO.getContent());
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

    // --- Mapper-like helper methods ---
    private PostListResponseDTO mapToPostListDTO(Post post) {
        return new PostListResponseDTO(
                post.getId(),
                post.getBoardType().name().toLowerCase(),
                post.getPostType(),
                post.getTitle(),
                post.getAuthor().getUserNickname(),
                formatDate(post.getCreatedAt()),
                post.getViews(),
                post.getLikesCount(),
                post.getCommentsCount(),
                post.isHasAttachment()
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
}
