package realty.service;

import java.io.File;
import java.io.IOException;

import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import realty.domain.dto.ContractDTO;

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
    public ContractDTO.StructuredContractDataDTO findByDocumentcode(String documentcode);
    public void save(ContractDTO.StructuredContractDataDTO leaseContract);
    public MultiValueMap<String, Object> getHttpBodyFromFile(File file);
    public File getFileFromMultipartFile(MultipartFile file) throws IOException;
    
}
