package realty.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import realty.domain.dto.LeaseContract;
import realty.domain.model.StructuredContractData;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : ContractConverter.java
 */

 /**
  * dto => model, model => dto 변환을 도와주는 클래스
  */


public class ContractConverter {

    public static StructuredContractData toEntity(LeaseContract leaseContract) {
        StructuredContractData entity = new StructuredContractData();

        entity.setLeaseType(leaseContract.getLeaseType());
        entity.setLocation(leaseContract.getLocation());
        entity.setLandType(leaseContract.getLandType());
        entity.setLandArea(BigDecimal.valueOf(leaseContract.getLandArea()));
        entity.setBuildingStructureUse(leaseContract.getBuildingStructureUse());
        entity.setBuildingArea(BigDecimal.valueOf(leaseContract.getBuildingArea()));
        entity.setLeasePart(leaseContract.getLeasePart());
        entity.setLeaseArea(BigDecimal.valueOf(leaseContract.getLeaseArea()));

        entity.setDeposit(leaseContract.getDeposit());
        entity.setDownPayment(leaseContract.getDownPayment());
        entity.setDownPaymentSigned(leaseContract.isDownPaymentSigned());
        entity.setMiddlePayment(leaseContract.getMiddlePayment());
        entity.setMiddlePaymentDate(convertToLocalDate(leaseContract.getMiddlePaymentDate()));
        entity.setBalance(leaseContract.getBalance());
        entity.setBalanceDate(convertToLocalDate(leaseContract.getBalanceDate()));
        entity.setRentAmount(leaseContract.getRentAmount());
        entity.setRentType(leaseContract.getRentType());
        entity.setRentDate(convertToLocalDate(leaseContract.getRentDate()));
        entity.setLeasePeriodStart(convertToLocalDate(leaseContract.getLeasePeriodStart()));
        entity.setLeasePeriodEnd(convertToLocalDate(leaseContract.getLeasePeriodEnd()));
        entity.setCommissionAmount(leaseContract.getCommissionAmount());
        entity.setSpecialTerms(leaseContract.getSpecialTerms());

        // Lessor
        entity.setLessorAddress(leaseContract.getLessorAddress());
        entity.setLessorIdNumber(leaseContract.getLessorIdNumber());
        entity.setLessorPhone(leaseContract.getLessorPhone());
        entity.setLessorName(leaseContract.getLessorName());
        entity.setLessorAgentAddress(leaseContract.getLessorAgentAddress());
        entity.setLessorAgentIdNumber(leaseContract.getLessorAgentIdNumber());
        entity.setLessorAgentName(leaseContract.getLessorAgentName());

        // Lessee
        entity.setLesseeAddress(leaseContract.getLesseeAddress());
        entity.setLesseeIdNumber(leaseContract.getLesseeIdNumber());
        entity.setLesseePhone(leaseContract.getLesseePhone());
        entity.setLesseeName(leaseContract.getLesseeName());
        entity.setLesseeAgentAddress(leaseContract.getLesseeAgentAddress());
        entity.setLesseeAgentIdNumber(leaseContract.getLesseeAgentIdNumber());
        entity.setLesseeAgentName(leaseContract.getLesseeAgentName());

        // Realtor
        entity.setRealtorOfficeAddress1(leaseContract.getRealtorOfficeAddress1());
        entity.setRealtorOfficeAddress2(leaseContract.getRealtorOfficeAddress2());
        entity.setRealtorOfficeName1(leaseContract.getRealtorOfficeName1());
        entity.setRealtorOfficeName2(leaseContract.getRealtorOfficeName2());
        entity.setRealtorSignature1(leaseContract.getRealtorSignature1());
        entity.setRealtorSignature2(leaseContract.getRealtorSignature2());
        entity.setRealtorLicensePhone1(leaseContract.getRealtorLicensePhone1());
        entity.setRealtorLicensePhone2(leaseContract.getRealtorLicensePhone2());
        entity.setRealtorAgentSignature1(leaseContract.getRealtorAgentSignature1());
        entity.setRealtorAgentSignature2(leaseContract.getRealtorAgentSignature2());

        return entity;
    }

