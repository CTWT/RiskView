package realty.domain.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.25
 * 파일명 : LawKeywordDTO.java
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawKeywordDTO {
    private String lawKeyword;
    private String lawKeywordDescription;
    private String lawKeywordCategory;
    private String lawReferenceName;
    private String lawReferenceUrl;
}
