package realty.domain.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.09.25
 * 수정일 : 25.09.25
 * 파일명 : AnalysisHistoryDTO.java
 * 설명 : 내 분석 내역을 보여주는 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisHistoryDTO {

  private String documentCode;
  private String location;
  private LocalDate contractDate;
  private LocalDate analysisDate;
  private String riskLevel;

  // JPQL 쿼리에서 사용할 생성자
  public AnalysisHistoryDTO(String documentCode, String location, LocalDate contractDate, String riskLevel) {
    this.documentCode = documentCode;
    this.location = location;
    this.contractDate = contractDate;
    this.riskLevel = riskLevel;
  }
}