import React from "react";
import { Link } from "react-router-dom";
import "../../styles/common/common.css";

// Header Component

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 수정일 :
 * 파일명 : Header.tsx
 */

/**
 *
 * @returns JSX.Element - 상단 헤더 UI 요소를 반환
 */

const Header: React.FC = () => {
return (
    <header className="headerContainer">
    <div className="headerLogo">
        <Link to="/" className="headerLogoText">
        <strong>Risk-view</strong>
        <span className="headerLogoSubText">Team. Debugging Monster</span>
        </Link>
    </div>
    <nav className="headerNav">
        <Link to="/PG600001">서비스 소개</Link>
        <Link to="/PG100001">계약서 분석</Link>
        <Link to="/PG400001">부동산 뉴스</Link>
        <Link to="/PG500001">커뮤니티</Link>
    </nav>
    <div className="headerAuth">
        {/* 로그인은 명시적으로 login=true 파라미터 추가 */}
        <Link to="/PG300001?login=true" className="headerLogin">
        로그인
        </Link>
        {/* 회원가입은 signup 파라미터를 추가하여 바로 회원가입 단계로 */}
        <Link to="/PG300001?signup=true" className="headerSignup">
        회원가입
        </Link>
    </div>
    </header>
    );
};

export default Header;
