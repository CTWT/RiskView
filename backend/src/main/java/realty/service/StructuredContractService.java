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
public class StructuredContractService implements ContractService {

    private final DocumentsRepository documentsRepository;
    private final StructuredContractDataRepository contractRepository;
    private final FileStorageMetadataRepository fileStorageMetadataRepository;

    /**
     * 파일을 받아서 HTTPRequest에 사용할 HTTPBody로 만듦
     */
    @Override
    public MultiValueMap<String, Object> getHttpBodyFromFile(File file) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(file));

        return body;
    }

    /**
     * MultipartFile을 받아서 File로 savedfile폴더에 저장하는 함수
     */
    @Override
    public File getFileFromMultipartFile(MultipartFile file) throws IOException {
        // 1. MultipartFile → File 변환
        File convFile = new File(getStoredPath() + file.getOriginalFilename());
        file.transferTo(convFile);

        return convFile;
    }

    @Override
    public ContractDTO.FileStorageMetadataDTO getFileMetadata(MultipartFile file) {
        return ContractDTO.FileStorageMetadataDTO.builder()
                                        .originalName(file.getOriginalFilename())
                                        .storedPath(getStoredPath())
                                        .fileSizeKb(longtoInt(file.getSize() / 1024))
                                        .fileType(file.getContentType())
                                        .isEncrypted(true)
                                        .build();
    }

    private String getStoredPath() {
        return System.getProperty("user.dir") + "/backend/src/main/java/realty/savedfile/";
    }

    private int longtoInt(long l) {
        Long ll = l;
        return ll.intValue();
    }

    @Override
    public ContractDTO.StructuredContractDataDTO findByDocumentcode(String documentcode) {
        return ContractDTO.StructuredContractDataDTO.from(contractRepository.findByDocumentcode(documentcode));
    }

    @Override
    public ContractDTO.DocumentsDTO findByUsercode(String Usercode) {
        return ContractDTO.DocumentsDTO.from(documentsRepository.findByUserCode(Usercode));
    }

    @Override
    public ContractDTO.FileStorageMetadataDTO findByDocumentCode(String documentcode) {
        return ContractDTO.FileStorageMetadataDTO.from(fileStorageMetadataRepository.findByDocumentCode(documentcode));
    }

    private String documentsSave(ContractDTO.DocumentsDTO documentsDTO, String userCode) {
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
        entity.setDocumentCode(documentCode);
        entity.setFileCode("not-set");
        FileStorageMetadata savedEntity = fileStorageMetadataRepository.save(entity);

        String generateCode = "FSM" + String.format("%08d", savedEntity.getFileId());
        savedEntity.setFileCode(generateCode);
        fileStorageMetadataRepository.save(savedEntity);
    }

    @Override
    @Transactional
    public void save(ContractDTO.ContractInfo contractInfo, String userCode) {
        String documentsCode = documentsSave(contractInfo.getDocumentsDTO(), userCode);
        structuredContractDataSave(contractInfo.getStructuredContractDataDTO(), documentsCode);
        fileStorageMetadataSave(contractInfo.getFileStorageMetadataDTO(), documentsCode);

        System.out.println("계약서 저장 완료!");
    }

}
