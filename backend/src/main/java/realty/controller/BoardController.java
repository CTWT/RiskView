package realty.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import realty.domain.dto.BoardDTOs.CommentResponseDTO;
import realty.domain.dto.BoardDTOs.PostListResponseDTO;
import realty.domain.dto.BoardDTOs.PostDetailResponseDTO;
import realty.domain.dto.BoardDTOs.PostSearchCondition;
import realty.domain.dto.BoardDTOs.PostCreateRequestDTO;
import realty.domain.dto.BoardDTOs.PostUpdateRequestDTO;
import realty.domain.dto.BoardDTOs.LikeResponseDTO;
import realty.domain.dto.BoardDTOs.CommentCreateRequestDTO;
import realty.domain.dto.BoardDTOs.CommentUpdateRequestDTO;
import realty.service.BoardService;
import java.net.URI;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : BoardController.java
 */

/**
 * @file BoardController.java
 * @description 커뮤니티 게시판 기능의 API 엔드포인트를 담당하는 컨트롤러
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class BoardController {

    private static final Logger log = LoggerFactory.getLogger(BoardController.class);

    private final BoardService boardService;

    /**
     * 게시글 목록을 조건에 따라 조회합니다 (검색, 필터링, 정렬, 페이지네이션).
     * @param board 게시판 구분 ('free', 'support')
     * @param searchCategory 검색 카테고리 ('title', 'content', 'author')
     * @param searchQuery 검색어
     * @param period 기간 필터 ('1w', '1m', '3m')
     * @param sortBy 정렬 기준 ('latest', 'likes', 'views')
     * @param pageable 페이지 정보
     * @return 페이징된 게시글 목록.
     */
    @GetMapping
    public ResponseEntity<Page<PostListResponseDTO>> getPosts(
            @RequestParam(defaultValue = "free") String board,
            @RequestParam(required = false) String searchCategory,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(name="period", required = false, defaultValue = "전체 기간") String period,
            @RequestParam(defaultValue = "최신순") String sortBy,
            Pageable pageable) {

        log.info("API: getPosts - board={}, category={}, query={}, period={}, sortBy={}, pageable={}", board, searchCategory, searchQuery, period, sortBy, pageable);

        Sort sort;
        switch (sortBy) {
            case "인기순":
                sort = Sort.by(Sort.Direction.DESC, "likesCount");
                break;
            case "조회순":
                sort = Sort.by(Sort.Direction.DESC, "views");
                break;
            case "최신순":
            default:
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        PostSearchCondition condition = new PostSearchCondition(board, searchCategory, searchQuery, period, sortBy);
        log.debug("Constructed PostSearchCondition: {}", condition);
        Page<PostListResponseDTO> posts = boardService.findPosts(condition, sortedPageable);
        log.info("Returning {} posts for page {}", posts.getNumberOfElements(), sortedPageable.getPageNumber());
        return ResponseEntity.ok(posts);
    }

    /**
     * 특정 ID의 게시글 상세 정보를 조회합니다.
     * @param id 게시글 ID
     * @return 게시글 상세 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostDetailResponseDTO> getPostById(@PathVariable Long id) {
        log.info("API: getPostById - id={}", id);
        Long currentUserId = 1L; // Placeholder for testing
        PostDetailResponseDTO post = boardService.findPostById(id, currentUserId);
        log.info("Found post: {}", post.getTitle());
        return ResponseEntity.ok(post);
    }

    /**
     * 새 게시글을 생성합니다.
     * @param requestDTO 게시글 생성 요청 데이터
     * @return 생성된 게시글 상세 정보
     */
    @PostMapping
    public ResponseEntity<PostDetailResponseDTO> createPost(@RequestBody PostCreateRequestDTO requestDTO) {
        log.info("API: createPost - title='{}'", requestDTO.getTitle());
        Long currentUserId = 1L; // Placeholder for testing
        PostDetailResponseDTO createdPost = boardService.createPost(requestDTO, currentUserId);
        log.info("Post created with ID: {}", createdPost.getId());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdPost.getId())
                .toUri();
        log.debug("New post location URI: {}", location);
        return ResponseEntity.created(location).body(createdPost);
    }

    /**
     * 기존 게시글을 수정합니다.
     * @param id 수정할 게시글 ID
     * @param requestDTO 게시글 수정 요청 데이터
     * @return 수정된 게시글 상세 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostDetailResponseDTO> updatePost(@PathVariable Long id, @RequestBody PostUpdateRequestDTO requestDTO) {
        log.info("API: updatePost - id={}, title='{}'", id, requestDTO.getTitle());
        Long currentUserId = 1L; // Placeholder for testing, will be replaced by authenticated user's ID
        PostDetailResponseDTO updatedPost = boardService.updatePost(id, requestDTO, currentUserId);
        log.info("Post with ID: {} updated successfully", id);
        return ResponseEntity.ok(updatedPost);
    }

    /**
     * 게시글을 삭제합니다.
     * @param id 삭제할 게시글 ID
     * @return 응답 없음 (204 No Content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        log.info("API: deletePost - id={}", id);
        Long currentUserId = 1L; // Placeholder for testing
        boardService.deletePost(id, currentUserId);
        log.info("Post with ID: {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 게시글에 좋아요를 추가합니다.
     * @param id 게시글 ID
     * @return 업데이트된 좋아요 정보
     */
    @PostMapping("/{id}/likes")
    public ResponseEntity<LikeResponseDTO> likePost(@PathVariable Long id) {
        log.info("API: likePost - id={}", id);
        Long currentUserId = 1L; // Placeholder for testing
        LikeResponseDTO response = boardService.likePost(id, currentUserId);
        log.info("Post {} liked. Total likes: {}", id, response.getLikes());
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 좋아요를 취소합니다.
     * @param id 게시글 ID
     * @return 업데이트된 좋아요 정보
     */
    @DeleteMapping("/{id}/likes")
    public ResponseEntity<LikeResponseDTO> unlikePost(@PathVariable Long id) {
        log.info("API: unlikePost - id={}", id);
        Long currentUserId = 1L; // Placeholder for testing
        LikeResponseDTO response = boardService.unlikePost(id, currentUserId);
        log.info("Post {} unliked. Total likes: {}", id, response.getLikes());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(@PathVariable Long id, @RequestBody CommentCreateRequestDTO requestDTO) {
        log.info("API: addComment - postId={}", id);
        Long currentUserId = 1L; // Placeholder for testing
        CommentResponseDTO createdComment = boardService.addComment(id, requestDTO, currentUserId);
        log.info("Comment added to post {} with new commentId {}", id, createdComment.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(@PathVariable Long id, @PathVariable Long commentId, @RequestBody CommentUpdateRequestDTO requestDTO) {
        log.info("API: updateComment - postId={}, commentId={}", id, commentId);
        Long currentUserId = 1L; // Placeholder for testing
        CommentResponseDTO updatedComment = boardService.updateComment(commentId, requestDTO, currentUserId);
        log.info("Comment {} on post {} updated successfully", commentId, id);
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @PathVariable Long commentId) {
        log.info("API: deleteComment - postId={}, commentId={}", id, commentId);
        Long currentUserId = 1L; // Placeholder for testing
        boardService.deleteComment(commentId, currentUserId);
        log.info("Comment {} on post {} deleted successfully", commentId, id);
        return ResponseEntity.noContent().build();
    }
}
