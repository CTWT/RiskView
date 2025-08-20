// src/pages/community/board/PG500041.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import CommonContainerHeader from "../../../components/ui/CommonContainerHeader";

/**
 * @file PG500021.tsx
 * @description 게시판 페이지입니다
 *
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.13
 * 파일명 : PG500041.tsx
 * 수정자 : 이주하
 * 수정일 : 25.08.19
 * 설명 : 게시판을 보여주는 페이지 입니다. db연동이 되지 않아 하드코딩으로 페이지 구현을 하였습니다.
 */

type PostType = "인기" | "정보" | "질문" | "";

interface PostItem {
    id: string;
    type?: PostType;
    title: string;
    content: string;
    author: string;
    date: string; // YYYY.MM.DD
    views: number;
    likes: number;
    comments: number;
    hasAttachment?: boolean;
}

const MOCK_POSTS: PostItem[] = [
{
    id: "post-1",
    type: "인기",
    title: "전세 계약 시 주의사항 공유",
    content:
    "최근 전세 계약하면서 겪은 경험을 공유하고자 합니다. RiskView 사용 후기도 포함!",
    author: "김부동산",
    date: "2025.08.15",
    views: 1247,
    likes: 23,
    comments: 45,
},
{
    id: "post-2",
    type: "정보",
    title: "강남구 아파트 시세 정보",
    content: "강남구 대치동 아파트 최근 거래 정보입니다. 1월 실거래가 업데이트",
    author: "부동산왕",
    date: "2025.08.15",
    views: 892,
    likes: 15,
    comments: 32,
},
{
    id: "post-3",
    type: "질문",
    title: "신축 아파트 분양권 양도 문의",
    content:
    "분당 신축 아파트 분양권 양도 시 주의사항이 궁금합니다. 세금 관련해서도 조언 부탁드려요.",
    author: "분양초보",
    date: "2025.08.02",
    views: 634,
    likes: 8,
    comments: 12,
},
{
    id: "post-4",
    type: "",
    title: "전세사기 당할 뻔한 경험담",
    content:
    "다행히 RiskView로 미리 위험해서 피할 수 있었어요. 모든 분들이 꼭 확인하세요!",
    author: "안전제일",
    date: "2025.07.22",
    views: 2156,
    likes: 67,
    comments: 99,
},
{
    id: "post-5",
    type: "",
    title: "외국인 부동산 투자 후기",
    content:
    "일본인인데 한국 부동산 투자했어요. RiskView 영어 서비스가 정말 도움됐습니다.",
    author: "TokyoInvestor",
    date: "2025.07.12",
    views: 1423,
    likes: 34,
    comments: 84,
},
];

const PG500041: React.FC = () => {
const [sortBy, setSortBy] = useState<string>("최신순");
const [period, setPeriod] = useState<string>("전체 기간");
const [category, setCategory] = useState<string>("제목");
const [searchQuery, setSearchQuery] = useState<string>("");
const [isOpen, setIsOpen] = useState(false);

const handleSearch = () => {
    console.log("검색:", searchQuery);
    // 검색 로직 구현
    };

return (
  <PageContainer showBreadcrumb={true} centerContent={true}>
    <div className="post-container">
      {/* 탭 메뉴 */}
      <div className="community-tabs">
        <Link to="/community/board/free" className="tab-item active">
          자유게시판
        </Link>
        <Link to="/community/board/data" className="tab-item">
          자료실
        </Link>
        <Link to="/community/board/support" className="tab-item">
          지역이슈
        </Link>
      </div>

      {/* 필터 및 검색 */}
      <div className="board-filters">
        <div className="filter-left">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="최신순">최신순</option>
            <option value="인기순">인기순</option>
            <option value="조회순">조회순</option>
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="전체 기간">전체 기간</option>
            <option value="1주일">1주일</option>
            <option value="1개월">1개월</option>
            <option value="3개월">3개월</option>
          </select>
        </div>

        <div className="filter-right">
          <div className="search-bar">
            <div
              className="custom-category-select"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="selected-category">{category}</span>
              <span className="arrow">▼</span>
              {isOpen && (
                <ul className="category-options">
                  <li
                    onClick={() => {
                      setCategory("제목");
                      setIsOpen(false);
                    }}
                  >
                    제목
                  </li>
                  <li
                    onClick={() => {
                      setCategory("내용");
                      setIsOpen(false);
                    }}
                  >
                    내용
                  </li>
                  <li
                    onClick={() => {
                      setCategory("작성자");
                      setIsOpen(false);
                    }}
                  >
                    작성자
                  </li>
                </ul>
              )}
            </div>

            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <button onClick={handleSearch} className="search-btn">
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 게시물 목록 */}
      <section className="board-list">
        {MOCK_POSTS.map((post) => (
          <div key={post.id} className="board-item">
            <div className="board-item-left">
              <div className="board-item-icon">
                {post.type === "인기" && "🔥"}
                {post.type === "정보" && "💰"}
                {post.type === "질문" && "🏠"}
                {!post.type && "⚠️"}
              </div>
              <div className="board-item-main">
                <div className="board-item-header">
                  <Link
                    to={
                      post.title.trim() === "전세 계약 시 주의사항 공유"
                        ? "/PG500001/PG500041/PG500042"
                        : `/PG500001/PG500041/${post.id}`
                    }
                    className="board-item-title"
                  >
                    {post.title}
                  </Link>
                </div>

                <div className="board-item-preview">{post.content}</div>

                <div className="board-item-meta">
                  <span className="author">작성자: {post.author}</span>
                  <span className="date">{post.date}</span>
                </div>
              </div>
            </div>

            <div className="board-item-stats">
              {post.type && (
                <span className={`board-badge board-badge-${post.type}`}>
                  {post.type}
                </span>
              )}
              <div className="stat-numbers">
                <span className="stat-item">
                  👁 {post.views.toLocaleString()}
                </span>
                <span className="stat-item">👍 {post.likes}</span>
                <span className="stat-item">💬 {post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  </PageContainer>
);
};

export default PG500041;