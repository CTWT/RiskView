package realty.domain.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "contract_clauses")
public class ContractClause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "clause_id")
    private Long clauseId; // 조항 ID

    @Column(name = "clause_code", nullable = false, unique = true, length = 20)
    private String clauseCode; // 조항 고유 코드

    @Column(name = "document_code", nullable = false, length = 20)
    private String documentCode; // 문서 고유 코드 (FK)

    @Enumerated(EnumType.STRING)
    @Column(name = "clause_type", columnDefinition = "ENUM('계약금','중도금','잔금','특약','기타')")
    private ClauseType clauseType; // 조항 타입

    @Column(name = "clause_title", length = 255)
    private String clauseTitle; // 조항 제목

    @Column(name = "clause_value")
    private String clauseValue; // 조항 내용

    @Column(name = "is_risky", nullable = false)
    private Boolean isRisky; // 위험 여부

    @Column(name = "risk_reason")
    private String riskReason; // 위험 판단 근거

    @Column(name = "created_by", length = 20)
    private String createdBy; // 레코드 생성자

    @CreatedDate
    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt; // 생성 시각

    // Enum 정의
    public enum ClauseType {
        계약금, 중도금, 잔금, 특약, 기타
    }

    @PostPersist
    public void generateCode() {
        this.clauseCode = "CCL" + String.format("%08d", clauseId);
    }
}
