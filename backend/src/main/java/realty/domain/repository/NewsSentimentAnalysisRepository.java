package realty.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.NewsSentimentAnalysis;

/*
 * 생성자 : 유연우
 * 생성일 : 25.09.19
 * 파일명 : NewsSentimentAnalysisRepository.java
 * 수정자 : 
 * 수정일 : 
 * 설명 : 뉴스 감성 분석 리포지토리
 */

@Repository
public interface NewsSentimentAnalysisRepository extends JpaRepository<NewsSentimentAnalysis, Long> {
    // 커스텀 메서드 정의 가능
    Optional<NewsSentimentAnalysis> findByArticleCode(String articleCode);
    
}
