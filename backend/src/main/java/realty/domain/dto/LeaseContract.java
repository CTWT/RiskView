package realty.domain.dto;
import java.util.Date;

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

    private String leaseType = "";
    private String location = "";
    private String landType = "";
    private double landArea = 0;
    private String buildingStructureUse = "";
    private double buildingArea = 0;
    private String leasePart = "";
    private double leaseArea = 0;

    private long deposit = 0;
    private long downPayment = 0;
    private boolean downPaymentSigned = false;
    private long middlePayment = 0;
    private Date middlePaymentDate = null;
    private long balance = 0;
    private Date balanceDate = null;
    private long rentAmount = 0;
    private String rentType = "";
    private Date rentDate = null;
    private Date leasePeriodStart = null;
    private Date leasePeriodEnd = null;
    private long commissionAmount = 0;
    private String specialTerms = "";

    // Lessor (임대인)
    private String lessorAddress = "";
    private String lessorIdNumber = "";
    private String lessorPhone = "";
    private String lessorName = "";
    private String lessorAgentAddress = "";
    private String lessorAgentIdNumber = "";
    private String lessorAgentName = "";

    // Lessee (임차인)
    private String lesseeAddress = "";
    private String lesseeIdNumber = "";
    private String lesseePhone = "";
    private String lesseeName = "";
    private String lesseeAgentAddress = "";
    private String lesseeAgentIdNumber = "";
    private String lesseeAgentName = "";

    // Realtor (공인중개사 정보)
    private String realtorOfficeAddress1 = "";
    private String realtorOfficeAddress2 = "";
    private String realtorOfficeName1 = "";
    private String realtorOfficeName2 = "";
    private String realtorSignature1 = "";
    private String realtorSignature2 = "";
    private String realtorLicensePhone1 = "";
    private String realtorLicensePhone2 = "";
    private String realtorAgentSignature1 = "";
    private String realtorAgentSignature2 = "";

}
