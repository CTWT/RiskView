package realty.domain.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "analysis_reports")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class) // 생성/수정 시각 자동 관리
@Builder
public class AnalysisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id", nullable = false, updatable = false)
    private Long reportId; // 리포트 고유 ID (PK, AUTO_INCREMENT)

    @Column(name = "report_code", nullable = false, unique = true, length = 20)
    private String reportCode; // 리포트 고유 코드 (유니크)

    @Column(name = "document_code", nullable = false, length = 20)
    private String documentCode; // 문서 고유 코드 (FK)

    @Column(name = "summary")
    private String summary; // 요약 내용

    @Column(name = "risk_level", length = 50)
    private String riskLevel; // 위험 수준 (예: 높음, 중간, 낮음)

    @Column(name = "sentiment_summary")
    private String sentimentSummary; // 감성 요약 (문장 형태)

    @Column(name = "sentiment_score", precision = 5, scale = 2)
    private BigDecimal sentimentScore; // 감성 점수 (소수점 2자리, -100~100 등)

    @Enumerated(EnumType.STRING)
    @Column(name = "sentiment_category", length = 10)
    private SentimentCategory sentimentCategory; // 감성 분류 (긍정, 부정, 중립)

    @Column(name = "sentiment_emoji", length = 10)
    private String sentimentEmoji; // 감성 이모지 (예: 😀, 😢, 😐)

    @Column(name = "created_by", length = 20)
    private String createdBy; // 레코드 생성자

    @CreatedDate
    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt; // 생성일시 (DB에서 current_timestamp로 자동 설정)

    // 감성 분류 Enum 정의
    public enum SentimentCategory {
        긍정, // Positive
        부정, // Negative
        중립  // Neutral
    }
}
