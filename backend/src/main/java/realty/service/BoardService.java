package realty.service;

import lombok.RequiredArgsConstructor;
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
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
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
     * 게시글 상세 정보를 조회하고, 조회수를 1 증가시킵니다.
     */
    @Transactional
    public PostDetailResponseDTO findPostById(Long postId, Long currentUserId) {
        log.info("Finding post by id: {} for user: {}", postId, currentUserId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));

        post.incrementViews();

        User user = new User(currentUserId); // Proxy user for existence check
        boolean likedByMe = postLikeRepository.existsByPostAndUser(post, user);

        return mapToPostDetailDTO(post, likedByMe);
    }

    /**
     * 새 게시글을 생성합니다.
     */
    public PostDetailResponseDTO createPost(PostCreateRequestDTO requestDTO, Long currentUserId) {
        log.info("Creating post with title '{}' by user {}", requestDTO.getTitle(), currentUserId);
        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + currentUserId));

        Post post = Post.builder()
                .boardType(Post.BoardType.valueOf(requestDTO.getBoard().toUpperCase()))
                .title(requestDTO.getTitle())
                .content(requestDTO.getContent())
                .tags(requestDTO.getTags() != null ? String.join(",", requestDTO.getTags()) : null)
                .author(author)
                .build();

        Post savedPost = postRepository.save(post);
        log.info("Successfully created post with id: {}", savedPost.getId());
        return mapToPostDetailDTO(savedPost, false);
    }

    /**
     * 게시글을 수정합니다. 작성자 본인만 수정할 수 있도록 권한 검사가 필요합니다.
     */
    public PostDetailResponseDTO updatePost(Long postId, PostUpdateRequestDTO requestDTO, Long currentUserId) {
        log.info("Updating post {} with title '{}' by user {}", postId, requestDTO.getTitle(), currentUserId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getUserSeq().equals(currentUserId)) {
            log.warn("User {} attempted to update post {} owned by {}", currentUserId, postId, post.getAuthor().getUserSeq());
            boolean likedByMe = postLikeRepository.existsByPostAndUser(post, new User(currentUserId));
            return mapToPostDetailDTO(post, likedByMe); // Return original post without updating
        }

        post.update(requestDTO.getTitle(), requestDTO.getContent(), requestDTO.getTags() != null ? String.join(",", requestDTO.getTags()) : null);
        Post updatedPost = postRepository.save(post);

        User user = new User(currentUserId);
        boolean likedByMe = postLikeRepository.existsByPostAndUser(updatedPost, user);
        return mapToPostDetailDTO(updatedPost, likedByMe);
    }

    /**
     * 게시글을 삭제합니다. 작성자 본인만 삭제할 수 있도록 권한 검사가 필요합니다.
     */
    public void deletePost(Long postId, Long currentUserId) {
        log.info("Deleting post {} by user {}", postId, currentUserId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getUserSeq().equals(currentUserId)) {
            log.warn("User {} attempted to delete post {} owned by {}", currentUserId, postId, post.getAuthor().getUserSeq());
            return;
        }
        postRepository.delete(post);
        log.info("Successfully deleted post with id: {}", postId);
    }

    public LikeResponseDTO likePost(Long postId, Long currentUserId) {
        log.info("User {} liked post {}", currentUserId, postId);
        Post post = postRepository.findById(postId).orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (postLikeRepository.existsByPostAndUser(post, user)) {
            log.warn("User {} already liked post {}", currentUserId, postId);
            return new LikeResponseDTO((int) postLikeRepository.countByPost(post), true);
        }

        PostLike like = PostLike.builder().post(post).user(user).build();
        postLikeRepository.save(like);
        return new LikeResponseDTO((int) postLikeRepository.countByPost(post), true);
    }

    public LikeResponseDTO unlikePost(Long postId, Long currentUserId) {
        log.info("User {} unliked post {}", currentUserId, postId);
        Post post = postRepository.findById(postId).orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        postLikeRepository.deleteByPostAndUser(post, user);
        return new LikeResponseDTO((int) postLikeRepository.countByPost(post), false);
    }

    public CommentResponseDTO addComment(Long postId, CommentCreateRequestDTO requestDTO, Long currentUserId) {
        log.info("User {} commented on post {}", currentUserId, postId);
        Post post = postRepository.findById(postId).orElseThrow(() -> new EntityNotFoundException("Post not found"));
        User author = userRepository.findById(currentUserId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .author(author)
                .content(requestDTO.getContent())
                .build();
        CommunityComment savedComment = commentRepository.save(comment);
        return mapToCommentDTO(savedComment);
    }

    public CommentResponseDTO updateComment(Long commentId, CommentUpdateRequestDTO requestDTO, Long currentUserId) {
        log.info("User {} updated comment {}", currentUserId, commentId);
        CommunityComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getUserSeq().equals(currentUserId)) {
            log.warn("User {} attempted to update comment {} owned by {}", currentUserId, commentId, comment.getAuthor().getUserSeq());
            return mapToCommentDTO(comment);
        }

        comment.setContent(requestDTO.getContent());
        return mapToCommentDTO(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId, Long currentUserId) {
        log.info("User {} deleted comment {}", currentUserId, commentId);
        CommunityComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getUserSeq().equals(currentUserId)) {
            log.warn("User {} attempted to delete comment {} owned by {}", currentUserId, commentId, comment.getAuthor().getUserSeq());
            return;
        }

        comment.setDeleted(true);
        commentRepository.save(comment);
        log.info("Soft-deleted comment with id: {}", commentId);
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
                post.getAuthor().getUserCode(),
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
                comment.getAuthor().getUserCode(),
                formatDate(comment.getCreatedAt()),
                comment.getContent()
        );
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
    }
}
