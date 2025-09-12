package realty.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserZScoreAnalysisDTO {
    private Double zScore; // z_score
    private String label;  // label
}
