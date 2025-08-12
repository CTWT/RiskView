package realty.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import realty.apicommunication.FileComponent;
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
    private final FileComponent fileComponent;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/contracts")
    public ResponseEntity<String> insertData(@RequestBody ContractDTO.ContractInfo contractInfo,
            HttpSession session) {
        // User user = (User) session.getAttribute("user");
        // if (user == null) {
        // return ResponseEntity
        // .status(500)
        // .body("No Logined User");
        // }

        // String userCode = user.getUserCode();
        

        String fileName = contractInfo.getFileStorageMetadataDTO().getOriginalName();
        
        //세션에 저장된 임시 파일경로를 가져와서 불러옴
        String tempFilePath = (String)session.getAttribute("tempFilePath");
        Path filePath = Path.of(tempFilePath);
        File file = filePath.toFile();

        // 불러온 임시파일 저장
        fileComponent.saveFile(file, fileName, session);

        String userCode = "U10000000";
        String documentCode = contractService.save(contractInfo, userCode);
        return ResponseEntity
                .ok()
                .body(documentCode);
    }

    @GetMapping("/contracts")
    public ResponseEntity<ContractDTO.StructuredContractDataDTO> getData(
            @RequestParam("documentCode") String documentCode,
            HttpSession session) {

        // // 로그인 체크
        // User user = (User) session.getAttribute("user");
        // if (user == null) {
        //     return ResponseEntity
        //             .status(HttpStatus.UNAUTHORIZED) // 401
        //             .body(null);
        // }

        // Documents document = contractService
        //         .findDocumentByUsercode(documentCode);

        // if (document == null) {
        //     return ResponseEntity
        //             .status(HttpStatus.NOT_FOUND) // 404
        //             .body(null);
        // }

        // // 권한 체크
        // if (!user.getUserCode().equals(document.getUserCode())) {
        //     return ResponseEntity
        //             .status(HttpStatus.FORBIDDEN) // 403
        //             .body(null);
        // }

        ContractDTO.StructuredContractDataDTO dto = ContractDTO.StructuredContractDataDTO.from(
                contractService.findStructuredContractDataByDocumentcode(documentCode));

        return ResponseEntity
                .ok()
                .body(dto);
    }

    /**
     * 파일 업로드 후 OCR 실행
     */
    @PostMapping("/upload")
    public ResponseEntity<ContractDTO.ContractResponse> handleFileUpload(@RequestParam("file") MultipartFile file, HttpSession session)
            throws IOException {
        // 계약서 정보
        fileComponent.saveTmpFile(file, session);
        ContractDTO.ContractInfo contractInfo = ocrComponent.scanContract(file);

        // 맵 정보
        String address = contractInfo.getStructuredContractDataDTO().getLocation();
        MapInfo mapinfo = mapComponent.localSearch(address);

        ContractDTO.ContractResponse contractResponse = ContractDTO.ContractResponse.builder()
                .contractInfo(contractInfo)
                .mapInfo(mapinfo)
                .build();
        return ResponseEntity.ok(contractResponse);
    }
}