package realty.domain.dto;

import lombok.Getter;
import lombok.Setter;
import realty.domain.model.ContractClause;

@Getter
@Setter
public class ClauseSummaryDTO {
    private String clauseSummary;
    private String legalRisk;
    private String financialImpact;
    private String operationalImpact;
    private String recommendedAction;

    public ClauseSummaryDTO(ContractClause contractClause) {
        if (contractClause == null || contractClause.getClauseValue() == null) {
            throw new IllegalArgumentException("계약 조항 정보가 null 입니다.");
        }

        String totalSummary = contractClause.getRiskReason();

        int legalRiskIndex = totalSummary.indexOf("법적 리스크: ");
        int financialImpactIndex = totalSummary.indexOf("재정적 영향: ");
        int operationalImpactIndex = totalSummary.indexOf("운영적 영향: ");
        int recommendedActionIndex = totalSummary.indexOf("권장 조치: ");

        if (legalRiskIndex == -1 || financialImpactIndex == -1 || 
            operationalImpactIndex == -1 || recommendedActionIndex == -1) {
            throw new IllegalStateException("조항 요약 포맷이 올바르지 않습니다: " + totalSummary);
        }

        String summary = totalSummary.substring("요약: ".length(), legalRiskIndex).trim();
        setClauseSummary(summary);

        String legalRisk = totalSummary.substring(
                legalRiskIndex + "법적 리스크: ".length(), financialImpactIndex).trim();
        setLegalRisk(legalRisk);

        String financialImpact = totalSummary.substring(
                financialImpactIndex + "재정적 영향: ".length(), operationalImpactIndex).trim();
        setFinancialImpact(financialImpact);

        String operationalImpact = totalSummary.substring(
                operationalImpactIndex + "운영적 영향: ".length(), recommendedActionIndex).trim();
        setOperationalImpact(operationalImpact);

        String recommendedAction = totalSummary.substring(
                recommendedActionIndex + "권장 조치: ".length()).trim();
        setRecommendedAction(recommendedAction);
    }
}
