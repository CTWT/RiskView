package realty.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import realty.config.MultipartInputStreamFileResource;
import realty.domain.dto.ContractDTO;

@RestController
@RequestMapping("/ajax")
public class FastApiRestController {

    private static final Logger logger = LoggerFactory.getLogger(FastApiRestController.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FASTAPI_URL = "http://localhost:8000";

    @PostMapping("/run-api")
    public ResponseEntity<Map<String, Object>> runApi(
            @RequestParam String apiName,
            @RequestParam(required = false) MultipartFile file) {

        Map<String, Object> result = new HashMap<>();
        try {
            // 1. trigger 호출
            callTrigger(apiName);

            // 2. FastAPI 호출 (OCRResponse 매핑)
            if ("ocr".equals(apiName)) {
                ContractDTO.OCRResponse ocrResponse;
                if (file != null) {
                    ocrResponse = callFastApiWithFileForOcr(apiName, file); // apiName 그대로 전달
                } else {
                    throw new IllegalArgumentException("OCR 실행 시 파일이 필요합니다.");
                }

                logger.info("OCR 결과 RAW: {}", ocrResponse);

                result.put("status", "success");
                result.put("structuredContractDataDTO", ocrResponse.getStructuredContractDataDTO());
                result.put("mapInfo", ocrResponse.getMapInfo());
            } else {
                // OCR 이외의 API는 일반 JSON으로 처리
                Map<String, Object> apiResponse;
                if (file != null) {
                    apiResponse = callFastApiWithFile(apiName, file);
                } else {
                    apiResponse = callFastApiWithoutFile(apiName);
                }
                result.put("status", "success");
                result.put("message", apiResponse.get("result"));
            }

        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "API 실행 실패: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    // ✅ 여기만 수정됨
    private ContractDTO.OCRResponse callFastApiWithFileForOcr(String apiName, MultipartFile file) throws IOException {
        String url = FASTAPI_URL + "/" + apiName;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        // ✅ ContractController와 동일하게 변경
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<ContractDTO.OCRResponse> response = restTemplate.postForEntity(url, requestEntity, ContractDTO.OCRResponse.class);

        return response.getBody();
    }

    private void callTrigger(String apiName) {
        String triggerUrl = FASTAPI_URL + "/trigger";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = new HashMap<>();
        body.put("api_name", apiName);

        restTemplate.exchange(
                triggerUrl,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<>() {}
        );
    }

    private Map<String, Object> callFastApiWithoutFile(String apiName) {
        String url = FASTAPI_URL + "/" + apiName;
        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();
    }

    private Map<String, Object> callFastApiWithFile(String apiName, MultipartFile file) throws IOException {
        String url = FASTAPI_URL + "/" + apiName;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        return restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();
    }
}