package realty.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "post_sentiment_analysis")
public class PostSentimentAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "analysis_code", nullable = false, length = 20)
    private String analysisCode;

    @Column(name = "post_code", nullable = false, length = 20) 
    private String postCode; 

    @Column(name = "sentiment_score", nullable = false)
    private Integer sentimentScore;

    @Column(name = "sentiment_category", nullable = false, length = 10)
    private String sentimentCategory;

    @Column(name = "sentiment_emoji", length = 10)
    private String sentimentEmoji;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "analyzed_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime analyzedAt;
}
