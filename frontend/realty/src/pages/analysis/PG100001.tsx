// src/pages/analysis/PG100001.tsx (Root Component)

/**
 * @file PG100001.tsx
 * @description 계약서 분석 페이지의 총괄 컴포넌트입니다
 * 이 파일은 분석 페이지를 구성하는 다양한 서브 컴포넌트들을 통합하고,
 * 사용자 입력과 분석 진행 상황 표시, 결과 요약등을 관리합니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.28
 * 파일명 : PG100001.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 계약서 분석 페이지의 전체 흐름과 컴포넌트 통합등을 담당하는 파일입니다.
 */

import React, { useState, useCallback } from "react";
import PG100002 from "./PG100002"; // 계약서 분석 전
import PG100003 from "./PG100003"; // OCR분석 후 화면
// import PG100004 from "./PG100004"; // 계약서 분석 후 (결과 화면)
// import PG100005 from "./PG100005"; // 분석 결과 확대 화면

const PG100001: React.FC = () => {
  // 현재 분석 진행 단계를 나타내는 상태 (0: 분석 전, 1: 분석 중(OCR 결과 확인), 2: 분석 완료, 3: 결과 확대)
  const [analysisPhase, setAnalysisPhase] = useState(0);

  // ⭐ PG100002 (OCR 스캔 완료)에서 PG100003으로 넘겨줄 데이터를 저장할 상태
  const [analysisOutputData, setAnalysisOutputData] = useState<{
    ocrResult: string;
    uploadedFilePreview: string | null;
    scannedFile: string;
  } | null>(null);

  // 단계 변경 함수 (하위 컴포넌트에서 호출하여 상위 상태를 변경)
  const handleNextPhase = (nextPhase: number) => {
    setAnalysisPhase(nextPhase);
  };

  // ⭐ PG100003에서 0단계로 돌아갈 때 호출할 함수 ⭐
  const handleBackToPhase0 = useCallback(() => {
    setAnalysisPhase(0);
  }, []); // 의존성 배열은 비워둠 (상태 setter를 사용하므로)

  // 하위 컴포넌트에 전달할 props (예: 사용자 입력 데이터, 분석 결과 데이터 등)
  //   const [contractData, setContractData] = useState<any>(null);
  //   const [analysisResult, setAnalysisResult] = useState<any>(null);

  return (
    <div className="analysis-root-container">
      {analysisPhase === 0 && (
        <PG100002
          onStartAnalysis={(data) => {
            // ⭐ PG100002에서 전달한 data를 받습니다.
            setAnalysisOutputData(data); // PG100002에서 넘어온 OCR 결과 데이터 저장
            handleNextPhase(1); // 분석 중 (OCR 결과 확인) 단계로 전환
          }}
        />
      )}

      {/* ⭐ analysisPhase가 1일 때 PG100003을 렌더링하고 데이터 전달 */}
      {analysisPhase === 1 &&
        analysisOutputData && ( // analysisOutputData가 있을 때만 렌더링
          <PG100003
            scannedFile={analysisOutputData.scannedFile}
            ocrData={analysisOutputData.ocrResult}
            uploadedFilePreview={analysisOutputData.uploadedFilePreview}
            // PG100003에서 다음 단계(PG100004)로 넘어가고 싶을 때 호출할 함수 (예시)
            onAnalysisComplete={(result) => {
              // setAnalysisResult(result); // PG100003에서 텍스트 수정이 있었다면 그 결과를 저장
              handleNextPhase(2); // 분석 완료 (PG100004) 단계로 전환
            }}
            onBackToPreviousPhase={handleBackToPhase0}
          />
        )}

      {/*
        PG100004 및 PG100005는 현재 주석 처리된 상태
        analysisPhase === 2 && (
          <PG100004
            contractData={contractData}
            analysisResult={analysisResult}
            onViewDetail={() => handleNextPhase(3)}
          />
        )
      */}

      {/*
        analysisPhase === 3 && (
          <PG100005
            analysisResult={analysisResult}
            onCloseDetail={() => handleNextPhase(2)}
          />
        )
      */}

      {/* 기타 공통 UI 요소 */}
    </div>
  );
};

export default PG100001;
