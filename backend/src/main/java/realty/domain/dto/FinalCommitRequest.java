package realty.domain.dto;

import lombok.Data;

@Data
public class FinalCommitRequest {
    private String documentCode;
    private ContractClauseDTO contractClauseDTO;
    private AnomalyDetectResult anomalyDetectResult;
    private AnalysisReportsDTO analysisReportsDTO;
}
