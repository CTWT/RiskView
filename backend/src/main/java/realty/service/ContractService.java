package realty.service;

import java.io.File;
import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import realty.apicommunication.FileComponent;
import realty.domain.dto.AiRiskAnalysisRequest;
import realty.domain.dto.AnalysisReportsDTO;
import realty.domain.dto.AnalysisSummaryDTO;
import realty.domain.dto.AnomalyDetectResult;
import realty.domain.dto.ClauseSummaryDTO;
import realty.domain.dto.ContractClauseDTO;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.FinalCommitRequest;
import realty.domain.dto.TransectionAnomalyDTO;
import realty.domain.model.AnalysisReport;
import realty.domain.model.ContractClause;
import realty.domain.model.ContractClause.ClauseType;
import realty.domain.model.Documents;
import realty.domain.model.FileStorageMetadata;
import realty.domain.model.StructuredContractData;
import realty.domain.model.TransactionAnomaly;
import realty.domain.repository.AnalysisReportRepository;
import realty.domain.repository.ContractClauseRepository;
import realty.domain.repository.DocumentsRepository;
import realty.domain.repository.FileStorageMetadataRepository;
import realty.domain.repository.StructuredContractDataRepository;
import realty.domain.repository.TransactionAnomalyRepository;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractRepositoy.java
 */

/**
 * 계약서 서비스 구현체
 * controller에서 db처리를 해준다.
 */

@Service
@RequiredArgsConstructor
public class ContractService {
    private static final Logger log = LoggerFactory.getLogger(ContractService.class);

    private final DocumentsRepository documentsRepository;
    private final StructuredContractDataRepository contractRepository;
    private final FileStorageMetadataRepository fileStorageMetadataRepository;
    private final ContractClauseRepository contractClauseRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final TransactionAnomalyRepository transactionAnomalyRepository;
    private final UserService userService; // UserService 주입
    private final RestTemplate restTemplate;
    private final FileComponent fileComponent;

    public StructuredContractData findStructuredContractDataByDocumentcode(String documentcode) {
        log.info("문서 코드로 구조화된 계약 데이터 조회 시작: {}", documentcode);
        return contractRepository.findByDocumentcode(documentcode);
    }

    public Documents findDocumentByUsercode(String Usercode) {
        log.info("사용자 코드로 문서 조회 시작: {}", Usercode);
        return documentsRepository.findByUserCode(Usercode);
    }

    private String documentSave(ContractDTO.DocumentsDTO documentsDTO, String userCode) {
        log.info("문서 저장 시작. 사용자 코드: {}", userCode);

        Documents entity = ContractDTO.DocumentsDTO.toEntity(documentsDTO);
        entity.setUserCode(userCode);
        entity.setDocumentCode("not-set");
        Documents savedEntity = documentsRepository.save(entity);
        documentsRepository.flush();

        String generatedCode = "D" + String.format("%08d", savedEntity.getDocumentId());
        savedEntity.setDocumentCode(generatedCode);
        documentsRepository.save(savedEntity);
        documentsRepository.flush();
        
        log.info("문서 저장 완료. 생성된 문서 코드: {}", generatedCode);
        return generatedCode;
    }

    private void structuredContractDataSave(ContractDTO.StructuredContractDataDTO structuredContractDataDTO, String documentCode) {
        log.info("구조화된 계약 데이터 저장 시작. 문서 코드: {}", documentCode);
        StructuredContractData entity = ContractDTO.StructuredContractDataDTO.toEntity(structuredContractDataDTO);
        entity.setDocumentcode(documentCode);

        // 주민등록번호 필드 해싱
        entity.setLessorIdNumber(userService.encrypt(entity.getLessorIdNumber()));
        entity.setLesseeIdNumber(userService.encrypt(entity.getLesseeIdNumber()));
        entity.setLessorAgentIdNumber(userService.encrypt(entity.getLessorAgentIdNumber()));
        entity.setLesseeAgentIdNumber(userService.encrypt(entity.getLesseeAgentIdNumber()));

        contractRepository.save(entity);
        log.info("구조화된 계약 데이터 저장 완료. 문서 코드: {}", documentCode);
    }

