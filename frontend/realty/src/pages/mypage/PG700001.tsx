import React, { useState, useEffect } from "react";
import { FiBarChart, FiMessageSquare, FiHeart, FiDollarSign, FiClock, FiChevronLeft } from "react-icons/fi";
import "../../styles/common/Common.css";
import PageContainer from "../../components/layout/PageContainer";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import PG700002 from "./PG700002";
import PG700003 from "./PG700003";
import PG700004 from "./PG700004";
import PG700005 from "./PG700005"; // 내 활동 내역 컴포넌트 임포트
import axios from "axios";

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 박윤성
* 작성일 : 25.09.12
* 수정일 : 25.09.22
* 파일명 : PG700001.tsx
*/

interface LoginHistory {
    loginTime: string;
}

const PG700001: React.FC = () => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isViewingLoginHistory, setIsViewingLoginHistory] = useState(false);
    const [isViewingMyActivities, setIsViewingMyActivities] = useState(false);
    const [activitySummary, setActivitySummary] = useState({ postCount: 0, commentCount: 0, likeCount: 0 });
    const [userProfile, setUserProfile] = useState({ name: '', email: '' });
    const [recentLogin, setRecentLogin] = useState<string>('');

    // 목업데이터(임시)
    const staticData = {
        totalAnalysis: 23,
        riskContracts: 7,
        riskPercentage: 30,
        expectedSavings: "1,200만원",
        avgRiskScore: 42,
        monthlyStats: [
            { month: "2025.04", count: 17 },
            { month: "2025.04", count: 12 },
            { month: "2025.05", count: 8 },
            { month: "2025.07", count: 6 },
        ],
        riskDistribution: [
            { level: "저위험 (0-30점)", percentage: 39, color: "#22c55e" },
            { level: "중위험 (31-70점)", percentage: 48, color: "#f59e0b" },
            { level: "고위험 (71-100점)", percentage: 13, color: "#ef4444" },
        ],
        recentAnalysis: [
            {
                location: "서울 강남구 대치동",
                amount: "12억 원",
                risk: "중위험",
                riskColor: "#f59e0b",
            },
            {
                location: "서울 서초구 반포동",
                amount: "15억 원",
                risk: "중위험",
                riskColor: "#f59e0b",
            },
            {
                location: "경기 성남시 분당구",
                amount: "8억 원",
                risk: "저위험",
                riskColor: "#22c55e",
            },
            {
                location: "서울 마포구 상암동",
                amount: "3억 2000만원",
                risk: "고위험",
                riskColor: "#ef4444",
            },
            {
                location: "인천 연수구 송도동",
                amount: "7억 4000만원",
                risk: "저위험",
                riskColor: "#22c55e",
            },
        ],
    };

    // 시간차 계산 함수: 얼마 전에 로그인했는지 계산
    const formatRelativeTime = (timestamp: string): string => {
        console.log("formatRelativeTime 입력값: ", timestamp)
        if (!timestamp) return "기록 없음";

        const loginTime = new Date(timestamp);
        console.log("파싱된 날짜 객체: ", loginTime);

        if (isNaN(loginTime.getTime())) {
            console.warn("잘못된 날짜 형식입니다:", timestamp);
            return "잘못된 날짜";
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - loginTime.getTime()) / 1000);

        if (diffInSeconds < 60) return "방금 전";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "어제";
        if (diffInDays < 7) return `${diffInDays}일 전`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 5) return `${diffInWeeks}주 전`;

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths}달 전`;

        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears}년 전`;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/user/me");
                if (response.data.success) {
                    setUserProfile({ // 프로필 정보란에 이름과 이메일 표시
                        name: response.data.user.name,
                        email: response.data.user.email,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        const fetchActivitySummary = async () => {
            try {
                const response = await axios.get("/api/posts/activity-summary");
                setActivitySummary(response.data);
            } catch (error) {
                console.error("Failed to fetch activity summary:", error);
            }
        };

        const fetchLoginHistory = async () => {
            try {
                const response = await axios.get<LoginHistory[]>("/api/user/login-history");
                console.log("로그인 기록 응답: ", response.data);
                if (response.data && response.data.length > 0) {
                    const latestRecord = response.data[0];
                    console.log("최근 로그인 타임스탬프: ", latestRecord.loginTime);
                    setRecentLogin(formatRelativeTime(latestRecord.loginTime));
                } else {
                    setRecentLogin('기록 없음');
                }
            } catch (error) {
                console.error("Failed to fetch login history:", error);
                setRecentLogin('오류');
            }
        };

        fetchUserData();
        fetchActivitySummary();
        fetchLoginHistory();
    }, []);

    const handleEditProfileClick = () => setIsEditingProfile(true);
    const handleViewLoginHistoryClick = () => setIsViewingLoginHistory(true);
    const handleViewMyActivitiesClick = () => setIsViewingMyActivities(true);
    const handleBackClick = () => {
        setIsEditingProfile(false);
        setIsViewingLoginHistory(false);
        setIsViewingMyActivities(false);
    };

    return (
        <PageContainer showBreadcrumb={true} centerContent={!(isEditingProfile || isViewingLoginHistory || isViewingMyActivities)}>
            <div className="mypage-container">
                {isEditingProfile || isViewingLoginHistory || isViewingMyActivities ? (
                    <div className="profile-edit-wrapper">
                        <p onClick={handleBackClick} className="backTo">
                            <FiChevronLeft />
                            뒤로가기
                        </p>
                        {isEditingProfile ? <PG700003 onBack={handleBackClick} /> : isViewingLoginHistory ? <PG700004 /> : <PG700005 />}
                    </div>
                ) : (
                    <>
                        <CommonContainerHeader
                            subtitle="마이페이지"
                            title="마이페이지"
                            description="나의 분석 기록과 통계를 확인하세요"
                        />
                        <div className="mypage-content">
                            <div className="profile-card">
                                <div>
                                    <p className="profile-name">{userProfile.name}</p>
                                    <p className="profile-email">{userProfile.email}</p>
                                </div>
                                <button className="profile-edit-btn" onClick={handleEditProfileClick}>
                                    프로필 수정
                                </button>
                            </div>

                            <div className="mypage-grid">
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon blue">
                                            <FiBarChart />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">{staticData.totalAnalysis}</div>
                                            <div className="stat-label">이 분석 횟수</div>
                                            <div className="stat-change">+3 이번 달</div>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon green">
                                            <FiDollarSign />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">{staticData.expectedSavings}</div>
                                            <div className="stat-label">예상 절약 금액</div>
                                            <div className="stat-change">위험 회피로 절약</div>
                                        </div>
                                    </div>

                                    <div className="stat-card clickable" onClick={handleViewLoginHistoryClick}>
                                        <div className="stat-icon purple">
                                            <FiClock />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">{recentLogin}</div>
                                            <div className="stat-label">최근 로그인</div>
                                        </div>
                                    </div>

                                    <div className="stat-card activity-card clickable" onClick={handleViewMyActivitiesClick}>
                                        <div className="stat-icon red">
                                            <FiMessageSquare />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">{activitySummary.postCount+activitySummary.commentCount}건</div>
                                            <div className="stat-label">내 활동</div>
                                            <div className="activity-details">
                                                <span>게시글 {activitySummary.postCount}</span>
                                                <span>댓글 {activitySummary.commentCount}</span>
                                                <span><FiHeart style={{ verticalAlign: 'middle', marginRight: '4px' }} />{activitySummary.likeCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="charts-grid">
                                    <div className="chart-card">
                                        <h3 className="chart-title">월별 분석 통계</h3>
                                        <div className="chart-subtitle">월별 분석 횟수</div>
                                        <div className="monthly-chart">
                                            {staticData.monthlyStats.map((item, index) => (
                                                <div key={index} className="chart-row">
                                                    <span className="chart-month">{item.month}</span>
                                                    <div className="chart-bar-container">
                                                        <div className="chart-bar" style={{ width: `${(item.count / 17) * 100}%` }}></div>
                                                    </div>
                                                    <span className="chart-value">{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="chart-card">
                                        <h3 className="chart-title">위험도 분포</h3>
                                        <PG700002 data={staticData.riskDistribution} />
                                    </div>
                                </div>
                            </div>

                            <div className="section-card recent-analysis-card">
                                <h3 className="card-title">최근 분석 기록</h3>
                                <div className="analysis-table">
                                    <div className="table-header">
                                        <span className="col-location">주소</span>
                                        <span className="col-amount">계약금</span>
                                        <span className="col-risk">위험도</span>
                                    </div>
                                    <div className="table-body">
                                        {staticData.recentAnalysis.map((item, index) => (
                                            <div key={index} className="table-row">
                                                <span className="col-location">{item.location}</span>
                                                <span className="col-amount">{item.amount}</span>
                                                <span className="col-risk risk-badge" style={{ color: item.riskColor }}>
                                                    {item.risk}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default PG700001;