    public static LeaseContract toDto(StructuredContractData leaseContract) {
        LeaseContract dto = new LeaseContract();

        dto.setLeaseType(leaseContract.getLeaseType());
        dto.setLocation(leaseContract.getLocation());
        dto.setLandType(leaseContract.getLandType());
        dto.setLandArea(leaseContract.getLandArea().doubleValue());
        dto.setBuildingStructureUse(leaseContract.getBuildingStructureUse());
        dto.setBuildingArea(leaseContract.getBuildingArea().doubleValue());
        dto.setLeasePart(leaseContract.getLeasePart());
        dto.setLeaseArea(leaseContract.getLeaseArea().doubleValue());

        dto.setDeposit(leaseContract.getDeposit());
        dto.setDownPayment(leaseContract.getDownPayment());
        dto.setDownPaymentSigned(leaseContract.getDownPaymentSigned());
        dto.setMiddlePayment(leaseContract.getMiddlePayment());
        dto.setMiddlePaymentDate(convertToDate(leaseContract.getMiddlePaymentDate()));
        dto.setBalance(leaseContract.getBalance());
        dto.setBalanceDate(convertToDate(leaseContract.getBalanceDate()));
        dto.setRentAmount(leaseContract.getRentAmount());
        dto.setRentType(leaseContract.getRentType());
        dto.setRentDate(convertToDate(leaseContract.getRentDate()));
        dto.setLeasePeriodStart(convertToDate(leaseContract.getLeasePeriodStart()));
        dto.setLeasePeriodEnd(convertToDate(leaseContract.getLeasePeriodEnd()));
        dto.setCommissionAmount(leaseContract.getCommissionAmount());
        dto.setSpecialTerms(leaseContract.getSpecialTerms());

        // Lessor
        dto.setLessorAddress(leaseContract.getLessorAddress());
        dto.setLessorIdNumber(leaseContract.getLessorIdNumber());
        dto.setLessorPhone(leaseContract.getLessorPhone());
        dto.setLessorName(leaseContract.getLessorName());
        dto.setLessorAgentAddress(leaseContract.getLessorAgentAddress());
        dto.setLessorAgentIdNumber(leaseContract.getLessorAgentIdNumber());
        dto.setLessorAgentName(leaseContract.getLessorAgentName());

        // Lessee
        dto.setLesseeAddress(leaseContract.getLesseeAddress());
        dto.setLesseeIdNumber(leaseContract.getLesseeIdNumber());
        dto.setLesseePhone(leaseContract.getLesseePhone());
        dto.setLesseeName(leaseContract.getLesseeName());
        dto.setLesseeAgentAddress(leaseContract.getLesseeAgentAddress());
        dto.setLesseeAgentIdNumber(leaseContract.getLesseeAgentIdNumber());
        dto.setLesseeAgentName(leaseContract.getLesseeAgentName());

        // Realtor
        dto.setRealtorOfficeAddress1(leaseContract.getRealtorOfficeAddress1());
        dto.setRealtorOfficeAddress2(leaseContract.getRealtorOfficeAddress2());
        dto.setRealtorOfficeName1(leaseContract.getRealtorOfficeName1());
        dto.setRealtorOfficeName2(leaseContract.getRealtorOfficeName2());
        dto.setRealtorSignature1(leaseContract.getRealtorSignature1());
        dto.setRealtorSignature2(leaseContract.getRealtorSignature2());
        dto.setRealtorLicensePhone1(leaseContract.getRealtorLicensePhone1());
        dto.setRealtorLicensePhone2(leaseContract.getRealtorLicensePhone2());
        dto.setRealtorAgentSignature1(leaseContract.getRealtorAgentSignature1());
        dto.setRealtorAgentSignature2(leaseContract.getRealtorAgentSignature2());

        return dto;
    }

    private static LocalDate convertToLocalDate(Date date) {
        return date != null ? date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : null;
    }

    private static Date convertToDate(LocalDate localDate) {
        return localDate != null ? Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant()) : null;
    }
}

