package realty.domain.dto;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.07.22
 * 수정일 : 
 * 파일명 : RecentAnalysisDTO.java
 */

public class RecentAnalysisDTO {

    private String location;
    private Long deposit;  // 계약금을 Long 타입으로 변경
    private String risk;   // 위험도

    // 생성자 수정 (location, deposit, risk)
    public RecentAnalysisDTO(String location, Long deposit, String risk) {
        this.location = location;
        this.deposit = deposit;
        this.risk = risk;
    }

    // getter, setter
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Long getDeposit() {
        return deposit;
    }

    public void setDeposit(Long deposit) {
        this.deposit = deposit;
    }

    public String getRisk() {
        return risk;
    }

    public void setRisk(String risk) {
        this.risk = risk;
    }
}
