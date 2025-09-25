// src/pages/analysis/PG100004.tsx
import React, { useState, useEffect } from "react";
import "../../styles/common/common.css";
import ProgressBar from "../../components/ui/ProgressBar";
import type { OcrDataType } from "./PG100003";
import axios from "axios";

interface PG100004Props {
  ocrData: OcrDataType | null;
  onAnalysisComplete?: (documentCode: string | null) => void;
}

export type SentimentCategory = "긍정" | "부정" | "중립";

export interface AnomalyDetectResult {
  userContractPrice: number | null;
  totalRiskScore: number | null;
  averagePrice: number | null;
  isAnomaly: boolean | null;
  deviationPercent : number | null;
  riskLevel: string | null;
  riskComment: string | null;
  zScore: number | null;
  label: string | null;
}
export interface ContractClauseDTO {
  clauseType: "계약금" | "중도금" | "잔금" | "특약" | "기타";
  clauseTitle: string;
  clauseValue: string;
  isRisky: boolean;
  riskReason: string;
}
export interface AnalysisReportsDTO {
  summary: string;
  riskLevel: string;
  sentimentSummary: string;
  sentimentScore: number;
  sentimentCategory: SentimentCategory;
  sentimentEmoji: string;
}
export interface AiRiskAnalysisRequest {
  contractClauseDTO: ContractClauseDTO;
  anomalyDetectResult: AnomalyDetectResult;
}
export interface FinalCommitRequest {
  documentCode: string;
  contractClauseDTO: ContractClauseDTO;
  anomalyDetectResult: AnomalyDetectResult;
  analysisReportsDTO: AnalysisReportsDTO;
}

const PG100004: React.FC<PG100004Props> = ({ ocrData, onAnalysisComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const uploadDocument = async (): Promise<string | null> => {
    try {
      const { documentsDTO, fileStorageMetadataDTO, structuredContractDataDTO } = ocrData!;
      const payload = { documentsDTO, fileStorageMetadataDTO, structuredContractDataDTO };
      console.log("전송 데이터", structuredContractDataDTO)
      const response = await axios.post<string>("/api/contracts", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("전송 성공", response.data);
      sessionStorage.setItem("rv_documentCode", response.data);
      return response.data;
    } catch (error) {
      console.error("전송 실패", error);
      alert("서버 전송 중 오류가 발생했습니다.");
      return null;
    }
  };

  const anomalyDetect = async (ocrData: OcrDataType) => {
    const response = await axios.post<AnomalyDetectResult>(
      "/api/contracts/anomalyDetect",
      ocrData
    );
    console.log("이상치 분석 결과 ==>", response.data);
    return response.data;
  };

  const clauseAnalyze = async (clause: string | null) => {
    const response = await axios.post<ContractClauseDTO>(
      "/api/contracts/clauseAnalysis",
      clause
    );
    console.log("특약사항 분석결과 ==>", response.data);
    console.log(response.data.riskReason)
    return response.data;
  };

  const aiRiskAnalyze = async (
    contractClauseDTO : ContractClauseDTO,
    anomalyDetectResult: AnomalyDetectResult
  ) => {
    const payload: AiRiskAnalysisRequest = { contractClauseDTO, anomalyDetectResult };
    const response = await axios.post<AnalysisReportsDTO>(
      "/api/contracts/aiRiskAnalysis",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("리포트 분석결과 ==>", response.data);
    return response.data;
  };

  const generateReport = async (
    documentCode: string,
    clauseAnalysis: ContractClauseDTO,
    anomalyDetectResult: AnomalyDetectResult,
    analysisReport: AnalysisReportsDTO
  ) => {

    console.log("final documentCode : ", documentCode);
    console.log("final clauseAnalysis : ", clauseAnalysis);
    console.log("final anomalyDetectResult : ", anomalyDetectResult);
    console.log("final analysisReport : ", analysisReport);
    
    const payload: FinalCommitRequest = {
      documentCode,
      contractClauseDTO: clauseAnalysis,
      anomalyDetectResult,
      analysisReportsDTO: analysisReport
    };
    const response = await axios.post<string>(
      "/api/contracts/finalCommit",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  };

  useEffect(() => {
    const runAnalysis = async () => {
      let accumulatedProgress = 0;

      // 1️⃣ 문서 업로드
      const uploadedDocumentCode = await uploadDocument();
      accumulatedProgress += 20;
      setProgress(accumulatedProgress);
      setCurrentStep(1);

      // 2️⃣ 이상치 분석
      const rAnomalyDetectResult = await anomalyDetect(ocrData!);
      accumulatedProgress += 20;
      setProgress(accumulatedProgress);
      setCurrentStep(2);

      // 3️⃣ 특약사항 분석
      let rClauseAnalysis: ContractClauseDTO | null = null;
      const specialTerms = ocrData?.structuredContractDataDTO?.specialTerms?.trim();
      if (specialTerms) {
        rClauseAnalysis = await clauseAnalyze(specialTerms);
      }
      accumulatedProgress += 20;
      setProgress(accumulatedProgress);
      setCurrentStep(3);

      // 4️⃣ AI 위험 요소 분석
      let rAnalysisReport: AnalysisReportsDTO | null = null;
      if (rClauseAnalysis && rAnomalyDetectResult){
        rAnalysisReport = await aiRiskAnalyze(rClauseAnalysis, rAnomalyDetectResult);
      }
      accumulatedProgress += 20;
      setProgress(accumulatedProgress);
      setCurrentStep(4);

      // 5️⃣ 최종 리포트 생성
      if (uploadedDocumentCode && rClauseAnalysis && rAnomalyDetectResult && rAnalysisReport) {
        await generateReport(uploadedDocumentCode, rClauseAnalysis, rAnomalyDetectResult, rAnalysisReport);
      }
      accumulatedProgress = 100;
      setProgress(accumulatedProgress);
      setCurrentStep(5);

      if (onAnalysisComplete) onAnalysisComplete(uploadedDocumentCode);
    };

    runAnalysis();
  }, [ocrData, onAnalysisComplete]);

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
          {["문서 업로드 완료","계약 내용 이상치 분석 완료","특약 사항 위험 분석 완료","AI 위험 요소 탐지 완료","분석 리포트 생성 완료"].map((stepLabel, index) => (
            <div
              key={index}
              className={`an04-step-item ${index < currentStep ? "an04-step-completed" : ""}`}
            >
              {index < currentStep ? <span className="an04-check-icon">✔</span> : <span className="an04-pending-icon"></span>}
              {stepLabel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PG100004;
