// src/pages/Home/PG200001.tsx
import { useNavigate } from "react-router-dom";
import "../../styles/common/common.css";
import { LuScanLine } from "react-icons/lu";
import PG200002 from "./PG200002"; // 캐러셀 컴포넌트 import

/**
 * @file PG200001.tsx
 * @description 메인 페이지 컴포넌트입니다.
 * 사용자를 환영하고 서비스의 핵심 가치를 요약하며, 주요 기능으로의 시작점을 제공합니다.
 */

/*
 * 수업명 : 가비아 2회차
 * 이름 : 문원주
 * 작성자 : 문원주
 * 수정자 : 이주하
 * 작성일 : 25.07.28
 * 파일명 : PG200001.tsx
 */

const PG200001 = () => {
    const navigate = useNavigate();

    const handleScanIconClick = () => {
        navigate("/PG100001");
    };

    return (
        <section className="main-section">
            <div className="main-container">
                {/* 왼쪽: 타이틀 + 업로드 박스 */}
                <div className="main-left">
                    <h1 className="main-title">
                        숨겨진 부동산 리스크, AI가 대신 분석합니다.
                        <br />
                        실거래가 비교와 문서 분석으로 한눈에 확인하세요.
                    </h1>
                    <div className="main-upload-box">
                        <input
                            type="text"
                            className="main-upload-input"
                            placeholder="문서를 촬영하거나 업로드하세요"
                            disabled
                        />
                        <LuScanLine
                            className="main-scan-icon"
                            onClick={handleScanIconClick}
                        />
                    </div>
                </div>

                {/* 오른쪽: 3D 캐러셀 */}
                <div className="main-right">
                    <PG200002 />
                </div>
            </div>
        </section>
    );
};

export default PG200001;
