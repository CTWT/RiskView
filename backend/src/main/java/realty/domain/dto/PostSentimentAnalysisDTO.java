package realty.domain.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostSentimentAnalysisDTO {
    private Integer sentimentScore;
    private String sentimentCategory;
    private String sentimentEmoji;
    private String summary;
    private LocalDateTime analyzedAt;
}
