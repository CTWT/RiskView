import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.24
 * 수정일 : 
 * 파일명 : i18n.ts
 * 파일 설명 : 다국어 설정 파일
 */

const resources = {
  EN: {
    translation: {
      // PG100005.tsx
      // CommonContainerHeader
      analysis_result_subtitle: "Contract Risk Analysis Result",
      analysis_report_title: "AI Analysis Report",
      analysis_report_description:
        "This is a temporary layout for verifying OCR saved values. Risk scores/comments will be added when the AI analysis part is integrated.",

      // Top Summary Chips
      analysis_complete: "Analysis Complete",
      property_address: "Property Address",
      contract_type: "Contract Type",
      jeonse: "Jeonse",
      monthly: "Monthly Rent",

      // Comprehensive Risk Banner
      comprehensive_risk_assessment: "Comprehensive Risk Assessment",
      sentiment_score: "Sentiment Score",
      Positive: "Positive",
      Negative: "Negative",
      Neutral: "Neutral",
      HIGH: "HIGH",
      MEDIUM: "MEDIUM",
      LOW: "LOW",
      CRITICAL: "CRITICAL",
      WARNING: "WARNING",
      CAUTION: "CAUTION",

      // Transaction Anomaly
      transaction_anomaly_detection: "Transaction Anomaly Detection",
      contract_price: "Contract Price",
      average_price: "Average Price",
      deviation_rate: "Deviation Rate",
      anomaly_status: "Anomaly Status",
      anomaly: "Anomaly",
      normal: "Normal",

      // Risky Clauses
      risky_clauses: "Risky Clauses",
      clause_summary: "Clause Summary",
      legal_risk: "Legal Risk",
      financial_impact: "Financial Impact",
      operational_impact: "Operational Impact",
      recommended_action: "Recommended Action",

      // Basic Information
      basic_information: "Basic Information",
      lease_part: "Lease Part",
      lease_period: "Lease Period",
      middle_payment_date: "Middle Payment Date",
      balance_date: "Balance Date",
      rent_payment_date: "Rent Payment Date",
      area_land_building_lease: "Area (Land/Building/Lease)",

      // Financial Analysis
      financial_analysis_base: "Financial Analysis (Base Values)",
      deposit: "Deposit",
      down_payment: "Down Payment",
      middle_payment: "Middle Payment",
      balance: "Balance",
      rent: "Rent",
      prepaid: "Prepaid",
      postpaid: "Postpaid",

      // Special Terms
      special_terms: "Special Terms",
      no_special_terms: "No special terms",

      // Key Findings
      key_findings_for_validation: "Key Findings (for data validation)",
      no_additional_values: "No additional values to display.",
      yes: "Yes",
      no: "No",

      // Buttons
      back: "Back",
      download_pdf: "Download as PDF",
      print: "Print",

      // Currency
      currency_unit: "KRW",
    },
    contractFields: {
      leaseType: "Lease Type",
      location: "Location",
      landType: "Land Type",
      landArea: "Land Area",
      buildingStructureUse: "Building Use",
      buildingArea: "Building Area",
      leasePart: "Lease Part",
      leaseArea: "Lease Area",
      deposit: "Deposit",
      downPayment: "Down Payment",
      downPaymentSigned: "Down Payment Signed",
      middlePayment: "Middle Payment",
      middlePaymentDate: "Middle Payment Date",
      balance: "Balance",
      balanceDate: "Balance Date",
      rentAmount: "Rent Amount",
      rentType: "Rent Type",
      rentDate: "Rent Date",
      leasePeriodStart: "Lease Period Start",
      leasePeriodEnd: "Lease Period End",
      specialTerms: "Special Terms",
      contractDate: "Contract Date",
      landlordName: "Landlord Name",
      landlordAddress: "Landlord Address",
      tenantName: "Tenant Name",
      tenantAddress: "Tenant Address",
      realtorName: "Realtor Name",
      realtorAddress: "Realtor Address",
      commissionAmount: "Commission Amount",
      // Lessor (임대인)
      lessorAddress: "Lessor Address",
      lessorIdNumber: "Lessor ID Number",
      lessorPhone: "Lessor Phone",
      lessorName: "Lessor Name",
      lessorAgentAddress: "Lessor Agent Address",
      lessorAgentIdNumber: "Lessor Agent ID Number",
      lessorAgentName: "Lessor Agent Name",
      // Lessee (임차인)
      lesseeAddress: "Lessee Address",
      lesseeIdNumber: "Lessee ID Number",
      lesseePhone: "Lessee Phone",
      lesseeName: "Lessee Name",
      lesseeAgentAddress: "Lessee Agent Address",
      lesseeAgentIdNumber: "Lessee Agent ID Number",
      lesseeAgentName: "Lessee Agent Name",
      // Realtor (공인중개사)
      realtorOfficeAddress1: "Realtor Office Address (Left)",
      realtorOfficeAddress2: "Realtor Office Address (Right)",
      realtorOfficeName1: "Realtor Office Name (Left)",
      realtorOfficeName2: "Realtor Office Name (Right)",
      realtorSignature1: "Representative Signature/Seal (Left)",
      realtorSignature2: "Representative Signature/Seal (Right)",
      realtorLicensePhone1: "Registration No. / Phone (Left)",
      realtorLicensePhone2: "Registration No. / Phone (Right)",
      realtorAgentSignature1: "Affiliated Realtor Signature (Left)",
      realtorAgentSignature2: "Affiliated Realtor Signature (Right)",
    }
  },
  KO: {
    translation: {
      // PG100005.tsx
      // CommonContainerHeader
      analysis_result_subtitle: "계약서 위험도 분석 결과",
      analysis_report_title: "AI 분석 리포트",
      analysis_report_description:
        "현재 화면은 OCR로 저장된 값 확인용 임시 레이아웃입니다. AI 분석 파트가 합류되면 위험 점수/코멘트가 추가됩니다.",

      // Top Summary Chips
      analysis_complete: "분석 완료",
      property_address: "매물 주소",
      contract_type: "계약 유형",
      jeonse: "전세",
      monthly: "월세",

      // Comprehensive Risk Banner
      comprehensive_risk_assessment: "종합 위험도 평가",
      sentiment_score: "감성 점수",
      긍정: "긍정",
      부정: "부정",
      중립: "중립",
      고위험: "고위험",
      중위험: "중위험",
      저위험: "저위험",
      치명: "치명",
      경고: "경고",
      주의: "주의",

      // Transaction Anomaly
      transaction_anomaly_detection: "거래 이상 감지",
      contract_price: "계약 가격",
      average_price: "평균 가격",
      deviation_rate: "편차율",
      anomaly_status: "이상 여부",
      anomaly: "이상",
      normal: "정상",

      // Risky Clauses
      risky_clauses: "위험 조항",
      clause_summary: "조항 요약",
      legal_risk: "법적 리스크",
      financial_impact: "재정적 영향",
      operational_impact: "운영적 영향",
      recommended_action: "권장 조치",

      // Basic Information
      basic_information: "기본 정보",
      lease_part: "임대할 부분",
      lease_period: "임대 기간",
      middle_payment_date: "중도금 지급일",
      balance_date: "잔금 지급일",
      rent_payment_date: "차임 지급일",
      area_land_building_lease: "면적(토지/건물/임대)",

      // Financial Analysis
      financial_analysis_base: "재무 분석(기초값)",
      deposit: "보증금",
      down_payment: "계약금",
      middle_payment: "중도금",
      balance: "잔금",
      rent: "차임",
      prepaid: "선불",
      postpaid: "후불",

      // Special Terms
      special_terms: "특약",
      no_special_terms: "특약사항 없음",

      // Key Findings
      key_findings_for_validation: "주요 발견사항(데이터 검증용)",
      no_additional_values: "추가로 표시할 값이 없습니다.",
      yes: "예",
      no: "아니오",

      // Buttons
      back: "뒤로",
      download_pdf: "pdf 파일로 받기",
      print: "인쇄",

      // Currency
      currency_unit: "원",
    },
    contractFields: {
      leaseType: "임대 유형",
      location: "소재지",
      landType: "토지 지목",
      landArea: "토지 면적",
      buildingStructureUse: "건물 구조/용도",
      buildingArea: "건물 면적",
      leasePart: "임대할 부분",
      leaseArea: "임대 면적",
      deposit: "보증금",
      downPayment: "계약금",
      downPaymentSigned: "계약금 서명 여부",
      middlePayment: "중도금",
      middlePaymentDate: "중도금 지급일",
      balance: "잔금",
      balanceDate: "잔금 지급일",
      rentAmount: "차임",
      rentType: "차임 지급 방식",
      rentDate: "차임 지급일",
      leasePeriodStart: "임대 기간 시작",
      leasePeriodEnd: "임대 기간 종료",
      specialTerms: "특약사항",
      contractDate: "계약일",
      landlordName: "임대인 성명",
      landlordAddress: "임대인 주소",
      tenantName: "임차인 성명",
      tenantAddress: "임차인 주소",
      realtorName: "공인중개사 성명",
      realtorAddress: "공인중개사 주소",
      commissionAmount: "중개보수 금액",
      // 임대인(Lessor)
      lessorAddress: "임대인 주소",
      lessorIdNumber: "임대인 주민등록번호",
      lessorPhone: "임대인 전화번호",
      lessorName: "임대인 성명",
      lessorAgentAddress: "임대인 대리인 주소",
      lessorAgentIdNumber: "임대인 대리인 주민등록번호",
      lessorAgentName: "임대인 대리인 성명",
      // 임차인(Lessee)
      lesseeAddress: "임차인 주소",
      lesseeIdNumber: "임차인 주민등록번호",
      lesseePhone: "임차인 전화번호",
      lesseeName: "임차인 성명",
      lesseeAgentAddress: "임차인 대리인 주소",
      lesseeAgentIdNumber: "임차인 대리인 주민등록번호",
      lesseeAgentName: "임차인 대리인 성명",
      // 공인중개사(Realtor)
      realtorOfficeAddress1: "공인중개사 사무소 소재지(좌측)",
      realtorOfficeAddress2: "공인중개사 사무소 소재지(우측)",
      realtorOfficeName1: "공인중개사 사무소 명칭(좌측)",
      realtorOfficeName2: "공인중개사 사무소 명칭(우측)",
      realtorSignature1: "대표 서명 및 날인(좌측)",
      realtorSignature2: "대표 서명 및 날인(우측)",
      realtorLicensePhone1: "등록번호 및 전화번호(좌측)",
      realtorLicensePhone2: "등록번호 및 전화번호(우측)",
      realtorAgentSignature1: "소속공인중개사 서명(좌측)",
      realtorAgentSignature2: "소속공인중개사 서명(우측)",
    }
  },
  JP: {
    translation: {
      // PG100005.tsx
      // CommonContainerHeader
      analysis_result_subtitle: "契約書リスク分析結果",
      analysis_report_title: "AI分析レポート",
      analysis_report_description:
        "この画面はOCRで保存された値を確認するための一時的なレイアウトです。AI分析パートが統合されると、リスクスコア/コメントが追加されます。",

      // Top Summary Chips
      analysis_complete: "分析完了",
      property_address: "物件住所",
      contract_type: "契約タイプ",
      jeonse: "チョンセ",
      monthly: "月払い家賃",

      // Comprehensive Risk Banner
      comprehensive_risk_assessment: "総合リスク評価",
      sentiment_score: "感情スコア",
      ポジティブ: "ポジティブ",
      ネガティブ: "ネガティブ",
      ニュートラル: "ニュートラル",
      高リスク: "高リスク",
      中リスク: "中リスク",
      低リスク: "低リスク",
      致命的: "致命的",
      警告: "警告",
      注意: "注意",

      // Transaction Anomaly
      transaction_anomaly_detection: "取引異常検知",
      contract_price: "契約価格",
      average_price: "平均価格",
      deviation_rate: "偏差率",
      anomaly_status: "異常有無",
      anomaly: "異常",
      normal: "正常",

      // Risky Clauses
      risky_clauses: "危険条項",
      clause_summary: "条項要約",
      legal_risk: "法的リスク",
      financial_impact: "財政的影響",
      operational_impact: "運営的影響",
      recommended_action: "推奨措置",

      // Basic Information
      basic_information: "基本情報",
      lease_part: "賃貸部分",
      lease_period: "賃貸期間",
      middle_payment_date: "中間金支払日",
      balance_date: "残金支払日",
      rent_payment_date: "賃料支払日",
      area_land_building_lease: "面積(土地/建物/賃貸)",

      // Financial Analysis
      financial_analysis_base: "財務分析(基礎値)",
      deposit: "保証金",
      down_payment: "契約金",
      middle_payment: "中間金",
      balance: "残金",
      rent: "賃料",
      prepaid: "前払い",
      postpaid: "後払い",

      // Special Terms
      special_terms: "特約",
      no_special_terms: "特約事項なし",

      // Key Findings
      key_findings_for_validation: "主な検出事項(データ検証用)",
      no_additional_values: "追加で表示する値がありません。",
      yes: "はい",
      no: "いいえ",

      // Buttons
      back: "戻る",
      download_pdf: "PDFでダウンロード",
      print: "印刷",

      // Currency
      currency_unit: "KRW",
    },
    contractFields: {
      leaseType: "賃貸タイプ",
      location: "所在地",
      landType: "土地地目",
      landArea: "土地面積",
      buildingStructureUse: "建物構造/用途",
      buildingArea: "建物面積",
      leasePart: "賃貸部分",
      leaseArea: "賃貸面積",
      deposit: "保証金",
      downPayment: "契約金",
      downPaymentSigned: "契約金署名有無",
      middlePayment: "中間金",
      middlePaymentDate: "中間金支払日",
      balance: "残金",
      balanceDate: "残金支払日",
      rentAmount: "賃料",
      rentType: "賃料支払方式",
      rentDate: "賃料支払日",
      leasePeriodStart: "賃貸期間開始",
      leasePeriodEnd: "賃貸期間終了",
      specialTerms: "特約事項",
      contractDate: "契約日",
      commissionAmount: "仲介手数料",
      // 貸主(Lessor)
      lessorAddress: "貸主住所",
      lessorIdNumber: "貸主ID番号",
      lessorPhone: "貸主電話番号",
      lessorName: "貸主氏名",
      lessorAgentAddress: "貸主代理人住所",
      lessorAgentIdNumber: "貸主代理人ID番号",
      lessorAgentName: "貸主代理人氏名",
      // 借主(Lessee)
      lesseeAddress: "借主住所",
      lesseeIdNumber: "借主ID番号",
      lesseePhone: "借主電話番号",
      lesseeName: "借主氏名",
      lesseeAgentAddress: "借主代理人住所",
      lesseeAgentIdNumber: "借主代理人ID番号",
      lesseeAgentName: "借主代理人氏名",
      // 仲介業者(Realtor)
      realtorOfficeAddress1: "仲介業者事務所所在地(左)",
      realtorOfficeAddress2: "仲介業者事務所所在地(右)",
      realtorOfficeName1: "仲介業者事務所名称(左)",
      realtorOfficeName2: "仲介業者事務所名称(右)",
      realtorSignature1: "代表署名・押印(左)",
      realtorSignature2: "代表署名・押印(右)",
      realtorLicensePhone1: "登録番号・電話番号(左)",
      realtorLicensePhone2: "登録番号・電話番号(右)",
      realtorAgentSignature1: "所属宅建士署名(左)",
      realtorAgentSignature2: "所属宅建士署名(右)",
    },
  },
  ZH: {
    translation: {
      // PG100005.tsx
      // CommonContainerHeader
      analysis_result_subtitle: "合同风险分析结果",
      analysis_report_title: "AI分析报告",
      analysis_report_description:
        "此屏幕是用于验证OCR保存值的临时布局。当AI分析部分集成后，将添加风险评分/评论。",

      // Top Summary Chips
      analysis_complete: "分析完成",
      property_address: "房产地址",
      contract_type: "合同类型",
      jeonse: "全租",
      monthly: "月租",

      // Comprehensive Risk Banner
      comprehensive_risk_assessment: "综合风险评估",
      sentiment_score: "情感分数",
      积极: "积极",
      消极: "消极",
      中性: "中性",
      高风险: "高风险",
      中风险: "中风险",
      低风险: "低风险",
      致命: "致命",
      警告: "警告",
      注意: "注意",

      // Transaction Anomaly
      transaction_anomaly_detection: "交易异常检测",
      contract_price: "合同价格",
      average_price: "平均价格",
      deviation_rate: "偏差率",
      anomaly_status: "是否异常",
      anomaly: "异常",
      normal: "正常",

      // Risky Clauses
      risky_clauses: "风险条款",
      clause_summary: "条款摘要",
      legal_risk: "法律风险",
      financial_impact: "财务影响",
      operational_impact: "运营影响",
      recommended_action: "建议措施",

      // Basic Information
      basic_information: "基本信息",
      lease_part: "租赁部分",
      lease_period: "租赁期限",
      middle_payment_date: "中期付款日",
      balance_date: "尾款支付日",
      rent_payment_date: "租金支付日",
      area_land_building_lease: "面积(土地/建筑/租赁)",

      // Financial Analysis
      financial_analysis_base: "财务分析(基础值)",
      deposit: "保证金",
      down_payment: "定金",
      middle_payment: "中期付款",
      balance: "尾款",
      rent: "租金",
      prepaid: "预付",
      postpaid: "后付",

      // Special Terms
      special_terms: "特别条款",
      no_special_terms: "无特别条款",

      // Key Findings
      key_findings_for_validation: "主要发现(用于数据验证)",
      no_additional_values: "没有其他可显示的值。",
      yes: "是",
      no: "否",

      // Buttons
      back: "返回",
      download_pdf: "下载PDF",
      print: "打印",

      // Currency
      currency_unit: "韩元",
    },
    contractFields: {
      leaseType: "租赁类型",
      location: "位置",
      leasePart: "租赁部分",
      deposit: "保证金",
      downPayment: "定金",
      downPaymentSigned: "定金是否签署",
      middlePayment: "中期付款",
      middlePaymentDate: "中期付款日",
      balance: "尾款",
      balanceDate: "尾款支付日",
      rentAmount: "租金",
      rentType: "租金支付方式",
      rentDate: "租金支付日",
      leasePeriodStart: "租赁期开始",
      leasePeriodEnd: "租赁期结束",
      specialTerms: "特别条款",
      contractDate: "合同日期",
      landlordName: "房东姓名",
      tenantName: "租户姓名",
      landType: "土地类别",
      landArea: "土地面积",
      buildingStructureUse: "建筑结构/用途",
      buildingArea: "建筑面积",
      leaseArea: "租赁面积",
      realtorAddress: "中介地址",
      realtorName: "中介名称",
      commissionAmount: "中介费",
      // 出租人(Lessor)
      lessorAddress: "出租人地址",
      lessorIdNumber: "出租人身份证号",
      lessorPhone: "出租人电话",
      lessorName: "出租人姓名",
      lessorAgentAddress: "出租人代理人地址",
      lessorAgentIdNumber: "出租人代理人身份证号",
      lessorAgentName: "出租人代理人姓名",
      // 承租人(Lessee)
      lesseeAddress: "承租人地址",
      lesseeIdNumber: "承租人身份证号",
      lesseePhone: "承租人电话",
      lesseeName: "承租人姓名",
      lesseeAgentAddress: "承租人代理人地址",
      lesseeAgentIdNumber: "承租人代理人身份证号",
      lesseeAgentName: "承租人代理人姓名",
      // 中介(Realtor)
      realtorOfficeAddress1: "中介事务所地址(左)",
      realtorOfficeAddress2: "中介事务所地址(右)",
      realtorOfficeName1: "中介事务所名称(左)",
      realtorOfficeName2: "中介事务所名称(右)",
      realtorSignature1: "代表签名及盖章(左)",
      realtorSignature2: "代表签名及盖章(右)",
      realtorLicensePhone1: "登记号及电话(左)",
      realtorLicensePhone2: "登记号及电话(右)",
      realtorAgentSignature1: "所属经纪人签名(左)",
      realtorAgentSignature2: "所属经纪人签名(右)",
    },
  },
};

i18n
  .use(initReactI18next) // react-i18next 연결
  .init({
    resources,
    lng: "KO", // 기본 언어
    fallbackLng: ["EN", "JP", "ZH"], // lng에서 해당 키를 찾지 못할 경우 사용할 언어
    interpolation: {
      escapeValue: false, // React에서는 기본적으로 HTML을 안전하게 처리하기 때문에 false로 설정
    },
    ns: ['translation', 'contractFields'], // 네임스페이스 등록
    defaultNS: 'translation',
  });

export default i18n;