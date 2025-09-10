import React, { useState, useEffect, useRef } from "react";
import "../../styles/common/common.css";
import PageContainer from "../../components/layout/PageContainer";
// import wordCloudMask from "./word_cloud_mask_image.jpeg"; // @visx/wordcloud는 이미지 마스크를 직접 지원하지 않습니다.

/*
 * 생성자 : 이주하
 * 생성일 : 25.08.01
 * 파일명 : PG400001.tsx
 * 수정자 : 박윤성
 * 수정일 : 25.09.08
 * 설명 : 뉴스 페이지 컴포넌트
 */

// 뉴스 데이터 타입
interface NewsItem {
  articleId: number;
  title: string; // 뉴스 제목
  publishedAt: string; // 날짜 필드
  content?: string; // 내용(선택적 속성)
  url?: string; // URL(선택적 속성)
  siteName?: string; // 사이트명(선택적 속성)
}

// 페이지네이션 정보 타입
interface PaginationInfo {
  totalPages: number; // 총 페이지 수
  currentPage: number; // 현재 페이지
  startPage: number; // 시작 페이지
  endPage: number; // 끝 페이지
  hasPrevBlock: boolean; // 이전 블록 존재 여부
  hasNextBlock: boolean; // 다음 블록 존재 여부
  prevBlockStartPage?: number; // 이전 블록의 시작 페이지(선택적 속성)
  nextBlockStartPage?: number; // 다음 블록의 시작 페이지(선택적 속성)
}

// 감성 분석 데이터 타입
interface SentimentAnalysis {
  score: number; // 감성 점수 (0-100)
  type: "positive" | "negative" | "neutral"; // 감성 유형
  confidence: number; // 신뢰도 (0-100)
  keywords: string[]; // 핵심 키워드
  marketImpact: "bullish" | "bearish" | "neutral"; // 시장 영향도
  analysisTime: string; // 분석 시간
}

