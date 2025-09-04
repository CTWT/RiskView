import React, { useState, useEffect, useRef } from "react";
import { FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import "../../styles/common/common.css";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";
import PageContainer from "../../components/layout/PageContainer";

/*
 * 생성자 : 이주하
 * 생성일 : 25.08.01
 * 파일명 : PG400001.tsx
 * 수정자 : 유연우
 * 수정일 : 25.09.04
 * 설명 : 뉴스 페이지 컴포넌트
 */

// 뉴스 데이터 타입
interface NewsItem {
  id: number;
  title: string;
  date: string;
  content?: string; // 선택적 속성
  url?: string; // 선택적 속성
  source?: string; // 선택적 속성
}

// 키워드 데이터 타입
interface KeywordItem {
  text: string;
  weight: number;
  color?: string; // 선택적 속성
}

// 페이지네이션 정보 타입
interface PaginationInfo {
  totalPages: number; // 총 페이지 수
  currentPage: number; // 현재 페이지
  startPage: number; // 시작 페이지
  endPage: number; // 끝 페이지
  hasPrevBlock: boolean; // 이전 블록 존재 여부
  hasNextBlock: boolean; // 다음 블록 존재 여부
  prevBlockStartPage?: number; // 이전 블록의 시작 페이지
  nextBlockStartPage?: number; // 다음 블록의 시작 페이지
}

// 뉴스 페이지 컴포넌트
const PG400001: React.FC = () => {
  // 활성화된 탭 상태
  const [activeTab, setActiveTab] = useState<string>("News");
  // 뉴스 목록 상태
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  // 키워드 상태
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);
  // 선택된 뉴스 상태
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  // 페이지네이션 정보 상태
  const [pagination, setPagination] = useState<PaginationInfo>({
    // 초기값 설정
    totalPages: 1, // 총 페이지 수
    currentPage: 1, // 현재 페이지
    startPage: 1, // 시작 페이지
    endPage: 1, // 끝 페이지
    hasPrevBlock: false, // 이전 블록 존재 여부
    hasNextBlock: false, // 다음 블록 존재 여부
  });

  // 뉴스 상세 DOM 참조
  const detailRef = useRef<HTMLDivElement | null>(null);

  // 컴포넌트 외부 클릭 감지
  useEffect(() => {
    // 마우스 클릭 이벤트 핸들러
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // 클릭된 요소가 뉴스 아이템 클릭 영역인지 확인
      const isNewsItem = (target as HTMLElement).closest(
        ".news-item-click-area"
      );

      // 상세 영역 밖을 클릭 시 닫기
      if (
        detailRef.current &&
        !detailRef.current.contains(target) &&
        !isNewsItem
      ) {
        setSelectedNews(null);
      }
    };

    // 상세보기가 열려 있을 때만 이벤트 리스너 등록
    if (selectedNews) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 클린업 함수: 이벤트 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedNews]);

  // API 호출 함수
  const fetchNewsData = async (pageNum: number) => {
    // 데이터를 불러오기 시작했으므로 로딩 상태를 true로 설정
    setLoading(true);
    // 지정된 주소로 API 호출 보냄
    fetch(`/api/board/news_articles?pageNum=${pageNum}&size=6`)
      // 서버로부터 응답을 받았으면
      .then((response) => {
        console.log("Response status:", response.status);
        // 응답이 성공적이지 못하면
        if (!response.ok) {
          // 에러 발생
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 응답의 Content-Type이 JSON인지 확인
        const contentType = response.headers.get("content-type") || "";
        // 만약 JSON 형식이 아니면
        if (!contentType.toLowerCase().includes("application/json")) {
          // 경고 메시지 띄움
          console.warn("예상치 못한 Content-Type:", contentType);
          // JSON 파싱 시도
          return response.json().catch(() => {
            throw new Error("JSON 파싱 실패");
          });
        }
        // JSON 형식이면
        return response.json();
      })
      // JSON 데이터를 받았으면
      .then((data) => {
        console.log("API 응답 데이터:", data);
        // 뉴스 데이터 설정
        setNewsData(data.content);
        // 페이지네이션 데이터 설정
        setPagination({
          totalPages: data.totalPages,
          currentPage: data.number,
          startPage: data.startPage,
          endPage: data.endPage,
          hasPrevBlock: data.hasPrevBlock,
          hasNextBlock: data.hasNextBlock,
          prevBlockStartPage: data.prevBlockStartPage,
          nextBlockStartPage: data.nextBlockStartPage,
        });
        // 키워드 데이터 설정
        setKeywords(mockKeywords);
        // 로딩 상태 false로 설정
        setLoading(false);
      })
      .catch((error) => {
        console.error("뉴스 데이터 로딩 오류:", error);
        // 뉴스 데이터를 빈 배열로 설정
        setNewsData([]);
        // 로딩 상태 false로 설정
        setLoading(false);
      });
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    // 뉴스 페이지네이션 API 호출하여 페이지 1로 이동
    fetchNewsData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 임시 키워드 데이터
  const mockKeywords: KeywordItem[] = [
    { text: "재개발", weight: 100, color: "#E91E63" },
    { text: "대출", weight: 85, color: "#9C27B0" },
    { text: "아파트", weight: 80, color: "#673AB7" },
    { text: "부동산", weight: 75, color: "#3F51B5" },
    { text: "주택", weight: 70, color: "#2196F3" },
    { text: "금리", weight: 65, color: "#03A9F4" },
    { text: "정책", weight: 60, color: "#00BCD4" },
    { text: "시장", weight: 55, color: "#009688" },
    { text: "투자", weight: 50, color: "#4CAF50" },
    { text: "분양", weight: 48, color: "#8BC34A" },
    { text: "매매", weight: 45, color: "#CDDC39" },
    { text: "전세", weight: 42, color: "#FFEB3B" },
    { text: "월세", weight: 40, color: "#FFC107" },
    { text: "청약", weight: 38, color: "#FF9800" },
    { text: "입주", weight: 35, color: "#FF5722" },
    { text: "분석", weight: 32, color: "#795548" },
    { text: "전망", weight: 30, color: "#607D8B" },
    { text: "상승", weight: 28, color: "#E91E63" },
    { text: "하락", weight: 25, color: "#9C27B0" },
    { text: "안정", weight: 22, color: "#673AB7" },
  ];

  // 탭 목록 데이터
  const tabs = ["코알라뉴스", "비버하우스", "수달빌리지"];

  // 페이지네이션 클릭 핸들러
  const goToPage = (pageNumber: number) => {
    // 페이지 번호가 1개 이상이고 총 페이지 수보다 작거나 같으면
    if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
      // 뉴스 페이지네이션 API 호출하여 해당되는 페이지로 이동
      fetchNewsData(pageNumber);
    }
  };

  // 이전 페이지로 이동
  const goToPrevPage = () => {
    // 현재 페이지가 1보다 크면
    if (pagination.currentPage > 1) {
      // 이전 페이지로 이동
      goToPage(pagination.currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const goToNextPage = () => {
    // 현재 페이지가 총 페이지 수보다 작으면
    if (pagination.currentPage < pagination.totalPages) {
      // 다음 페이지로 이동
      goToPage(pagination.currentPage + 1);
    }
  };

  // 이전 블록으로 이동
  const goToPrevBlock = () => {
    // 이전 블록이 존재하고 이전 블록의 시작 페이지가 있으면
    if (pagination.hasPrevBlock && pagination.prevBlockStartPage) {
      // 이전 블록의 시작 페이지로 이동
      goToPage(pagination.prevBlockStartPage);
    }
  };

  // 다음 블록으로 이동
  const goToNextBlock = () => {
    // 다음 블록이 존재하고 다음 블록의 시작 페이지가 있으면
    if (pagination.hasNextBlock && pagination.nextBlockStartPage) {
      // 다음 블록의 시작 페이지로 이동
      goToPage(pagination.nextBlockStartPage);
    }
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    // 페이지 번호 배열 생성
    const pages = [];
    // 페이지 번호 배열에 페이지 번호 추가
    for (let i = pagination.startPage; i <= pagination.endPage; i++) {
      pages.push(i);
    }
    // 페이지 번호 배열 반환
    return pages;
  };

  // 워드클라우드 스타일 계산
  const getWordCloudStyle = (keyword: KeywordItem, index: number) => {
    const fontSize = Math.max(12, (keyword.weight / 100) * 48);
    // 키워드 위치 배열
    const positions = [
      { top: "20%", left: "15%" },
      { top: "35%", left: "45%" },
      { top: "15%", left: "70%" },
      { top: "50%", left: "25%" },
      { top: "40%", left: "65%" },
      { top: "65%", left: "15%" },
      { top: "70%", left: "50%" },
      { top: "25%", left: "35%" },
      { top: "55%", left: "75%" },
      { top: "80%", left: "30%" },
      { top: "30%", left: "80%" },
      { top: "75%", left: "65%" },
      { top: "45%", left: "10%" },
      { top: "60%", left: "40%" },
      { top: "85%", left: "70%" },
      { top: "10%", left: "50%" },
      { top: "90%", left: "15%" },
      { top: "35%", left: "90%" },
      { top: "65%", left: "5%" },
      { top: "20%", left: "25%" },
    ];
    const position = positions[index % positions.length];

    return {
      fontSize: `${fontSize}px`,
      fontWeight: keyword.weight > 60 ? "bold" : "normal",
      color: keyword.color || "#333",
      position: "absolute" as const,
      ...position,
      cursor: "pointer",
      transition: "all 0.3s ease",
      userSelect: "none" as const,
    };
  };

  // 렌더링
  return (
    <PageContainer showBreadcrumb={true}>
      <div className="news-container">
        {/* 왼쪽: 뉴스 섹션 */}
        <div className="news-section">
          <div className="news-header">
            <div className="news-title-row">
              <h3>News</h3>
              {/* 뉴스 탭 목록 */}
              <div className="tab-inline-navigation">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${
                      activeTab === tab ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 뉴스 목록 */}
          <div className="news-list">
            {/* 로딩 중 로딩 스피너 표시 */}
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>뉴스를 불러오는 중...</p>
              </div>
            ) : (
              <>
                {/* 뉴스 기사 목록 렌더링 */}
                {newsData.map((news) => (
                  <article key={news.id} className="news-item">
                    {/* 클릭 시 상세 보기 */}
                    <div
                      className="news-item-click-area"
                      onClick={() => setSelectedNews(news)}
                    >
                      <div className="news-date">{news.date}</div>
                      <h3 className="news-title">{news.title}</h3>
                    </div>
                  </article>
                ))}

                {/* 페이지네이션 UI */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-container">
                    {/* 앞 블록으로 이동 */}
                    <button
                      className={`pagination-button nav-button ${
                        !pagination.hasPrevBlock ? "disabled" : ""
                      }`}
                      onClick={goToPrevBlock}
                      disabled={!pagination.hasPrevBlock}
                      title="이전 블록"
                    >
                      ≪
                    </button>

                    {/* 이전 페이지로 이동 */}
                    <button
                      className={`pagination-button nav-button ${
                        pagination.currentPage <= 1 ? "disabled" : ""
                      }`}
                      onClick={goToPrevPage}
                      disabled={pagination.currentPage <= 1}
                      title="이전 페이지"
                    >
                      ＜
                    </button>

                    {/* 페이지 번호들 */}
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        className={`pagination-button ${
                          pagination.currentPage === page ? "active" : ""
                        }`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    ))}

                    {/* 다음 페이지로 이동 */}
                    <button
                      className={`pagination-button nav-button ${
                        pagination.currentPage >= pagination.totalPages
                          ? "disabled"
                          : ""
                      }`}
                      onClick={goToNextPage}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      title="다음 페이지"
                    >
                      ＞
                    </button>

                    {/* 뒤 블록으로 이동 */}
                    <button
                      className={`pagination-button nav-button ${
                        !pagination.hasNextBlock ? "disabled" : ""
                      }`}
                      onClick={goToNextBlock}
                      disabled={!pagination.hasNextBlock}
                      title="다음 블록"
                    >
                      ≫
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 오른쪽: 연관 키워드 또는 뉴스 상세 */}
        <div className="keyword-section">
          <div className="keyword-card">
            {/* selectedNews가 있으면 상세 내용 표시 */}
            {selectedNews ? (
              <div className="news-detail" ref={detailRef}>
                <h2>{selectedNews.title}</h2>
                <p className="news-date">{selectedNews.date}</p>
                <p className="news-content">{selectedNews.content}</p>
              </div>
            ) : (
              // 없으면 워드클라우드 표시
              <>
                <h2 className="keyword-title">연관 키워드</h2>
                {/* 로딩 중 로딩 스피너 표시 */}
                {loading ? (
                  <div className="keyword-loading">
                    <div className="spinner"></div>
                    <p>키워드 분석 중...</p>
                  </div>
                ) : (
                  <>
                    {/* 워드클라우드 컨테이너 */}
                    <div className="wordcloud-container">
                      {keywords.map((keyword, index) => (
                        <span
                          key={`${keyword.text}-${index}`}
                          className="keyword-item"
                          // 동적 스타일 적용
                          style={getWordCloudStyle(keyword, index)}
                          onClick={() =>
                            console.log(`키워드 클릭: ${keyword.text}`)
                          }
                          // 마우스 호버 효과
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.opacity = "0.8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.opacity = "1";
                          }}
                        >
                          {keyword.text}
                        </span>
                      ))}
                    </div>
                    <p className="keyword-description">
                      최근 1달간 수집된 부동산 뉴스 키워드에서 추출한 주요
                      키워드입니다.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PG400001;