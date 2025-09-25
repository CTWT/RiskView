package realty.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import realty.domain.model.Documents;
import realty.domain.model.FileStorageMetadata;
import realty.domain.model.StructuredContractData;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 :
 * 작성일 : 25.07.31
 * 파일명 : ContractDTO.java
 */

/**
 * 계약서와 관련된 DTO를 모아 놓은 클래스
 */

public class ContractDTO {
    
    /**
     * DocumentsDTO
     */
    @Builder
    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentsDTO{
        private String title;               
        private String status;
        private Boolean isDeleted;

        public static DocumentsDTO from(Documents entity) {
            return DocumentsDTO.builder()
                    .title(entity.getTitle())
                    .status(entity.getStatus())
                    .isDeleted(entity.getIsDeleted())
                    .build();
        }

        public static Documents toEntity(DocumentsDTO documentsDTO) {
            return Documents.builder()
                    .title(documentsDTO.getTitle())
                    .status(documentsDTO.getStatus())
                    .isDeleted(documentsDTO.getIsDeleted())
                    .build();
        }
    }

    /**
     * FileStorageMetadataDTO
     */
    @Builder
    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileStorageMetadataDTO{
        private String originalName;
        private String storedPath;
        private Integer fileSizeKb;
        private String fileType;
        private Boolean isEncrypted;

        public static FileStorageMetadataDTO from(FileStorageMetadata fileStorageMetadata){
            return FileStorageMetadataDTO.builder()
                                        .originalName(fileStorageMetadata.getOriginalName())
                                        .storedPath(fileStorageMetadata.getStoredPath())
                                        .fileSizeKb(fileStorageMetadata.getFileSizeKb())
                                        .fileType(fileStorageMetadata.getFileType())
                                        .isEncrypted(fileStorageMetadata.getIsEncrypted())
                                        .build();
        }

        public static FileStorageMetadata toEntity(FileStorageMetadataDTO fileStorageMetadataDTO) {
            return FileStorageMetadata.builder()
                    .originalName(fileStorageMetadataDTO.getOriginalName())
                    .storedPath(fileStorageMetadataDTO.getStoredPath())
                    .fileSizeKb(fileStorageMetadataDTO.getFileSizeKb())
                    .fileType(fileStorageMetadataDTO.getFileType())
                    .isEncrypted(fileStorageMetadataDTO.getIsEncrypted())
                    .build();
        }
    }

