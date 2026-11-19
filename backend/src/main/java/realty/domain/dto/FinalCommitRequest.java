package realty.domain.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class FinalCommitRequest {
    private String documentCode;
    private ContractClauseDTO contractClauseDTO;
    private AnomalyDetectResult anomalyDetectResult;
    private AnalysisReportsDTO analysisReportsDTO;
}
