import React from "react";
import { FiBarChart, FiAlertTriangle, FiDollarSign, FiZap } from "react-icons/fi";
import "../../styles/common/Common.css";
import PageContainer from "../../components/layout/PageContainer";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import PG700002 from "./PG700002";

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.09.11
* 파일명 : PG700001.tsx
*/

/**
 * PG700001 - 마이페이지 화면
 *
 * 사용자 개인의 분석 기록 및 통계 데이터를 보여주는 컴포넌트
 * 
 * - 닉네임, 이메일 등의 프로필 정보 표시
 * - 총 분석 횟수, 위험 계약 수, 예상 절약 금액, 평균 위험도 등의 통계 카드 출력
 * - 월별 분석 횟수와 위험도 분포를 그래프로 시각화
 * - 최근 분석된 계약 내역을 표 형식으로 제공
 *
 * @component
 * @returns {JSX.Element} 마이페이지 화면 JSX
 */

const PG700001: React.FC = () => {
    const userData = {
        nickname: "루미님", // 사용자 닉네임 
        email: "homeprotector", // 사용자 이메일 (localStorage에서 가져옴)
        totalAnalysis: 23, // 총 분석 횟수
        riskContracts: 7, // 위험 계약 건수
        riskPercentage: 30, // 위험 계약 비율 (%)
        expectedSavings: "1,200만원", // 예측 절감액
        avgRiskScore: 42, // 평균 위험도 점수
        monthlyStats: [
            { month: "2025.04", count: 17 }, // 월별 분석 횟수
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
                location: "서울 강남구 대치동", // 분석 대상 주소
                amount: "12억 원", // 계약 금액
                risk: "중위험", // 위험도 분류
                riskColor: "#f59e0b", // 위험도에 따른 색상
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

    return (
        <>
        {/* 마이페이지 전체 페이지 레이아웃 래퍼 */}
        <PageContainer showBreadcrumb={true} centerContent={true}>

            {/* 페이지 내부 컨텐츠 */}
            <div className="mypage-container">

            {/* 상단 제목 영역 */}
            <CommonContainerHeader
                subtitle="마이페이지"
                title="마이페이지"
                description="나의 분석 기록과 통계를 확인하세요"
            />

            <div className="mypage-content">

              {/* ─── 프로필 카드 ─────────────────────────────── */}
                <div className="profile-card">
                <div>
                  <p className="profile-name">{userData.nickname}</p> {/* 사용자 닉네임 */}
                  <p className="profile-email">{userData.email}</p>   {/* 사용자 이메일 */}
                </div>
                <button className="profile-edit-btn">프로필 수정</button>
                </div>

              {/* ─── 통계 및 차트 영역 ───────────────────── */}
                <div className="mypage-grid">

                {/* 통계 카드들 */}
                <div className="stats-grid">
                  {/* 각각의 카드마다 대표 아이콘, 수치, 설명 포함 */}
                    <div className="stat-card">
                        <div className="stat-icon blue">
                        <FiBarChart />
                        </div>
                        <div className="stat-content">
                        <div className="stat-number">{userData.totalAnalysis}</div>
                        <div className="stat-label">이 분석 횟수</div>
                        <div className="stat-change">+3 이번 달</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon red">
                        <FiAlertTriangle />
                        </div>
                        <div className="stat-content">
                        <div className="stat-number">{userData.riskContracts}</div>
                        <div className="stat-label">위험 계약 탐지</div>
                        <div className="stat-change">
                            {userData.riskPercentage}% 위험도
                        </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                        <FiDollarSign />
                        </div>
                        <div className="stat-content">
                        <div className="stat-number">{userData.expectedSavings}</div>
                        <div className="stat-label">예상 절약 금액</div>
                        <div className="stat-change">위험 회피로 절약</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon yellow">
                        <FiZap />
                        </div>
                        <div className="stat-content">
                        <div className="stat-number">{userData.avgRiskScore}점</div>
                        <div className="stat-label">평균 위험도</div>
                        <div className="stat-change">3.2 감소</div>
                        </div>
                    </div>
                </div>

                {/* 차트 카드들 */}
                <div className="charts-grid">
                  {/* 월별 분석 통계 차트 */}
                    <div className="chart-card">
                        <h3 className="chart-title">월별 분석 통계</h3>
                        <div className="chart-subtitle">월별 분석 횟수</div>

                        <div className="monthly-chart">
                        {userData.monthlyStats.map((item, index) => (
                            <div key={index} className="chart-row">
                            <span className="chart-month">{item.month}</span>
                            <div className="chart-bar-container">
                                <div
                                className="chart-bar"
                                style={{ width: `${(item.count / 17) * 100}%` }}
                                ></div>
                            </div>
                            <span className="chart-value">{item.count}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                  {/* 위험도 분포 도넛 차트 */}
                    <div className="chart-card">
                        <h3 className="chart-title">위험도 분포</h3>

                        {/* 기존 위험도 분포를 도넛 차트로 교체 */}
                        <PG700002 data={userData.riskDistribution} />
                    </div>
                    </div>
                </div>

              {/* ─── 최근 분석 기록 섹션 ───────────────────── */}
                <div className="section-card recent-analysis-card">
                <h3 className="card-title">최근 분석 기록</h3>

                <div className="analysis-table">
                <div className="table-header">
                    <span className="col-location">주소</span>
                    <span className="col-amount">계약금</span>
                    <span className="col-risk">위험도</span>
                </div>

                <div className="table-body">
                    {userData.recentAnalysis.map((item, index) => (
                    <div key={index} className="table-row">
                        <span className="col-location">{item.location}</span>
                        <span className="col-amount">{item.amount}</span>
                        <span
                        className="col-risk risk-badge"
                        style={{ color: item.riskColor }}
                        >
                        {item.risk}
                        </span>
                    </div>
                    ))}
                </div>
                </div>
                </div>

            </div>
            </div>
        </PageContainer>
        </>
    );
};

export default PG700001;
