// src/pages/analysis/PG100003.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 내부에서 다른 페이지로 이동할 경우 여전히 필요할 수 있음
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import "../../styles/common/common.css"; // common.css 경로 확인

import type {
    DocumentsDTO,
    FileStorageMetadataDTO,
    StructuredContractDataDTO,
    MapInfo,
} from "../../types/contract";

/**
 * @file PG100003.tsx
 * @description 계약서 분석의 OCR추출 이후 사용자가 검증하는 페이지 입니다
 * 실제 계약서에서 OCR로 단어들을 추출하고 사용자가 직접 추출된 단어들을 보면서 누락되거나 틀린 부분을 집고
 * 수정하며 에러를 고치고
 * OCR에서 나온 지역에 맞춰서 지도 API를 띄워 실거래가가 어느 지역을 기준으로 데이터화 하였는지
 * 보여주는 페이지 입니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : PG100003.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 계약서 분석 중 OCR 추출한 이후 사용자가 보고 AI 추출을 하기 전 검증하는 페이지 입니다
 */

// ⭐ 1. ocrData의 타입을 별도 인터페이스로 분리 ⭐
export interface OcrDataType {
    documentsDTO: DocumentsDTO;
    fileStorageMetadataDTO: FileStorageMetadataDTO;
    structuredContractDataDTO: StructuredContractDataDTO;
    mapInfo: MapInfo | null;
}

// ⭐ 2. PG100001로부터 받을 props 인터페이스 정의 ⭐
interface PG100003Props {
    scannedFile: string;
    ocrData: OcrDataType; // <-- 분리된 인터페이스 사용
    uploadedFilePreview: string | null;
    // ⭐ 3. onAnalysisComplete prop에서도 분리된 인터페이스 사용 ⭐
    onAnalysisComplete?: (result: OcrDataType) => void;
    onBackToPreviousPhase?: () => void;
}

// ⭐ props를 구조 분해 할당으로 받도록 변경 ⭐
const PG100003: React.FC<PG100003Props> = ({
    scannedFile,
    ocrData, // 객체로 변경
    uploadedFilePreview,
    onAnalysisComplete,
    onBackToPreviousPhase,
}) => {
    const navigate = useNavigate();

    // ⭐ 상태 초기값을 props로 받은 ocrData 객체로 설정 ⭐
    // 사용자가 데이터를 수정할 수 있으므로, ocrData 객체 전체를 `useState`로 관리합니다.
    const [currentOcrData, setCurrentOcrData] =
        useState<typeof ocrData>(ocrData);
    const [currentScannedFileName] = useState<string>(scannedFile);
    const [currentUploadedFilePreview] = useState<string | null>(
        uploadedFilePreview
    );

    // ⭐ OCR 결과에서 추출될 주소 정보는 이제 `ocrData` 객체에서 바로 가져옵니다. ⭐
    const [recognizedAddress, setRecognizedAddress] = useState<string | null>(
        ocrData.structuredContractDataDTO.location || null
    );

    // useEffect는 이제 더 이상 복잡한 로직을 수행할 필요가 없습니다.
    // props로 받은 주소 정보가 변경될 때마다 상태를 업데이트합니다.
    useEffect(() => {
        setRecognizedAddress(
            currentOcrData.structuredContractDataDTO.location ||
                "주소 인식 실패"
        );
    }, [currentOcrData]);

    // 구조화된 데이터의 특정 필드를 업데이트하는 범용 핸들러
    const handleDataChange = (
        field: keyof StructuredContractDataDTO,
        value: string
    ) => {
        setCurrentOcrData((prevData) => ({
            ...prevData,
            structuredContractDataDTO: {
                ...prevData.structuredContractDataDTO,
                [field]: value,
            },
        }));
    };

    const handleBackToUpload = () => {
        if (onBackToPreviousPhase) {
            onBackToPreviousPhase();
        } else {
            navigate("/pg100001");
        }
    };

    const handleProcessResult = () => {
        // '다음 단계로 진행' 버튼 클릭 시, 수정된 `currentOcrData` 객체 전체를 부모 컴포넌트로 전달
        if (onAnalysisComplete) {
            onAnalysisComplete(currentOcrData);
        } else {
            alert("OCR 결과 처리 (다음 단계로 이동) 로직 구현 예정");
        }
    };

    return (
        <div className="an03-container">
            <CommonContainerHeader
                subtitle="계약 분석 결과"
                title="OCR 분석 결과 확인"
                description="업로드하신 파일의 OCR 분석 결과입니다. 인식된 텍스트를
                    확인하고 필요한 경우 수정해주세요."
            />

            <div className="an03-content-wrapper">
                {/* 왼쪽: 원본 파일 미리보기 */}
                <div className="an03-pane an03-original-file-pane">
                    <h3 className="an03-pane-title">원본 파일</h3>
                    {currentUploadedFilePreview ? (
                        <img
                            src={currentUploadedFilePreview}
                            alt="원본 파일 미리보기"
                            className="an03-uploaded-image-preview"
                        />
                    ) : (
                        <div className="an03-no-preview">
                            <span className="an03-file-icon">📄</span>
                            <p>미리보기를 지원하지 않는 파일 형식입니다.</p>
                            {currentScannedFileName && (
                                <p className="an03-file-name">
                                    파일: {currentScannedFileName}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* 오른쪽: OCR 인식 텍스트 (이제는 구조화된 데이터) */}
                {/* ⭐ 기존의 textarea를 제거하고, 구조화된 데이터를 보여주는 UI로 변경 ⭐ */}
                <div className="an03-pane an03-ocr-text-pane">
                    <h3 className="an03-pane-title">OCR 분석 결과</h3>
                    <div className="an03-structured-data-form">
                        {/* 예시: 주소지 입력 필드 */}
                        <div className="an03-form-field">
                            <label htmlFor="location">주소지</label>
                            <input
                                id="location"
                                type="text"
                                value={
                                    currentOcrData.structuredContractDataDTO
                                        .location || ""
                                }
                                onChange={(e) =>
                                    handleDataChange("location", e.target.value)
                                }
                            />
                        </div>
                        {/* 예시: 보증금 입력 필드 */}
                        <div className="an03-form-field">
                            <label htmlFor="deposit">보증금</label>
                            <input
                                id="deposit"
                                type="text"
                                value={
                                    currentOcrData.structuredContractDataDTO.deposit?.toString() ||
                                    ""
                                }
                                onChange={(e) =>
                                    handleDataChange("deposit", e.target.value)
                                }
                            />
                        </div>
                        {/* 다른 계약 항목들도 여기에 추가됩니다. */}
                    </div>
                </div>
            </div>

            {/* 지도 API 구역 */}
            <div className="an03-map-section">
                <h3 className="an03-section-title">주변 시세 비교 구역</h3>
                <p className="an03-map-description">
                    OCR로 인식된 주소지 **
                    {recognizedAddress || "[주소 인식 중...]"}** 의 1km 반경 내
                    시세 비교 구역입니다. (지도 API는 추후 연동 예정입니다.)
                </p>
                <div className="an03-map-placeholder">
                    <div className="an03-map-dummy">
                        <p>지도 API가 표시될 공간</p>
                        <p>1km 반경 구역이 여기에 시각화됩니다.</p>
                    </div>
                </div>
            </div>

            <div className="an03-actions">
                <button
                    className="an02-secondary-btn"
                    onClick={handleBackToUpload}
                >
                    다시 업로드하기
                </button>
                <button
                    className="an02-ai-analyze-start-btn"
                    onClick={handleProcessResult}
                >
                    다음 단계로 진행
                </button>
            </div>
        </div>
    );
};

export default PG100003;
