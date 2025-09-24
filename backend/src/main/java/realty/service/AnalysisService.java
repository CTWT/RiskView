package realty.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import realty.domain.dto.AnalysisHistoryDTO;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.RecentAnalysisDTO;
import realty.domain.repository.AnalysisRepository;
import realty.domain.dto.RiskDistributionDTO;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.22
 * 수정일 : 
 * 파일명 : AnalysisService.java
 */

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisRepository analysisRepository;

    /**
     * 특정 사용자의 총 분석 횟수 반환
     */
    public long getAnalysisCountForUser(String userCode) {
        return analysisRepository.countByUserCode(userCode);
    }

    /**
     * 특정 사용자의 최근 분석 기록 5개 반환
     */
    public List<RecentAnalysisDTO> getRecentAnalysisForUser(String userCode) {
        return analysisRepository.findAllByUserCodeOrderByCreatedAtDesc(userCode);
    }

    /**
     * 특정 사용자의 위험도 분포 통계 반환
     */
    public List<RiskDistributionDTO> getRiskDistributionForUser(String userCode) {
        List<Map<String, Object>> results = analysisRepository.countRiskLevelsByUserCode(userCode);
        long total = results.stream().mapToLong(r -> (Long) r.get("count")).sum();

        if (total == 0) {
            return List.of();
        }

        return results.stream().map(result -> {
            String riskLevel = (String) result.get("riskLevel");
            long count = (Long) result.get("count");
            double percentage = (double) count / total * 100;

            return new RiskDistributionDTO(
                riskLevel,
                Math.round(percentage) // 소수점 반올림
            );
        }).collect(Collectors.toList());
    }

    /**
     * 특정 사용자의 전체 분석 기록 반환 (내 분석 보기)
     */
    public List<AnalysisHistoryDTO> getAnalysisHistory(String userCode) {
        return analysisRepository.findAnalysisHistoryByUserCode(userCode);
    }
}