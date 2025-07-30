import React from "react";
import { Link } from "react-router-dom";
import "../../styles/common/common.css";

// Header Component

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.07.25
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
        <Link to="/serviceIntro">서비스 소개</Link>
        <Link to="/PG100001">계약서 분석</Link>
        <Link to="/news">부동산 뉴스</Link>
        <Link to="/community">커뮤니티</Link>
      </nav>
      <div className="headerAuth">
        {/* 로그인은 PG300001로 (기본 authStep=0) */}
        <Link to="/PG300001" className="headerLogin">
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
