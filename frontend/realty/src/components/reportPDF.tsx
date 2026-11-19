// ReportPDF.tsx
import React from "react";
import NotoSansKR from "../../../../ai-api/api/wordcloud/NotoSansKR-Bold.ttf";
import NotoSansJP from "../../../../ai-api/api/wordcloud/NotoSansJP-Bold.ttf";
import NotoSansSC from "../../../../ai-api/api/wordcloud/NotoSansSC-Bold.ttf";

import { Font } from "@react-pdf/renderer";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import type { StructuredContractDataDTO } from "../types/contract";
import type { AnalysisSummaryDTO } from "../pages/analysis/PG100005";

// 한글 등 비 라틴 문자권 하이픈 오류 방지
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "NotoSansKR", backgroundColor: "#f9f9f9" },
  section: { marginBottom: 20, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 12, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 16, marginBottom: 8, color: "#666" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontWeight: "bold", color: "#333" },
  value: { color: "#000" },
  sentimentBarContainer: { flexDirection: "row", height: 12, backgroundColor: "#eee", borderRadius: 6, marginTop: 4 },
  sentimentBarFill: { height: 12, borderRadius: 6 },
  highlightBox: { padding: 8, borderRadius: 6, marginBottom: 6 },
});

interface ReportPDFProps {
  data: StructuredContractDataDTO;
  summary: AnalysisSummaryDTO | null;
  labels: Record<string, string>;
  lang: string; // 현재 언어 코드 (e.g., 'KO', 'EN', 'JP', 'ZH')
}

const ReportPDF: React.FC<ReportPDFProps> = ({ data, summary, labels, lang }) => {
  // 언어에 따라 폰트 동적 등록
  const getFontFamily = (language: string) => {
    const upperLang = language.toUpperCase();
    switch (upperLang) {
      case 'JA': // 일본어
      case 'JP':
        Font.register({ family: "NotoSans", src: NotoSansJP });
        return "NotoSans";
      case 'ZH': // 중국어
        Font.register({ family: "NotoSans", src: NotoSansSC });
        return "NotoSans";
      case 'KO': // 한국어
      default:
        Font.register({ family: "NotoSans", src: NotoSansKR });
        return "NotoSans";
    }
  };

  const fontFamily = getFontFamily(lang);
  const dynamicStyles = StyleSheet.create({
    page: { ...styles.page, fontFamily: fontFamily },
  });

  if (!summary) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>{labels.no_analysis_data}</Text>
        </Page>
      </Document>
    );
  }

  const getSentimentColor = (score: number) => {
    if (score > 70) return "#4caf50"; // Positive
    if (score > 40) return "#ff9800"; // Neutral
    return "#f44336"; // Negative
  };

  const getRiskColor = (riskLevel: string) => {
    const lowerRisk = riskLevel?.toLowerCase();
    if (["high", "critical", "고위험", "치명"].includes(lowerRisk)) return "#d32f2f";
    if (["medium", "warning", "중위험", "경고"].includes(lowerRisk)) return "#fbc02d";
    if (["low", "저위험"].includes(lowerRisk)) return "#388e3c";
    return "#9e9e9e"; // gray for UNKNOWN
  };

  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.title}>{labels.analysis_report_title}</Text>
        </View>

        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>{labels.basic_information}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.property_address}:</Text>
            <Text style={styles.value}>{data.location ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.contract_type}:</Text>
            <Text style={styles.value}>{data.leaseType ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.lease_period}:</Text>
            <Text style={styles.value}>
              {data.leasePeriodStart ?? "-"} ~ {data.leasePeriodEnd ?? "-"}
            </Text>
          </View>
        </View>

        {/* 재무 정보 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>{labels.financial_analysis_base}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.deposit}:</Text>
            <Text style={styles.value}>{data.deposit?.toLocaleString() ?? "-"} {labels.currency_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.down_payment}:</Text>
            <Text style={styles.value}>{data.downPayment?.toLocaleString() ?? "-"} {labels.currency_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.middle_payment}:</Text>
            <Text style={styles.value}>{data.middlePayment?.toLocaleString() ?? "-"} {labels.currency_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.balance}:</Text>
            <Text style={styles.value}>{data.balance?.toLocaleString() ?? "-"} {labels.currency_unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{labels.rent}:</Text>
            <Text style={styles.value}>
              {data.rentAmount?.toLocaleString() ?? "-"} {labels.currency_unit} ({data.rentType ?? "-"})
            </Text>
          </View>
        </View>

        {/* 특약사항 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>{labels.special_terms}</Text>
          <Text>{data.specialTerms?.trim() || labels.no_special_terms}</Text>
        </View>

        {/* 분석 요약 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>{labels.analysis_report_title}</Text>
          <View style={{ ...styles.highlightBox, backgroundColor: "#e3f2fd" }}>
            <Text>{labels.summary}: {summary.analysisReport.summary}</Text>
          </View>
          <Text style={{ color: getRiskColor(summary.analysisReport.riskLevel) }}>{labels.risk_level}: {summary.analysisReport.riskLevel}</Text>
          <View style={{ marginTop: 4 }}>
            <Text>
              {labels.sentiment_analysis}: {summary.analysisReport.sentimentSummary} {summary.analysisReport.sentimentEmoji}
            </Text>
            <View style={styles.sentimentBarContainer}>
              <View
                style={{
                  ...styles.sentimentBarFill,
                  width: `${summary.analysisReport.sentimentScore}%`,
                  backgroundColor: getSentimentColor(summary.analysisReport.sentimentScore),
                }}
              />
            </View>
            <Text>
              {labels.sentiment_score}: {summary.analysisReport.sentimentScore} ({summary.analysisReport.sentimentCategory})
            </Text>
          </View>
        </View>

        {/* 거래 이상 감지 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>{labels.transaction_anomaly_detection}</Text>
          <Text>{labels.contract_price}: {summary.transactionAnomaly.price.toLocaleString()} {labels.currency_unit}</Text>
          <Text>{labels.average_price}: {summary.transactionAnomaly.averagePrice.toLocaleString()} {labels.currency_unit}</Text>
          <Text>{labels.deviation_rate}: {summary.transactionAnomaly.deviationPercent}%</Text>
          <Text>{labels.anomaly_status}: {summary.transactionAnomaly.isAnomaly ? labels.anomaly : labels.normal}</Text>
        </View>

        {/* 위험 조항 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>{labels.risky_clauses}</Text>
          <View style={{ ...styles.highlightBox, backgroundColor: "#ffecec" }}>
            <Text style={{ fontWeight: "bold", color: "#d32f2f" }}>{labels.legal_risk}:</Text>
            <Text>{summary.riskyClauses.legalRisk}</Text>
          </View>
          <Text>{labels.clause_summary}: {summary.riskyClauses.clauseSummary}</Text>
          <Text>{labels.financial_impact}: {summary.riskyClauses.financialImpact}</Text>
          <Text>{labels.operational_impact}: {summary.riskyClauses.operationalImpact}</Text>
          <Text>{labels.recommended_action}: {summary.riskyClauses.recommendedAction}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
