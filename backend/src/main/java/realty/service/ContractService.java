package realty.service;

import realty.domain.dto.LeaseContract;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractService.java
 */

 /**
  * 계약서 서비스 인터페이스
  */

public interface ContractService {
    public LeaseContract findByDocumentcode(String documentcode);
    public void save(LeaseContract leaseContract);
    
}
