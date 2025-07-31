package realty.controller;

import java.io.File;
import java.io.IOException;

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

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractController.java
 */

/* 
 * 계약서와 관련된 일반 컨트롤러(타임리프 테스트를 위해 만듦)
 */

@Controller
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    /**
     * 계약서를 저장하는 PostMapping
     * 
     * @param contract
     * @return insert가 잘 됬는지 확인하는 페이지로 이동
     */
    @PostMapping("/contracts")
    public String insertData(@ModelAttribute ContractDTO.StructuredContractDataDTO contract) {
        contractService.save(contract);
        return "ocr/InsertSuccess";
    }

    /**
     * 
     * @param file  첨부 이미지 파일
     * @param model OCR결과로 보낼 model
     * @return OCRResult 페이지로 이동
     * @throws IOException
     */
    @PostMapping("/upload")
    public String handleFileUpload(@RequestParam("file") MultipartFile file, Model model)
            throws IOException {
        //Http헤더 생성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        //Http 바디 생성
        File convertedFile = contractService.getFileFromMultipartFile(file);
        MultiValueMap<String,Object> body = contractService.getHttpBodyFromFile(convertedFile);
        
        // Http 요청을 보내기 위해 HttpEntity
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        // FastAPI 서버로 전송 (RestTemplate)
        RestTemplate restTemplate = new RestTemplate();
        String fastApiUrl = "http://localhost:8000/ocr"; // FastAPI POST endpoint
        ResponseEntity<ContractDTO.OCRResponse> response = restTemplate.postForEntity(fastApiUrl, requestEntity,
                ContractDTO.OCRResponse.class);

        // 3. 결과 저장
        ContractDTO.OCRResponse result = response.getBody();

        if(result != null){
            model.addAttribute("contract", result.getStructuredContractDataDTO());
            model.addAttribute("mapInfo", result.getMapInfo());
        }

        return "ocr/OCRResult";
    }

    /**
     * 파일 업로드 화면을 가져오는 GetMapping
     * @return
     */
    @GetMapping("/upload")
    public String imageUpload() {
        return "ocr/ImageUpload";
    }
}