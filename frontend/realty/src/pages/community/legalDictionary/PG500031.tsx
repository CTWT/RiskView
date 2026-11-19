// src/pages/community/legalDictionary/PG500031.tsx
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

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { LuSearch } from "react-icons/lu";
import PageContainer from "../../../components/layout/PageContainer";
import CommonContainerHeader from "../../../components/ui/CommonContainerHeader";

interface LawKeywordDTO {
  lawKeyword: string;
  lawKeywordDescription: string;
  lawKeywordCategory: string;
  lawReferenceName?: string;
  lawReferenceUrl?: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number; // 현재 페이지 index
}

const PG500031: React.FC = () => {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [terms, setTerms] = useState<LawKeywordDTO[]>([]);

  // 페이지네이션 상태
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ API 호출
  useEffect(() => {
    axios
        .get<PageResponse<LawKeywordDTO>>("http://localhost:8080/lawKeyword/keywords", {
        params: { page, size }
        })
        .then((res) => {
        const data = res.data || { content: [], totalPages: 0, number: 0 };
        setTerms(data.content || []);
        setTotalPages(data.totalPages || 0);
        if (data.content && data.content.length && selectedId === null) {
            setSelectedId(0);
        }
        })
        .catch((err) => console.error("API error:", err));
    }, [page, size, selectedId]);

  // 검색 필터
  const filtered = useMemo(() => {
    const list = terms || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
        (t) =>
        t.lawKeyword.toLowerCase().includes(q) ||
        t.lawKeywordDescription.toLowerCase().includes(q)
    );
    }, [query, terms]);

  // 선택된 항목
  const selected = useMemo(
    () => (selectedId !== null ? filtered[selectedId] : null),
    [selectedId, filtered]
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && filtered.length) {
      setSelectedId(0); // 첫 번째 항목 선택
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

        {/* 중앙 정렬 */}
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
                <h3 className="co31-term-title">{selected.lawKeyword}</h3>
                <p className="co31-term-desc">
                  {selected.lawKeywordDescription}
                </p>
                {selected.lawReferenceName && (
                  <p className="co31-term-law">
                    <a
                      href={selected.lawReferenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selected.lawReferenceName}
                    </a>
                  </p>
                )}
              </>
            ) : (
              <div className="co31-empty">
                검색 결과가 없습니다. 다른 키워드를 입력해 보세요.
              </div>
            )}
          </section>

          {/* 용어 칩 리스트 */}
          <div className="co31-chip-wrap">
            {filtered?.map((t, idx) => (
                <button
                key={idx}
                type="button"
                className={
                    "an02-ai-analyze-start-btn co31-chip" +
                    (idx === selectedId ? " active" : "")
                }
                onClick={() => setSelectedId(idx)}
                >
                {t.lawKeyword}
                </button>
            ))}
        </div>

        <div className="pagination-container">
          {/* 첫 페이지 */}
          <button
            className="pagination-button"
            disabled={page === 0}
            onClick={() => setPage(0)}
          >
            &laquo;
          </button>

          {/* 이전 페이지 */}
          <button
            className="pagination-button"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            &lt;
          </button>

          {/* 숫자 페이지 버튼 (5개 단위로 묶음) */}
          {(() => {
            const groupSize = 5; // 한 번에 보여줄 페이지 수
            const currentGroup = Math.floor(page / groupSize);
            const start = currentGroup * groupSize;
            const end = Math.min(start + groupSize, totalPages);

            return Array.from({ length: end - start }, (_, idx) => {
              const pageIndex = start + idx;
              return (
                <button
                  key={pageIndex}
                  className={`pagination-button ${
                    page === pageIndex ? "active" : ""
                  }`}
                  onClick={() => setPage(pageIndex)}
                >
                  {pageIndex + 1}
                </button>
              );
            });
          })()}

          {/* 다음 페이지 */}
          <button
            className="pagination-button"
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            &gt;
          </button>

          {/* 마지막 페이지 */}
          <button
            className="pagination-button"
            disabled={page === totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
          >
            &raquo;
          </button>
        </div>

        </div>
      </div>
    </PageContainer>
  );
};

export default PG500031;
