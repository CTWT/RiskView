// src/pages/analysis/PG100004.tsx

import React, { useState, useEffect } from "react";
import "../../styles/common/common.css"; // ⭐ common.css만 임포트 ⭐
import ProgressBar from "../../components/ui/ProgressBar"; // ProgressBar 컴포넌트 임포트 경로 확인 및 수정
import type { OcrDataType } from "./PG100003";
import axios from "axios";

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
  ocrData: OcrDataType | null;
  onAnalysisComplete?: (documentCode: string | null) => void; // 모든 분석이 완료되면 호출될 콜백
}

export interface AiRiskAnalysisRequest {
  ocrData: OcrDataType;
  anomalyDetectResult: AnomalyDetectResult | null;
}

// 응답 바디
export interface RiskAssessment {
  level: string;
  comment: string;
}

export interface UserZScoreAnalysis {
  zScore: number;
  label: string;
}

export interface AnomalyDetectResult {
  userContractPrice: number;
  totalRiskScore: number;
  averagePrice: number;
  isAnomaly: boolean;
  riskAssessment: RiskAssessment;
  userZScoreAnalysis: UserZScoreAnalysis;
}

interface AnalysisStep {
  label: string;
  action?: () => Promise<string | void>; // 첫 스텝은 string, 나머지는 void
}

const PG100004: React.FC<PG100004Props> = ({ ocrData, onAnalysisComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentOcrData, setCurrentOcrData] = useState<OcrDataType>(ocrData);
    const [documentCode, setDocumentCode] = useState<string | null>(null);
    const [anomalyDetectResult, setAnomalyDetectResult] =
        useState<AnomalyDetectResult | null>(null);
    const [aiRiskAnalysis, setAiRiskAnalysis] = useState<string | null>(null);

    const analysisSteps: AnalysisStep[] = [
        {
            label: "문서 업로드 완료",
            action: async (): Promise<string> => {
            return await uploadDocument() ?? "";
            },
        },
        {
            label: "계약 내용 이상치 분석 완료",
            action: async () => {
            await anomalyDetect(currentOcrData);
            },
        },
        {
            label: "AI 위험 요소 탐지 완료",
            action: async () => {
            await aiRiskAnalyze(currentOcrData, anomalyDetectResult);
            },
        },
        {
            label: "분석 리포트 생성 완료",
            action: async () => {
            await generateReport();
            },
        },
        ];

    const uploadDocument = async (): Promise<string | null> => {
        try {
            const { documentsDTO, fileStorageMetadataDTO, structuredContractDataDTO } = currentOcrData!;
            const payload = { documentsDTO, fileStorageMetadataDTO, structuredContractDataDTO };

            const response = await axios.post<string>(
                "http://localhost:8080/contracts",
                payload,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            console.log("전송 성공", response.data);

            // sessionStorage에 저장 (PG100005에서도 안전하게 가져오기 위해)
            sessionStorage.setItem("rv_documentCode", response.data);

            return response.data; // ✅ 여기가 이제 string으로 반환됨
        } catch (error) {
            console.error("전송 실패", error);
            alert("서버 전송 중 오류가 발생했습니다.");
            return null;
        }
    };

    const anomalyDetect = async (ocrData: OcrDataType) => {
        const response = await axios.post<AnomalyDetectResult>(
        "http://localhost:8080/contracts/anomalyDetect",
        ocrData
        );
        setAnomalyDetectResult(response.data);
    };

    const aiRiskAnalyze = async (
        ocrData: OcrDataType,
        anomalyDetectResult: AnomalyDetectResult | null
    ) => {
        const payload: AiRiskAnalysisRequest = { ocrData, anomalyDetectResult };

        const response = await axios.post<string>(
        "http://localhost:8080/contracts/aiRiskAnalysis",
        payload,
        {
            headers: {
            "Content-Type": "application/json",
            },
        }
        );

        setAiRiskAnalysis(response.data); // state 반영
    };

    const generateReport = async () => {};

   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        const runSteps = async () => {
            let accumulatedProgress = 0;
            let uploadedDocumentCode: string | null = null;

            for (let stepIndex = 0; stepIndex < analysisSteps.length; stepIndex++) {
                const step = analysisSteps[stepIndex];

                if (step.action) {
                    if (step.label === "문서 업로드 완료") {
                        uploadedDocumentCode = await step.action() as string;
                    } else {
                        await step.action();
                    }
                }

                // 진행도 업데이트
                accumulatedProgress += 100 / analysisSteps.length;
                setProgress(Math.min(accumulatedProgress, 100));
                setCurrentStep(stepIndex + 1);

                // 🔹 각 단계 후 1초 딜레이
                await delay(1000);
            }

            if (onAnalysisComplete) {
                console.log("PG100004 uploadedDocumentCode:", uploadedDocumentCode);
                onAnalysisComplete(uploadedDocumentCode);
            }
        };

        runSteps();
    }, []);

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
            <h2 className="an04-main-message">AI가 계약서를 분석하고 있습니다</h2>
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
