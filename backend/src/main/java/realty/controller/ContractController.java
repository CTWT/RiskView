package realty.controller;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import realty.domain.dto.AiRiskAnalysisRequest;
import realty.domain.dto.AnalysisReportsDTO;
import realty.domain.dto.AnalysisSummaryDTO;
import realty.domain.dto.AnomalyDetectResult;
import realty.domain.dto.ContractClauseDTO;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.FinalCommitRequest;
import realty.domain.dto.MapInfo;
import realty.domain.dto.ContractDTO.StructuredContractDataDTO;
import realty.domain.model.User;
import realty.service.ContractService;
import realty.service.UserService;

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
    private static final Logger log = LoggerFactory.getLogger(ContractController.class);

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
        if (user == null) {
            return ResponseEntity.internalServerError()
                    .body("유저 정보를 확인할 수 없습니다");
        }
        String userCode = user.getUserCode();

        String fileName = contractInfo.getFileStorageMetadataDTO().getOriginalName();

        // 세션에 저장된 임시 파일경로를 가져와서 불러옴
        String tempFilePath = (String) session.getAttribute("tempFilePath");
        Path filePath = Path.of(tempFilePath);
        File file = filePath.toFile();

        // 불러온 임시파일 저장
        fileComponent.saveFile(file, fileName, session);

        formatAddress(contractInfo.getStructuredContractDataDTO());

        log.info("들어온 데이터 : {}", contractInfo.getStructuredContractDataDTO());


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

        formatAddress(dto);

        return ResponseEntity
                .ok()
                .body(dto);
    }

    @GetMapping("/analysisSummary")
    public ResponseEntity<AnalysisSummaryDTO> getSummary(
        @RequestParam("documentCode") String documentCode) {
            AnalysisSummaryDTO analysisSummaryDTO = contractService.getAnalysisSummary(documentCode);

            return ResponseEntity
                    .ok()
                    .body(analysisSummaryDTO);

    }

    /**
     * 파일 업로드 후 OCR 실행
     */
    @PostMapping("/upload")
    public ResponseEntity<ContractDTO.ContractResponse> handleFileUpload(@RequestParam("file") MultipartFile file,
            HttpSession session)
            throws IOException {
        // 계약서 정보
        fileComponent.saveTmpFile(file, session);
        ContractDTO.ContractInfo contractInfo = ocrComponent.scanContract(file);
        log.info("OCR 결과 데이터 ==> {}", contractInfo.getStructuredContractDataDTO());

        // 맵 정보
        String address = contractInfo.getStructuredContractDataDTO().getLocation();
        MapInfo mapinfo = mapComponent.localSearch(address);

        formatAddress(contractInfo.getStructuredContractDataDTO());

        ContractDTO.ContractResponse contractResponse = ContractDTO.ContractResponse.builder()
                .contractInfo(contractInfo)
                .mapInfo(mapinfo)
                .build();
        return ResponseEntity.ok(contractResponse);
    }

    /**
     * 이상치 분석
     */
    @PostMapping("/contracts/anomalyDetect")
    public ResponseEntity<AnomalyDetectResult> anomalyDetect(
                 @RequestBody ContractDTO.ContractInfo contractInfo) {
        log.info("이상치 분석을 실행합니다.");
        AnomalyDetectResult analysisResult = contractService
                .analyzeAnomaly(contractInfo.getStructuredContractDataDTO());
        log.info("이상치 분석 결과 : {}", analysisResult.toString());

        return ResponseEntity
                .ok()
                .body(analysisResult);
    }

    @PostMapping("/contracts/clauseAnalysis")
    public ResponseEntity<ContractClauseDTO> analyzeClause(@RequestBody String contractClause) {
        log.info("특약사항 분석을 실행합니다.");
        ContractClauseDTO contractClauseDTO = contractService.analyzeClause(contractClause);

        return ResponseEntity.ok(contractClauseDTO);
    }

    /**
     * AI 위험 분석
     */
    @PostMapping("/contracts/aiRiskAnalysis")
    public ResponseEntity<AnalysisReportsDTO> createAnalysisReport(
            @RequestBody AiRiskAnalysisRequest request) {

        log.info("AI 리스크 분석 요청: {}", request);

        AnalysisReportsDTO analysisReportsDTO = contractService.createAnalysisReport(request);

        return ResponseEntity.ok().body(analysisReportsDTO);
    }

    @PostMapping("/contracts/finalCommit")
    public ResponseEntity<String> finalCommit(
        @RequestBody FinalCommitRequest finalCommitRequest
    ){
        log.info("데이터 저장");
        log.info("마지막 커밋 ===> {}", finalCommitRequest);
        contractService.save(finalCommitRequest);
        return ResponseEntity.ok().build();
    }

    /**
     * 계약서 주소들을 보기 쉬운 주소들로 변환
     * 
     * @param dto
     */
    private void formatAddress(StructuredContractDataDTO dto) {
        dto.setLocation(formatAddress(dto.getLocation()));
        dto.setLesseeAddress(formatAddress(dto.getLesseeAddress()));
        dto.setLessorAddress(formatAddress(dto.getLessorAddress()));
        dto.setRealtorOfficeAddress1(formatAddress(dto.getRealtorOfficeAddress1()));
        dto.setRealtorOfficeAddress2(formatAddress(dto.getRealtorOfficeAddress2()));
        dto.setLessorAgentAddress(formatAddress(dto.getLessorAgentAddress()));
        dto.setLesseeAgentAddress(formatAddress(dto.getLesseeAgentAddress()));
    }

    private String formatAddress(String raw) {
        if (raw == null || raw.isEmpty()) {
            return raw;
        }

        String result = raw;

        // 1. 시/도/구/군/동/읍/면/리 뒤에 공백
        result = result.replaceAll("(시|도|구|군|동|읍|면|리)", "$1 ");

        // 2. 로/길 뒤에 공백
        result = result.replaceAll("(로|길)", "$1 ");

        // 3. 숫자 앞뒤에 공백 (예: "테헤란로123길45" → "테헤란로 123 길 45")
        result = result.replaceAll("(?<=\\D)(\\d+)", " $1"); // 숫자 앞에 한글 있으면 공백 삽입
        result = result.replaceAll("(\\d+)(?=\\D)", "$1 "); // 숫자 뒤에 한글 있으면 공백 삽입

        // 4. 여러 공백 하나로 정리
        result = result.replaceAll("\\s+", " ").trim();
        // log.info("주소 변경! {} -> {}", raw, result);
        return result;
    }
}