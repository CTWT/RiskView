import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
 * 수정자 : 박윤성
 * 수정일 : 25.09.03
 * 설명 : 게시판을 보여주는 페이지 입니다. db연동이 되지 않아 하드코딩으로 페이지 구현을 하였습니다.
 */

type PostType = "인기" | "정보" | "질문" | "";
type BoardKey = 'free' | 'support';

interface PostItem {
  id: string;
  board: BoardKey; // 게시판 구분(자유/지역이슈)
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

const POSTS_PER_PAGE = 5;

const PG500041: React.FC = () => {
  console.log('[PG500041] 컴포넌트 렌더링됨');
  const [searchParams, setSearchParams] = useSearchParams();
  const currentBoard: BoardKey = (searchParams.get('board') as BoardKey) || 'free';

  // 기본 상태
  const [sortBy, setSortBy] = useState<string>("최신순");
  const [period, setPeriod] = useState<string>("전체 기간");
  const [category, setCategory] = useState<string>("제목");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 게시글 데이터 상태
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 및 필터링 로직
  useEffect(() => {
    console.log('[PG500041] 다음 파라미터로 게시글 목록을 가져옵니다:', { currentPage, searchQuery, category, period, sortBy, currentBoard });
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("board", currentBoard);
      if (searchQuery.trim()) {
        const categoryMap: { [key: string]: string } = {
          "제목": "title", 
          "내용": "content", 
          "작성자": "author",
        };
        params.append("searchCategory", categoryMap[category] || "title");
        params.append("searchQuery", searchQuery.trim());
      }
      if (period !== "전체 기간") {
        params.append("period", period);
      }
      params.append("sortBy", sortBy);
      params.append("page", String(currentPage - 1)); // Spring은 0부터 시작
      params.append("size", String(POSTS_PER_PAGE));

      try {
        const res = await fetch(`/api/posts?${params.toString()}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "게시글을 불러오는데 실패했습니다.");
        }

        const data = await res.json();
        setPosts(data.content);
        console.log('[PG500041] 게시글 목록 로딩 성공:', data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        setPosts([]);
        setTotalPages(0);
        console.error("게시글 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchQuery, category, period, sortBy, currentBoard]);
  
  // --- 실시간 통계 동기화: 상세에서 보고/좋아요/댓글 후 목록에도 최신 수치 반영 ---
  const refreshingRef = useRef(false);
  const lastFetchedIdsRef = useRef<string[]>([]);

  // 개별 포스트 통계 조회 후 posts 상태에 병합 업데이트
  const refreshStats = async (ids: string[]) => {
    if (!ids.length || refreshingRef.current) return;
    console.log('[PG500041] 다음 ID의 게시글 통계를 새로고침합니다:', ids);
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
        } catch (error) {
          console.error(`[PG500041] 게시글 ${id} 통계 새로고침 실패:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(tasks);
      const updates = results
        .map((r) => (r.status === 'fulfilled' ? r.value : null))
        .filter(Boolean) as { id: string; views: number; likes: number; comments: number }[];

      if (updates.length) {
        console.log('[PG500041] 통계 업데이트 적용:', updates);
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
    // 같은 세트에 대해 과도한 호출 방지
    const ids = posts.map(p => p.id);
    if (JSON.stringify(ids) !== JSON.stringify(lastFetchedIdsRef.current)) {
      lastFetchedIdsRef.current = ids;
      refreshStats(ids);
    }
  }, [posts]);

  // 브라우저 포커스/가시성 변경 시에도 재동기화 
  useEffect(() => {
    const onFocus = () => refreshStats(posts.map(p => p.id));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [posts]);


  // 검색 핸들러
  const handleSearch = () => {
    console.log("[PG500041] 검색 실행, 검색어:", searchQuery);
    // 검색은 useEffect에서 자동으로 처리됨
    setCurrentPage(1); // 검색 시 첫 페이지로 리셋
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    console.log(`[PG500041] 페이지 변경: ${page}`);
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
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
              className={`tab-item ${currentBoard === "free" ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setSearchParams({ board: "free" });
                setCurrentPage(1);
              }}
            >
              자유게시판
            </Link>
            <Link
              to={{ pathname: "", search: "?board=support" }}
              className={`tab-item ${
                currentBoard === "support" ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                setSearchParams({ board: "support" });
                setCurrentPage(1);
              }}
            >
              지역이슈
            </Link>
            {/* 글쓰기 버튼 */}
            <Link
              to="/PG500043"
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

        {/* 종합 위험 배너(임시) */}
        <div className="rv05-banner">
          <div>
            <div className="rv05-banner-title"></div>
            <div className="rv05-banner-sub">
              게시판 페이지는 아직 개발 단계입니다.
            </div>
          </div>
          <div className="rv05-badge warn">준비중</div>
        </div>

        {/* 게시물 목록 */}
        <section className="board-list">
          {isLoading ? (
            <div className="no-posts">
              <p>게시글을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="no-posts">
              <p>오류: {error}</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
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
      <ChatToggleButton
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen((prev) => !prev)}
      />
    </PageContainer>
  );
};

export default PG500041;