// src/pages/community/PG500011.tsx

import React from "react";
import { NavLink } from "react-router-dom";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import PageContainer from "../../components/layout/PageContainer";

import {
    LuMegaphone, // 공지
    LuBookOpen, // 용어 사전
    LuMessagesSquare, // 게시판
    //LuBellRing, // 업데이트(리스트)
    //LuCheckCircle2, // 체크(리스트)
} from "react-icons/lu";

/**
 * @file PG500011.tsx
 * @description 게시판 인트로에 대한 페이지 입니다.
 *
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.13
 * 파일명 : PG500011.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 커뮤니티 탭에 들어가면 보이는 인트로 페이지입니다 이 부분에서 다른 21,31,41 페이지로 이동이 가능합니다.
 */

const PG500011 = () => {
    return (
        <PageContainer showBreadcrumb={true} centerContent={true}>
            <div className="community-container">
                {/* 1. 상단 공용 헤더 */}
                <CommonContainerHeader
                    subtitle="커뮤니티"
                    title="부동산 계약 경험을 공유하세요"
                    description="계약서에 대한 궁금증, 리스크 사례를 자유롭게 나눠보세요"
                />

                {/* 2. 바로가기 카드 섹션 */}
                <div className="shortcut-cards">
                    <NavLink to="/PG500001/PG500021" className="card-link">
                        <div className="shortcut-card">
                            {/* 공지사항 아이콘 */}
                            <div className="icon-wrap icon-announcement">
                                <LuMegaphone />
                            </div>
                            <span>공지사항</span>
                        </div>
                    </NavLink>
                    <NavLink to="/PG500001/PG500031" className="card-link">
                        <div className="shortcut-card">
                            {/* 부동산 용어 사전 아이콘 */}
                            <div className="icon-wrap icon-dictionary">
                                <LuBookOpen />
                            </div>
                            <span>부동산 용어 사전</span>
                        </div>
                    </NavLink>
                    <NavLink to="/PG500001/PG500041" className="card-link">
                        <div className="shortcut-card">
                            {/* 게시판 아이콘 */}
                            <div className="icon-wrap icon-board">
                                <LuMessagesSquare />
                            </div>
                            <span>게시판</span>
                        </div>
                    </NavLink>
                </div>

                {/* 3. 하단 탭 네비게이션 및 내용 */}
                <nav className="community-nav">
                    <NavLink
                        to="/PG500001/announcements"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        공지사항
                    </NavLink>
                    <NavLink
                        to="/PG500001/legal-dictionary"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        부동산 용어 사전
                    </NavLink>
                    <NavLink
                        to="/PG500001/board"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        게시판
                    </NavLink>
                </nav>

                <div className="community-content">
                    {/* 아래는 이미지(image_954ecc.png)를 참고하여 
                  최신 공지사항 목록의 틀만 잡은 것입니다. 
                */}
                    <div className="latest-announcements-list">
                        <div className="list-item">
                            <span className="icon icon-megaphone"></span>
                            <span>
                                [중요] 전세사기 피해 방지를 위한 계약 체크리스트
                                안내
                            </span>
                            <span className="date">관리자 2025.07.16</span>
                            <span className="tag tag-필독">필독</span>
                        </div>
                        <div className="list-item">
                            <span className="icon icon-update"></span>
                            <span>
                                RiskView 서비스 업데이트 안내 (2025.06.10)
                            </span>
                            <span className="date">관리자 2025.07.10</span>
                        </div>
                        <div className="list-item">
                            <span className="icon icon-check"></span>
                            <span>부동산 용어 사전 서비스 오픈 안내</span>
                            <span className="date">관리자 2025.07.05</span>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};
export default PG500011;
