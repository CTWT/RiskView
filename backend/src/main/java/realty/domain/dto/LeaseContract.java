package realty.domain.dto;
import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : LeaseContract.java
 */

 /**
  * 계약서에 대한 DTO 
  * model에서 documentCode, id 등 데이터를 주고 받을때 필요없는 정보는 포함하지 않음
  */

@Getter
@Setter
@ToString
public class LeaseContract {

    private String leaseType = "";  // 임대 유형(전세:JEONSE, 월세:MONTHLY)
    private String location = "";  // 소재지
    private String landType = "";  // 토지-지목
    private double landArea = 0;  // 토지-면적(㎡)
    private String buildingStructureUse = "";  // 건물-구조 및 용도
    private double buildingArea = 0;  // 건물-면적(㎡)
    private String leasePart = "";  // 임대할 부분
    private double leaseArea = 0;  // 임대할 부분 면적(㎡)

    private long deposit = 0;  // 보증금
    private long downPayment = 0;  // 계약금
    private boolean downPaymentSigned = false;  // 계약금 서명 여부
    private long middlePayment = 0;  // 중도금

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date middlePaymentDate = null;  // 중도금 지급일
    private long balance = 0;  // 잔금

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date balanceDate = null;  // 잔금 지급일
    
    private long rentAmount = 0;  // 차임
    private String rentType = "";  // 선불/후불

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date rentDate = null;  // 차임 지급일자

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date leasePeriodStart = null;  // 임대 시작일

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date leasePeriodEnd = null;  // 임대 종료일

    private long commissionAmount = 0;  // 중개보수 금액
    private String specialTerms = "";  // 특약사항

    // Lessor (임대인)
    private String lessorAddress = "";  // 임대인 주소
    private String lessorIdNumber = "";  // 임대인 주민등록번호
    private String lessorPhone = "";  // 임대인 전화번호
    private String lessorName = "";  // 임대인 성명
    private String lessorAgentAddress = "";  // 임대인 대리인 주소
    private String lessorAgentIdNumber = "";  // 임대인 대리인 주민번호
    private String lessorAgentName = "";  // 임대인 대리인 성명

    // Lessee (임차인)
    private String lesseeAddress = "";  // 임차인 주소
    private String lesseeIdNumber = "";  // 임차인 주민등록번호
    private String lesseePhone = "";  // 임차인 전화번호
    private String lesseeName = "";  // 임차인 성명
    private String lesseeAgentAddress = "";  // 임차인 대리인 주소
    private String lesseeAgentIdNumber = "";  // 임차인 대리인 주민번호
    private String lesseeAgentName = "";  // 임차인 대리인 성명

    // Realtor (공인중개사 정보)
    private String realtorOfficeAddress1 = "";  // 공인중개사 사무소 소재지(좌측)
    private String realtorOfficeAddress2 = "";  // 공인중개사 사무소 소재지(우측)
    private String realtorOfficeName1 = "";  // 공인중개사 사무소명칭(좌측)
    private String realtorOfficeName2 = "";  // 공인중개사 사무소명칭(우측)
    private String realtorSignature1 = "";  // 대표 서명 및 날인(좌측)
    private String realtorSignature2 = "";  // 대표 서명 및 날인(우측)
    private String realtorLicensePhone1 = "";  // 등록번호 및 전화번호(좌측)
    private String realtorLicensePhone2 = "";  // 등록번호 및 전화번호(우측)
    private String realtorAgentSignature1 = "";  // 소속공인중개사 서명(좌측)
    private String realtorAgentSignature2 = "";  // 소속공인중개사 서명(우측)
}
