import React from "react";
import { Link } from "react-router-dom";
import "../../styles/common/common.css";
import { useContext } from "react";
import { AuthContext } from "../../pages/auth/components/authentication/AuthContext.ts";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
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
    const { isLoggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // 로그아웃 이벤트 처리
    const handleLogout = () => {
        logout();
        navigate("/");
    };
    return (
    <header className="headerContainer">
    <div className="headerLogo">
        <Link to="/" className="headerLogoText">
        <img src={logo} alt="RiskView Logo" className="headerLogoImage" />
        </Link>
    </div>
    <nav className="headerNav">
        <Link to="/PG600001">서비스 소개</Link>
        <Link to="/PG100001">계약서 분석</Link>
        <Link to="/PG400001">부동산 뉴스</Link>
        <Link to="/PG500001">커뮤니티</Link>
    </nav>
    <div className="headerAuth">
        {/* 로그인 여부에 따라서 메뉴를 다르게 표시 */}
        {isLoggedIn ? (
            // 로그인 상태일 때
            <>
                <Link to="/" onClick={handleLogout} className="headerLogout">
                    로그아웃
                </Link>
                <Link to="/PG700001" className="headerMypage">
                    마이페이지
                </Link>
            </>
        ) : (
            // 로그아웃 상태일 때
            <>
                {/* 로그인은 명시적으로 login=true 파라미터 추가 */}
                <Link to="/PG300001?login=true" className="headerLogin">
                    로그인
                </Link>
                {/* 회원가입은 명시적으로 signup=true 파라미터 추가 */}
                <Link to="/PG300001?signup=true" className="headerSignup">
                    회원가입
                </Link>
            </>
        )}
    </div>
    </header>
    );
};

export default Header;
