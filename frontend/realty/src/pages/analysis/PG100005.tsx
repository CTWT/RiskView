// src/pages/analysis/PG100005.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import axios from "axios";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import "../../styles/common/common.css";
import contractFieldLabels from "../../contracts/contractFieldLabels";
import type { StructuredContractDataDTO } from "../../types/contract";
import { pdf } from "@react-pdf/renderer";
import ReportPDF from "../../components/reportPDF";



/*
 * @file PG100005.tsx
 * @description 아직 설계단계이지만 AI 분석 이후 분석결과 보고서가 나올 페이지 입니다.
 * 현재 어느 형태의 보고서가 작성될지 미지수라 페이지만 설계되었습니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : PG100005.tsx
 * 수정자 : 박윤성
 * 수정일 : 25.09.24
 * 설명 : 계약서 분석결과 보고서가 담당될 페이지로, 다국어 지원.
 */

interface PG100005Props {
    documentCode: string | null;
}

export interface AnalysisSummaryDTO {
  analysisReport: { // 분석 보고서
    summary: string; // 요약
    riskLevel: string; // 위험등급
    sentimentSummary: string; // 감성 분석 요약
    sentimentScore: number; // 감성 분석 점수
    sentimentCategory: string; // 감성 분석 카테고리
    sentimentEmoji: string; // 감성 분석 이모지
  };
  transactionAnomaly: { // 거래 이상 감지
    price: number; // 가격
    averagePrice: number; // 평균 가격
    deviationPercent: number; // 편차율
    isAnomaly: boolean; // 이상 여부
  };
  riskyClauses: { // 위험 조항
    clauseSummary: string; // 조항 요약
    legalRisk : string; // 법적 위험
    financialImpact : string; // 재무 영향
    operationalImpact : string; // 운영 영향
    recommendedAction : string; // 추천 조치
  }
}


