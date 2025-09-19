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
import type { StructuredContractDataDTO } from "../../src/types/contract"

// 앱 시작 시 1회 등록
Font.register({
  family: "NotoSansKR",
  src: NotoSansKR,
});

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "NotoSansKR",
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    color: "grey",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
  },
});

// PDF 문서 컴포넌트
const ReportPDF: React.FC<{ data: StructuredContractDataDTO }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>계약서 분석 리포트</Text>
        <Text style={styles.subtitle}>AI 분석 결과 (임시)</Text>
      </View>

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
            {data.rentAmount?.toLocaleString() ?? "-"} 원 (
            {data.rentType ?? "-"})
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>특약사항</Text>
        <Text>{data.specialTerms?.trim() || "특약 없음"}</Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
