package realty.domain.dto;

import lombok.Data;

@Data
public class AiRiskAnalysisRequest {
    private ContractDTO.ContractInfo ocrData;
    private AnomalyDetectResult anomalyDetectResult;
}
