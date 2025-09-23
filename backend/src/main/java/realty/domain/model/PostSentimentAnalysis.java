package realty.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "post_sentiment_analysis",
       indexes = @Index(name = "fk_post_sentiment", columnList = "post_code"),
       uniqueConstraints = @UniqueConstraint(name = "analysis_code", columnNames = "analysis_code"))
public class PostSentimentAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "analysis_code", nullable = false, length = 20)
    private String analysisCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_code", nullable = false,
                foreignKey = @ForeignKey(name = "fk_post_sentiment"))
    private Post post; // Post 엔티티와 매핑

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
