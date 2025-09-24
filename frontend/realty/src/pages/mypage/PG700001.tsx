import React, { useState, useEffect } from "react";
import {
    FiBarChart,
    FiMessageSquare,
    FiHeart,
    FiDollarSign,
    FiClock,
    FiChevronLeft,
} from "react-icons/fi";
import "../../styles/common/common.css";
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

interface RecentAnalysis {
    location: string;
    deposit: number;
    risk: string;
}

interface RiskDistribution {
    level: string;
    percentage: number;
}

const PG700001: React.FC = () => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isViewingLoginHistory, setIsViewingLoginHistory] = useState(false);
    const [isViewingMyActivities, setIsViewingMyActivities] = useState(false);
    const [activitySummary, setActivitySummary] = useState({
        postCount: 0,
        commentCount: 0,
        likeCount: 0,
    });
    const [userProfile, setUserProfile] = useState({ name: "", email: "" });
    const [recentLogin, setRecentLogin] = useState<string>("");
    const [analysisCount, setAnalysisCount] = useState(0); // 분석 횟수 상태
    const [recentAnalysis, setRecentAnalysis] = useState<RecentAnalysis[]>([]); // 최근 분석 기록 상태
    const [riskDistribution, setRiskDistribution] = useState<
        { level: string; percentage: number; color: string }[]
    >([]);

    // 목업데이터(임시)
    const staticData = {
        expectedSavings: "1,200만원",
        monthlyStats: [
            { month: "1월", count: 10 },
            { month: "2월", count: 12 },
            { month: "3월", count: 8 },
            { month: "4월", count: 15 },
            { month: "5월", count: 17 },
        ],
    };

    // 시간차 계산 함수: 얼마 전에 로그인했는지 계산
    const formatRelativeTime = (timestamp: string): string => {
        console.log("formatRelativeTime 입력값: ", timestamp);
        if (!timestamp) return "기록 없음";

        const loginTime = new Date(timestamp);
        console.log("파싱된 날짜 객체: ", loginTime);

        if (isNaN(loginTime.getTime())) {
            console.warn("잘못된 날짜 형식입니다:", timestamp);
            return "잘못된 날짜";
        }

        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - loginTime.getTime()) / 1000
        );
        console.log("로그인 시간과 현재 시간 차이 (초 단위): ", diffInSeconds);

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
                console.log("유저 데이터 응답: ", response.data);
                if (response.data.success) {
                    setUserProfile({
                        // 프로필 정보란에 이름과 이메일 표시
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
                console.log("활동 요약 응답: ", response.data);
                setActivitySummary(response.data);
            } catch (error) {
                console.error("Failed to fetch activity summary:", error);
            }
        };

        const fetchLoginHistory = async () => {
            try {
                const response = await axios.get<LoginHistory[]>(
                    "/api/user/login-history"
                );
                console.log("로그인 기록 응답: ", response.data);
                if (response.data && response.data.length > 0) {
                    const latestRecord = response.data[0];
                    console.log(
                        "최근 로그인 타임스탬프: ",
                        latestRecord.loginTime
                    );
                    setRecentLogin(formatRelativeTime(latestRecord.loginTime));
                } else {
                    setRecentLogin("기록 없음");
                }
            } catch (error) {
                console.error("Failed to fetch login history:", error);
                setRecentLogin("오류");
            }
        };

        const fetchAnalysisCount = async () => {
            try {
                // 현재 로그인한 사용자의 분석 횟수를 가져오는 API 호출
                const response = await axios.get("/api/analysis/count");
                console.log("분석 횟수 응답: ", response.data);
                setAnalysisCount(response.data);
            } catch (error) {
                console.error("Failed to fetch analysis count:", error);
            }
        };

        const fetchRecentAnalysis = async () => {
            try {
                const response = await axios.get<RecentAnalysis[]>(
                    "/api/analysis/recent"
                );
                console.log("최근 분석 기록 응답: ", response.data);
                setRecentAnalysis(response.data);
            } catch (error) {
                console.error("Failed to fetch recent analysis:", error);
                setRecentAnalysis([]); // 오류 발생 시 빈 배열로 설정
            }
        };

        const fetchRiskDistribution = async () => {
            try {
                const response = await axios.get<RiskDistribution[]>(
                    "/api/analysis/risk-distribution"
                );
                console.log("위험도 분포 응답: ", response.data);

                const getRiskColor = (level: string) => {
                    switch (level.toLowerCase()) {
                        case "고위험":
                        case "치명":
                            return "#ef4444"; // red
                        case "중위험":
                        case "경고":
                        case "medium":
                            return "#f59e0b"; // yellow
                        case "저위험":
                        case "정상":
                        case "unknown":
                            return "#9ca3af"; // gray
                        default:
                            return "#22c55e"; // green
                    }
                };

                const chartData = response.data.map((item) => ({
                    level: item.level,
                    percentage: item.percentage,
                    color: getRiskColor(item.level),
                }));

                setRiskDistribution(chartData);
            } catch (error) {
                console.error("Failed to fetch risk distribution:", error);
                setRiskDistribution([]);
            }
        };

        fetchUserData();
        fetchActivitySummary();
        fetchLoginHistory();
        fetchAnalysisCount();
        fetchRecentAnalysis();
        fetchRiskDistribution();
    }, []);

    const handleEditProfileClick = () => {
        console.log("프로필 수정 클릭");
        setIsEditingProfile(true);
    };
    const handleViewLoginHistoryClick = () => {
        console.log("로그인 기록 보기 클릭");
        setIsViewingLoginHistory(true);
    };
    const handleViewMyActivitiesClick = () => {
        console.log("내 활동 보기 클릭");
        setIsViewingMyActivities(true);
    };
    const handleBackClick = () => {
        console.log("뒤로 가기 클릭");
        setIsEditingProfile(false);
        setIsViewingLoginHistory(false);
        setIsViewingMyActivities(false);
    };

    // 위험도에 따른 색상 반환 함수
    const getRiskColor = (risk: string) => {
        console.log(`위험도: ${risk}`);
        switch (risk.toLowerCase()) {
            case "고위험":
            case "치명":
            case "high":
            case "critical":
                return "#ef4444"; // red
            case "중위험":
            case "경고":
            case "medium":
            case "warning":
                return "#f59e0b"; // yellow
            case "unknown":
                return "#9ca3af"; // gray
            case "저위험":
            case "low":
                return "#22c55e"; // green
            default:
                return "#9ca3af"; // gray
        }
    };

    return (
        <PageContainer showBreadcrumb={true} centerContent={true}>
            <div className="mypage-container">
                {isEditingProfile ||
                isViewingLoginHistory ||
                isViewingMyActivities ? (
                    <div className="profile-edit-wrapper">
                        <p onClick={handleBackClick} className="backTo">
                            <FiChevronLeft />
                            뒤로가기
                        </p>
                        {isEditingProfile ? (
                            <PG700003 onBack={handleBackClick} />
                        ) : isViewingLoginHistory ? (
                            <PG700004 />
                        ) : (
                            <PG700005 />
                        )}
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
                                    <p className="profile-name">
                                        {userProfile.name}
                                    </p>
                                    <p className="profile-email">
                                        {userProfile.email}
                                    </p>
                                </div>
                                <button
                                    className="profile-edit-btn"
                                    onClick={handleEditProfileClick}
                                >
                                    프로필 수정
                                </button>
                            </div>

                            {/* 마이페이지 그리드 */}
                            <div className="mypage-grid">
                                {/* 차트 그리드 */}
                                <div className="charts-grid">
                                    <div className="chart-card">
                                        <h3 className="chart-title">
                                            위험도 분포
                                        </h3>
                                        {riskDistribution.length > 0 ? (
                                            <PG700002 data={riskDistribution} />
                                        ) : (
                                            <div className="empty-message">
                                                분석 기록이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* 통계 그리드 */}
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon blue">
                                            <FiBarChart />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">
                                                {analysisCount}건
                                            </div>
                                            <div className="stat-label">
                                                분석 횟수
                                            </div>
                                        </div>
                                    </div>
                                    {/* 로그인 이력 그리드 */}
                                    <div
                                        className="stat-card clickable"
                                        onClick={handleViewLoginHistoryClick}
                                    >
                                        <div className="stat-icon yellow">
                                            <FiClock />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">
                                                {recentLogin}
                                            </div>
                                            <div className="stat-label">
                                                최근 로그인
                                            </div>
                                        </div>
                                    </div>
                                    {/* 활동 그리드 */}
                                    <div
                                        className="stat-card activity-card clickable"
                                        onClick={handleViewMyActivitiesClick}
                                    >
                                        <div className="stat-icon red">
                                            <FiMessageSquare />
                                        </div>
                                        <div className="stat-content">
                                            <div className="stat-number">
                                                {activitySummary.postCount +
                                                    activitySummary.commentCount}
                                                건
                                            </div>
                                            <div className="stat-label">
                                                내 활동
                                            </div>
                                            <div className="activity-details">
                                                <span>
                                                    게시글{" "}
                                                    {activitySummary.postCount}
                                                </span>
                                                <span>
                                                    댓글{" "}
                                                    {
                                                        activitySummary.commentCount
                                                    }
                                                </span>
                                                <span>
                                                    <FiHeart
                                                        style={{
                                                            verticalAlign:
                                                                "middle",
                                                            marginRight: "4px",
                                                        }}
                                                    />
                                                    {activitySummary.likeCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 최근 분석 기록 그리드 */}
                            <div className="section-card recent-analysis-card">
                                <h3 className="card-title">최근 분석 기록</h3>
                                <div className="analysis-table">
                                    <div className="table-header">
                                        <span className="col-location">
                                            주소
                                        </span>
                                        <span className="col-amount">
                                            계약금
                                        </span>
                                        <span className="col-risk">위험도</span>
                                    </div>
                                    <div className="table-body">
                                        {recentAnalysis.length > 0 ? (
                                            recentAnalysis.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="table-row"
                                                    >
                                                        <span className="col-location">
                                                            {item.location}
                                                        </span>
                                                        <span className="col-amount">
                                                            ₩
                                                            {item.deposit.toLocaleString()}
                                                        </span>
                                                        <span
                                                            className="col-risk risk-badge"
                                                            style={{
                                                                color: getRiskColor(
                                                                    item.risk
                                                                ),
                                                            }}
                                                        >
                                                            {item.risk}
                                                        </span>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="empty-message">
                                                최근 분석 기록이 없습니다.
                                            </div>
                                        )}
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
