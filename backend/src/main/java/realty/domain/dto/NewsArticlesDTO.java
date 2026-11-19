package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.07.28
 * 파일명 : NewsArticlesDTO.java
 */

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NewsArticlesDTO {
    private Long id; // 뉴스 기사 ID
    private String title; // 뉴스 기사 제목
    private String content; // 뉴스 기사 내용
    private String siteName; // 뉴스 출처
    private String publishedAt; // 뉴스 게시일
}