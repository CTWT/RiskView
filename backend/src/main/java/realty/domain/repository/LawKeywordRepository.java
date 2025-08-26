package realty.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.LawKeyword;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.25
 * 파일명 : LawKeywordRepository.java
 */

@Repository
public interface LawKeywordRepository extends JpaRepository<LawKeyword,Long> {
    LawKeyword findByLawKeyword(String lawKeyword);
    Page<LawKeyword> findAllByLawKeywordCategory(String category, Pageable pageable);
}
