package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.LawReference;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.25
 * 파일명 : LawReferenceRepository.java
 */

@Repository
public interface LawReferenceRepository extends JpaRepository<LawReference,String> {
    LawReference findByLawReferenceId(String lawReferenceId);
}
