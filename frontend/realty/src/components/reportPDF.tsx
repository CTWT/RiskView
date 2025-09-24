// ReportPDF.tsx
import React from "react";
import NotoSansKR from "../../src/fonts/NotoSansKR-Regular.ttf";
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

// 폰트 등록
Font.register({
  family: "NotoSansKR",
  src: NotoSansKR,
});

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
}

const ReportPDF: React.FC<ReportPDFProps> = ({ data, summary }) => {
  if (!summary) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>분석 데이터가 없습니다.</Text>
        </Page>
      </Document>
    );
  }

  const sentimentColor =
    summary.analysisReport.sentimentScore > 70
      ? "#4caf50"
      : summary.analysisReport.sentimentScore > 40
      ? "#ff9800"
      : "#f44336";

  const riskColor =
    summary.analysisReport.riskLevel === "HIGH"
      ? "#d32f2f"
      : summary.analysisReport.riskLevel === "MEDIUM"
      ? "#fbc02d"
      : "#388e3c";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.title}>계약서 분석 리포트</Text>
        </View>

        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>기본 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>매물 주소:</Text>
            <Text style={styles.value}>{data.location ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>계약 유형:</Text>
            <Text style={styles.value}>{data.leaseType ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>임대 기간:</Text>
            <Text style={styles.value}>
              {data.leasePeriodStart ?? "-"} ~ {data.leasePeriodEnd ?? "-"}
            </Text>
          </View>
        </View>

        {/* 재무 정보 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>재무 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>보증금:</Text>
            <Text style={styles.value}>{data.deposit?.toLocaleString() ?? "-"} 원</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>계약금:</Text>
            <Text style={styles.value}>{data.downPayment?.toLocaleString() ?? "-"} 원</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>중도금:</Text>
            <Text style={styles.value}>{data.middlePayment?.toLocaleString() ?? "-"} 원</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>잔금:</Text>
            <Text style={styles.value}>{data.balance?.toLocaleString() ?? "-"} 원</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>차임:</Text>
            <Text style={styles.value}>
              {data.rentAmount?.toLocaleString() ?? "-"} 원 ({data.rentType ?? "-"})
            </Text>
          </View>
        </View>

        {/* 특약사항 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>특약사항</Text>
          <Text>{data.specialTerms?.trim() || "특약 없음"}</Text>
        </View>

        {/* 분석 요약 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>AI 분석 요약</Text>
          <View style={{ ...styles.highlightBox, backgroundColor: "#e3f2fd" }}>
            <Text>요약: {summary.analysisReport.summary}</Text>
          </View>
          <Text style={{ color: riskColor }}>위험 수준: {summary.analysisReport.riskLevel}</Text>
          <View style={{ marginTop: 4 }}>
            <Text>
              감성 분석: {summary.analysisReport.sentimentSummary} {summary.analysisReport.sentimentEmoji}
            </Text>
            <View style={styles.sentimentBarContainer}>
              <View
                style={{
                  ...styles.sentimentBarFill,
                  width: `${summary.analysisReport.sentimentScore}%`,
                  backgroundColor: sentimentColor,
                }}
              />
            </View>
            <Text>
              감성 점수: {summary.analysisReport.sentimentScore} ({summary.analysisReport.sentimentCategory})
            </Text>
          </View>
        </View>

        {/* 거래 이상 감지 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>거래 이상 감지</Text>
          <Text>계약 가격: {summary.transactionAnomaly.price.toLocaleString()} 원</Text>
          <Text>평균 가격: {summary.transactionAnomaly.averagePrice.toLocaleString()} 원</Text>
          <Text>편차율: {summary.transactionAnomaly.deviationPercent}%</Text>
          <Text>이상 여부: {summary.transactionAnomaly.isAnomaly ? "이상" : "정상"}</Text>
        </View>

        {/* 위험 조항 */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>위험 조항</Text>
          <View style={{ ...styles.highlightBox, backgroundColor: "#ffecec" }}>
            <Text style={{ fontWeight: "bold", color: "#d32f2f" }}>법적 리스크:</Text>
            <Text>{summary.riskyClauses.legalRisk}</Text>
          </View>
          <Text>조항 요약: {summary.riskyClauses.clauseSummary}</Text>
          <Text>재정적 영향: {summary.riskyClauses.financialImpact}</Text>
          <Text>운영적 영향: {summary.riskyClauses.operationalImpact}</Text>
          <Text>권장 조치: {summary.riskyClauses.recommendedAction}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
