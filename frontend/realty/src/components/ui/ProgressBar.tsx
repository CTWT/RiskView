// src/componets/ui/ProgressBar.tsx

/**
 * @file ProgressBar.tsx
 * @description 각 페이지에서 사용될 가장 기본적인 프로그래스바(진행도바) 입니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : ProgressBar.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 각 페이지에서 사용될 컴포넌트 중 하나인 프로그래스바 입니다.
 */

import React from "react";
import "../components.css";

interface ProgressBarProps {
  progress: number;
  message?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="progress-modal-container">
      {message && <p className="progress-message">{message}</p>}
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
          <span className="progress-bar-label">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
