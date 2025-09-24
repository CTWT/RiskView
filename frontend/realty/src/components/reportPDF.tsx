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
import type { AnalysisSummaryDTO } from "../pages/analysis/PG100005"; // 타입 import

Font.register({
  family: "NotoSansKR",
  src: NotoSansKR,
});

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "NotoSansKR" },
  section: { marginBottom: 15 },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginBottom: 6, color: "grey" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontWeight: "bold" },
});

interface ReportPDFProps {
  data: StructuredContractDataDTO;
  summary: AnalysisSummaryDTO;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ data, summary }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 제목 */}
      <View style={styles.section}>
        <Text style={styles.title}>계약서 분석 리포트</Text>
        <Text style={styles.subtitle}>AI 분석 결과</Text>
      </View>

      {/* 기본 정보 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>기본 정보</Text>
        <View style={styles.row}>
          <Text style={styles.label}>매물 주소:</Text>
          <Text>{data.location ?? "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>계약 유형:</Text>
          <Text>{data.leaseType ?? "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>임대 기간:</Text>
          <Text>
            {data.leasePeriodStart ?? "-"} ~ {data.leasePeriodEnd ?? "-"}
          </Text>
        </View>
      </View>

      {/* 재무 정보 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>재무 정보</Text>
        <View style={styles.row}>
          <Text style={styles.label}>보증금:</Text>
          <Text>{data.deposit?.toLocaleString() ?? "-"} 원</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>계약금:</Text>
          <Text>{data.downPayment?.toLocaleString() ?? "-"} 원</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>중도금:</Text>
          <Text>{data.middlePayment?.toLocaleString() ?? "-"} 원</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>잔금:</Text>
          <Text>{data.balance?.toLocaleString() ?? "-"} 원</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>차임:</Text>
          <Text>
            {data.rentAmount?.toLocaleString() ?? "-"} 원 ({data.rentType ?? "-"})
          </Text>
        </View>
      </View>

      {/* 특약 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>특약사항</Text>
        <Text>{data.specialTerms?.trim() || "특약 없음"}</Text>
      </View>

      {/* 분석 요약 */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>AI 분석 요약</Text>
        <Text>요약: {summary.analysisReport.summary}</Text>
        <Text>위험 수준: {summary.analysisReport.riskLevel}</Text>
        <Text>감성 분석: {summary.analysisReport.sentimentSummary} {summary.analysisReport.sentimentEmoji}</Text>
        <Text>감성 점수: {summary.analysisReport.sentimentScore} ({summary.analysisReport.sentimentCategory})</Text>
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
        <Text>조항 요약: {summary.riskyClauses.clauseSummary}</Text>
        <Text>법적 리스크: {summary.riskyClauses.legalRisk}</Text>
        <Text>재정적 영향: {summary.riskyClauses.financialImpact}</Text>
        <Text>운영적 영향: {summary.riskyClauses.operationalImpact}</Text>
        <Text>권장 조치: {summary.riskyClauses.recommendedAction}</Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
