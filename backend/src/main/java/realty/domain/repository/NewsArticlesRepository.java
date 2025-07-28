package realty.domain.repository;

import realty.domain.model.NewsArticles;
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
    // findAll(Pageable pageable) 메서드는 오버라이딩이 필요없는 기본 메서드
}
