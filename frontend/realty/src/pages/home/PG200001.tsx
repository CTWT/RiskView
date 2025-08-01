// src/pages/Home/PG200001.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/common/Common.css";
import { LuScanLine } from "react-icons/lu"; // 아이콘 사용(npm install react-icons)

/**
 * @file PG200001.tsx
 * @description 메인 페이지 컴포넌트입니다.
 * 사용자를 환영하고 서비스의 핵심 가치를 요약하며, 주요 기능으로의 시작점을 제공합니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.28
 * 파일명 : PG200001.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 메인 페이지 컴포넌트
 */

const PG200001 = () => {
  const navigate = useNavigate();
  // 아이콘 클릭 시 특정 페이지로 이동하는 함수
  const handleScanIconClick = () => {
    navigate("/PG100001"); // 이동할 경로를 지정
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

        {/* 오른쪽: 분석 카드 (컨테이너 바깥으로 자유롭게 이동 가능) */}
        <div className="analysis-absolute-wrapper">
          <div className="analysis-card-mask">
            <div className="analysis-card-content">
              <p className="image-placeholder-text">
                분석 카드 이미지 및 캐러셀 적용 예정
                <br />
                가능하다면 3d캐러셀
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PG200001;
