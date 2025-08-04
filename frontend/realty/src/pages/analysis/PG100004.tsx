// src/pages/analysis/PG100004.tsx

import React, { useState, useEffect } from "react";
import "../../styles/common/common.css"; // ⭐ common.css만 임포트 ⭐
import ProgressBar from "../../components/ui/ProgressBar"; // ProgressBar 컴포넌트 임포트 경로 확인 및 수정

/**
 * @file PG100004.tsx
 * @description AI 분석의 결과가 오래걸리니 사용자 UX적으로 실제로 어느정도 작업이 되었다 라는걸 시각화
 * 하기 위하여 제작된 로딩 페이지 입니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : PG100004.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 계약서의 AI 분석 중 어느정도 진행되었나 진행도를 확인할 수 있는 로딩창 입니다.
 */

interface PG100004Props {
    onAnalysisComplete?: () => void; // 모든 분석이 완료되면 호출될 콜백
}

const PG100004: React.FC<PG100004Props> = ({ onAnalysisComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    // 분석 단계 목록
    const analysisSteps = [
        { label: "문서 업로드 완료", completed: false },
        { label: "OCR 텍스트 추출 완료", completed: false },
        { label: "계약 내용 분석 완료", completed: false },
        { label: "위험 요소 탐지 완료", completed: false },
        { label: "분석 리포트 생성 완료", completed: false },
    ];

    useEffect(() => {
        const simulateAnalysis = () => {
            let currentProgress = 0;
            let stepIndex = 0;

            const interval = setInterval(() => {
                currentProgress += 20;
                setProgress(Math.min(currentProgress, 100));

                if (
                    currentProgress >= (stepIndex + 1) * 20 &&
                    stepIndex < analysisSteps.length
                ) {
                    setCurrentStep(stepIndex + 1);
                    stepIndex++;
                }

                if (currentProgress >= 100) {
                    clearInterval(interval);
                    if (onAnalysisComplete) {
                        onAnalysisComplete();
                    }
                }
            }, 500);

            return () => clearInterval(interval);
        };

        simulateAnalysis();
    }, [onAnalysisComplete, analysisSteps.length]);

    return (
        <div className="an04-container">
            <div className="an04-header">
                <h2 className="an02-subtitle">계약 분석</h2>
                <h1 className="an02-title">계약서 분석</h1>
                <p className="an02-description">
                    부동산 계약서를 업로드하여 자동으로 내용을 분석해보세요
                </p>
            </div>

            <div className="an04-loading-card">
                <div className="an04-spinner-wrapper">
                    <div className="an04-spinner"></div>
                </div>
                <h2 className="an04-main-message">
                    AI가 계약서를 분석하고 있습니다
                </h2>
                <p className="an04-sub-message">
                    문서를 스캔하고 위험 요소를 분석하는 중입니다.
                    <br />
                    잠시만 기다려주세요.
                </p>

                <ProgressBar progress={progress} />

                <div className="an04-steps-list">
                    {analysisSteps.map((step, index) => (
                        <div
                            key={index}
                            className={`an04-step-item ${
                                index < currentStep ? "an04-step-completed" : ""
                            }`}
                        >
                            {index < currentStep ? (
                                <span className="an04-check-icon">✔</span>
                            ) : (
                                <span className="an04-pending-icon"></span>
                            )}
                            {step.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PG100004;
