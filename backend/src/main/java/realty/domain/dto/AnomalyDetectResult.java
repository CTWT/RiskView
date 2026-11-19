package realty.domain.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

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
    private BigDecimal deviationPercent;
    private String riskLevel;
    private String riskComment;

    @JsonProperty("zScore")
    private BigDecimal zScore; // z_score
    
    private String label;  // label
}