    public FileStorageMetadata fileStorageMetadataSave(ContractDTO.FileStorageMetadataDTO fileStorageMetadataDTO, String entityCode) {
        log.info("파일 메타데이터 저장 시작. 부모 코드: {}", entityCode);
        log.info("파일 메타데이터 DTO : {}", fileStorageMetadataDTO);
        FileStorageMetadata entity = ContractDTO.FileStorageMetadataDTO.toEntity(fileStorageMetadataDTO);
        entity.setFileCode("not-set"); // 초기값
        entity.setEntityCode(entityCode);
        // 원본 파일명은 DTO에서 받은 그대로 유지합니다.
        entity.setOriginalName(fileStorageMetadataDTO.getOriginalName());

        // 일단 저장하여 ID 생성
        FileStorageMetadata savedEntity = fileStorageMetadataRepository.saveAndFlush(entity);

        // 고유 코드 생성
        String generateCode = "FSM" + String.format("%08d", savedEntity.getFileId());
        savedEntity.setFileCode(generateCode);

        fileStorageMetadataRepository.save(savedEntity);
        fileStorageMetadataRepository.flush();

        return savedEntity;
    }

    @Transactional
    public String save(ContractDTO.ContractInfo contractInfo, String userCode, HttpSession session) {
        log.info("계약 정보 저장 트랜잭션 시작. 사용자 코드: {}", userCode);
        String documentsCode = documentSave(contractInfo.getDocumentsDTO(), userCode);
        structuredContractDataSave(contractInfo.getStructuredContractDataDTO(), documentsCode);
        FileStorageMetadata metadata = fileStorageMetadataSave(contractInfo.getFileStorageMetadataDTO(), documentsCode);

        // 세션에 저장된 임시 파일경로를 가져와서 불러옴
        String tempFilePath = (String) session.getAttribute("tempFilePath");
        log.info("임시 폴더 경로 : {}", tempFilePath);
        Path filePath = Path.of(tempFilePath);
        File file = filePath.toFile();

        // 불러온 임시파일 저장하고, 저장된 디렉토리 경로를 받아옴
        String storedDir = fileComponent.saveFile(file, metadata.getFileCode(), metadata.getOriginalName());
        metadata.setStoredPath(storedDir);
        fileStorageMetadataRepository.save(metadata);

        log.info("계약 정보 저장 트랜잭션 완료. 문서 코드: {}", documentsCode);
        return documentsCode;
    }
    
    @Transactional
    public void save(FinalCommitRequest finalCommitRequest) {
        log.info("최종 분석 결과 저장 트랜잭션 시작. 문서 코드: {}", finalCommitRequest.getDocumentCode());
        ContractClauseDTO contractClauseDTO = finalCommitRequest.getContractClauseDTO();
        contractClauseSave(contractClauseDTO, finalCommitRequest.getDocumentCode());
        
        AnalysisReportsDTO analysisReportsDTO = finalCommitRequest.getAnalysisReportsDTO();
        String reportCode = analysisReportSave(analysisReportsDTO, finalCommitRequest.getDocumentCode());

        AnomalyDetectResult anomalyDetectResult = finalCommitRequest.getAnomalyDetectResult();
        anomalyDetectSave(anomalyDetectResult, reportCode);
        log.info("최종 분석 결과 저장 트랜잭션 완료. 문서 코드: {}", finalCommitRequest.getDocumentCode());
    }

    private void contractClauseSave(ContractClauseDTO contractClauseDTO, String documentCode) {
        log.info("계약 조항 저장 시작. 문서 코드: {}", documentCode);
        // 문자열 → Enum 변환
        ClauseType clauseTypeEnum;
        try {
            clauseTypeEnum = ClauseType.valueOf(contractClauseDTO.getClauseType()); // 대문자 변환 필수
        } catch (IllegalArgumentException e) {
            clauseTypeEnum = ClauseType.기타; // 기본값 지정
        }

        ContractClause contractClause = ContractClause.builder()
                                                        .documentCode(documentCode)
                                                        .clauseCode("not-set")
                                                        .clauseTitle(contractClauseDTO.getClauseTitle())
                                                        .clauseType(clauseTypeEnum)
                                                        .clauseValue(contractClauseDTO.getClauseValue())
                                                        .riskReason(contractClauseDTO.getRiskReason())
                                                        .isRisky(contractClauseDTO.getIsRisky())
                                                        .build();
        
        contractClauseRepository.save(contractClause);
        contractClauseRepository.flush();
        log.info("계약 조항 저장 완료. 문서 코드: {}", documentCode);
    }

