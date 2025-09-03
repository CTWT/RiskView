package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/*
 * 수업명 : 가비아 2회차
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.09.03
 * 파일명 : BoardDTOs.java
 */

/**
 * @file BoardDtos.java
 * @description 게시판 기능에서 사용되는 DTO(Data Transfer Object)들을 정의한 클래스
 */
public class BoardDTOs {

    /**
     * 게시글 목록 조회 응답 DTO
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PostListResponseDTO {
        private Long id;
        private String board; // "free", "support"
        private String type; // "인기", "정보", "질문", ""
        private String title;
        private String author;
        private String date; // "YYYY.MM.DD"
        private int views;
        private int likes;
        private int comments;
        private boolean hasAttachment;
    }

    /**
     * 게시글 상세 조회 응답 DTO
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PostDetailResponseDTO {
        private Long id;
        private String board;
        private String title;
        private String author;
        private String authorId;
        private String date;
        private String content;
        private int views;
        private int likes;
        private boolean likedByMe;
        private List<String> tags;
        private List<CommentResponseDTO> comments;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CommentResponseDTO {
        private Long id;
        private String author;
        private String authorId;
        private String date;
        private String content;
    }

    @Data
    public static class PostCreateRequestDTO {
        private String board;
        private String title;
        private String content;
        private List<String> tags;
    }

    @Data
    public static class PostUpdateRequestDTO {
        private String title;
        private String content;
        private List<String> tags;
    }

    @Data public static class CommentCreateRequestDTO { private String content; }
    @Data public static class CommentUpdateRequestDTO { private String content; }

    @Data @AllArgsConstructor public static class LikeResponseDTO { private int likes; private boolean likedByMe; }

    @Data @AllArgsConstructor public static class PostSearchCondition {
        private String board; private String searchCategory; private String searchQuery;
        private String period; private String sortBy;
    }
}
