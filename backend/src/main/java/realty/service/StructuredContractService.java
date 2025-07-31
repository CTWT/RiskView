package realty.service;

import java.io.File;
import java.io.IOException;

import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.ContractDTO;
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


    /**
     * 파일을 받아서 HTTPRequest에 사용할 HTTPBody로 만듦
     */
    @Override
    public MultiValueMap<String, Object> getHttpBodyFromFile(File file){
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(file));

        return body;
    }

    /**
     * MultipartFile을 받아서 File로 savedfile폴더에 저장하는 함수
     */
    @Override
    public File getFileFromMultipartFile(MultipartFile file) throws IOException{
        // 1. MultipartFile → File 변환
        System.out.println(System.getProperty("user.dir"));
        File convFile = new File(System.getProperty("user.dir") + "/backend/src/main/java/realty/savedfile/" + file.getOriginalFilename());
        file.transferTo(convFile);

        return convFile;
    }

    @Override
    public ContractDTO.StructuredContractDataDTO findByDocumentcode(String documentcode) {
        return ContractDTO.StructuredContractDataDTO.from(contractRepository.findByDocumentcode(documentcode));
    }

    @Override
    @Transactional
    public void save(ContractDTO.StructuredContractDataDTO contract) {
        
        StructuredContractData data = ContractDTO.StructuredContractDataDTO.toEntity(contract);
        data.setDocumentcode("1");
        contractRepository.save(data);
    }
    
}
