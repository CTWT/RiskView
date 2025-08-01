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

import lombok.RequiredArgsConstructor;
import realty.domain.dto.ContractDTO;
import realty.service.ContractService;

@Controller
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/contracts")
    public String insertData(@ModelAttribute ContractDTO.StructuredContractDataDTO contract) {
        contractService.save(contract);
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
    ResponseEntity<ContractDTO.OCRResponse> response =
            restTemplate.postForEntity(fastApiUrl, requestEntity, ContractDTO.OCRResponse.class);

    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
        ContractDTO.OCRResponse ocrResponse = response.getBody();

        // OCR 데이터 매핑
        model.addAttribute("contract", ocrResponse.getStructuredContractDataDTO());
        model.addAttribute("mapInfo", ocrResponse.getMapInfo());
    } else {
        model.addAttribute("contract", new ContractDTO.StructuredContractDataDTO());
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