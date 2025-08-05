package realty.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract_clauses")
public class ContractClause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "clause_id")
    private Long clauseId;

    @Column(name = "clause_code", length = 20, nullable = false, unique = true)
    private String clauseCode;

    @Column(name = "document_code", insertable = false, updatable = false)
    private String documentCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "clause_type", columnDefinition = "ENUM('DEPOSIT', 'INSTALLMENT', 'BALANCE', 'SPECIAL_TERM', 'ETC')")
    private ClauseType clauseType;

    @Column(name = "clause_title", length = 255)
    private String clauseTitle;

    @Column(name = "clause_value", columnDefinition = "TEXT")
    private String clauseValue;

    @Column(name = "is_risky")
    private Boolean isRisky = false;

    @Column(name = "risk_reason", columnDefinition = "TEXT")
    private String riskReason;

    @Column(name = "created_at", columnDefinition = "DATETIME")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_code", referencedColumnName = "document_code", 
                foreignKey = @ForeignKey(ConstraintMode.CONSTRAINT), nullable = false)
    private Documents documents;

    // ENUM 정의
    public enum ClauseType {
        DEPOSIT, INSTALLMENT, BALANCE, SPECIAL_TERM, ETC
    }
}
