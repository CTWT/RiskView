import React, { useState, useEffect, useRef } from "react";
import { FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import "../../styles/common/common.css";

// 뉴스 데이터 타입 정의
interface NewsItem {
  id: number;
  title: string;
  date: string;
  content?: string;
  url?: string;
  source?: string;
}

// 키워드 데이터 타입 정의
interface KeywordItem {
  text: string;
  weight: number;
  color?: string;
}

// 뉴스 페이지 컴포넌트
const PG400001: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("News");
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isNewsItem = (target as HTMLElement).closest(".news-item-click-area");

      if (detailRef.current && !detailRef.current.contains(target) && !isNewsItem) {
        setSelectedNews(null);
      }
    };

    if (selectedNews) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedNews]);

  // 임시 뉴스 데이터 (실제로는 API에서 받아올 데이터)
  const mockNewsData: NewsItem[] = [
    {
      id: 1,
      title: "은행권, 대출모집인 통한 주담대 신청 줄줄이 중단",
      date: "2025.07.08",
      content: "기사 내용이 여기에 표시됩니다...",
      source: "연합뉴스"
    },
    {
      id: 2,
      title: "강남구, 청년·신혼부부 전월세 대출이자 지원예산 2.3배로 늘려",
      date: "2025.07.08",
      content: "기사 내용이 여기에 표시됩니다...",
      source: "조선비즈"
    },
    {
      id: 3,
      title: "6월 서울 아파트 낙찰가율 98.5%...3년 만에 최고치",
      date: "2025.07.08",
      content: "기사 내용이 여기에 표시됩니다...",
      source: "부동산114"
    },
    {
      id: 4,
      title: "전국 아파트 분양전망지수 97.0...4개월 연속 상승",
      date: "2025.07.08",
      content: "기사 내용이 여기에 표시됩니다...",
      source: "연합뉴스"
    },
    {
      id: 5,
      title: "자양4동 A구역 정비계획 결정고시...한강변 2천999세대 대단지로",
      date: "2025.07.09",
      content: "기사 내용이 여기에 표시됩니다...",
      source: "조선비즈"
    },
    {
      id: 6,
      title: "독산·시흥동 일대 대변신...13만평 주거·교통 통합정비 추진",
      date: "2025.07.09",
      content: "기사 내용이 여기에 표시됩니다...",
      source: "부동산114"
    },
  ];

  // 임시 키워드 데이터 (실제로는 뉴스 분석 결과에서 받아올 데이터)
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

  // 탭 목록
  const tabs = ["연합뉴스", "조선비즈", "부동산114"];

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출
    setTimeout(() => {
      setNewsData(mockNewsData);
      setKeywords(mockKeywords);
      setLoading(false);
    }, 1000);
  }, []);

  // 페이지 이동 (페이지네이션용) - TODO: 백엔드 연동 예정
  const goToPage = (pageNumber: number) => {
    console.log("페이지 이동:", pageNumber);
    // TODO: 백엔드 페이지네이션 API 연동 예정
  };

  // 워드클라우드 스타일(임시)
  const getWordCloudStyle = (keyword: KeywordItem, index: number) => {
    const fontSize = Math.max(12, (keyword.weight / 100) * 48);
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

  return (
    <div className="news-page">
      {/* 브레드크럼 네비게이션 */}
      <nav className="breadcrumb">
        <Link to="/">
          <FiHome className="breadcrumb-home" />
        </Link>
        <span className="breadcrumb-separator">{">"}</span>
        <span className="breadcrumb-current">부동산 뉴스</span>
      </nav>

      <div className="news-container">
        {/* 왼쪽: 뉴스 섹션 */}
        <div className="news-section">
          <div className="news-header">
            <div className="news-title-row">
              <h3>News</h3>
              <div className="tab-inline-navigation">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${activeTab === tab ? "active" : ""}`}
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
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>뉴스를 불러오는 중...</p>
              </div>
            ) : (
              <>
                {newsData.map((news) => (
                  <article key={news.id} className="news-item">
                    <div className="news-item-click-area" onClick={() => setSelectedNews(news)}>
                      <div className="news-date">{news.date}</div>
                      <h3 className="news-title">{news.title}</h3>
                    </div>
                  </article>
                ))}

                {/* 페이지네이션 UI */}
                <div className="pagination">
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className="page-button"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 오른쪽: 연관 키워드 워드클라우드 또는 뉴스 상세 */}
        <div className="keyword-section">
          <div className="keyword-card">
            {selectedNews ? (
              <div className="news-detail" ref={detailRef}>
                <h2>{selectedNews.title}</h2>
                <p className="news-date">{selectedNews.date}</p>
                <p className="news-content">{selectedNews.content}</p>
              </div>
            ) : (
              <>
                <h2 className="keyword-title">연관 키워드</h2>
                {loading ? (
                  <div className="keyword-loading">
                    <div className="spinner"></div>
                    <p>키워드 분석 중...</p>
                  </div>
                ) : (
                  <>
                    <div className="wordcloud-container">
                      {keywords.map((keyword, index) => (
                        <span
                          key={`${keyword.text}-${index}`}
                          className="keyword-item"
                          style={getWordCloudStyle(keyword, index)}
                          onClick={() => console.log(`키워드 클릭: ${keyword.text}`)}
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
                      최근 1달간 수집된 부동산 뉴스 키워드에서 추출한 주요 키워드입니다.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PG400001;
