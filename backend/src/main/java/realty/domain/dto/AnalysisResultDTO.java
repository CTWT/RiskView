package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultDTO {
    private String address; // address
    private Long userContractPrice; // user_contract_price
    private Object additionalPoints; // additional_points
    private List<Map<String, Object>> surroundingTransactions; // surrounding_transactions
    private UserZScoreAnalysisDTO userZScoreAnalysis; // user_z_score_analysis
}
