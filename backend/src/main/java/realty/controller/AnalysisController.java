package realty.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import realty.domain.dto.AnalysisHistoryDTO;
import realty.domain.dto.RecentAnalysisDTO;
import realty.domain.dto.RiskDistributionDTO;
import realty.domain.model.User;
import realty.service.AnalysisService;
import realty.service.UserService;

/*
* 수업명 : 가비아 2회차
* 이름 : 박윤성
* 작성자 : 박윤성
* 수정자 : 
* 작성일 : 25.09.22
* 수정일 : 
* 파일명 : AnalysisController.java
*/

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService; // Ensure AnalysisService is a properly managed Spring bean (@Service)
    private final UserService userService; // Ensure UserService is a properly managed Spring bean (@Service or @Component)

    /**
     * 현재 로그인한 사용자의 총 계약서 분석 횟수 반환
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getMyAnalysisCount(HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        if (currentUser == null) {
            // 로그인하지 않은 사용자는 0을 반환하거나 에러 처리
            return ResponseEntity.status(401).body(0L);
        }

        long count = analysisService.getAnalysisCountForUser(currentUser.getUserCode());
        return ResponseEntity.ok(count);
    }

    /**
     * 현재 로그인한 사용자의 최근 분석 기록 5개 반환
     */
    @GetMapping("/recent")
    public ResponseEntity<List<RecentAnalysisDTO>> getMyRecentAnalysis(HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        if (currentUser == null) {
            // 로그인하지 않은 사용자는 빈 리스트를 반환하거나 에러 처리
            return ResponseEntity.status(401).body(List.of());
        }

        List<RecentAnalysisDTO> recentAnalysis = analysisService.getRecentAnalysisForUser(currentUser.getUserCode());
        return ResponseEntity.ok(recentAnalysis);
    }

    /**
     * 현재 로그인한 사용자의 위험도 분포 통계 반환
     */
    @GetMapping("/risk-distribution")
    public ResponseEntity<List<RiskDistributionDTO>> getMyRiskDistribution(HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        if (currentUser == null) {
            // 로그인하지 않은 사용자는 빈 리스트를 반환하거나 에러 처리
            return ResponseEntity.status(401).body(List.of());
        }

        List<RiskDistributionDTO> riskDistribution = analysisService.getRiskDistributionForUser(currentUser.getUserCode());
        return ResponseEntity.ok(riskDistribution);
    }

    /**
     * 현재 로그인한 사용자의 분석 내역 반환
     */
    @GetMapping("/history")
    public ResponseEntity<List<AnalysisHistoryDTO>> getAnalysisHistory(HttpServletRequest request) {
        User currentUser = userService.getCurrentUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userCode = currentUser.getUserCode();
        List<AnalysisHistoryDTO> history = analysisService.getAnalysisHistory(userCode).stream().map(h -> {
            // contractDate가 없는 경우를 대비해 analysisDate를 추가
            if (h.getContractDate() == null && h.getAnalysisDate() != null) {
                h.setContractDate(h.getAnalysisDate());
            }
            return h;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(history);
    }
}