    private String analysisReportSave(AnalysisReportsDTO analysisReportsDTO, String documentCode) {
        log.info("분석 리포트 저장 시작. 문서 코드: {}", documentCode);

        AnalysisReport analysisReport = AnalysisReport.builder()
                                                        .documentCode(documentCode)
                                                        .reportCode("not-set")
                                                        .riskLevel(analysisReportsDTO.getRiskLevel())
                                                        .sentimentCategory(analysisReportsDTO.getSentimentCategory())
                                                        .sentimentEmoji(analysisReportsDTO.getSentimentEmoji())
                                                        .sentimentScore(analysisReportsDTO.getSentimentScore())
                                                        .sentimentSummary(analysisReportsDTO.getSentimentSummary())
                                                        .build();

        AnalysisReport savedEntity = analysisReportRepository.save(analysisReport);
        analysisReportRepository.flush();

        log.info("분석 리포트 저장 완료. 생성된 리포트 코드: {}", savedEntity.getReportCode());
        return savedEntity.getReportCode();
                                                        
    }

    private void anomalyDetectSave(AnomalyDetectResult anomalyDetectResult, String reportCode) {
        log.info("거래 이상 감지 결과 저장 시작. 리포트 코드: {}", reportCode);
        TransactionAnomaly transactionAnomaly = TransactionAnomaly.builder()
                                                                    .reportCode(reportCode)
                                                                    .anomalyCode("not-set")
                                                                    .averagePrice(anomalyDetectResult.getAveragePrice())
                                                                    .deviationPercent(anomalyDetectResult.getDeviationPercent())
                                                                    .isAnomaly(anomalyDetectResult.getIsAnomaly())
                                                                    .price(anomalyDetectResult.getUserContractPrice())
                                                                    .build();

        transactionAnomalyRepository.save(transactionAnomaly);
        log.info("거래 이상 감지 결과 저장 완료. 리포트 코드: {}", reportCode);
    }



