import { useNavigate } from "react-router-dom";
import "../components.css";

/*
 * 생성자 : 이주하
 * 생성일 : 25.09.10
 * 파일명 : Footer.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : RiskView 서비스의 하단 정보 영역을 구성하는 Footer 컴포넌트
 *        브랜드 정보, 서비스 링크, 팀원, 연락처 정보를 제공하며,
 *        각 서비스 항목 클릭 시 해당 페이지로 라우팅
 */

const Footer = () => {
    const navigate = useNavigate();

    /**
     * 지정한 경로로 라우팅을 수행하는 함수
     * @param path - 이동할 페이지의 경로
     */
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    return (
        <>
            <div className="footer-top-border" />
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section brand">
                        <h2>RiskView</h2>
                        <p>AI 기반 부동산 거래 위험 분석 서비스</p>
                    </div>
                    <div className="footer-section">
                        <h3>서비스</h3>
                        <ul>
                            <li
                                onClick={() => handleNavigate("/PG100001")}
                                style={{ cursor: "pointer" }}
                            >
                                계약서 분석
                            </li>
                            <li
                                onClick={() => handleNavigate("/PG600001")}
                                style={{ cursor: "pointer" }}
                            >
                                서비스 소개
                            </li>
                            <li
                                onClick={() => handleNavigate("/PG400001")}
                                style={{ cursor: "pointer" }}
                            >
                                부동산 뉴스
                            </li>
                            <li
                                onClick={() => handleNavigate("/PG500001")}
                                style={{ cursor: "pointer" }}
                            >
                                커뮤니티
                            </li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>팀원</h3>
                        <ul>
                            <li>신인철 · 김관호</li>
                            <li>임해균 · 박윤성</li>
                            <li>문원주 · 유연우</li>
                            <li>이주하</li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>연락처</h3>
                        <ul>
                            <li>📧 riskviewproject@gmail.com</li>
                            <li>⏰ 평일 09:00 - 18:00</li>
                        </ul>
                    </div>
                </div>
                <hr className="footer-divider" />
                <div className="footer-bottom">
                    © 2025 RiskView. All rights reserved.
                </div>
            </footer>
        </>
    );
};

export default Footer;
