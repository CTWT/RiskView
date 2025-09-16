package realty.apicommunication;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import realty.domain.dto.AnomalyDetectResult;
import realty.domain.dto.ContractDTO;
/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.11
 * 파일명 : OcrComponent.java
 */

/**
 * Ocr 호출과 관련된 컴포넌트
 */

@Component
@RequiredArgsConstructor
public class OcrComponent {
    private static final Logger log = LoggerFactory.getLogger(OcrComponent.class);
    
    private final RestTemplate restTemplate;
    private final FileComponent fileComponent;

    /**
     * 파일을 분석해서 DTO로 반환해주는 함수
     * 
     * @param file
     * @return ContractInfo
     */
    public ContractDTO.ContractInfo scanContract(MultipartFile file) {

        // FastAPI 서버쪽의 ocr 트리거 활성화
        triggerFastApiOcr();

        HttpEntity<MultiValueMap<String, Object>> requestEntity = null;

        // FastAPI 쪽에 보낼 requestEntity 생성
        try {
            requestEntity = fileComponent.createMultipartRequest(file);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (requestEntity == null) {
            System.out.println("requestEntity생성에 실패했습니다.");
            return null;
        }

        // post
        ResponseEntity<ContractDTO.StructuredContractDataDTO> response = restTemplate.postForEntity(
                "http://localhost:8000/ocr",
                requestEntity,
                ContractDTO.StructuredContractDataDTO.class);

        // 응답할 데이터 초기화
        ContractDTO.ContractInfo contractInfo = createDefaultContractInfo();

        // OCR 응답 데이터가 유효하다면 contractInfo, mapInfo 값 매핑
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            ContractDTO.StructuredContractDataDTO ocrResponse = response.getBody();
            contractInfo = buildContractInfoFromOcr(file, ocrResponse);
        }

        return contractInfo;
    }

    /**
     * 
     * @param structuredContractDataDTO 계약서 정보
     * @return
     */
    public AnomalyDetectResult analyzeContractRisks(ContractDTO.StructuredContractDataDTO structuredContractDataDTO){

        triggerFastApiAnalysis();

        // post
        ResponseEntity<AnomalyDetectResult> response = restTemplate.postForEntity(
                "http://localhost:8000/analyze_estate",
                structuredContractDataDTO,
                AnomalyDetectResult.class);

        return response.getBody();
    }

    /**
     * ocr결과를 이상치분석 api 요청
     */

    private void triggerFastApiAnalysis() {
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", "analyze_estate");

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:8000/trigger",
                triggerBody,
                Map.class);

        if (response.getBody() != null) {
            String message = (String) response.getBody().get("message");
            System.out.println("FastAPI 응답: " + message);
        }
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
     * 디폴트 ContractInfo 생성
     * 
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
     * @param file          프론트로부터 받은 MultipartFile
     * @param convertedFile MultiparFile을 File로 변환한 결과물
     * @param ocrResponse   ocr하여 얻은 결과
     * @return
     */
    private ContractDTO.ContractInfo buildContractInfoFromOcr(MultipartFile file,
            ContractDTO.StructuredContractDataDTO ocrResponse) {
        ContractDTO.StructuredContractDataDTO structuredData = ocrResponse;
        ContractDTO.FileStorageMetadataDTO metadata = getFileMetadata(file);
        ContractDTO.DocumentsDTO documents = ContractDTO.DocumentsDTO.builder()
                .title(file.getOriginalFilename())
                .status("UPLOAD")
                .isDeleted(false)
                .build();

        return ContractDTO.ContractInfo.builder()
                .structuredContractDataDTO(structuredData)
                .fileStorageMetadataDTO(metadata)
                .documentsDTO(documents)
                .build();
    }

    public ContractDTO.FileStorageMetadataDTO getFileMetadata(MultipartFile file) {
        return ContractDTO.FileStorageMetadataDTO.builder()
                .originalName(file.getOriginalFilename())
                .storedPath(fileComponent.getStoredPath())
                .fileSizeKb(fileComponent.longtoInt(file.getSize() / 1024))
                .fileType(file.getContentType())
                .isEncrypted(true)
                .build();
    }

}
