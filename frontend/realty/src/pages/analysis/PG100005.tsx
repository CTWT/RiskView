// src/pages/analysis/PG100005.tsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import "../../styles/common/common.css";
import contractFieldLabels from "../../contracts/contractFieldLabels";
import type { StructuredContractDataDTO } from "../../types/contract";

/*
 * @file PG100005.tsx
 * @description 아직 설계단계이지만 AI 분석 이후 분석결과 보고서가 나올 페이지 입니다.
 * 현재 어느 형태의 보고서가 작성될지 미지수라 페이지만 설계되었습니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : PG100005.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 계약서 분석결과 보고서가 담당될 페이지 입니다.
 */

interface PG100005Props {
    documentCode: string | null;
}

const PG100005: React.FC<PG100005Props> = ({ documentCode }) => {
    const [data, setData] = useState<StructuredContractDataDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const code = documentCode ?? sessionStorage.getItem("rv_documentCode");
        if (!code) {
            setErr(
                "문서 코드가 없습니다. 03 단계에서 저장 후 다시 시도하세요."
            );
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await axios.get<StructuredContractDataDTO>(
                    "http://localhost:8080/contracts",
                    { params: { documentCode: code }, withCredentials: true }
                );
                if (!cancelled) setData(res.data);
            } catch (e) {
                if (!cancelled) setErr("데이터 조회 중 오류가 발생했습니다.");
                console.error(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [documentCode]);

    const fmtNum = (n: number | null | undefined) =>
        typeof n === "number" ? n.toLocaleString() : "-";

    const fmtDate = (d: string | null | undefined) => (d ? d : "-");

    // 상단 요약칩에 쓰는 값
    const leaseType = data?.leaseType ?? "-";
    const location = data?.location ?? "-";
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
    ]);

    const restEntries = useMemo(() => {
        if (!data) return [] as Array<{ label: string; value: string }>;

        const keys = Object.keys(data) as (keyof StructuredContractDataDTO)[];

        return keys
            .filter((k) => !shownKeys.has(k))
            .filter((k) => {
                const v = data[k];
                return v !== null && v !== undefined && v !== "";
            })
            .map((k) => {
                const raw = data[k];
                const label = contractFieldLabels[k] ?? (k as string);

                let value = "";
                if (typeof raw === "number") value = raw.toLocaleString();
                else if (typeof raw === "string") value = raw;
                else value = String(raw); // (보통 올 일 없음)

                return { label, value };
            });
    }, [data]);

    if (loading) {
        return (
            <div className="rv05-container">
                <div className="rv05-card rv05-center">
                    <div className="an04-spinner" aria-hidden="true" />
                    <p>보고서를 불러오는 중…</p>
                </div>
            </div>
        );
    }
    if (err) {
        return (
            <div className="rv05-container">
                <div className="rv05-card rv05-error">{err}</div>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="rv05-container">
                <div className="rv05-card">데이터가 없습니다.</div>
            </div>
        );
    }

    return (
      <div className="rv05-container">
        <CommonContainerHeader
          subtitle="계약서 위험도 분석 결과"
          title="AI 분석 리포트"
          description="현재 화면은 OCR로 저장된 값 확인용 임시 레이아웃입니다. AI 분석 파트가 합류되면 위험 점수/코멘트가 추가됩니다."
        />

        {/* 상단 요약칩 */}
        <div className="rv05-chips">
          <div className="rv05-chip">
            <span className="rv05-chip-dot ok" />
            <div>
              <div className="rv05-chip-title">분석 완료</div>
              <div className="rv05-chip-sub">
                {now.toISOString().slice(0, 10)}{" "}
                {now.toTimeString().slice(0, 5)}
              </div>
            </div>
          </div>
          <div className="rv05-chip">
            <span className="rv05-chip-dot info" />
            <div>
              <div className="rv05-chip-title">매물 주소</div>
              <div className="rv05-chip-sub">{location}</div>
            </div>
          </div>
          <div className="rv05-chip">
            <span className="rv05-chip-dot note" />
            <div>
              <div className="rv05-chip-title">계약 유형</div>
              <div className="rv05-chip-sub">{leaseType}</div>
            </div>
          </div>
        </div>

        {/* 종합 위험 배너(임시) */}
        <div className="rv05-banner">
          <div>
            <div className="rv05-banner-title">종합 위험도 평가</div>
            <div className="rv05-banner-sub">
              AI 분석 준비 중입니다. 현재는 OCR 데이터만 반영합니다.
            </div>
          </div>
          <div className="rv05-badge warn">준비중</div>
        </div>

        {/* 2열 카드 그리드 */}
        <section className="rv05-grid">
          <article className="rv05-card">
            <h3 className="rv05-sec-title">기본 정보</h3>
            <dl className="rv05-dl">
              <div>
                <dt>임대할 부분</dt>
                <dd>{data.leasePart ?? "-"}</dd>
              </div>
              <div>
                <dt>임대 기간</dt>
                <dd>
                  {fmtDate(data.leasePeriodStart)} ~{" "}
                  {fmtDate(data.leasePeriodEnd)}
                </dd>
              </div>
              <div>
                <dt>중도금 지급일</dt>
                <dd>{fmtDate(data.middlePaymentDate)}</dd>
              </div>
              <div>
                <dt>잔금 지급일</dt>
                <dd>{fmtDate(data.balanceDate)}</dd>
              </div>
              <div>
                <dt>차임 지급일</dt>
                <dd>{fmtDate(data.rentDate)}</dd>
              </div>
              <div>
                <dt>면적(토지/건물/임대)</dt>
                <dd>
                  {fmtNum(data.landArea)} / {fmtNum(data.buildingArea)} /{" "}
                  {fmtNum(data.leaseArea)} ㎡
                </dd>
              </div>
            </dl>
          </article>

          <article className="rv05-card">
            <h3 className="rv05-sec-title">재무 분석(기초값)</h3>
            <dl className="rv05-dl">
              <div>
                <dt>보증금</dt>
                <dd>{fmtNum(data.deposit)} 원</dd>
              </div>
              <div>
                <dt>계약금</dt>
                <dd>{fmtNum(data.downPayment)} 원</dd>
              </div>
              <div>
                <dt>중도금</dt>
                <dd>{fmtNum(data.middlePayment)} 원</dd>
              </div>
              <div>
                <dt>잔금</dt>
                <dd>{fmtNum(data.balance)} 원</dd>
              </div>
              <div>
                <dt>차임</dt>
                <dd>
                  {fmtNum(data.rentAmount)} 원 ({data.rentType ?? "-"})
                </dd>
              </div>
            </dl>
          </article>

          {/* 특약 */}
          <article className="rv05-card rv05-wide">
            <h3 className="rv05-sec-title">특약</h3>
            <p className="rv05-special">
              {data.specialTerms?.trim() || "특약사항 없음"}
            </p>
          </article>

          {/* 주요 발견사항: 나머지 필드 전부 */}
          <article className="rv05-card rv05-wide">
            <h3 className="rv05-sec-title">주요 발견사항(데이터 검증용)</h3>
            <ul className="rv05-kvlist">
              {restEntries.length === 0 ? (
                <li className="rv05-dim">추가로 표시할 값이 없습니다.</li>
              ) : (
                restEntries.map(({ label, value }, idx) => (
                  <li key={idx}>
                    <span>{label}</span>
                    <em>{value}</em>
                  </li>
                ))
              )}
            </ul>
          </article>
        </section>

        <div className="rv05-actions">
          <button
            className="an02-ai-analyze-start-btn"
            onClick={() => window.history.back()}
          >
            뒤로
          </button>
          <button
            className="an02-ai-analyze-start-btn"
            onClick={() => window.print()}
          >
            인쇄
          </button>
        </div>
      </div>
    );
};

export default PG100005;
