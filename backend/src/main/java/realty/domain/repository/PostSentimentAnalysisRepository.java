package realty.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import realty.domain.model.PostSentimentAnalysis;

public interface PostSentimentAnalysisRepository extends JpaRepository<PostSentimentAnalysis, Long>{
    Optional<PostSentimentAnalysis> findByPostCode(String postCode);
}
