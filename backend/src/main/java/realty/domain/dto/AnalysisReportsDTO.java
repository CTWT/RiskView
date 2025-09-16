package realty.domain.dto;

import java.math.BigDecimal;

import lombok.Data;
import realty.domain.model.AnalysisReport.SentimentCategory;

@Data
public class AnalysisReportsDTO {
    private String summary; 					// 요약 내용
    private String riskLevel; 					// 위험 수준 (예: 높음, 중간, 낮음)
    private String sentimentSummary; 			// 감성 요약 (문장 형태)
    private BigDecimal sentimentScore; 			// 감성 점수 (소수점 2자리, -100~100 등)
    private SentimentCategory sentimentCategory;	// 감성 분류 (긍정, 부정, 중립)
    private String sentimentEmoji; 				// 감성 이모지 (예: 😀, 😢, 😐)
}
