package realty.service;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.ContractDTO;
import realty.domain.model.Documents;
import realty.domain.model.FileStorageMetadata;
import realty.domain.model.StructuredContractData;
import realty.domain.repository.DocumentsRepository;
import realty.domain.repository.FileStorageMetadataRepository;
import realty.domain.repository.StructuredContractDataRepository;

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
public class ContractService {

    private final DocumentsRepository documentsRepository;
    private final StructuredContractDataRepository contractRepository;
    private final FileStorageMetadataRepository fileStorageMetadataRepository;

    public StructuredContractData findStructuredContractDataByDocumentcode(String documentcode) {
        return contractRepository.findByDocumentcode(documentcode);
    }

    public Documents findDocumentByUsercode(String Usercode) {
        return documentsRepository.findByUserCode(Usercode);
    }

    private String documentSave(ContractDTO.DocumentsDTO documentsDTO, String userCode) {
        Documents entity = ContractDTO.DocumentsDTO.toEntity(documentsDTO);
        entity.setUserCode(userCode);
        entity.setDocumentCode("not-set");
        Documents savedEntity = documentsRepository.save(entity);
        documentsRepository.flush();

        String generatedCode = "D" + String.format("%08d", savedEntity.getDocumentId());
        savedEntity.setDocumentCode(generatedCode);
        documentsRepository.save(savedEntity);
        documentsRepository.flush();

        return generatedCode;
    }

    private void structuredContractDataSave(ContractDTO.StructuredContractDataDTO structuredContractDataDTO, String documentCode) {
        StructuredContractData entity = ContractDTO.StructuredContractDataDTO.toEntity(structuredContractDataDTO);
        entity.setDocumentcode(documentCode);
        contractRepository.save(entity);
    }

    private void fileStorageMetadataSave(ContractDTO.FileStorageMetadataDTO fileStorageMetadataDTO, String documentCode) {
        FileStorageMetadata entity = ContractDTO.FileStorageMetadataDTO.toEntity(fileStorageMetadataDTO);
        entity.setFileCode("not-set");
        entity.setEntityCode(documentCode);
        FileStorageMetadata savedEntity = fileStorageMetadataRepository.save(entity);

        String generateCode = "FSM" + String.format("%08d", savedEntity.getFileId());
        savedEntity.setFileCode(generateCode);
        fileStorageMetadataRepository.save(savedEntity);
    }

    @Transactional
    public String save(ContractDTO.ContractInfo contractInfo, String userCode) {
        String documentsCode = documentSave(contractInfo.getDocumentsDTO(), userCode);
        structuredContractDataSave(contractInfo.getStructuredContractDataDTO(), documentsCode);
        fileStorageMetadataSave(contractInfo.getFileStorageMetadataDTO(), documentsCode);

        System.out.println("계약서 저장 완료!");
        return documentsCode;
    }

}
