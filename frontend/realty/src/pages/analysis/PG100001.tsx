// src/pages/analysis/PG100001.tsx (Root Component)

import React, { useState, useCallback } from "react";
import PG100002 from "./PG100002"; // 계약서 분석 전
import PG100003 from "./PG100003"; // OCR분석 후 화면
import PG100004 from "./PG100004"; // 계약서 분석 중 로딩 화면
import PG100005 from "./PG100005"; // 분석 결과 보고서 화면

import type { OcrDataType } from "./PG100003";

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

const PG100001: React.FC = () => {
    // 현재 분석 진행 단계를 나타내는 상태 (0: 분석 전, 1: 분석 중(OCR 결과 확인), 2: AI분석 중(로딩창), 3: 분석 완료 후 보고서)
    const [analysisPhase, setAnalysisPhase] = useState(0);

    // ⭐ PG100002 (OCR 스캔 완료)에서 PG100003으로 넘겨줄 데이터를 저장할 상태
    const [analysisOutputData, setAnalysisOutputData] = useState<{
        ocrData: OcrDataType;
        uploadedFilePreview: string | null;
        scannedFile: string;
    } | null>(null);

    const [documentCode, setDocumentCode] = useState<string | null>(null);
    const [ocrData, setOcrData] = useState<OcrDataType | null>(null);

    // 단계 변경 함수 (하위 컴포넌트에서 호출하여 상위 상태를 변경)
    const handleNextPhase = (nextPhase: number) => {
        setAnalysisPhase(nextPhase);
    };

    // ⭐ PG100003에서 0단계로 돌아갈 때 호출할 함수 ⭐
    const handleBackToPhase0 = useCallback(() => {
        setAnalysisPhase(0);
    }, []); // 의존성 배열은 비워둠 (상태 setter를 사용하므로)

    // PG100004 분석 완료 후 호출될 함수 (analysisPhase를 3으로 변경)
    const handleFinalAnalysisComplete = useCallback(() => {
        setAnalysisPhase(3); // 분석 완료 단계 (PG100005 렌더링 준비)
        // 여기에서 실제 분석 리포트 데이터를 저장하거나 전달할 수 있습니다.
        //setAnalysisResult("최종 분석 리포트 데이터"); // 예시
    }, []);

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
                        ocrData={analysisOutputData.ocrData}
                        uploadedFilePreview={
                            analysisOutputData.uploadedFilePreview
                        }
                        // PG100003에서 다음 단계(PG100004)로 넘어가고 싶을 때 호출할 함수
                        onAnalysisComplete={(ocrData : OcrDataType) => {
                            setOcrData(ocrData);
                            handleNextPhase(2); // 분석 완료 (PG100004) 단계로 전환
                        }}
                        onBackToPreviousPhase={handleBackToPhase0}
                    />
                )}

            {analysisPhase === 2 && ( // ⭐ AI 분석 중 (PG100004 렌더링) ⭐
                <PG100004 
                    ocrData = {ocrData}
                    onAnalysisComplete={(documentCode : string | null) => {
                        console.log("PG100001 got documentCode:", documentCode);
                        setDocumentCode(documentCode);
                        handleFinalAnalysisComplete();
                    }} // ⭐ 분석 완료 시 콜백 연결 ⭐
                />
            )}

            {analysisPhase === 3 && <PG100005 documentCode={documentCode} />}

            {/* 기타 공통 UI 요소 */}
        </div>
    );
};

export default PG100001;
