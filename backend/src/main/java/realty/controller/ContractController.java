package realty.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.MapInfo;
import realty.domain.model.User;
import realty.service.ContractService;

@RestController
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final RestTemplate restTemplate;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/contracts")
    public ResponseEntity<String> insertData(@RequestBody ContractDTO.ContractInfo contractInfo,
            HttpSession session) {
         User user = (User) session.getAttribute("user");
    if (user == null) {
        return ResponseEntity
                .status(500)
                .contentType(MediaType.TEXT_PLAIN)
                .body("No Logined User");
    }

    String userCode = user.getUserCode();
    contractService.save(contractInfo, userCode);
    return ResponseEntity
            .ok()
            .contentType(MediaType.TEXT_PLAIN)
            .body("Contract Save Complete!");
    }

    /**
     * 파일 업로드 후 OCR 실행
     */
    @PostMapping("/upload")
    public ResponseEntity<ContractDTO.ContractResponse> handleFileUpload(@RequestParam("file") MultipartFile file)
            throws IOException {
        
        // FastAPI 서버쪽의 ocr 트리거 활성화
        triggerFastApiOcr();

        // MultipartFile -> File
        File convertedFile = contractService.getFileFromMultipartFile(file);

        // FastAPI 쪽에 보낼 requestEntity 생성
        HttpEntity<MultiValueMap<String, Object>> requestEntity = createMultipartRequest(convertedFile);

        //post
        ResponseEntity<ContractDTO.OCRResponse> response = restTemplate.postForEntity(
                "http://localhost:8000/ocr",
                requestEntity,
                ContractDTO.OCRResponse.class);

        // 응답할 데이터 초기화
        ContractDTO.ContractInfo contractInfo = createDefaultContractInfo();
        MapInfo mapInfo = null;

        // OCR 응답 데이터가 유효하다면 contractInfo, mapInfo 값 매핑
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            ContractDTO.OCRResponse ocrResponse = response.getBody();
            contractInfo = buildContractInfoFromOcr(file, convertedFile, ocrResponse);
            mapInfo = ocrResponse.getMapInfo();
        }

        // 최종 응답 DTO 생성
        ContractDTO.ContractResponse contractResponse = ContractDTO.ContractResponse.builder()
                .contractInfo(contractInfo)
                .mapInfo(mapInfo)
                .build();

        return ResponseEntity.ok(contractResponse);
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
        MultiValueMap<String, Object> body = contractService.getHttpBodyFromFile(file);
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
            ContractDTO.OCRResponse ocrResponse) {
        ContractDTO.StructuredContractDataDTO structuredData = ocrResponse.getStructuredContractDataDTO();
        ContractDTO.FileStorageMetadataDTO metadata = contractService.getFileMetadata(file);
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

    /**
     * 파일 업로드 화면
     */
    @GetMapping("/upload")
    public String imageUpload() {
        return "ocr/ImageUpload";
    }
}