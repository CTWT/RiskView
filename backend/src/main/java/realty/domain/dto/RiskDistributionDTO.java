package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.22
 * 수정일 : 
 * 파일명 : RiskDistributionDTO.java
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RiskDistributionDTO {

    /**
     * 위험도 수준 (예: "고위험", "중위험", "저위험")
     */
    private String level;

    /**
     * 해당 위험도가 전체 분석에서 차지하는 비율 (%)
     */
    private long percentage;
}
