package realty.domain.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class AiRiskAnalysisRequest {
    private ContractClauseDTO contractClauseDTO;
    private AnomalyDetectResult anomalyDetectResult;
}
