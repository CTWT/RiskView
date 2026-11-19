package realty.domain.dto;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import realty.domain.model.NewsSentimentAnalysis;

/*
 * 생성자 : 유연우
 * 생성일 : 25.09.19
 * 파일명 : NewsSentimentAnalysisDTO.java
 * 수정자 : 
 * 수정일 : 
 * 설명 : 뉴스 감성 분석 DTO
 */


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsSentimentAnalysisDTO {
    private BigDecimal sentimentScore;
    private String sentimentCategory;
    private String sentimentEmoji;
    private String summary;
    private List<String> keyWords;
    private Date analyzedAt;

    public static NewsSentimentAnalysisDTO fromEntity(NewsSentimentAnalysis entity) {

        String keywordsStr = entity.getKeyWords(); 
        List<String> keywords = List.of(keywordsStr.split(","));
        keywords.stream().map(String::trim).toList();

        return NewsSentimentAnalysisDTO.builder()
                .sentimentScore(entity.getSentimentScore())
                .sentimentCategory(entity.getSentimentCategory())
                .sentimentEmoji(entity.getSentimentEmoji())
                .summary(entity.getSummary())
                .keyWords(keywords)
                .analyzedAt(entity.getAnalyzedAt())
                .build();
    }

}
