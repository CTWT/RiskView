package realty.controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
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
import realty.domain.model.FileStorageMetadata;
import realty.domain.repository.FileStorageMetadataRepository;
import realty.domain.model.StructuredContractData;
import realty.domain.model.User;
import realty.service.ContractService;
import realty.service.UserService;
import realty.support.AddressFormatter;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 박윤성
 * 작성일 : 25.08.08
 * 수정일 : 25.09.25
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
    private final FileStorageMetadataRepository fileStorageMetadataRepository;

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

        formatAddress(contractInfo.getStructuredContractDataDTO());

        log.info("들어온 데이터 : {}", contractInfo.getStructuredContractDataDTO());


        String documentCode = contractService.save(contractInfo, userCode, session);
        return ResponseEntity
                .ok()
                .body(documentCode);
    }

    @GetMapping("/contracts")
    public ResponseEntity<ContractDTO.StructuredContractDataDTO> getData(
            @RequestParam("documentCode") String documentCode) {
        
        StructuredContractData contractData = contractService.findStructuredContractDataByDocumentcode(documentCode);

        // 주민등록번호 필드 복호화
        contractData.setLessorIdNumber(userService.decrypt(contractData.getLessorIdNumber()));
        contractData.setLesseeIdNumber(userService.decrypt(contractData.getLesseeIdNumber()));
        contractData.setLessorAgentIdNumber(userService.decrypt(contractData.getLessorAgentIdNumber()));
        contractData.setLesseeAgentIdNumber(userService.decrypt(contractData.getLesseeAgentIdNumber()));

        ContractDTO.StructuredContractDataDTO dto = ContractDTO.StructuredContractDataDTO.from(contractData);

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
    
    @GetMapping("/download/contract")
    public ResponseEntity<Resource> downloadContractFile(@RequestParam("documentCode") String documentCode) throws IOException {
        log.info("파일 다운로드 요청. 문서 코드: {}", documentCode);

        // 1. documentCode(entity_code)로 파일 메타데이터 조회
        FileStorageMetadata metadata = fileStorageMetadataRepository.findByEntityCode(documentCode).stream().findFirst()
                .orElseThrow(() -> new EntityNotFoundException("문서 코드에 해당하는 파일을 찾을 수 없습니다: " + documentCode));

        // 2. 실제 저장된 파일명 (fileCode + . + 확장자)으로 파일 경로 생성 및 리소스 로드
        // metadata.getOriginalName()에서 확장자를 추출하여 사용
        String fileExtension = getFileExtension(metadata.getOriginalName());
        String storedFileName = metadata.getFileCode() + "." + fileExtension;
        Path filePath = Paths.get(metadata.getStoredPath()).resolve(storedFileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new FileNotFoundException("파일을 찾을 수 없거나 읽을 수 없습니다: " + storedFileName);
        }

        // 3. 다운로드 시 사용할 원본 파일명 추출
        String originalFileName = metadata.getOriginalName();

        // 4. 다운로드를 위한 HTTP 헤더 설정
        String encodedFileName = URLEncoder.encode(originalFileName, StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"");

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
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

        if(analysisResult != null) {
            analysisResult.setAveragePrice(analysisResult.getAveragePrice() * 10000);
            analysisResult.setUserContractPrice(analysisResult.getUserContractPrice() * 10000);
            log.info("이상치 분석 결과 : {}", analysisResult.toString());
        }

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
        dto.setLocation(AddressFormatter.formatAddress(dto.getLocation()));
        dto.setLesseeAddress(AddressFormatter.formatAddress(dto.getLesseeAddress()));
        dto.setLessorAddress(AddressFormatter.formatAddress(dto.getLessorAddress()));
        dto.setRealtorOfficeAddress1(AddressFormatter.formatAddress(dto.getRealtorOfficeAddress1()));
        dto.setRealtorOfficeAddress2(AddressFormatter.formatAddress(dto.getRealtorOfficeAddress2()));
        dto.setLessorAgentAddress(AddressFormatter.formatAddress(dto.getLessorAgentAddress()));
        dto.setLesseeAgentAddress(AddressFormatter.formatAddress(dto.getLesseeAgentAddress()));
    }

    // 파일 확장자를 추출하는 헬퍼 메서드 (FileComponent와 중복되지만, Controller에서도 필요하므로 추가)
    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
    }
}