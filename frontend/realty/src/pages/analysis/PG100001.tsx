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

import React, { useState } from "react";
import PG100002 from "./PG100002"; // 계약서 분석 전
// import PG100003 from "./PG100003"; // 계약서 분석 중
// import PG100004 from "./PG100004"; // 계약서 분석 후 (결과 화면)
// import PG100005 from "./PG100005"; // 분석 결과 확대 화면

const PG100001: React.FC = () => {
  // 현재 분석 진행 단계를 나타내는 상태 (0: 분석 전, 1: 분석 중, 2: 분석 완료, 3: 결과 확대)
  const [analysisPhase, setAnalysisPhase] = useState(0);

  // 단계 변경 함수 (하위 컴포넌트에서 호출하여 상위 상태를 변경)
  const handleNextPhase = (nextPhase: number) => {
    setAnalysisPhase(nextPhase);
  };

  // 하위 컴포넌트에 전달할 props (예: 사용자 입력 데이터, 분석 결과 데이터 등)
  //   const [contractData, setContractData] = useState<any>(null);
  //   const [analysisResult, setAnalysisResult] = useState<any>(null);

  return (
    <div className="analysis-root-container">
      {analysisPhase === 0 && (
        <PG100002
          onStartAnalysis={
            (/*data*/) => {
              //setContractData(data); // 업로드된 계약서 데이터 저장
              handleNextPhase(1); // 분석 중 단계로 전환
            }
          }
        />
      )}

      {/* {analysisPhase === 1 && (
        <PG100003
          onAnalysisComplete={(result) => {
            setAnalysisResult(result); // 분석 결과 저장
            handleNextPhase(2); // 분석 완료 단계로 전환
          }}
          progress={progress} // 분석 중 프로그레스 전달
          setProgress={setProgress} // 프로그레스 업데이트 함수 전달
        />
      )}

      {analysisPhase === 2 && (
        <PG100004
          contractData={contractData} // 계약서 원본 데이터 전달
          analysisResult={analysisResult} // 분석 결과 데이터 전달
          onViewDetail={() => handleNextPhase(3)} // 상세 보기 클릭 시 확대 화면으로 전환
        />
      )}

      {analysisPhase === 3 && (
        <PG100005
          analysisResult={analysisResult} // 분석 결과 데이터 전달
          onCloseDetail={() => handleNextPhase(2)} // 확대 화면 닫기 시 이전 화면으로 전환
        />
      )} */}

      {/* 기타 공통 UI 요소 */}
    </div>
  );
};

export default PG100001;
