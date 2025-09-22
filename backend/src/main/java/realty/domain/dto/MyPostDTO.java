package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.22
 * 수정일 : 
 * 파일명 : MyPostDTO.java
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyPostDTO {
    private Long id;
    private String title;
    private String createdAt;
    private long commentCount;
}

