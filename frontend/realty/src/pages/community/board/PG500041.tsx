import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import ChatToggleButton from "../../../components/chat/ChatToggleButton";

/**
 * @file PG500041.tsx
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
type BoardKey = 'free' | 'support';

interface PostItem {
  board: BoardKey; // 게시판 구분(자유/지역이슈)
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
  createdAt: Date;
}

interface NewPost {
  title: string;
  content: string;
  tags: string;
}

const MOCK_POSTS: PostItem[] = [
  {
    id: "post-1",
    board: 'free',
    type: "인기",
    title: "전세 계약 시 주의사항 공유",
    content:
      "최근 전세 계약하면서 겪은 경험을 공유하고자 합니다. RiskView 사용 후기도 포함!",
    author: "김부동산",
    date: "2025.08.15",
    views: 1247,
    likes: 23,
    comments: 45,
    createdAt: new Date("2025-08-15"),
  },
  {
    id: "post-2",
    board: 'free',
    type: "정보",
    title: "강남구 아파트 시세 정보",
    content: "강남구 대치동 아파트 최근 거래 정보입니다. 1월 실거래가 업데이트",
    author: "부동산왕",
    date: "2025.08.15",
    views: 892,
    likes: 15,
    comments: 32,
    createdAt: new Date("2025-08-15"),
  },
  {
    id: "post-3",
    board: 'free',
    type: "질문",
    title: "신축 아파트 분양권 양도 문의",
    content:
      "분당 신축 아파트 분양권 양도 시 주의사항이 궁금합니다. 세금 관련해서도 조언 부탁드려요.",
    author: "분양초보",
    date: "2025.08.02",
    views: 634,
    likes: 8,
    comments: 12,
    createdAt: new Date("2025-08-02"),
  },
  {
    id: "post-4",
    board: 'free',
    type: "",
    title: "전세사기 당할 뻔한 경험담",
    content:
      "다행히 RiskView로 미리 위험해서 피할 수 있었어요. 모든 분들이 꼭 확인하세요!",
    author: "안전제일",
    date: "2025.07.22",
    views: 2156,
    likes: 67,
    comments: 99,
    createdAt: new Date("2025-07-22"),
  },
  {
    id: "post-5",
    board: 'free',
    type: "",
    title: "외국인 부동산 투자 후기",
    content:
      "일본인인데 한국 부동산 투자했어요. RiskView 영어 서비스가 정말 도움됐습니다.",
    author: "TokyoInvestor",
    date: "2025.07.12",
    views: 1423,
    likes: 34,
    comments: 84,
    createdAt: new Date("2025-07-12"),
  },
  // 더 많은 데이터를 위한 추가 포스트들
  {
    id: "post-6",
    board: 'free',
    type: "정보",
    title: "2025년 전세대출 금리 변화 분석",
    content: "올해 전세대출 금리가 많이 올랐네요. 각 은행별 비교 정보입니다.",
    author: "금융분석가",
    date: "2025.07.10",
    views: 987,
    likes: 19,
    comments: 28,
    createdAt: new Date("2025-07-10"),
  },
  {
    id: "post-7",
    board: 'free',
    type: "질문",
    title: "중도금 대출 승인 거부 시 대처법?",
    content: "분양받은 아파트 중도금 대출이 거부됐어요. 어떻게 해야 할까요?",
    author: "급한사람",
    date: "2025.07.08",
    views: 543,
    likes: 12,
    comments: 34,
    createdAt: new Date("2025-07-08"),
  },
  {
    id: "support-1",
    board: "support",
    type: "정보",
    title: "강동구 상수도 공사 안내",
    content: "9/1~9/3 일부 구간 단수 예정입니다.",
    author: "강동구청",
    date: "2025.08.18",
    views: 210,
    likes: 3,
    comments: 2,
    createdAt: new Date("2025-08-18"),
  },
  {
    id: "support-2",
    board: "support",
    type: "질문",
    title: "송파구 매립지 악취 민원 공유",
    content: "최근 밤마다 냄새가 심한데 같은 분 계신가요?",
    author: "잠실주민",
    date: "2025.08.17",
    views: 389,
    likes: 6,
    comments: 11,
    createdAt: new Date("2025-08-17"),
  }
];

const POSTS_PER_PAGE = 5;

const PG500041: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentBoard: BoardKey = (searchParams.get('board') as BoardKey) || 'free';

  // 기본 상태
  const [sortBy, setSortBy] = useState<string>("최신순");
  const [period, setPeriod] = useState<string>("전체 기간");
  const [category, setCategory] = useState<string>("제목");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 글쓰기 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newPost, setNewPost] = useState<NewPost>({
    title: "",
    content: "",
    tags: "",
  });

  // 게시글 데이터 상태
  const [posts, setPosts] = useState<PostItem[]>(MOCK_POSTS);
  const [filteredPosts, setFilteredPosts] = useState<PostItem[]>(MOCK_POSTS.filter(p => p.board === currentBoard));

  // 검색 및 필터링 로직
  useEffect(() => {
    let result = posts.filter(p => p.board === currentBoard);

    // 검색 필터링
    if (searchQuery.trim()) {
      result = result.filter((post) => {
        switch (category) {
          case "제목":
            return post.title.toLowerCase().includes(searchQuery.toLowerCase());
          case "내용":
            return post.content
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          case "작성자":
            return post.author
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          default:
            return (
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
      });
    }

    // 기간 필터링
    if (period !== "전체 기간") {
      const now = new Date();
      const filterDate = new Date();

      switch (period) {
        case "1주일":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "1개월":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "3개월":
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }

      result = result.filter((post) => post.createdAt >= filterDate);
    }

    // 정렬
    switch (sortBy) {
      case "최신순":
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "인기순":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "조회순":
        result.sort((a, b) => b.views - a.views);
        break;
    }

    setFilteredPosts(result);
    setCurrentPage(1); // 필터링 시 첫 페이지로 이동
  }, [posts, searchQuery, category, period, sortBy, currentBoard]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // --- 실시간 통계 동기화: 상세에서 보고/좋아요/댓글 후 목록에도 최신 수치 반영 ---
  const refreshingRef = useRef(false);
  const lastFetchedIdsRef = useRef<string[]>([]);

  // 개별 포스트 통계 조회 후 posts 상태에 병합 업데이트
  const refreshStats = async (ids: string[]) => {
    if (!ids.length || refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const tasks = ids.map(async (id) => {
        try {
          const res = await fetch(`/api/posts/${id}`);
          if (!res.ok) throw new Error(String(res.status));
          const data = await res.json();
          return {
            id: String(data.id ?? id),
            views: Number(data.views ?? 0),
            likes: Number(data.likes ?? 0),
            comments: Array.isArray(data.comments) ? data.comments.length : Number(data.comments ?? 0),
          };
        } catch (_) {
          return null;
        }
      });

      const results = await Promise.allSettled(tasks);
      const updates = results
        .map((r) => (r.status === 'fulfilled' ? r.value : null))
        .filter(Boolean) as { id: string; views: number; likes: number; comments: number }[];

      if (updates.length) {
        setPosts((prev) =>
          prev.map((p) => {
            const u = updates.find((x) => x.id === p.id);
            return u ? { ...p, views: u.views, likes: u.likes, comments: u.comments } : p;
          })
        );
      }
    } finally {
      refreshingRef.current = false;
    }
  };

  // 현재 페이지의 게시글들에 대해 진입/탭 이동 시 최신 통계로 동기화
  useEffect(() => {
    const ids = currentPosts.map((p) => p.id);
    // 같은 세트에 대해 과도한 호출 방지
    if (JSON.stringify(ids) !== JSON.stringify(lastFetchedIdsRef.current)) {
      lastFetchedIdsRef.current = ids;
      refreshStats(ids);
    }

  }, [currentBoard, currentPage, filteredPosts.length]);

  // 브라우저 포커스/가시성 변경 시에도 재동기화 
  useEffect(() => {
    const onFocus = () => refreshStats(currentPosts.map((p) => p.id));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };

  }, [currentBoard, currentPage, filteredPosts.length]);

  // 검색 핸들러
  const handleSearch = () => {
    console.log("검색:", searchQuery);
    // 검색은 useEffect에서 자동으로 처리됨
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // 페이지 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 페이지 번호 렌더링 함수
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`page-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <PageContainer showBreadcrumb={true} centerContent={true}>
      <div className="post-container">
        {/* 탭 메뉴 */}
        <div className="community-tabs-wrapper">
          <div className="community-tabs">
            <Link
              to={{ pathname: "", search: "?board=free" }}
              className={`tab-item ${currentBoard === 'free' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setSearchParams({ board: 'free' });
                setCurrentPage(1);
              }}
            >
              자유게시판
            </Link>
            <Link
              to={{ pathname: "", search: "?board=support" }}
              className={`tab-item ${currentBoard === 'support' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setSearchParams({ board: 'support' });
                setCurrentPage(1);
              }}
            >
              지역이슈
            </Link>
            {/* 글쓰기 버튼 */}
            <Link
              to={{ pathname: "PG500043" }}
              state={{ board: currentBoard }}
              className="write-btn"
            >
              + 글쓰기
            </Link>
          </div>
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
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
          {currentPosts.length > 0 ? (
            currentPosts.map((post) => (
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
                        to={`/PG500001/PG500041/PG500042/${post.id}`}
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
            ))
          ) : (
            <div className="no-posts">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </section>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>

            {renderPaginationButtons()}

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>
      <ChatToggleButton isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </PageContainer>
  );
};

export default PG500041;