const PG100005: React.FC<PG100005Props> = ({ documentCode }) => {
    // --- 상태 관리 ---
    console.log("PG100005: 컴포넌트 렌더링 시작", { documentCode });

    type TranslatedContent = {
        data: StructuredContractDataDTO;
        summary: AnalysisSummaryDTO;
    };

    const [data, setData] = useState<StructuredContractDataDTO | null>(null);
    const [summary, setSummary] = useState<AnalysisSummaryDTO | null>(null);
    // 번역된 데이터를 언어별로 저장
    const [translations, setTranslations] = useState<Record<string, TranslatedContent>>({});
    const [currentLang, setCurrentLang] = useState(i18n.language.toUpperCase());

    // 현재 보여줄 데이터 (원본 또는 번역본)
    const displayData = currentLang === 'KO' ? data : translations[currentLang]?.data;
    const displaySummary = currentLang === 'KO' ? summary : translations[currentLang]?.summary;

    const [isTranslating, setIsTranslating] = useState(false); // 번역 로딩 상태
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [isTranslateDropdownOpen, setTranslateDropdownOpen] = useState(false);
    const { t } = useTranslation();

    // 번역 중 스켈레톤 UI를 위한 래퍼 컴포넌트
    const SkeletonWrapper: React.FC<{ children: React.ReactNode; width?: string; height?: string }> = ({ children, width = '80%', height = '20px' }) => {
        if (isTranslating) {
            return <span className="skeleton" style={{ width, height, display: 'inline-block', verticalAlign: 'middle' }}></span>;
        }
        return <>{children}</>;
    };
    const SkeletonBlock: React.FC<{ children: React.ReactNode; width?: string; height?: string }> = ({ children, width = '100%', height = 'auto' }) => {
        return isTranslating ? <div className="skeleton" style={{ width, height, minHeight: '60px' }}></div> : <>{children}</>;
    };

    // PDF 내보내기 핸들러
    const handleExportPDF = async () => {
        // 번역된 데이터가 있으면 번역본을, 없으면 원본 데이터를 사용
        const pdfData = displayData;
        if (!pdfData) return;

        // PDF에 필요한 모든 레이블을 현재 언어로 미리 번역합니다.
        const pdfLabels = {
            analysis_report_title: t("analysis_report_title"),
            basic_information: t("basic_information"),
            property_address: t("property_address"),
            contract_type: t("contract_type"),
            lease_period: t("lease_period"),
            financial_analysis_base: t("financial_analysis_base"),
            deposit: t("deposit"),
            down_payment: t("down_payment"),
            middle_payment: t("middle_payment"),
            balance: t("balance"),
            rent: t("rent"),
            currency_unit: t("currency_unit"),
            special_terms: t("special_terms"),
            no_special_terms: t("no_special_terms"),
            summary: t("summary"),
            risk_level: t("risk_level"),
            sentiment_analysis: t("sentiment_analysis"),
            sentiment_score: t("sentiment_score"),
            transaction_anomaly_detection: t("transaction_anomaly_detection"),
            contract_price: t("contract_price"),
            average_price: t("average_price"),
            deviation_rate: t("deviation_rate"),
            anomaly_status: t("anomaly_status"),
            anomaly: t("anomaly"),
            normal: t("normal"),
            risky_clauses: t("risky_clauses"),
            legal_risk: t("legal_risk"),
            clause_summary: t("clause_summary"),
            financial_impact: t("financial_impact"),
            operational_impact: t("operational_impact"),
            recommended_action: t("recommended_action"),
            no_analysis_data: t("no_analysis_data"),
        };

        const blob = await pdf(<ReportPDF data={pdfData} summary={displaySummary} labels={pdfLabels} lang={i18n.language} />).toBlob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = i18n.language === 'KO' ? "분석보고서.pdf" : "AnalysisReport.pdf";
        a.click();

        URL.revokeObjectURL(url); // 메모리 해제
    };

    // 계약서 번역 핸들러
    const handleTranslate = React.useCallback(async (targetLang: 'EN' | 'JP' | 'ZH') => {
        // 번역본이 없으면 API 호출
        if (!data || !summary) return;
        setIsTranslating(true);
        try {
            // Backend는 소문자 ISO 코드(en/ja/zh)를 기대하므로 매핑합니다.
            const backendLangMap: Record<'EN' | 'JP' | 'ZH', 'en' | 'ja' | 'zh'> = {
                EN: 'en',
                JP: 'ja',
                ZH: 'zh',
            };
            const apiLang = backendLangMap[targetLang];
            const [contractRes, analysisRes] = await Promise.all([
                axios.post<StructuredContractDataDTO>(
                  'http://localhost:8000/contracts/translate',
                    data,
                    { params: { target_lang: apiLang } }
                ),
                axios.post<AnalysisSummaryDTO>(
                    'http://localhost:8000/analysis/translate',
                    summary,
                    { params: { target_lang: apiLang } }
                )
            ]);

            // AI가 일부 필드를 누락할 수 있으므로, 원본 데이터와 번역된 데이터를 병합합니다.
            const mergedData = { ...data, ...contractRes.data };
            const mergedSummary = { ...summary, ...analysisRes.data };

            setTranslations(prev => ({
                ...prev,
                [targetLang]: {
                    data: mergedData,
                    summary: mergedSummary,
                }
            }));
            setCurrentLang(targetLang);
            setTranslateDropdownOpen(false);
            i18n.changeLanguage(targetLang);
        } catch (error) {
            console.error("번역 중 오류 발생:", error);
            setErr("번역 서비스 호출 중 오류가 발생했습니다.");
        } finally {
            setIsTranslating(false);
        }
    }, [data, summary, translations, i18n]);

    const toggleTranslateDropdown = () => {
        setTranslateDropdownOpen(prev => !prev);
    };

    // 원문 복구 핸들러
    const handleRevert = () => {
        console.log("PG100005: 원문으로 되돌리기");
        setCurrentLang('KO');
        i18n.changeLanguage('KO');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.querySelector('.rv05-translate-dropdown');
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setTranslateDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // --- 데이터 로딩 useEffect ---
        // 컴포넌트가 마운트될 때 항상 언어를 한국어로 초기화하여 다른 페이지의 번역 상태에 영향을 받지 않도록 합니다.
        if (i18n.language !== 'KO') {
            i18n.changeLanguage('KO');
        }
        setCurrentLang('KO');

        console.log("PG100005: useEffect 실행, 데이터 로딩 시작");
        const code = documentCode ?? sessionStorage.getItem("rv_documentCode");
        if (!code) {
            setErr("문서 코드가 없습니다. 03 단계에서 저장 후 다시 시도하세요.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                console.log("PG100005: 계약서 및 요약 정보 API 호출");
                const [contractRes, summaryRes] = await Promise.all([
                    axios.get<StructuredContractDataDTO>(
                        "http://localhost:8080/contracts",
                        { params: { documentCode: code }, withCredentials: true }
                    ),
                    axios.get<AnalysisSummaryDTO>(
                        "http://localhost:8080/analysisSummary",
                        { params: { documentCode: code }, withCredentials: true }
                    ),
                ]);

                console.log("PG100005: API 응답 받음", { contractData: contractRes.data, summaryData: summaryRes.data });

                if (!cancelled) {
                    setData(contractRes.data);
                    console.log("PG100005: 'data' 상태 업데이트 완료");

                    setSummary({
                        analysisReport: {
                          summary: summaryRes.data.analysisReport?.summary ?? "",
                          riskLevel: summaryRes.data.analysisReport?.riskLevel ?? "",
                          sentimentSummary: summaryRes.data.analysisReport?.sentimentSummary ?? "",
                          sentimentScore: summaryRes.data.analysisReport?.sentimentScore ?? 0,
                          sentimentCategory: summaryRes.data.analysisReport?.sentimentCategory ?? "",
                          sentimentEmoji: summaryRes.data.analysisReport?.sentimentEmoji ?? "",
                        },
                        riskyClauses: {
                          clauseSummary: summaryRes.data.riskyClauses?.clauseSummary ?? "",
                          legalRisk: summaryRes.data.riskyClauses?.legalRisk ?? "",
                          financialImpact: summaryRes.data.riskyClauses?.financialImpact ?? "",
                          operationalImpact: summaryRes.data.riskyClauses?.operationalImpact ?? "",
                          recommendedAction: summaryRes.data.riskyClauses?.recommendedAction ?? "",
                        },
                        transactionAnomaly: {
                          price: summaryRes.data.transactionAnomaly?.price ?? 0,
                          averagePrice: summaryRes.data.transactionAnomaly?.averagePrice ?? 0,
                          deviationPercent: summaryRes.data.transactionAnomaly?.deviationPercent ?? 0,
                          isAnomaly: summaryRes.data.transactionAnomaly?.isAnomaly ?? false,
                        },
                      });
                    console.log("PG100005: 'summary' 상태 업데이트 완료");
                }
            } catch (e) {
                if (!cancelled) {
                    setErr(t("error_fetching_data"));
                    console.error("PG100005: 데이터 조회 중 오류 발생", e);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            console.log("PG100005: 컴포넌트 unmount 또는 재실행으로 인한 클린업");
            cancelled = true;
        };
    }, [documentCode, i18n]);

    // i18n 언어 변경과 currentLang 동기화 + 번역 자동 트리거
    useEffect(() => {
        const onLangChanged = (lng: string) => {
            // i18n은 EN/KO/JP/ZH을 사용 중. currentLang과 동일 포맷으로 맞춤
            const upper = (lng || '').toUpperCase();
            if (upper === currentLang) return;
            setCurrentLang(upper as 'KO' | 'EN' | 'JP' | 'ZH');

            // 한국어 외 언어로 전환했는데 번역본이 없으면 자동 번역 수행
            if ((upper === 'EN' || upper === 'JP' || upper === 'ZH') && !translations[upper]) {
                // data/summary가 준비된 이후에만 호출
                if (data && summary) {
                    handleTranslate(upper);
                }
            }
        };
        i18n.on('languageChanged', onLangChanged);
        return () => {
            i18n.off('languageChanged', onLangChanged);
        };
    }, [currentLang, translations, data, summary, handleTranslate]);

    // --- 포맷팅 함수 ---
    const fmtNum = (n: number | null | undefined) =>
        typeof n === "number" ? n.toLocaleString() : "-";

    const fmtDate = (d: string | null | undefined) => (d ? d : "-");

    // 상단 요약칩에 쓰는 값
    const leaseType = displayData?.leaseType ?? "-";
    const location = displayData?.location ?? "-";
    const now = useMemo(() => new Date(), []);

    // 주요 섹션에서 이미 표시한 키들 제외하고 "주요 발견사항"에 나머지 전부 뿌리기
    const shownKeys = new Set<keyof StructuredContractDataDTO>([
        "leaseType",
        "location",
        "leasePart",
        "landArea",
        "buildingArea",
        "leaseArea",
        "deposit",
        "downPayment",
        "middlePayment",
        "balance",
        "rentAmount",
        "rentType",
        "middlePaymentDate",
        "balanceDate",
        "rentDate",
        "leasePeriodStart",
        "leasePeriodEnd",
        "specialTerms",
        "contractDate"
    ]);

    // "주요 발견사항"에 나머지 전부 뿌리기
    const restEntries = useMemo(() => {
      console.log("PG100005: 'restEntries' useMemo 계산");
      if (!displayData) return [] as Array<{ label: string; value: string }>;

      const keys = Object.keys(displayData) as (keyof StructuredContractDataDTO)[];

      return keys
          .filter((k) => !shownKeys.has(k))
          .filter((k) => {
              const v = displayData[k]; // 현재 표시 데이터 기준으로 필터링
              return v !== null && v !== undefined && v !== "";
          })
          .map((k) => {
              // 번역된 데이터가 있고 해당 키의 값이 존재하면 번역본 사용, 아니면 원본 사용
              const raw = displayData[k];
              
              // 번역된 상태에서는 i18n을 사용하고, 아닐 때는 기존 라벨 사용
              const label = currentLang !== 'KO' ? t(k, { ns: 'contractFields' }) : (contractFieldLabels[k] ?? (k as string));

              let value: string | number = "";
              if (typeof raw === "number") value = raw.toLocaleString();
              else if (typeof raw === "string") value = raw;
              else value = String(raw);

              // 디버깅을 위한 로그 추가
              if (currentLang !== 'KO') {
                  console.log(`번역 확인 - 키: ${k}, 최종값: ${value}`);
              }

              return { label, value };
          });
    }, [displayData, t, currentLang]);

    // --- 렌더링 로직 ---
    if (loading && !data) { // 초기 전체 로딩
      return (
        <div className="rv05-container">
          <CommonContainerHeader
            subtitle={t("analysis_result_subtitle")}
            title={t("analysis_report_title")}
            description={t("analysis_report_description")}
          />
          {/* 스켈레톤 UI */}
          <div className="rv05-banner skeleton" style={{ height: '120px', marginBottom: '24px' }}></div>
          <article className="rv05-card rv05-wide">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-hr"></div>
            <div className="skeleton-dl">
              <div className="skeleton skeleton-dt"></div>
              <div className="skeleton skeleton-dd"></div>
              <div className="skeleton skeleton-dt"></div>
              <div className="skeleton skeleton-dd"></div>
              <div className="skeleton skeleton-dt"></div>
              <div className="skeleton skeleton-dd"></div>
              <div className="skeleton skeleton-dt"></div>
              <div className="skeleton skeleton-dd"></div>
            </div>
          </article>
          <section className="rv05-grid">
            <article className="rv05-card">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-hr"></div>
              <div className="skeleton-dl" style={{ gridTemplateColumns: '1fr' }}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton skeleton-dd" style={{ width: '100%', marginBottom: '8px' }}></div>)}
              </div>
            </article>
            <article className="rv05-card">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-hr"></div>
              <div className="skeleton-dl" style={{ gridTemplateColumns: '1fr' }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton skeleton-dd" style={{ width: '100%', marginBottom: '8px' }}></div>)}
              </div>
            </article>
          </section>
          <article className="rv05-card rv05-wide"><div className="skeleton skeleton-p"></div></article>
        </div>
      );
    }

    if (err) {
        return ( // 에러 발생 시
            <div className="rv05-container">
                <div className="rv05-card rv05-error">{err}</div>
            </div>
        );
    }

    // 여기서 data와 summary가 모두 있어야 페이지 렌더링
    if (!data) { // 데이터가 아예 없는 경우 (이론상 발생하기 어려움)
        return ( 
            <div className="rv05-container">
                <div className="rv05-card">데이터가 아직 준비되지 않았습니다.</div>
            </div>
        );
    }

    return (
      <div className="report-container">
        <div className="rv05-container">
          <CommonContainerHeader
              subtitle={t("analysis_result_subtitle")}
              title={t("analysis_report_title")}
              description={displaySummary?.analysisReport?.summary || t("analysis_report_description")}
          />

          {/* 상단 요약칩 */}
          <div className="rv05-chips">
            <div className="rv05-chip">
              <span className="rv05-chip-dot ok" />
              <div>
                <div className="rv05-chip-title">{t("analysis_complete")}</div>
                <div className="rv05-chip-sub">
                  {now.toISOString().slice(0, 10)}{" "}
                  {now.toTimeString().slice(0, 5)}
                </div>
              </div>
            </div>
            <div className="rv05-chip">
              <span className="rv05-chip-dot info" />
              <div>
                <div className="rv05-chip-title">{t("property_address")}</div>
                <div className="rv05-chip-sub">{location}</div>
              </div>
            </div>
            <div className="rv05-chip">
              <span className="rv05-chip-dot note" />
              <div>
                <div className="rv05-chip-title">{t("contract_type")}</div>
                <div className="rv05-chip-sub">
                  {currentLang !== 'KO'
                    ? leaseType // 번역된 경우 JEONSE/MONTHLY 그대로 표시
                    : leaseType === "JEONSE"
                    ? t("jeonse")
                    : leaseType === "MONTHLY"
                    ? t("monthly")
                    : leaseType}
                </div>
              </div>
            </div>
          </div>

          {/* 종합 위험 배너 */}
          {loading ? (
              <div className="rv05-banner skeleton" style={{ height: '120px', marginBottom: '24px' }}></div>
          ) : (
              <div className="rv05-banner">
                <div>
                  <div className="rv05-banner-title">{t("comprehensive_risk_assessment")}</div>
                    <div className="rv05-banner-sub">
                        <SkeletonWrapper width="90%">{displaySummary?.analysisReport?.summary ?? "-"}</SkeletonWrapper>
                    </div>
                    <div className="rv05-banner-sub">
                        <SkeletonWrapper width="70%">{displaySummary?.analysisReport?.sentimentSummary ?? "-"} {displaySummary?.analysisReport?.sentimentEmoji ?? ""}</SkeletonWrapper>
                    </div>
                    <div className="rv05-banner-sub">
                        <SkeletonWrapper width="50%">
                            {t("sentiment_score")}: {displaySummary?.analysisReport?.sentimentScore ?? "-"} ({displaySummary?.analysisReport?.sentimentCategory ?? "-"})
                        </SkeletonWrapper>
                    </div>
                </div>
                <div
                  className={`rv05-badge ${
                    (
                      displaySummary?.analysisReport?.riskLevel === "HIGH" ||
                      displaySummary?.analysisReport?.riskLevel === "치명" ||
                      displaySummary?.analysisReport?.riskLevel === "고위험" ||
                      displaySummary?.analysisReport?.riskLevel === "高リスク"
                    )
                      ? "danger"
                      : (displaySummary?.analysisReport?.riskLevel === "MEDIUM" ||
                        displaySummary?.analysisReport?.riskLevel === "경고" ||
                        displaySummary?.analysisReport?.riskLevel === "주의" ||
                        displaySummary?.analysisReport?.riskLevel === "中リスク"
                      )
                      ? "warn"
                      : "ok"
                  }`}
                >
                  <SkeletonWrapper width="40px">
                    {displaySummary?.analysisReport?.riskLevel ?? "-"}
                  </SkeletonWrapper>
                </div>
              </div>
          )}

          {/* 거래 이상 감지 */}
          {loading ? (
              <article className="rv05-card rv05-wide">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-hr"></div>
                  <div className="skeleton-dl">
                      <div className="skeleton skeleton-dt"></div><div className="skeleton skeleton-dd"></div>
                      <div className="skeleton skeleton-dt"></div><div className="skeleton skeleton-dd"></div>
                  </div>
              </article>
          ) : (
              <article className="rv05-card rv05-wide">
                  <h3 className="rv05-sec-title">{t("transaction_anomaly_detection")}</h3>
                  <hr className="rv05-hr" />
                  <p></p>
                  <p></p>
                  <dl className="rv05-dl">
                      <div>
                          <dt>{t("contract_price")}</dt>
                          <dd>
                              <SkeletonWrapper>{fmtNum(displaySummary?.transactionAnomaly?.price)} {t("currency_unit")}</SkeletonWrapper>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("average_price")}</dt>
                          <dd>
                              <SkeletonWrapper>{fmtNum(displaySummary?.transactionAnomaly?.averagePrice)} {t("currency_unit")}</SkeletonWrapper>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("deviation_rate")}</dt>
                          <dd>
                              <SkeletonWrapper width="50px">{displaySummary?.transactionAnomaly?.deviationPercent}%</SkeletonWrapper>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("anomaly_status")}</dt>
                          <dd>
                              <SkeletonWrapper width="60px">{displaySummary?.transactionAnomaly?.isAnomaly ? t("anomaly") : t("normal")}</SkeletonWrapper>
                          </dd>
                      </div>
                  </dl>
              </article>
          )}

          {/* 위험 조항 */}
          {loading ? (
              <article className="rv05-card rv05-wide">
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-hr"></div>
                  <div className="skeleton-dl">
                      <div className="skeleton skeleton-dt"></div><div className="skeleton skeleton-dd"></div>
                      <div className="skeleton skeleton-dt"></div><div className="skeleton skeleton-dd"></div>
                  </div>
              </article>
          ) : (
              <article className="rv05-card rv05-wide">
                  <h3 className="rv05-sec-title">{t("risky_clauses")}</h3>
                  <hr className="rv05-hr" />
                  <p></p>
                  <p></p>
                  <dl className="rv05-dl">
                      <div>
                          <dt>{t("clause_summary")}</dt>
                          <dd>
                              <SkeletonBlock height="40px">{displaySummary?.riskyClauses?.clauseSummary ?? "-"}</SkeletonBlock>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("legal_risk")}</dt>
                          <dd>
                              <SkeletonBlock height="40px">{displaySummary?.riskyClauses?.legalRisk ?? "-"}</SkeletonBlock>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("financial_impact")}</dt>
                          <dd>
                              <SkeletonBlock height="40px">{displaySummary?.riskyClauses?.financialImpact ?? "-"}</SkeletonBlock>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("operational_impact")}</dt>
                          <dd>
                              <SkeletonBlock height="40px">{displaySummary?.riskyClauses?.operationalImpact ?? "-"}</SkeletonBlock>
                          </dd>
                      </div>
                      <div>
                          <dt>{t("recommended_action")}</dt>
                          <dd>
                              <SkeletonBlock height="40px">{displaySummary?.riskyClauses?.recommendedAction ?? "-"}</SkeletonBlock>
                          </dd>
                      </div>
                  </dl>
              </article>
          )}

          {/* 2열 카드 그리드 */}
          <section className="rv05-grid">
            <article className="rv05-card">
              <h3 className="rv05-sec-title">{t("basic_information")}</h3>
              <hr className="rv05-hr"/>
              <p></p>
              <dl className="rv05-dl">
                <div>
                  <dt>{t("lease_part")}</dt>
                  <dd><SkeletonWrapper>{displayData?.leasePart ?? "-"}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("lease_period")}</dt>
                  <dd><SkeletonWrapper>{fmtDate(displayData?.leasePeriodStart)} ~ {fmtDate(displayData?.leasePeriodEnd)}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("middle_payment_date")}</dt>
                  <dd><SkeletonWrapper>{fmtDate(displayData?.middlePaymentDate)}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("balance_date")}</dt>
                  <dd><SkeletonWrapper>{fmtDate(displayData?.balanceDate)}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("rent_payment_date")}</dt>
                  <dd><SkeletonWrapper>{fmtDate(displayData?.rentDate)}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("area_land_building_lease")}</dt>
                  <dd><SkeletonWrapper>{fmtNum(displayData?.landArea)} / {fmtNum(displayData?.buildingArea)} / {fmtNum(displayData?.leaseArea)} ㎡</SkeletonWrapper></dd>
                </div>
              </dl>
            </article>

            <article className="rv05-card">
              <h3 className="rv05-sec-title">{t("financial_analysis_base")}</h3>
              <hr className="rv05-hr"/>
              <p></p>
              <dl className="rv05-dl">
                <div>
                  <dt>{t("deposit")}</dt>
                  <dd><SkeletonWrapper>{fmtNum(displayData?.deposit)} {t("currency_unit")}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("down_payment")}</dt>
                  <dd><SkeletonWrapper>{fmtNum(displayData?.downPayment)} {t("currency_unit")}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("middle_payment")}</dt>
                  <dd><SkeletonWrapper>{fmtNum(displayData?.middlePayment)} {t("currency_unit")}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("balance")}</dt>
                  <dd><SkeletonWrapper>{fmtNum(displayData?.balance)} {t("currency_unit")}</SkeletonWrapper></dd>
                </div>
                <div>
                  <dt>{t("rent")}</dt>
                  <dd>
                    <SkeletonWrapper>{fmtNum(displayData?.rentAmount)} {t("currency_unit")} ({displayData?.rentType ?? "-"})</SkeletonWrapper>
                  </dd>
                </div>
              </dl>
            </article>

            {/* 특약 */}
            <article className="rv05-card rv05-wide">
              <h3 className="rv05-sec-title">{t("special_terms")}</h3>
              <hr className="rv05-hr"/>
              <p></p>
              <SkeletonBlock height="auto">
                <p className="rv05-special">
                  {displayData?.specialTerms?.trim() || t("no_special_terms")}
                </p>
              </SkeletonBlock>
            </article>

            {/* 주요 발견사항: 나머지 필드 전부 */}
            <article className="rv05-card rv05-wide">
              <h3 className="rv05-sec-title">{t("key_findings_for_validation")}</h3>
              <hr className="rv05-hr" />
              <p></p>
              <ul className="rv05-kvlist">
                {restEntries.length === 0 ? (
                  <li className="rv05-dim">{t("no_additional_values")}</li>
                ) : (
                  restEntries.map(({ label, value }, idx) => (
                    <li key={idx}>
                      <span>{t(label)}</span> {/* label을 i18n 키로 인식 */}
                      <em>
                        <SkeletonWrapper width="100px">
                          {value === 'true' ? t('yes') : value === 'false' ? t('no') : t(value)}
                        </SkeletonWrapper>
                      </em>
                    </li>
                  ))
                )}
              </ul>
            </article>
          </section>

          <div className="rv05-actions">
            {currentLang !== 'KO' ? (
              <button className="an02-ai-analyze-start-btn" onClick={handleRevert}>
                  {t("view_original")}
              </button>
            ) : (
              <div className={`rv05-translate-dropdown ${isTranslateDropdownOpen ? 'is-open' : ''}`}>
                  <button className="an02-ai-analyze-start-btn" disabled={isTranslating} onClick={toggleTranslateDropdown} >
                      {isTranslating ? t("translating") : t("translate_contract")}
                  </button>
                  <div className="rv05-dropdown-content">
                      <a href="#" onClick={(e) => { e.preventDefault(); handleTranslate('EN'); }}>English</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleTranslate('JP'); }}>日本語</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleTranslate('ZH'); }}>中文</a>
                  </div>
              </div>
            )}
            <button
              className="an02-ai-analyze-start-btn"
              onClick={() => window.history.back()}
            >
              {t("back")}
            </button>
            <button
              className="an02-ai-analyze-start-btn"
              onClick={handleExportPDF}
            >
              {t("download_pdf")}
            </button>
            <button
              className="an02-ai-analyze-start-btn"
              onClick={() => window.print()}
            >
              {t("print")}
            </button>
          </div>
        </div>
      </div>
    );
};

export default PG100005;