    /**
     * 이상치 분석로직
     * @param structuredContractDataDTO 계약서 정보
     * @return
     */
    public AnomalyDetectResult analyzeAnomaly(ContractDTO.StructuredContractDataDTO structuredContractDataDTO){
        log.info("이상 거래 분석 시작. 주소: {}", structuredContractDataDTO.getLocation());

        triggerFastApiAnalysis("analyze_estate");

        ContractDTO.StructuredContractDataDTO sanitizedDto = sanitizeDto(structuredContractDataDTO);

        log.info("FastAPI 'analyze_estate' 호출");
        // post
        ResponseEntity<AnomalyDetectResult> response = restTemplate.postForEntity(
                "http://localhost:8000/analyze_estate",
                sanitizedDto,
                AnomalyDetectResult.class);

        AnomalyDetectResult result = response.getBody();

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("이상 거래 분석 성공. 결과: {}", result);
        } else {
            log.error("이상 거래 분석 실패. 응답 코드: {}", response.getStatusCode());
            // 실패 시 null 또는 기본 객체를 반환할 수 있습니다.
            return new AnomalyDetectResult(); 
        }
        return result != null ? result : new AnomalyDetectResult();
    }

    private ContractDTO.StructuredContractDataDTO sanitizeDto(ContractDTO.StructuredContractDataDTO dto) {
        // 문자열 기본값 처리
        if (dto.getLeaseType() == null) dto.setLeaseType("");
        if (dto.getLocation() == null) dto.setLocation("");
        if (dto.getLandType() == null) dto.setLandType("");
        if (dto.getBuildingStructureUse() == null) dto.setBuildingStructureUse("");
        if (dto.getLeasePart() == null) dto.setLeasePart("");
        if (dto.getRentType() == null) dto.setRentType("");
        if (dto.getSpecialTerms() == null) dto.setSpecialTerms("");

        // Lessor
        if (dto.getLessorAddress() == null) dto.setLessorAddress("");
        if (dto.getLessorIdNumber() == null) dto.setLessorIdNumber("");
        if (dto.getLessorPhone() == null) dto.setLessorPhone("");
        if (dto.getLessorName() == null) dto.setLessorName("");
        if (dto.getLessorAgentAddress() == null) dto.setLessorAgentAddress("");
        if (dto.getLessorAgentIdNumber() == null) dto.setLessorAgentIdNumber("");
        if (dto.getLessorAgentName() == null) dto.setLessorAgentName("");

        // Lessee
        if (dto.getLesseeAddress() == null) dto.setLesseeAddress("");
        if (dto.getLesseeIdNumber() == null) dto.setLesseeIdNumber("");
        if (dto.getLesseePhone() == null) dto.setLesseePhone("");
        if (dto.getLesseeName() == null) dto.setLesseeName("");
        if (dto.getLesseeAgentAddress() == null) dto.setLesseeAgentAddress("");
        if (dto.getLesseeAgentIdNumber() == null) dto.setLesseeAgentIdNumber("");
        if (dto.getLesseeAgentName() == null) dto.setLesseeAgentName("");

        // Realtor
        if (dto.getRealtorOfficeAddress1() == null) dto.setRealtorOfficeAddress1("");
        if (dto.getRealtorOfficeAddress2() == null) dto.setRealtorOfficeAddress2("");
        if (dto.getRealtorOfficeName1() == null) dto.setRealtorOfficeName1("");
        if (dto.getRealtorOfficeName2() == null) dto.setRealtorOfficeName2("");
        if (dto.getRealtorSignature1() == null) dto.setRealtorSignature1("");
        if (dto.getRealtorSignature2() == null) dto.setRealtorSignature2("");
        if (dto.getRealtorLicensePhone1() == null) dto.setRealtorLicensePhone1("");
        if (dto.getRealtorLicensePhone2() == null) dto.setRealtorLicensePhone2("");
        if (dto.getRealtorAgentSignature1() == null) dto.setRealtorAgentSignature1("");
        if (dto.getRealtorAgentSignature2() == null) dto.setRealtorAgentSignature2("");

        // 날짜 기본값 처리 (오늘 날짜로)
        if (dto.getMiddlePaymentDate() == null) dto.setMiddlePaymentDate(new Date());
        if (dto.getBalanceDate() == null) dto.setBalanceDate(new Date());
        if (dto.getRentDate() == null) dto.setRentDate(new Date());
        if (dto.getLeasePeriodStart() == null) dto.setLeasePeriodStart(new Date());
        if (dto.getLeasePeriodEnd() == null) dto.setLeasePeriodEnd(new Date());
        if (dto.getContractDate() == null) dto.setContractDate(new Date());

        return dto;
    }


    /**
     * 특약사항 분석 로직
     * @param contractClause
     * @return
     */
    public ContractClauseDTO analyzeClause(String contractClause){
        log.info("특약사항 분석 시작. 내용: {}", contractClause);

        triggerFastApiAnalysis("analyze_clause");

        String decodedContractClause = decodeUTF(contractClause);

        Map<String, String> body = new HashMap<>();
        body.put("contract_clause", decodedContractClause);

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HttpEntity로 body + headers 감싸기
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        log.info("FastAPI 'analyze_clause' 호출");
        // POST 요청
        ResponseEntity<ContractClauseDTO> response = restTemplate.postForEntity(
                "http://localhost:8000/analyze_clause",
                request,
                ContractClauseDTO.class
        );
        
        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("특약사항 분석 성공. 결과: {}", response.getBody());
        } else {
            log.error("특약사항 분석 실패. 응답 코드: {}", response.getStatusCode());
        }
        return response.getBody();
    }

    private String decodeUTF(String incodedStr) {
        // 디코딩
        String decoded = URLDecoder.decode(incodedStr, StandardCharsets.UTF_8);

        // 끝 '=' 제거
        if (decoded.endsWith("=")) {
            decoded = decoded.substring(0, decoded.length() - 1);
        }

        // 디코딩 후 로그 출력
        log.info("디코딩 문자열 : {}", decoded);

        return decoded;

    }

    public AnalysisReportsDTO createAnalysisReport(AiRiskAnalysisRequest request) {
        log.info("분석 리포트 생성 시작");

        triggerFastApiAnalysis("create_report");

        request.setAnomalyDetectResult(sanitizeAnomalyResult(request.getAnomalyDetectResult()));

        log.info("FastAPI 'create_report' 호출");
        // post
        ResponseEntity<AnalysisReportsDTO> response = restTemplate.postForEntity(
                "http://localhost:8000/create_report",
                request,
                AnalysisReportsDTO.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("분석 리포트 생성 성공. 결과: {}", response.getBody());
        } else {
            log.error("분석 리포트 생성 실패. 응답 코드: {}", response.getStatusCode());
        }
        return response.getBody();
    }

    private AnomalyDetectResult sanitizeAnomalyResult(AnomalyDetectResult result) {
        if (result == null) return new AnomalyDetectResult();

        if (result.getUserContractPrice() == null) result.setUserContractPrice(0L);
        if (result.getTotalRiskScore() == null) result.setTotalRiskScore(0L);
        if (result.getAveragePrice() == null) result.setAveragePrice(0L);
        if (result.getIsAnomaly() == null) result.setIsAnomaly(false);
        if (result.getDeviationPercent() == null) result.setDeviationPercent(new BigDecimal(0L));
        if (result.getRiskLevel() == null) result.setRiskLevel("");
        if (result.getRiskComment() == null) result.setRiskComment("");
        if (result.getZScore() == null) result.setZScore(new BigDecimal(0L));
        if (result.getLabel() == null) result.setLabel("");
        return result;
    }

    /**
     * 데이터베이스에서 문서정보를 불러와 요약DTO를 만들어주는 함수
     * @param documentCode
     * @return
     */
    public AnalysisSummaryDTO getAnalysisSummary(String documentCode) {
        ContractClause contractclause = contractClauseRepository.findByDocumentCode(documentCode)
                                            .orElseThrow(
                                                () -> new EntityNotFoundException("ContractClause not found with documentCode: " + documentCode)
                                                );

        ClauseSummaryDTO clauseSummaryDTO = new ClauseSummaryDTO(contractclause);

        AnalysisReport analysisReport = analysisReportRepository.findByDocumentCode(documentCode)
                                            .orElseThrow(
                                                () -> new EntityNotFoundException("AnalysisReport not found with documentCode: " + documentCode)
                                            );

        AnalysisReportsDTO analysisReportsDTO = AnalysisReportsDTO.fromEntity(analysisReport);

        String reportCode = analysisReport.getReportCode();
        if(reportCode == null) {
            throw new IllegalArgumentException("reportCode가 null입니다");
        }

        TransactionAnomaly transactionAnomaly = transactionAnomalyRepository.findByReportCode(reportCode)
                                                    .orElseThrow(
                                                    () -> new EntityNotFoundException("TransactionAnomaly not found with reportCode: " + reportCode)
                                                );

        TransectionAnomalyDTO TransactionAnomalyDTO = new TransectionAnomalyDTO(transactionAnomaly);

        return AnalysisSummaryDTO.builder()
                                    .riskyClauses(clauseSummaryDTO)
                                    .transactionAnomaly(TransactionAnomalyDTO)
                                    .analysisReport(analysisReportsDTO)
                                    .build();
    }

     /**
     * ocr결과를 이상치분석 api 요청
     */
    private void triggerFastApiAnalysis(String apiName) {
        log.info("FastAPI 트리거 활성화: {}", apiName);
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", apiName);

        @SuppressWarnings("rawtypes") // postForEntity가 제네릭 맵 타입을 직접 지원하지 않으므로 경고를 무시합니다.
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:8000/trigger",
                triggerBody,
                Map.class);

        @SuppressWarnings("rawtypes")
        Map responseBody = response.getBody();
        if (responseBody != null) {
            Object messageObj = responseBody.get("message");
            String message = (messageObj != null) ? messageObj.toString() : "No message";
            log.info("FastAPI 트리거 응답: {}", message);
        }
    }
}
