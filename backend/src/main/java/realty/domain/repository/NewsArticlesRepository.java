package realty.domain.repository;

import realty.domain.model.NewsArticles;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.28
 * 파일명 : NewsArticlesRepository.java
 */


@Repository
public interface NewsArticlesRepository extends JpaRepository<NewsArticles, Long> {
    // siteName으로 뉴스를 필터링하고 페이징하는 메서드
    Page<NewsArticles> findAllBySiteName(String siteName, Pageable pageable);
    // articleId로 뉴스 기사 찾기
    Optional<NewsArticles> findByArticleId(Long articleId);
    
}
