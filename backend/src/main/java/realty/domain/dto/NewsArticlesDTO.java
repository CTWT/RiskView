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
    private Long id;
    private String title;
    private String content;
    private String date;
}