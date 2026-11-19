package realty.domain.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transaction_anomalies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionAnomaly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "anomaly_id", nullable = false, updatable = false)
    private Long anomalyId; // 이상 ID (PK, AUTO_INCREMENT)

    @Column(name = "anomaly_code", nullable = false, unique = true, length = 20)
    private String anomalyCode; // 이상 탐지 고유 코드 (유니크)

    @Column(name = "report_code", nullable = false, length = 20)
    private String reportCode; // 분석 리포트 고유 코드 (FK)

    @Column(name = "price")
    private Long price; // 거래 가격

    @Column(name = "average_price")
    private Long averagePrice; // 평균 시세

    @Column(name = "deviation_percent", precision = 5, scale = 2)
    private BigDecimal deviationPercent; // 편차율 (percentage)

    @Column(name = "is_anomaly")
    private Boolean isAnomaly; // 이상 여부 (true: 이상, false: 정상)

    @Column(name = "created_by", length = 20)
    private String createdBy; // 레코드 생성자

    @PostPersist
    public void generateCode() {
        this.anomalyCode = "TA" + String.format("%08d", anomalyId);
    }
}