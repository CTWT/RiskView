package realty.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import realty.domain.dto.RecentAnalysisDTO;
import realty.domain.model.AnalysisReport;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.22
 * 수정일 : 
 * 파일명 : AnalysisRepository.java
 */

@Repository
public interface AnalysisRepository extends JpaRepository<AnalysisReport, Long> {

    /**
     * 특정 사용자의 분석 리포트 개수를 조회합니다.
     * AnalysisReport와 Documents 테이블을 documentCode로 조인하여 userCode와 일치하는 레코드 수를 계산합니다.
     * @param userCode 사용자 고유 코드
     * @return 해당 사용자의 분석 리포트 개수
     */
    @Query("SELECT COUNT(ar) FROM AnalysisReport ar JOIN Documents d ON ar.documentCode = d.documentCode WHERE d.userCode = :userCode")
    long countByUserCode(@Param("userCode") String userCode);

    /**
     * 특정 사용자의 최근 분석 기록을 조회합니다.
     * @param userCode 사용자 고유 코드.
     * @return 최근 분석 기록 DTO 리스트 (생성일 내림차순).
     */
    @Query("SELECT new realty.domain.dto.RecentAnalysisDTO(scd.location, scd.deposit, ar.riskLevel) " +
           "FROM AnalysisReport ar " +
           "JOIN Documents d ON ar.documentCode = d.documentCode " +
           "JOIN StructuredContractData scd ON d.documentCode = scd.documentcode " +
           "WHERE d.userCode = :userCode ORDER BY ar.createdAt DESC")
    List<RecentAnalysisDTO> findAllByUserCodeOrderByCreatedAtDesc(@Param("userCode") String userCode);

    /**
     * 특정 사용자의 위험도별 분석 리포트 개수를 조회합니다.
     * @param userCode 사용자 고유 코드
     * @return 위험도(riskLevel)를 키로, 개수를 값으로 갖는 Map 리스트
     */
    @Query("SELECT new map(ar.riskLevel as riskLevel, COUNT(ar) as count) FROM AnalysisReport ar " +
           "JOIN Documents d ON ar.documentCode = d.documentCode WHERE d.userCode = :userCode GROUP BY ar.riskLevel")
    List<Map<String, Object>> countRiskLevelsByUserCode(@Param("userCode") String userCode);
}