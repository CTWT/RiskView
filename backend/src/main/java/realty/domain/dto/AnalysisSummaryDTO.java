package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisSummaryDTO {
    private AnalysisReportsDTO analysisReport;
    private TransectionAnomalyDTO transactionAnomaly;
    private ClauseSummaryDTO riskyClauses;
}

