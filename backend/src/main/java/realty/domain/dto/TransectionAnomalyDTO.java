package realty.domain.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
import realty.domain.model.TransactionAnomaly;

@Getter
@Setter
public class TransectionAnomalyDTO{
    private Long price; // 환산 전체가
    private Long averagePrice;      // 평균가
    private Boolean isAnomaly;      // 이상여부
    private BigDecimal deviationPercent;

    public TransectionAnomalyDTO(TransactionAnomaly transactionAnomaly) {
        setPrice(transactionAnomaly.getPrice());
        setAveragePrice(transactionAnomaly.getAveragePrice());
        setIsAnomaly(transactionAnomaly.getIsAnomaly());
        setDeviationPercent(transactionAnomaly.getDeviationPercent());
    }    
}
