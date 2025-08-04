package realty.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/*
 * 수업명 : 가비아 2회차
 * 이름 : 김관호
 * 작성자 : 김관호
 * 수정자 : 
 * 작성일 : 25.07.21
 * 파일명 : StructuredContractData.java
 */

/**
 * 데이터베이스와 연동되는 계약서 Entity(model)
 */

@Entity
@Table(name = "structured_contract_data")
@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class StructuredContractData implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "BIGINT COMMENT '구조화 계약 데이터 ID'")
    private Long id;

    @Column(name = "lease_type", nullable = false, columnDefinition = "ENUM('JEONSE', 'MONTHLY') DEFAULT 'JEONSE' COMMENT '임대 유형'")
    private String leaseType;

    @Column(name = "document_code", nullable = false, length = 20, columnDefinition = "VARCHAR(20) COMMENT '문서 고유 코드 (FK)'")
    private String documentcode;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "land_type", length = 100)
    private String landType;

    @Column(name = "land_area", precision = 10, scale = 2)
    private BigDecimal landArea;

    @Column(name = "building_structure_use", length = 255)
    private String buildingStructureUse;

    @Column(name = "building_area", precision = 10, scale = 2)
    private BigDecimal buildingArea;

    @Column(name = "lease_part", length = 255)
    private String leasePart;

    @Column(name = "lease_area", precision = 10, scale = 2)
    private BigDecimal leaseArea;

    @Column(name = "deposit")
    private Long deposit;

    @Column(name = "down_payment")
    private Long downPayment;

    @Column(name = "down_payment_signed")
    private Boolean downPaymentSigned;

    @Column(name = "middle_payment")
    private Long middlePayment;

    @Column(name = "middle_payment_date")
    private LocalDate middlePaymentDate;

    @Column(name = "balance")
    private Long balance;

    @Column(name = "balance_date")
    private LocalDate balanceDate;

    @Column(name = "rent_amount")
    private Long rentAmount;

    @Column(name = "rent_type", columnDefinition = "ENUM('선불', '후불')")
    private String rentType;

    @Column(name = "rent_date")
    private LocalDate rentDate;

    @Column(name = "lease_period_start")
    private LocalDate leasePeriodStart;

    @Column(name = "lease_period_end")
    private LocalDate leasePeriodEnd;

    @Column(name = "commission_amount")
    private Long commissionAmount;

    @Column(name = "special_terms", columnDefinition = "TEXT")
    private String specialTerms;

    @Column(name = "lessor_address", length = 255)
    private String lessorAddress;

    @Column(name = "lessor_id_number", length = 100)
    private String lessorIdNumber;

    @Column(name = "lessor_phone", length = 50)
    private String lessorPhone;

    @Column(name = "lessor_name", length = 100)
    private String lessorName;

    @Column(name = "lessor_agent_address", length = 255)
    private String lessorAgentAddress;

    @Column(name = "lessor_agent_id_number", length = 100)
    private String lessorAgentIdNumber;

    @Column(name = "lessor_agent_name", length = 100)
    private String lessorAgentName;

    @Column(name = "lessee_address", length = 255)
    private String lesseeAddress;

    @Column(name = "lessee_id_number", length = 100)
    private String lesseeIdNumber;

    @Column(name = "lessee_phone", length = 50)
    private String lesseePhone;

    @Column(name = "lessee_name", length = 100)
    private String lesseeName;

    @Column(name = "lessee_agent_address", length = 255)
    private String lesseeAgentAddress;

    @Column(name = "lessee_agent_id_number", length = 100)
    private String lesseeAgentIdNumber;

    @Column(name = "lessee_agent_name", length = 100)
    private String lesseeAgentName;

    @Column(name = "realtor_office_address_1", length = 255, nullable = false)
    private String realtorOfficeAddress1;

    @Column(name = "realtor_office_address_2", length = 255)
    private String realtorOfficeAddress2;

    @Column(name = "realtor_office_name_1", length = 255, nullable = false)
    private String realtorOfficeName1;

    @Column(name = "realtor_office_name_2", length = 255)
    private String realtorOfficeName2;

    @Column(name = "realtor_signature_1", length = 255, nullable = false)
    private String realtorSignature1;

    @Column(name = "realtor_signature_2", length = 255)
    private String realtorSignature2;

    @Column(name = "realtor_license_phone_1", length = 100, nullable = false)
    private String realtorLicensePhone1;

    @Column(name = "realtor_license_phone_2", length = 100)
    private String realtorLicensePhone2;

    @Column(name = "realtor_agent_signature_1", length = 255, nullable = false)
    private String realtorAgentSignature1;

    @Column(name = "realtor_agent_signature_2", length = 255)
    private String realtorAgentSignature2;

    // 연관관계 매핑 (선택적)
    // 문서와의 다대일 관계
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_code", referencedColumnName = "document_code",
                insertable = false, updatable = false)
    private Documents documents;
}
