package realty.domain.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.25
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
  private String riskLevel;
}