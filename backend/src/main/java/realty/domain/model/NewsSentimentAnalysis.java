package realty.domain.model;

import java.math.BigDecimal;
import java.sql.Date;

// import realty.domain.model.NewsArticles;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/*
 * 생성자 : 유연우
 * 생성일 : 25.09.19
 * 파일명 : NewsSentimentAnalysis.java
 * 수정자 : 
 * 수정일 : 
 * 설명 : 뉴스 감성 분석 엔티티
 */

@Entity
@Table(name="news_sentiment_analysis")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NewsSentimentAnalysis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "analysis_code", nullable = false, unique=true, length = 20)
    private String analysisCode;

    @Column(name = "article_code", nullable = false, length = 20)
    private String articleCode;

    @Column(name = "sentiment_score", precision = 5, scale = 2)
    private BigDecimal sentimentScore;

    @Column(name = "sentiment_category", columnDefinition = "ENUM('긍정', '부정', '중립')")
    private String sentimentCategory;

    @Column(name = "sentiment_emoji", length = 10)
    private String sentimentEmoji;

    @Lob
    @Column(name = "summary")
    private String summary;

    @Lob
    @Column(name = "key_words")
    private String keyWords;

    @Column(name = "created_by", length = 20)
    private String createdBy;

    @Column(name = "analyzed_at")
    private Date analyzedAt;
}
