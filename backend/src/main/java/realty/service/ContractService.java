package realty.service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
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
public class ContractService {

    private final DocumentsRepository documentsRepository;
    private final StructuredContractDataRepository contractRepository;
    private final FileStorageMetadataRepository fileStorageMetadataRepository;
    private final RestTemplate restTemplate;

    public ContractDTO.ContractInfo getContractInfo(MultipartFile file){

         // FastAPI 서버쪽의 ocr 트리거 활성화
        triggerFastApiOcr();

        // MultipartFile -> File
        File convertedFile = getFileFromMultipartFile(file);

        // FastAPI 쪽에 보낼 requestEntity 생성
        HttpEntity<MultiValueMap<String, Object>> requestEntity = createMultipartRequest(convertedFile);

        //post
        ResponseEntity<ContractDTO.StructuredContractDataDTO> response = restTemplate.postForEntity(
                "http://localhost:8000/ocr",
                requestEntity,
                ContractDTO.StructuredContractDataDTO.class);

        // 응답할 데이터 초기화
        ContractDTO.ContractInfo contractInfo = createDefaultContractInfo();

        // OCR 응답 데이터가 유효하다면 contractInfo, mapInfo 값 매핑
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            ContractDTO.StructuredContractDataDTO ocrResponse = response.getBody();
            contractInfo = buildContractInfoFromOcr(file, convertedFile, ocrResponse);
        }


        return contractInfo;
    }

    /**
     * 파일을 받아서 HTTPRequest에 사용할 HTTPBody로 만듦
     */
    public MultiValueMap<String, Object> getHttpBodyFromFile(File file) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(file));

        return body;
    }

    /**
     * MultipartFile을 받아서 File로 savedfile폴더에 저장하는 함수
     */
    public File getFileFromMultipartFile(MultipartFile file){
        // 1. MultipartFile → File 변환
        File convFile = null;
        try{
            convFile = new File(getStoredPath() + file.getOriginalFilename());
            file.transferTo(convFile);
        } catch (IOException e){
            e.printStackTrace();
        }
        return convFile;
    }

    public ContractDTO.FileStorageMetadataDTO getFileMetadata(MultipartFile file) {
        return ContractDTO.FileStorageMetadataDTO.builder()
                                        .originalName(file.getOriginalFilename())
                                        .storedPath(getStoredPath())
                                        .fileSizeKb(longtoInt(file.getSize() / 1024))
                                        .fileType(file.getContentType())
                                        .isEncrypted(true)
                                        .build();
    }

    /**
     * FastAPI 서버 쪽의 ocr 트리거 활성화
     */
    private void triggerFastApiOcr() {
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", "ocr");
        restTemplate.postForEntity("http://localhost:8000/trigger", triggerBody, Void.class);
    }

    /**
     * ocr 할 request형식 생성
     * @param file
     * @return HttpEntity에 ocr할 파일을 실어서 리턴
     */
    private HttpEntity<MultiValueMap<String, Object>> createMultipartRequest(File file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = getHttpBodyFromFile(file);
        return new HttpEntity<>(body, headers);
    }

    /**
     * 디폴트 ContractInfo 생성
     * @return default ContractInfo
     */
    private ContractDTO.ContractInfo createDefaultContractInfo() {
        return ContractDTO.ContractInfo.builder()
                .structuredContractDataDTO(new ContractDTO.StructuredContractDataDTO())
                .fileStorageMetadataDTO(new ContractDTO.FileStorageMetadataDTO())
                .documentsDTO(new ContractDTO.DocumentsDTO())
                .build();
    }

    /**
     * 
     * @param file 프론트로부터 받은 MultipartFile
     * @param convertedFile MultiparFile을 File로 변환한 결과물
     * @param ocrResponse ocr하여 얻은 결과
     * @return
     */
    private ContractDTO.ContractInfo buildContractInfoFromOcr(MultipartFile file, File convertedFile,
            ContractDTO.StructuredContractDataDTO ocrResponse) {
        ContractDTO.StructuredContractDataDTO structuredData = ocrResponse;
        ContractDTO.FileStorageMetadataDTO metadata = getFileMetadata(file);
        ContractDTO.DocumentsDTO documents = ContractDTO.DocumentsDTO.builder()
                .title(convertedFile.getName())
                .status("UPLOAD")
                .isDeleted(false)
                .build();

        return ContractDTO.ContractInfo.builder()
                .structuredContractDataDTO(structuredData)
                .fileStorageMetadataDTO(metadata)
                .documentsDTO(documents)
                .build();
    }

    private String getStoredPath() {
        return System.getProperty("user.dir") + "/backend/src/main/java/realty/savedfile/";
    }

    private int longtoInt(long l) {
        Long ll = l;
        return ll.intValue();
    }

    public ContractDTO.StructuredContractDataDTO findByDocumentcode(String documentcode) {
        return ContractDTO.StructuredContractDataDTO.from(contractRepository.findByDocumentcode(documentcode));
    }

    public ContractDTO.DocumentsDTO findByUsercode(String Usercode) {
        return ContractDTO.DocumentsDTO.from(documentsRepository.findByUserCode(Usercode));
    }

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

    @Transactional
    public void save(ContractDTO.ContractInfo contractInfo, String userCode) {
        String documentsCode = documentsSave(contractInfo.getDocumentsDTO(), userCode);
        structuredContractDataSave(contractInfo.getStructuredContractDataDTO(), documentsCode);
        fileStorageMetadataSave(contractInfo.getFileStorageMetadataDTO(), documentsCode);

        System.out.println("계약서 저장 완료!");
    }

}
