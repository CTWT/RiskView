import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import CommonContainerHeader from "../../../components/ui/CommonContainerHeader";

/**
 * @file PG500021.tsx
 * @description 공지사항 페이지입니다
 *
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.13
 * 파일명 : PG500021.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 공지사항을 보여주는 페이지 입니다. db연동이 되지 않아 하드코딩으로 페이지 구현을 하였습니다.
 */
type BadgeType = "필독" | "업데이트" | "이벤트" | "안내" | "공지";
type SubTag = "NEW" | "첨부파일";

interface AnnItem {
    id: string;
    type: BadgeType;
    title: string;
    author: string;
    date: string; // YYYY.MM.DD
    subtags?: SubTag[];
}

const MOCK: AnnItem[] = [
    {
        id: "n-1",
        type: "필독",
        title: "[중요] 전세사기 피해 방지를 위한 계약 체크리스트 안내",
        author: "관리자",
        date: "2025.07.16",
        subtags: ["NEW", "첨부파일"],
    },
    {
        id: "n-2",
        type: "업데이트",
        title: "RiskView 서비스 업데이트 안내 - AI 분석 엔진 개선 및 새로운 기능 추가",
        author: "관리자",
        date: "2025.07.02",
    },
    {
        id: "n-3",
        type: "이벤트",
        title: "신규 회원 가입 이벤트 - 첫 계약서 분석 무료 쿠폰 증정",
        author: "관리자",
        date: "2025.06.28",
    },
    {
        id: "n-4",
        type: "안내",
        title: "부동산 계약 시 필수 확인 사항 - 등기부등본 확인 방법",
        author: "관리자",
        date: "2025.06.20",
    },
    {
        id: "n-5",
        type: "공지",
        title: "RiskView 커뮤니티 이용 가이드 및 규칙 안내",
        author: "관리자",
        date: "2025.06.13",
    },
];

const PG500021: React.FC = () => {
    React.useEffect(() => {
        try {
            localStorage.setItem('noticePosts', JSON.stringify(MOCK));
        } catch {}
    }, []);

    return (
      <PageContainer showBreadcrumb={true} centerContent={true}>
        <div className="community-container">
          <CommonContainerHeader
            subtitle="공지사항"
            title="RiskView의 새로운 소식을 전해드립니다"
            description="업데이트 안내, 이벤트, 주요 변경 사항을 빠르게 확인하세요."
          />

          {/* 배너(임시) */}
          <div className="rv05-banner">
            <div>
              <div className="rv05-banner-title"></div>
              <div className="rv05-banner-sub">
                공지사항 페이지는 아직 개발 단계입니다.
              </div>
            </div>
            <div className="rv05-badge warn">준비중</div>
          </div>

          <section className="co21-card">
            {/* 헤더 라인 */}
            <div className="co21-head">
              <div className="co21-col-type">분류</div>
              <div className="co21-col-title">제목</div>
              <div className="co21-col-author">작성자</div>
              <div className="co21-col-date">작성일</div>
            </div>

            {/* 리스트 */}
            <div className="co21-body">
              {MOCK.map((item) => (
                <div key={item.id} className="co21-row">
                  <div className="co21-col-type">
                    <span className={`co21-pill co21-pill-${item.type}`}>
                      {item.type}
                    </span>
                  </div>

                  <div className="co21-col-title">
                    <Link
                      to={`/PG500001/PG500021/detail/${item.id}`}
                      state={{ title: item.title }}
                      replace
                      className="co21-row-title-link"
                    >
                      {item.title}
                    </Link>
                    {item.subtags?.map((t) => (
                      <span
                        key={t}
                        className={`co21-pill-sub ${
                          t === "NEW" ? "is-new" : "is-file"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="co21-col-author">{item.author}</div>
                  <div className="co21-col-date">{item.date}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </PageContainer>
    );
};

export default PG500021;
