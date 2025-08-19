// src/pages/community/board/PG500042.tsx

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";

/**
 * @file PG500041.tsx
 * @description 자유게시판 상세 페이지입니다
 *
 */

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 
 * 작성일 : 25.08.19
 * 파일명 : PG500042.tsx
 */

interface PostDetail {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  views: number;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
}

// Mock 데이터
const MOCK_POST: PostDetail = {
  id: "post-1",
  title: "전세 계약 시 주의사항 공유",
  author: "김부동산",
  date: "2025.08.15",
  content: `안녕하세요. 최근 전세 계약을 진행하면서 겪은 경험을 공유하고자 합니다.

특히 등기부등본 확인이 정말 중요하다는 것을 느꼈습니다. 처음에는 단순히 소유권만 확인하면 되는 줄 알았는데, 근저당권 설정 현황과 선순위 채권 등을 꼼꼼히 살펴봐야 한다는 것을 알게 되었습니다.

RiskView 서비스를 이용해서 계약서를 분석해봤는데, 정말 도움이 많이 되었습니다. 특히 특약 조항에서 놓칠 뻔한 위험 요소들을 AI가 찾아주더라고요.`,
  views: 1247,
  likes: 23,
  comments: [
    {
      id: "comment-1",
      author: "부동산전문가",
      date: "2025.08.15",
      content:
        "좋은 정보 감사합니다! 저도 비슷한 경험이 있어서 공감이 많이 되네요.",
    },
    {
      id: "comment-2",
      author: "신입부동산",
      date: "2025.08.16",
      content:
        "RisView 서비스 정말 유용하더라고요. 저도 한 번 사용해봐야겠습니다!",
    },
    {
      id: "comment-3",
      author: "계약고수",
      date: "2025.08.16",
      content:
        "등기부등본 확인은 정말 중요하죠. 특히 선순위 근저당권은 꼭 체크해야 합니다!",
    },
  ],
};

const PG500042: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [newComment, setNewComment] = useState<string>("");
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // 좋아요 처리 로직
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      console.log("댓글 작성:", newComment);
      setNewComment("");
      // 댓글 추가 로직
    }
  };

  return (
    <PageContainer showBreadcrumb={true} centerContent={true}>
      <div className="post-detail">
        {/* 게시물 상세 */}
        <header className="post-header">
          <h1 className="post-title">{MOCK_POST.title}</h1>
          <div className="post-meta">
            <span className="post-author">작성자: {MOCK_POST.author}</span>
            <span className="post-date">{MOCK_POST.date}</span>
          </div>
          <hr className="post-divider" />
        </header>

        <div className="post-content">
          {MOCK_POST.content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <hr className="post-divider" />

        <div className="post-actions">
          <button
            className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            👍 좋아요 {MOCK_POST.likes + (isLiked ? 1 : 0)}
          </button>
          <div className="post-stats">
            <span>조회 {MOCK_POST.views.toLocaleString()}</span>
          </div>
        </div>

        {/* AI 감성분석 섹션 */}
        <section className="ai-analysis">
          <h3 className="analysis-title">AI 감성분석</h3>
          <div className="analysis-content">
            <div className="emotion-badges">
              <div className="score-item sentiment-score">
                <div className="sentiment-label">
                  <span className="sentiment-emoji">😊</span>
                  <span className="sentiment-text">긍정적 정보 공유</span>
                </div>
                <div className="sentiment-bar-wrapper">
                  <span className="sentiment-score-label">감정 점수:</span>
                  <div className="sentiment-bar-bg">
                    <div
                      className="sentiment-bar-fill"
                      style={{ width: "82%" }}
                    />
                  </div>
                  <span className="sentiment-score-number">82/100</span>
                </div>
              </div>
              <hr className="emotion-divider" />
              <span className="emotion-badge neutral">🤖 AI 분석 결과</span>
            </div>

            <p className="analysis-text">
              이 게시글은 실제 경험을 바탕으로 한 유용한 정보를 담고 있습니다.
              특히 전세 계약 시 주의사항과 RiskView 서비스 사용 후기가 다른
              사용자들에게 큰 도움이 될 것으로 분석됩니다. 긍적적이고 건설적인
              내용으로 커뮤니티에 가치를 더하는 게시글입니다.
            </p>

            <div className="analysis-scores">
              <div className="score-item">
                <span className="score-label">정보 가치</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: "82%" }}></div>
                </div>
                <span className="score-number">82/100</span>
              </div>

              <div className="score-item">
                <span className="score-label">특히 만족</span>
                <div className="score-bar">
                  <div
                    className="score-fill positive"
                    style={{ width: "78%" }}
                  ></div>
                </div>
                <span className="score-number">매우 정확한</span>
              </div>

              <div className="score-item">
                <span className="score-label">유용도</span>
                <div className="score-bar">
                  <div
                    className="score-fill excellent"
                    style={{ width: "91%" }}
                  ></div>
                </div>
                <span className="score-number">구체 유용</span>
              </div>
            </div>

            <hr className="emotion-divider" />
            <div className="analysis-footer">
              <small>
                🔎 분석 기준: 키워드 감정 분석, 정보 유용성, 커뮤니티 기여도
              </small>
              <span className="analysis-timestamp">
                🕐 분석 시간: 2025.08.15 오후 17:39:48
              </span>
            </div>
          </div>
        </section>

        {/* 댓글 섹션 */}
        <section className="comments-section">
          <h3 className="comments-title">댓글 {MOCK_POST.comments.length}</h3>

          <div className="comments-list">
            {MOCK_POST.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-author">{comment.author}</div>
                <div className="comment-date">{comment.date}</div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>

          <div className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="comment-input"
              rows={4}
            />
            <button
              onClick={handleCommentSubmit}
              className="comment-submit-btn"
            >
              댓글 작성
            </button>
          </div>
        </section>

        {/* 하단 네비게이션 */}
        <div className="post-navigation">
          <Link to="/PG500001/PG500041" className="nav-btn back-btn">
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default PG500042;
