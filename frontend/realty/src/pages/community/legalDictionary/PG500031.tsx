// src/pages/community/legalDictionary/PG500021.tsx

import React, { useMemo, useState, useEffect } from "react";
import PageContainer from "../../../components/layout/PageContainer";
import CommonContainerHeader from "../../../components/ui/CommonContainerHeader";
import { LuSearch } from "react-icons/lu";

/**
 * @file PG500031.tsx
 * @description 부동산 용어 사전 페이지입니다
 *
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.13
 * 파일명 : PG500031.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 부동산 용어 사전 페이지를 보여주는 tsx 입니다. db 연동을 하지 못해
 * Term으로 각 버튼의 값들을 줘서 화면에 띄우는 방식으로 진행하였습니다.
 * 칩 기반 검색과 실시간 필터링 기능을 사용하여 원하는 목록을 바로 검색이 가능합니다
 */

type Term = {
    id: string;
    name: string;
    desc: string;
    law?: string;
};

const TERMS: Term[] = [
    {
        id: "jeonse-right",
        name: "전세권",
        desc: "“전세권”이란 전세금을 지급하고 타인의 부동산을 점유해 그 부동산의 용도에 좇아 사용·수익하며, 그 부동산 전부에 대해 후순위권리자 기타 채권자보다 전세금의 우선변제를 받을 권리를 말합니다.",
        law: "관련 법령 : 민법 제303조제1항",
    },
    {
        id: "mortgage-max",
        name: "근저당권",
        desc: "채무의 발생과 증감을 대비하여 일정한 ‘최고액’ 범위 내에서 담보하는 저당권의 한 형태입니다. 개별 채무가 변동되더라도 동일 담보로 계속 담보할 수 있어, 대출 한도 운용이나 신용공여가 반복되는 거래에 활용됩니다. 원본 확정 전에는 최고액 한도에서 담보력이 유지됩니다.",
        law: "관련 법령 : 민법(저당권 규정) 및 판례 실무",
    },
    {
        id: "jeonse-deposit",
        name: "전세금",
        desc: "전세권 설정 또는 임대차에서 임차인이 임대인에게 맡기는 보증성 금전입니다. 계약 종료 시 목적물을 반환하고 조건을 이행하면 원칙적으로 전액 반환받으며, 반환 지연 시 임차인은 대항력·우선변제권 등을 통해 회수를 도모할 수 있습니다.",
    },
    {
        id: "priority-opposability",
        name: "대항력",
        desc: "임차인이 제3자(새 소유자 등)에게도 임차권을 주장해 거주·사용을 계속할 수 있는 효력입니다. 주택의 경우 실제 점유와 전입신고를 갖추면 취득하고, 보증금 회수 보호를 위해서는 확정일자를 추가로 받으면 우선변제권이 강화됩니다.",
        law: "관련 법령 : 주택임대차보호법 제3조",
    },
    {
        id: "lease-contract",
        name: "임대차계약",
        desc: "임대인이 목적물을 사용·수익하게 할 의무를 지고, 임차인은 차임을 지급하는 쌍무계약입니다. 목적물의 보존·수선, 차임지급 시기, 해지·해제 사유 등을 약정으로 정하며, 주거·상가 등 목적에 따라 특별법의 보호를 받을 수 있습니다.",
        law: "관련 법령 : 민법 제618조 이하",
    },
    {
        id: "housing-lease-protection",
        name: "주택임대차보호법",
        desc: "주거용 건물 임차인의 권익을 보호하기 위해 제정된 특별법입니다. 대항력·우선변제권·최우선변제 등 임차인의 보증금 회수와 거주 안정에 관한 규정을 두며, 임대차기간·계약갱신요구권 등 실생활에 밀접한 보호 장치를 제공합니다.",
    },
    {
        id: "registry-right-holder",
        name: "등기권리자",
        desc: "부동산 등기 신청에서 새로운 권리를 취득하는 자를 뜻합니다. 매매의 경우 매수인이, 저당권 설정 등기에서는 저당권자가 등기권리자가 되며, 등기의무자(권리를 이전·설정해 주는 자)와 대비되는 개념입니다.",
        law: "관련 법령 : 부동산등기법",
    },
    {
        id: "debtor",
        name: "채무자",
        desc: "채권자에게 급부를 이행할 의무를 부담하는 자를 말합니다. 이행 지체나 불능 시에는 손해배상·지연손해금 등의 책임을 질 수 있으며, 담보제공이나 기한의 이익 상실 등 계약·법률에서 정한 제재가 따를 수 있습니다.",
    },
];

const PG500031: React.FC = () => {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string>(TERMS[0].id);

    const filtered = useMemo(() => {
        const q = query.trim();
        if (!q) return TERMS;
        return TERMS.filter(
            (t) =>
                t.name.includes(q) ||
                t.desc.toLowerCase().includes(q.toLowerCase())
        );
    }, [query]);

    // 검색 후 목록이 비었을 때를 대비하여 선택 상태 관리
    useEffect(() => {
        if (filtered.length && !filtered.some((t) => t.id === selectedId)) {
            setSelectedId(filtered[0].id);
        }
    }, [filtered, selectedId]);

    const selected = useMemo(
        () => TERMS.find((t) => t.id === selectedId),
        [selectedId]
    );

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter" && filtered.length) {
            setSelectedId(filtered[0].id);
        }
    };

    return (
        <PageContainer showBreadcrumb={true} centerContent={true}>
            <div className="community-container co31">
                <CommonContainerHeader
                    subtitle="부동산 용어 사전"
                    title="계약 전, 용어부터 똑똑하게!"
                    description="복잡한 계약서, 이제 용어부터 정확히 이해하세요"
                />

                {/* ✅ 중앙 정렬 공통 래퍼 */}
                <div className="co31-center">
                    {/* 검색 입력 */}
                    <div className="co31-search-wrap">
                        <LuSearch className="co31-search-ic" />
                        <input
                            className="co31-search-input"
                            placeholder="법률 용어 검색"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* 용어 설명 카드 */}
                    <section className="co31-term-card">
                        {selected ? (
                            <>
                                <h3 className="co31-term-title">
                                    {selected.name}
                                </h3>
                                <p className="co31-term-desc">
                                    {selected.desc}
                                </p>
                                {selected.law && (
                                    <p className="co31-term-law">
                                        {selected.law}
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="co31-empty">
                                검색 결과가 없습니다. 다른 키워드를 입력해
                                보세요.
                            </div>
                        )}
                    </section>

                    {/* 용어 칩(버튼) 리스트 */}
                    <div className="co31-chip-wrap">
                        {filtered.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={
                                    "an02-ai-analyze-start-btn co31-chip" +
                                    (t.id === selectedId ? " active" : "")
                                }
                                onClick={() => setSelectedId(t.id)}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default PG500031;
