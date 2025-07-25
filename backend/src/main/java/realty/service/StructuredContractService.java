package realty.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.LeaseContract;
import realty.domain.model.StructuredContractData;
import realty.domain.repository.ContractRepository;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractRepositoy.java
 */

 /**
  * 계약서 서비스 구현체
  * controller에서 db처리를 해준다.
  */

@Service
@RequiredArgsConstructor
public class StructuredContractService implements ContractService {

    private final ContractRepository contractRepository;

    @Override
    public LeaseContract findByDocumentcode(String documentcode) {
        return ContractConverter.toDto(contractRepository.findByDocumentcode(documentcode));
    }

    @Override
    @Transactional
    public void save(LeaseContract contract) {
        
        StructuredContractData data = ContractConverter.toEntity(contract);
        data.setDocumentcode("1");
        contractRepository.save(data);
    }
    
}
