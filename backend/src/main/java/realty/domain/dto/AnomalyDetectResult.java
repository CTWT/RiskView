package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AnomalyDetectResult {
    private Long userContractPrice; // 환산 전체가
    private Long totalRiskScore;    // 총 점수
    private Long averagePrice;      // 평균가
    private Boolean isAnomaly;      // 이상여부
    private RiskAssessment riskAssessment;  //위험 코멘트
    private UserZScoreAnalysis userZScoreAnalysis; //z-score 분석
}
