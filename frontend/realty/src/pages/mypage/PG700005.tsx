import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/common/common.css";

/*
* 수업명 : 가비아 2회차
* 이름 : 박윤성
* 작성자 : 박윤성
* 수정자 :
* 작성일 : 25.09.22
* 수정일 : 
* 파일명 : PG700005.tsx
*/

// PostListResponseDTO에서 가져온 데이터를 인터페이스로 정의
interface MyPost {
    id: number;
    title: string;
    createdAt: string; 
    likes: number;
    comments: number;
}

// MyCommentResponseDTO에서 가져온 데이터를 인터페이스로 정의
interface MyComment {
    id: number;
    content: string;
    createdAt: string;
    postTitle: string;
    postId: number;
}

// MyLikedPostResponseDTO에서 가져온 데이터를 인터페이스로 정의
interface MyLikedPost {
    id: number;
    title: string;
    author: string;
    createdAt: string;
    likes: number;
    comments: number;
}

const PG700005: React.FC = () => {
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [myComments, setMyComments] = useState<MyComment[]>([]);
    const [myLikedPosts, setMyLikedPosts] = useState<MyLikedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'likedPosts'>('posts');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            console.log("activeTab 상태: ", activeTab);

            try {
                {/* 탭별 데이터 가져오기 */}
                {/* 작성한 글 */}
                if (activeTab === 'posts') {
                    const response = await axios.get("/api/posts/my-posts"); // BoardController
                    console.log("작성한 글 응답: ", response.data);
                    setMyPosts(response.data);
                {/* 작성한 댓글 */}
                } else if (activeTab === 'comments') {
                    const response = await axios.get("/api/posts/my-comments"); // BoardController
                    console.log("작성한 댓글 응답: ", response.data);
                    setMyComments(response.data);
                {/* 좋아요한 글 */}
                } else if (activeTab === 'likedPosts') {
                    const response = await axios.get("/api/posts/my-likes"); // BoardController
                    console.log("좋아요한 게시글 응답: ", response.data);
                    setMyLikedPosts(response.data);
                }
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || "데이터를 불러오는 데 실패했습니다.");
                } else {
                    setError("데이터를 불러오는 중 알 수 없는 오류가 발생했습니다.");
                }
                console.error(`Failed to fetch my ${activeTab}:`, err);
            } finally {
                setIsLoading(false);
                console.log("작성한 글/댓글/좋아요한 글 로딩 완료");
            }
        };

        fetchData();
    }, [activeTab]);

    {/* 날짜 포맷팅 */}
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const normalized = dateString.replace(/\./g, '-');
            const date = new Date(normalized);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('ko-KR');
        } catch {
            return 'Invalid Date';
        }
    };

    {/* 탭별 내용 렌더링 */}
    const renderContent = () => {
        if (isLoading) return <div className="loading-message">로딩 중...</div>;
        if (error) return <div className="error-message">{error}</div>;

        {/* 작성한 글 */}
        if (activeTab === 'posts') {
            if (myPosts.length === 0) {
                return <div className="empty-message">작성한 게시글이 없습니다.</div>;
            }
            return (
                <div className="activity-list posts-list">
                    <div className="activity-list-header">
                        <span className="mypage-post-title">제목</span>
                        <span className="post-comments">댓글</span>
                        <span className="post-date">작성일</span>
                    </div>
                    {myPosts.map(post => (
                        <div key={post.id} className="activity-list-item">
                            <span className="mypage-post-title">
                                <a href={`/PG500001/PG500041/PG500042/${post.id}`}>{post.title}</a>
                            </span>
                            <span className="post-comments">{post.comments}개</span>
                            <span className="post-date">{formatDate(post.createdAt)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        {/* 작성한 댓글 */}
        if (activeTab === 'comments') {
            if (myComments.length === 0) {
                return <div className="empty-message">작성한 댓글이 없습니다.</div>;
            }
            return (
                <div className="activity-list comments-list">
                    <div className="activity-list-header">
                        <span className="comment-content">댓글 내용</span>
                        <span className="comment-post-title">원문</span>
                        <span className="comment-date">작성일</span>
                    </div>
                    {myComments.map(comment => (
                        <div key={comment.id} className="activity-list-item">
                            <span className="comment-content">{comment.content}</span>
                            <span className="comment-post-title">
                                <a href={`/PG500001/PG500041/PG500042/${comment.postId}`}>{comment.postTitle}</a>
                            </span>
                            <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        {/* 좋아요한 게시글 */}
        if (activeTab === 'likedPosts') {
            if (myLikedPosts.length === 0) {
                return <div className="empty-message">좋아요한 게시글이 없습니다.</div>;
            }
            return (
                <div className="activity-list liked-posts-list">
                    <div className="activity-list-header">
                        <span className="mypage-post-title">제목</span>
                        <span className="post-author">작성자</span>
                        <span className="post-likes">좋아요</span>
                        <span className="post-date">작성일</span>
                    </div>
                    {myLikedPosts.map(post => (
                        <div key={post.id} className="activity-list-item">
                            <span className="mypage-post-title">
                                <a href={`/PG500001/PG500041/PG500042/${post.id}`}>{post.title}</a>
                            </span>
                            <span className="post-author">{post.author}</span>
                            <span className="post-likes">{post.likes}</span>
                            <span className="post-date">{formatDate(post.createdAt)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="my-activity-container">
            <h2 className="page-authwelcome">내 활동 내역</h2>
            <div className="activity-tabs">
                <button
                    className={`activity-tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    작성한 글
                </button>
                <button
                    className={`activity-tab ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    작성한 댓글
                </button>
                <button
                    className={`activity-tab ${activeTab === 'likedPosts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('likedPosts')}
                >
                    좋아요한 글
                </button>
            </div>
            <div className="activity-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default PG700005;
