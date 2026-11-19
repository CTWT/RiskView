package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realty.domain.model.StructuredContractData;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractRepositoy.java
 */

 /**
  * 계약서 레포지토리(JPA)
  */

@Repository
public interface StructuredContractDataRepository extends JpaRepository<StructuredContractData, Long>{
    StructuredContractData findByDocumentcode(String documentcode);
}
