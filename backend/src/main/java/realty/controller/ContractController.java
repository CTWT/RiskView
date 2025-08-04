package realty.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.MapInfo;
import realty.domain.model.User;
import realty.service.ContractService;

@Controller
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/contracts")
    public String insertData(@ModelAttribute ContractDTO.ContractInfo contractInfo, HttpSession session) {
        
        System.out.println(session.getId());
        System.out.println("user: " + session.getAttribute("user"));
        User user = (User)session.getAttribute("user");
        String userCode = user.getUserCode();
        contractService.save(contractInfo, userCode);
        return "ocr/InsertSuccess";
    }

    /**
     * 파일 업로드 후 OCR 실행
     */
    @PostMapping("/upload")
    public String handleFileUpload(@RequestParam("file") MultipartFile file, Model model)
            throws IOException {

        // 1. Trigger 호출 (FastAPI event_flags 활성화)
        RestTemplate triggerRestTemplate = new RestTemplate();
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", "ocr");
        triggerRestTemplate.postForEntity("http://localhost:8000/trigger", triggerBody, Void.class);

        // 2. Http 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 3. Http 바디 생성
        File convertedFile = contractService.getFileFromMultipartFile(file);
        MultiValueMap<String, Object> body = contractService.getHttpBodyFromFile(convertedFile);

        // 4. Http 요청 엔티티 생성
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // OCR API 호출 (FastAPI)
        RestTemplate restTemplate = new RestTemplate();
        String fastApiUrl = "http://localhost:8000/ocr";

        // OCRResponse로 받기
        ResponseEntity<ContractDTO.OCRResponse> response = restTemplate.postForEntity(fastApiUrl, requestEntity,
                ContractDTO.OCRResponse.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            ContractDTO.OCRResponse ocrResponse = response.getBody();

            // 모든 분석결과 추출
            MapInfo mapInfo = ocrResponse.getMapInfo();
            ContractDTO.StructuredContractDataDTO structuredContractDataDTO = ocrResponse.getStructuredContractDataDTO();
            ContractDTO.FileStorageMetadataDTO fileStorageMetadataDTO = contractService.getFileMetadata(file);
            ContractDTO.DocumentsDTO documentsDTO = ContractDTO.DocumentsDTO.builder()
                    .title(convertedFile.getName())
                    .status("UPLOAD")
                    .isDeleted(false)
                    .build();

            ContractDTO.ContractInfo contractInfo = ContractDTO.ContractInfo.builder()
                    .structuredContractDataDTO(structuredContractDataDTO)
                    .fileStorageMetadataDTO(fileStorageMetadataDTO)
                    .documentsDTO(documentsDTO)
                    .build();

            // 모델 설정
            model.addAttribute("contractInfo", contractInfo);
            model.addAttribute("mapInfo", mapInfo);
        } else {
            ContractDTO.ContractInfo contractInfo = ContractDTO.ContractInfo.builder()
                    .structuredContractDataDTO(new ContractDTO.StructuredContractDataDTO())
                    .fileStorageMetadataDTO(new ContractDTO.FileStorageMetadataDTO())
                    .documentsDTO(new ContractDTO.DocumentsDTO())
                    .build();

            model.addAttribute("contractInfo", contractInfo);
            model.addAttribute("mapInfo", null);
        }

        return "ocr/OCRResult";
    }

    /**
     * 파일 업로드 화면
     */
    @GetMapping("/upload")
    public String imageUpload() {
        return "ocr/ImageUpload";
    }
}