package realty.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import realty.apicommunication.MapComponent;
import realty.apicommunication.OcrComponent;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.MapInfo;
import realty.service.ContractService;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.08.08
 * 파일명 : ContractController.java
 */

@RestController
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final MapComponent mapComponent;
    private final OcrComponent ocrComponent;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/contracts")
    public ResponseEntity<String> insertData(@RequestBody ContractDTO.ContractInfo contractInfo,
            HttpSession session) {
        // User user = (User) session.getAttribute("user");
        // if (user == null) {
        //     return ResponseEntity
        //             .status(500)
        //             .contentType(MediaType.TEXT_PLAIN)
        //             .body("No Logined User");
        // }

        // String userCode = user.getUserCode();

        String userCode = "U10000000";
        String documentCode = contractService.save(contractInfo, userCode);
        return ResponseEntity
                .ok()
                .body(documentCode);
    }

    @GetMapping("/contracts")
    public ResponseEntity<ContractDTO.StructuredContractDataDTO> getData(@RequestBody String documentCode){
        ContractDTO.StructuredContractDataDTO structuredContractDataDTO
        = contractService.findStructuredContractDataByDocumentcode(documentCode);

        return ResponseEntity
                .ok()
                .body(structuredContractDataDTO);
    }

    /**
     * 파일 업로드 후 OCR 실행
     */
    @PostMapping("/upload")
    public ResponseEntity<ContractDTO.ContractResponse> handleFileUpload(@RequestParam("file") MultipartFile file)
            throws IOException {
        //계약서 정보
        ContractDTO.ContractInfo contractInfo = ocrComponent.getContractInfo(file);

        //맵 정보
        String address = contractInfo.getStructuredContractDataDTO().getLocation();
        MapInfo mapinfo = mapComponent.getMapInfo(address);

        ContractDTO.ContractResponse contractResponse = ContractDTO.ContractResponse.builder()
                .contractInfo(contractInfo)
                .mapInfo(mapinfo)
                .build();
        return ResponseEntity.ok(contractResponse);
    }
}