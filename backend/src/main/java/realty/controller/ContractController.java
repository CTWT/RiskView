package realty.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import realty.apicommunication.FileComponent;
import realty.apicommunication.MapComponent;
import realty.apicommunication.OcrComponent;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.MapInfo;
import realty.domain.dto.ContractDTO.StructuredContractDataDTO;
import realty.domain.model.User;
import realty.service.ContractService;
import realty.service.UserService;
import realty.support.JwtUtil;
import io.jsonwebtoken.Claims;

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
    private final UserService userService;

    /**
     * 계약서를 저장하는 PostMapping
     */
    @PostMapping("/contracts")
    public ResponseEntity<String> insertData(@RequestBody ContractDTO.ContractInfo contractInfo,
            HttpSession session, HttpServletRequest request) {

        User user = userService.getCurrentUser(request);
        if(user == null) {
           return ResponseEntity.internalServerError()
           .body("유저 정보를 확인할 수 없습니다");
        }
        String userCode = user.getUserCode();
        
        String fileName = contractInfo.getFileStorageMetadataDTO().getOriginalName();
        
        //세션에 저장된 임시 파일경로를 가져와서 불러옴
        String tempFilePath = (String)session.getAttribute("tempFilePath");
        Path filePath = Path.of(tempFilePath);
        File file = filePath.toFile();

        // 불러온 임시파일 저장
        fileComponent.saveFile(file, fileName, session);

        UserDataToDBData(contractInfo.getStructuredContractDataDTO());

        String documentCode = contractService.save(contractInfo, userCode);
        return ResponseEntity
                .ok()
                .body(documentCode);
    }

    @GetMapping("/contracts")
    public ResponseEntity<ContractDTO.StructuredContractDataDTO> getData(
            @RequestParam("documentCode") String documentCode) {

        ContractDTO.StructuredContractDataDTO dto = ContractDTO.StructuredContractDataDTO.from(
                contractService.findStructuredContractDataByDocumentcode(documentCode));

        DBDataToUserData(dto);

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

        DBDataToUserData(contractInfo.getStructuredContractDataDTO());

        ContractDTO.ContractResponse contractResponse = ContractDTO.ContractResponse.builder()
                .contractInfo(contractInfo)
                .mapInfo(mapinfo)
                .build();
        return ResponseEntity.ok(contractResponse);
    }

    private void DBDataToUserData(StructuredContractDataDTO dto){
        if(dto.getLeaseType().equals("JEONSE"))
        {
            dto.setLeaseType("전세");
        }
        else if(dto.getLeaseType().equals("MONTHLY")){
            dto.setLeaseType("월세");
        }
    }

    private void UserDataToDBData(StructuredContractDataDTO dto) {
        if(dto.getLeaseType().equals("전세")){
            dto.setLeaseType("JEONSE");
        }
        else if(dto.getLeaseType().equals("월세")){
            dto.setLeaseType("MONTHLY");
        }
    }
}