    /**
     * StructuredContractDataDTO
     */
    @Builder
    @Getter
    @Setter
    @ToString
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StructuredContractDataDTO{
        private String leaseType;  // 임대 유형(전세:JEONSE, 월세:MONTHLY)
        private String location;  // 소재지
        private String landType;  // 토지-지목
        private double landArea;  // 토지-면적(㎡)
        private String buildingStructureUse;  // 건물-구조 및 용도
        private double buildingArea;  // 건물-면적(㎡)
        private String leasePart;  // 임대할 부분
        private double leaseArea;  // 임대할 부분 면적(㎡)

        private long deposit; // 보증금
        private long downPayment;  // 계약금
        private boolean downPaymentSigned;  // 계약금 서명 여부
        private long middlePayment; // 중도금

        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date middlePaymentDate;  // 중도금 지급일
        private long balance;  // 잔금

        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date balanceDate;  // 잔금 지급일
        
        private long rentAmount; // 차임
        private String rentType;  // 선불/후불

        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date rentDate;  // 차임 지급일자

        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date leasePeriodStart;  // 임대 시작일

        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date leasePeriodEnd;  // 임대 종료일

        private long commissionAmount;  // 중개보수 금액
        private String specialTerms;  // 특약사항

        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date contractDate;  // 임대 종료일

        // Lessor (임대인)
        private String lessorAddress;  // 임대인 주소
        private String lessorIdNumber;  // 임대인 주민등록번호
        private String lessorPhone;  // 임대인 전화번호
        private String lessorName;  // 임대인 성명
        private String lessorAgentAddress;  // 임대인 대리인 주소
        private String lessorAgentIdNumber;  // 임대인 대리인 주민번호
        private String lessorAgentName;  // 임대인 대리인 성명

        // Lessee (임차인)
        private String lesseeAddress;  // 임차인 주소
        private String lesseeIdNumber;  // 임차인 주민등록번호
        private String lesseePhone;  // 임차인 전화번호
        private String lesseeName; // 임차인 성명
        private String lesseeAgentAddress ;  // 임차인 대리인 주소
        private String lesseeAgentIdNumber ;  // 임차인 대리인 주민번호
        private String lesseeAgentName ;  // 임차인 대리인 성명

        // Realtor (공인중개사 정보)
        private String realtorOfficeAddress1 ;  // 공인중개사 사무소 소재지(좌측)
        private String realtorOfficeAddress2 ;  // 공인중개사 사무소 소재지(우측)
        private String realtorOfficeName1 ;  // 공인중개사 사무소명칭(좌측)
        private String realtorOfficeName2 ;  // 공인중개사 사무소명칭(우측)
        private String realtorSignature1 ;  // 대표 서명 및 날인(좌측)
        private String realtorSignature2 ;  // 대표 서명 및 날인(우측)
        private String realtorLicensePhone1 ;  // 등록번호 및 전화번호(좌측)
        private String realtorLicensePhone2 ;  // 등록번호 및 전화번호(우측)
        private String realtorAgentSignature1 ;  // 소속공인중개사 서명(좌측)
        private String realtorAgentSignature2 ;  // 소속공인중개사 서명(우측)

        public static StructuredContractDataDTO from(StructuredContractData structuredContractData){
            return StructuredContractDataDTO.builder()
                .leaseType(structuredContractData.getLeaseType())
                .location(structuredContractData.getLocation())
                .landType(structuredContractData.getLandType())
                .landArea(structuredContractData.getLandArea() != null ? structuredContractData.getLandArea().doubleValue() : 0)
                .buildingStructureUse(structuredContractData.getBuildingStructureUse())
                .buildingArea(structuredContractData.getBuildingArea() != null ? structuredContractData.getBuildingArea().doubleValue() : 0)
                .leasePart(structuredContractData.getLeasePart())
                .leaseArea(structuredContractData.getLeaseArea() != null ? structuredContractData.getLeaseArea().doubleValue() : 0)
                .deposit(structuredContractData.getDeposit() != null ? structuredContractData.getDeposit() : 0)
                .downPayment(structuredContractData.getDownPayment() != null ? structuredContractData.getDownPayment() : 0)
                .downPaymentSigned(Boolean.TRUE.equals(structuredContractData.getDownPaymentSigned()))
                .middlePayment(structuredContractData.getMiddlePayment() != null ? structuredContractData.getMiddlePayment() : 0)
                .middlePaymentDate(toDate(structuredContractData.getMiddlePaymentDate()))
                .balance(structuredContractData.getBalance() != null ? structuredContractData.getBalance() : 0)
                .balanceDate(toDate(structuredContractData.getBalanceDate()))
                .rentAmount(structuredContractData.getRentAmount() != null ? structuredContractData.getRentAmount() : 0)
                .rentType(structuredContractData.getRentType())
                .rentDate(toDate(structuredContractData.getRentDate()))
                .leasePeriodStart(toDate(structuredContractData.getLeasePeriodStart()))
                .leasePeriodEnd(toDate(structuredContractData.getLeasePeriodEnd()))
                .commissionAmount(structuredContractData.getCommissionAmount() != null ? structuredContractData.getCommissionAmount() : 0)
                .specialTerms(structuredContractData.getSpecialTerms())
                .contractDate(toDate(structuredContractData.getContractDate()))
                .lessorAddress(structuredContractData.getLessorAddress())
                .lessorIdNumber(structuredContractData.getLessorIdNumber())
                .lessorPhone(structuredContractData.getLessorPhone())
                .lessorName(structuredContractData.getLessorName())
                .lessorAgentAddress(structuredContractData.getLessorAgentAddress())
                .lessorAgentIdNumber(structuredContractData.getLessorAgentIdNumber())
                .lessorAgentName(structuredContractData.getLessorAgentName())
                .lesseeAddress(structuredContractData.getLesseeAddress())
                .lesseeIdNumber(structuredContractData.getLesseeIdNumber())
                .lesseePhone(structuredContractData.getLesseePhone())
                .lesseeName(structuredContractData.getLesseeName())
                .lesseeAgentAddress(structuredContractData.getLesseeAgentAddress())
                .lesseeAgentIdNumber(structuredContractData.getLesseeAgentIdNumber())
                .lesseeAgentName(structuredContractData.getLesseeAgentName())
                .realtorOfficeAddress1(structuredContractData.getRealtorOfficeAddress1())
                .realtorOfficeAddress2(structuredContractData.getRealtorOfficeAddress2())
                .realtorOfficeName1(structuredContractData.getRealtorOfficeName1())
                .realtorOfficeName2(structuredContractData.getRealtorOfficeName2())
                .realtorSignature1(structuredContractData.getRealtorSignature1())
                .realtorSignature2(structuredContractData.getRealtorSignature2())
                .realtorLicensePhone1(structuredContractData.getRealtorLicensePhone1())
                .realtorLicensePhone2(structuredContractData.getRealtorLicensePhone2())
                .realtorAgentSignature1(structuredContractData.getRealtorAgentSignature1())
                .realtorAgentSignature2(structuredContractData.getRealtorAgentSignature2())
                .build();
        }

        public static StructuredContractData toEntity(StructuredContractDataDTO dto) {
            return StructuredContractData.builder()
                    .leaseType(dto.getLeaseType())
                    .location(dto.getLocation())
                    .landType(dto.getLandType())
                    .landArea(BigDecimal.valueOf(dto.getLandArea()))
                    .buildingStructureUse(dto.getBuildingStructureUse())
                    .buildingArea(BigDecimal.valueOf(dto.getBuildingArea()))
                    .leasePart(dto.getLeasePart())
                    .leaseArea(BigDecimal.valueOf(dto.getLeaseArea()))
                    .deposit(dto.getDeposit())
                    .downPayment(dto.getDownPayment())
                    .downPaymentSigned(dto.isDownPaymentSigned())
                    .middlePayment(dto.getMiddlePayment())
                    .middlePaymentDate(toLocalDate(dto.getMiddlePaymentDate()))
                    .balance(dto.getBalance())
                    .balanceDate(toLocalDate(dto.getBalanceDate()))
                    .rentAmount(dto.getRentAmount())
                    .rentType(dto.getRentType())
                    .rentDate(toLocalDate(dto.getRentDate()))
                    .leasePeriodStart(toLocalDate(dto.getLeasePeriodStart()))
                    .leasePeriodEnd(toLocalDate(dto.getLeasePeriodEnd()))
                    .commissionAmount(dto.getCommissionAmount())
                    .specialTerms(dto.getSpecialTerms())
                    .contractDate(toLocalDate(dto.getContractDate()))
                    .lessorAddress(dto.getLessorAddress())
                    .lessorIdNumber(dto.getLessorIdNumber())
                    .lessorPhone(dto.getLessorPhone())
                    .lessorName(dto.getLessorName())
                    .lessorAgentAddress(dto.getLessorAgentAddress())
                    .lessorAgentIdNumber(dto.getLessorAgentIdNumber())
                    .lessorAgentName(dto.getLessorAgentName())
                    .lesseeAddress(dto.getLesseeAddress())
                    .lesseeIdNumber(dto.getLesseeIdNumber())
                    .lesseePhone(dto.getLesseePhone())
                    .lesseeName(dto.getLesseeName())
                    .lesseeAgentAddress(dto.getLesseeAgentAddress())
                    .lesseeAgentIdNumber(dto.getLesseeAgentIdNumber())
                    .lesseeAgentName(dto.getLesseeAgentName())
                    .realtorOfficeAddress1(dto.getRealtorOfficeAddress1())
                    .realtorOfficeAddress2(dto.getRealtorOfficeAddress2())
                    .realtorOfficeName1(dto.getRealtorOfficeName1())
                    .realtorOfficeName2(dto.getRealtorOfficeName2())
                    .realtorSignature1(dto.getRealtorSignature1())
                    .realtorSignature2(dto.getRealtorSignature2())
                    .realtorLicensePhone1(dto.getRealtorLicensePhone1())
                    .realtorLicensePhone2(dto.getRealtorLicensePhone2())
                    .realtorAgentSignature1(dto.getRealtorAgentSignature1())
                    .realtorAgentSignature2(dto.getRealtorAgentSignature2())
                    .build();
        }
    }


    @Builder 
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    public static class ContractInfo {
        private DocumentsDTO documentsDTO;
        private StructuredContractDataDTO structuredContractDataDTO;
        private FileStorageMetadataDTO fileStorageMetadataDTO;
    }

    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContractResponse {
        private ContractInfo contractInfo;
        private MapInfo mapInfo;
    }

    // LocalDate -> Date
    private static Date toDate(LocalDate localDate) {
         return localDate != null ? java.sql.Date.valueOf(localDate) : null;
    }

    //Date -> LocalDate
    private static LocalDate toLocalDate(Date date) {
        return date != null ? date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : null;
    }
};