// 뉴스 페이지 컴포넌트
const PG400001: React.FC = () => {
  // 선택된 뉴스 출처 상태 ('전체'를 기본값으로 설정)
  const [selectedSource, setSelectedSource] = useState<string>("전체");
  // 뉴스 목록 상태
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  // 워드클라우드 이미지 URL 상태
  const [wordCloudImage, setWordCloudImage] = useState<string | null>(null);
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);
  // 키워드 로딩 상태 추가
  const [keywordLoading, setKeywordLoading] = useState<boolean>(true);
  // 선택된 뉴스 상태
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  // 감성 분석 결과 상태
  const [sentimentAnalysis, setSentimentAnalysis] =
    useState<SentimentAnalysis | null>(null);
  // 감성 분석 로딩 상태
  const [sentimentLoading, setSentimentLoading] = useState<boolean>(false);
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

  // 감성 분석 API 호출 함수
  const fetchSentimentAnalysis = async (newsId: number) => {
    setSentimentLoading(true);
    try {
      // API 호출 (실제 API 엔드포인트로 변경 필요)
      const response = await fetch(`/api/sentiment/analyze/${newsId}`);
      if (!response.ok) {
        throw new Error("감성 분석 API 호출 실패");
      }
      const data = await response.json();
      setSentimentAnalysis(data);
    } catch (error) {
      console.error("감성 분석 오류:", error);
      // 임시 더미 데이터 (실제 환경에서는 제거)
      setSentimentAnalysis({
        score: 72,
        type: "negative",
        confidence: 85,
        keywords: ["위험 요가", "신용 붕괴", "신중 접근"],
        marketImpact: "bearish",
        analysisTime: "2025.08.15 오후 17:39:48",
      });
    } finally {
      setSentimentLoading(false);
    }
  };

  // 뉴스 선택 시 감성 분석 실행
  const handleNewsSelect = (news: NewsItem) => {
    setSelectedNews(news);
    setSentimentAnalysis(null);
    fetchSentimentAnalysis(news.articleId);
  };

  // 감성 분석 결과 렌더링 함수
  const renderSentimentAnalysis = () => {
    if (!sentimentAnalysis) return null;

    const getSentimentColor = () => {
      switch (sentimentAnalysis.type) {
        case "positive":
          return "#4CAF50";
        case "negative":
          return "#f44336";
        default:
          return "#FF9800";
      }
    };

    const getSentimentText = () => {
      switch (sentimentAnalysis.type) {
        case "positive":
          return "긍정적 시장 선호";
        case "negative":
          return "부정적 시장 선호";
        default:
          return "중립적";
      }
    };

    return (
      <div className="sentiment-analysis">
        {/* 배너(임시) */}
        <div className="rv05-banner">
          <div>
            <div className="rv05-banner-title"></div>
            <div className="rv05-banner-sub">
              AI 감성분석은 아직 개발 단계입니다.
            </div>
          </div>
          <div className="rv05-badge warn">준비중</div>
        </div>
        
        <div className="sentiment-header">
          <h3>🤖 AI 감성 분석</h3>
        </div>

        <div className="sentiment-alert">
          <div className="sentiment-alert-header">
            <span className="alert-icon">😰</span>
            <span className="alert-title">{getSentimentText()}</span>
            <div className="sentiment-score-container">
              <span className="score-label">감성 점수:</span>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${sentimentAnalysis.score}%`,
                    backgroundColor: getSentimentColor(),
                  }}
                ></div>
              </div>
              <span className="score-value">{sentimentAnalysis.score}/100</span>
            </div>
          </div>

          <div className="sentiment-description">
            <h4>🧠 AI 분석 결과</h4>
            <p>
              전세가율 상승과 전세사기 증가로 인해 시장 불안감이 높아지고
              있습니다. 임차인들의 위험 부담이 증가하고 있어 신중한 접근이
              필요한 상황입니다.
            </p>
          </div>

          <div className="sentiment-keywords">
            <span className="keywords-label">핵심 키워드:</span>
            {sentimentAnalysis.keywords.map((keyword) => (
              <span key={keyword} className="keyword-tag">
                {keyword}
              </span>
            ))}
          </div>

          <div className="analysis-time">
            <span className="time-icon">🕒</span>
            <span>분석 시간: {sentimentAnalysis.analysisTime}</span>
          </div>
        </div>

        <div className="market-indicators">
          <div className="indicator-item">
            <div className="indicator-icon">📈</div>
            <div className="indicator-text">
              <div className="indicator-title">시장 영향도</div>
              <div className="indicator-value" style={{ color: "#4CAF50" }}>
                보통
              </div>
            </div>
          </div>

          <div className="indicator-item">
            <div className="indicator-icon">😟</div>
            <div className="indicator-text">
              <div className="indicator-title">시장 영향도</div>
              <div className="indicator-value" style={{ color: "#f44336" }}>
                우려
              </div>
            </div>
          </div>

          <div className="indicator-item">
            <div className="indicator-icon">🔴</div>
            <div className="indicator-text">
              <div className="indicator-title">거래 신호</div>
              <div className="indicator-value" style={{ color: "#f44336" }}>
                신중 접근
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        setSentimentAnalysis(null);
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

  // 뉴스 데이터 가져오기
  const fetchNewsData = async (pageNum: number, source: string) => {
    // 데이터를 불러오기 시작했으므로 로딩 상태를 true로 설정
    setLoading(true);

    // '전체'가 아닐 경우에만 source 파라미터를 추가
    const sourceParam = source !== "전체" ? `&source=${encodeURIComponent(source)}` : "";
    const apiUrl = `/api/board/news_articles?pageNum=${pageNum}&size=6${sourceParam}`;

    // 지정된 주소로 API 호출 보냄
    fetch(apiUrl)
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
        const formattedNews: NewsItem[] = data.content.map((item: any) => ({
          articleId: item.articleId,
          title: item.title,
          publishedAt: item.publishedAt, // API 응답 필드명 확인
          content: item.content,
          siteName: item.siteName,
        }));
        setNewsData(formattedNews);
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
        // 로딩 상태 false로 설정
      })
      .catch((error) => {
        console.error("뉴스 데이터 로딩 오류:", error);
        // 뉴스 데이터를 빈 배열로 설정
        setNewsData([]);
      })
      .finally(() => {
        // 뉴스 로딩이 끝나면 로딩 상태 false로 설정
        setLoading(false);
      });
  };

  // 워드클라우드 키워드 데이터 가져오기
  const fetchKeywords = async () => {
    setKeywordLoading(true); // 키워드 로딩 시작
    setWordCloudImage(null); // 기존 이미지 제거
    try {
      const response = await fetch("/api/board/news_articles/keywords");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답을 Blob으로 변환
      const imageBlob = await response.blob();
      // Blob을 가리키는 URL 생성
      const imageUrl = URL.createObjectURL(imageBlob);
      setWordCloudImage(imageUrl);

    } catch (error) {
      console.error("키워드 데이터 로딩 오류:", error);
      setWordCloudImage(null); // 오류 발생 시 이미지 없음
    } finally {
        setKeywordLoading(false); // 키워드 로딩 완료
    }
  };

  // 컴포넌트가 처음 마운트될 때만 워드클라우드 키워드 데이터를 호출합니다.
  useEffect(() => {
    fetchKeywords();
  }, []);

  // selectedSource가 변경될 때 뉴스 데이터를 호출합니다.
  useEffect(() => {
    // 선택된 소스로 뉴스 데이터의 첫 페이지를 불러옴
    fetchNewsData(1, selectedSource);
  }, [selectedSource]);

  // 탭 목록 데이터
  const tabs = ["전체", "코알라 뉴스", "비버 하우스", "수달 빌리지"];

  // 페이지네이션 클릭 핸들러
  const goToPage = (pageNumber: number) => {
    // 페이지 번호가 1개 이상이고 총 페이지 수보다 작거나 같으면
    if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
      // 뉴스 페이지네이션 API 호출하여 해당되는 페이지로 이동
      fetchNewsData(pageNumber, selectedSource);
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
                    className={`tab-button ${selectedSource === tab ? "active" : ""}`}
                    onClick={() => setSelectedSource(tab)}
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
              <div>
                {/* 뉴스 기사 목록 렌더링 */}
                {newsData.map((news) => (
                  <article key={news.articleId} className="news-item">
                    {/* 클릭 시 상세 보기 */}
                    <div
                      className="news-item-click-area"
                      onClick={() => handleNewsSelect(news)}
                    >
                      <div className="news-meta">
                        <span className="news-date">{news.publishedAt.split(' ')[0]}</span>
                        {news.siteName && <span className="news-source">{news.siteName}</span>}
                      </div>
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
              </div>
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
                <p className="news-publishedAt">{selectedNews.publishedAt}</p>
                <p className="news-siteName">{selectedNews.siteName}</p>
                <p className="news-content">{selectedNews.content}</p>

                <hr className="Ai-divider" />

                {/* AI 감성 분석 결과 */}
                {sentimentLoading ? (
                  <div className="sentiment-loading">
                    <div className="spinner"></div>
                    <p>AI가 감성을 분석하는 중...</p>
                  </div>
                ) : (
                  renderSentimentAnalysis()
                )}
              </div>
            ) : (
                // 없으면 워드클라우드 표시
              <>
                <h2 className="keyword-title">연관 키워드</h2>
                {/* 로딩 중 로딩 스피너 표시 */}
                {keywordLoading ? (
                  <div className="keyword-loading">
                    <div className="spinner"></div>
                    <p>키워드 분석 중...</p>
                  </div>
                ) : (
                  <>
                    {wordCloudImage ? (
                      <img src={wordCloudImage} alt="연관 키워드 워드클라우드" style={{ width: '100%', height: 'auto' }} />
                    ) : (
                      <p>워드클라우드를 표시할 수 없습니다.</p>
                    )}
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
