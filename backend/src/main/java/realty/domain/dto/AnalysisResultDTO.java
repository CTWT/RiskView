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
public class AnalysisResultDTO {
    private String address;
    private Long userContractPrice;
    private Long totalRiskScore;
    private Long averagePrice;
    private Boolean isAnomaly;
    private RiskAssessment riskAssessment;
    private UserZScoreAnalysis userZScoreAnalysis;
}
