package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractClauseDTO {
    private String clauseType; 	// 조항 타입
    private String clauseTitle; 		// 조항 제목
    private String clauseValue; 	// 조항 내용
    private Boolean isRisky;	// 위험 여부
    private String riskReason; 		// 위험 판단 근거
}
