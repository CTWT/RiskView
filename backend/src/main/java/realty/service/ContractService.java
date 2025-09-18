package realty.service;

import java.math.BigDecimal;
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

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.AnalysisReportsDTO;
import realty.domain.dto.AnomalyDetectResult;
import realty.domain.dto.ContractClauseDTO;
import realty.domain.dto.ContractDTO;
import realty.domain.dto.FinalCommitRequest;
import realty.domain.model.AnalysisReport;
import realty.domain.model.ContractClause;
import realty.domain.model.ContractClause.ClauseType;
import realty.domain.model.Documents;
import realty.domain.model.FileStorageMetadata;
import realty.domain.model.StructuredContractData;
import realty.domain.model.TransactionAnomaly;
import realty.domain.model.AnalysisReport.SentimentCategory;
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
    private final RestTemplate restTemplate;

    public StructuredContractData findStructuredContractDataByDocumentcode(String documentcode) {
        return contractRepository.findByDocumentcode(documentcode);
    }

    public Documents findDocumentByUsercode(String Usercode) {
        return documentsRepository.findByUserCode(Usercode);
    }

    private String documentSave(ContractDTO.DocumentsDTO documentsDTO, String userCode) {
        Documents entity = ContractDTO.DocumentsDTO.toEntity(documentsDTO);
        entity.setUserCode(userCode);
        entity.setDocumentCode("not-set");
        Documents savedEntity = documentsRepository.save(entity);
        documentsRepository.flush();

        String generatedCode = "D" + String.format("%08d", savedEntity.getDocumentId());
        savedEntity.setDocumentCode(generatedCode);
        documentsRepository.save(savedEntity);
        documentsRepository.flush();

        return generatedCode;
    }

    private void structuredContractDataSave(ContractDTO.StructuredContractDataDTO structuredContractDataDTO, String documentCode) {
        StructuredContractData entity = ContractDTO.StructuredContractDataDTO.toEntity(structuredContractDataDTO);
        entity.setDocumentcode(documentCode);
        contractRepository.save(entity);
    }

    private void fileStorageMetadataSave(ContractDTO.FileStorageMetadataDTO fileStorageMetadataDTO, String documentCode) {
        FileStorageMetadata entity = ContractDTO.FileStorageMetadataDTO.toEntity(fileStorageMetadataDTO);
        entity.setFileCode("not-set");
        entity.setEntityCode(documentCode);
        FileStorageMetadata savedEntity = fileStorageMetadataRepository.save(entity);

        String generateCode = "FSM" + String.format("%08d", savedEntity.getFileId());
        savedEntity.setFileCode(generateCode);
        fileStorageMetadataRepository.save(savedEntity);
    }

    @Transactional
    public String save(ContractDTO.ContractInfo contractInfo, String userCode) {
        String documentsCode = documentSave(contractInfo.getDocumentsDTO(), userCode);
        structuredContractDataSave(contractInfo.getStructuredContractDataDTO(), documentsCode);
        fileStorageMetadataSave(contractInfo.getFileStorageMetadataDTO(), documentsCode);

        System.out.println("계약서 저장 완료!");
        return documentsCode;
    }

    @Transactional
    public void save(FinalCommitRequest finalCommitRequest) {
        ContractClauseDTO contractClauseDTO = finalCommitRequest.getContractClauseDTO();
        contractClauseSave(contractClauseDTO, finalCommitRequest.getDocumentCode());
        
        AnalysisReportsDTO analysisReportsDTO = finalCommitRequest.getAnalysisReportsDTO();
        String reportCode = analysisReportSave(analysisReportsDTO, finalCommitRequest.getDocumentCode());

        AnomalyDetectResult anomalyDetectResult = finalCommitRequest.getAnomalyDetectResult();
        anomalyDetectSave(anomalyDetectResult, reportCode);
    }

    private void contractClauseSave(ContractClauseDTO contractClauseDTO, String documentCode) {
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
        
    }

    private String analysisReportSave(AnalysisReportsDTO analysisReportsDTO, String documentCode) {
        AnalysisReport analysisReport = AnalysisReport.builder()
                                                        .documentCode(documentCode)
                                                        .reportCode("not-set")
                                                        .riskLevel("not-set")
                                                        .sentimentCategory(SentimentCategory.긍정)
                                                        .sentimentEmoji("!")
                                                        .sentimentScore(new BigDecimal(100))
                                                        .sentimentSummary("not-set")
                                                        .build();

        AnalysisReport savedEntity = analysisReportRepository.save(analysisReport);
        analysisReportRepository.flush();
        return savedEntity.getReportCode();
                                                        
    }

    private void anomalyDetectSave(AnomalyDetectResult anomalyDetectResult, String reportCode) {
        TransactionAnomaly transactionAnomaly = TransactionAnomaly.builder()
                                                                    .reportCode(reportCode)
                                                                    .anomalyCode("not-set")
                                                                    .averagePrice(anomalyDetectResult.getAveragePrice())
                                                                    .deviationPercent(anomalyDetectResult.getDeviationPercent())
                                                                    .isAnomaly(anomalyDetectResult.getIsAnomaly())
                                                                    .price(anomalyDetectResult.getUserContractPrice())
                                                                    .build();

        transactionAnomalyRepository.save(transactionAnomaly);                                   
    }



    /**
     * 이상치 분석로직
     * @param structuredContractDataDTO 계약서 정보
     * @return
     */
    public AnomalyDetectResult analyzeAnomaly(ContractDTO.StructuredContractDataDTO structuredContractDataDTO){

        triggerFastApiAnalysis("analyze_estate");

        // post
        ResponseEntity<AnomalyDetectResult> response = restTemplate.postForEntity(
                "http://localhost:8000/analyze_estate",
                structuredContractDataDTO,
                AnomalyDetectResult.class);


        return response.getBody();
    }

    /**
     * 특약사항 분석 로직
     * @param contractClause
     * @return
     */
    public ContractClauseDTO analyzeClause(String contractClause){
        triggerFastApiAnalysis("analyze_clause");

        Map<String, String> body = new HashMap<>();
        body.put("contract_clause", contractClause);

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HttpEntity로 body + headers 감싸기
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        // POST 요청
        ResponseEntity<ContractClauseDTO> response = restTemplate.postForEntity(
                "http://localhost:8000/analyze_clause",
                request,
                ContractClauseDTO.class
        );

        return response.getBody();
    }

     /**
     * ocr결과를 이상치분석 api 요청
     */
    private void triggerFastApiAnalysis(String apiName) {
        Map<String, String> triggerBody = new HashMap<>();
        triggerBody.put("api_name", apiName);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:8000/trigger",
                triggerBody,
                Map.class);

        if (response.getBody() != null) {
            String message = (String) response.getBody().get("message");
            System.out.println("FastAPI 응답: " + message);
        }
    }

}
