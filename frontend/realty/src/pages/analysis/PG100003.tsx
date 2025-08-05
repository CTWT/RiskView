// src/pages/analysis/PG100003.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import "../../styles/common/common.css";
import contractFieldLabels from "../../contracts/contractFieldLabels";

import type {
    DocumentsDTO,
    FileStorageMetadataDTO,
    StructuredContractDataDTO,
    MapInfo,
} from "../../types/contract";

/**
 * @file PG100003.tsx
 * @description 계약서 분석의 OCR추출 이후 사용자가 검증하는 페이지 입니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : PG100003.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 계약서 분석 중 OCR 추출한 이후 사용자가 보고 AI 추출을 하기 전 검증하는 페이지 입니다
 */

//  1. ocrData의 타입을 별도 인터페이스로 분리
export interface OcrDataType {
    documentsDTO: DocumentsDTO | null;
    fileStorageMetadataDTO: FileStorageMetadataDTO | null;
    structuredContractDataDTO: StructuredContractDataDTO | null;
    mapInfo: MapInfo | null;
}

//  2. PG100001로부터 받을 props 인터페이스 정의
interface PG100003Props {
    scannedFile: string;
    ocrData: OcrDataType;
    uploadedFilePreview: string | null;
    //  3. onAnalysisComplete prop에서도 분리된 인터페이스 사용
    onAnalysisComplete?: (result: OcrDataType) => void;
    onBackToPreviousPhase?: () => void;
}

const PG100003: React.FC<PG100003Props> = ({
    scannedFile,
    ocrData,
    uploadedFilePreview,
    onAnalysisComplete,
    onBackToPreviousPhase,
}) => {
    const navigate = useNavigate();

    const [currentOcrData, setCurrentOcrData] =
        useState<typeof ocrData>(ocrData);
    const [currentScannedFileName] = useState<string>(scannedFile);
    const [currentUploadedFilePreview] = useState<string | null>(
        uploadedFilePreview
    );

    //  수정: ocrData.structuredContractDataDTO가 null일 수 있으므로 옵셔널 체이닝 사용
    const [recognizedAddress, setRecognizedAddress] = useState<string | null>(
        ocrData.structuredContractDataDTO?.location || null
    );

    //  수정: useEffect 내부에서도 옵셔널 체이닝 사용
    useEffect(() => {
        setRecognizedAddress(
            currentOcrData.structuredContractDataDTO?.location ||
                "주소 인식 실패"
        );
    }, [currentOcrData]);

    const handleDataChange = (
        field: keyof StructuredContractDataDTO,
        value: string
    ) => {
        setCurrentOcrData((prevData) => {
            // structuredContractDataDTO가 null이면 빈 객체를 사용하여 오류 방지
            const prevStructuredData = prevData.structuredContractDataDTO || {};

            let newValue: string | number | null = value;
            // deposit 필드는 숫자로 변환
            if (field === "deposit") {
                newValue = value ? Number(value) : null;
                // 숫자로 변환 실패 시 null 처리
                if (isNaN(Number(newValue))) {
                    newValue = null;
                }
            }

            return {
                ...prevData,
                structuredContractDataDTO: {
                    ...prevStructuredData,
                    [field]: newValue,
                } as StructuredContractDataDTO, // 타입 단언(type assertion)으로 컴파일러 오류 해결
            };
        });
    };

    const handleBackToUpload = () => {
        if (onBackToPreviousPhase) {
            onBackToPreviousPhase();
        } else {
            navigate("/pg100001");
        }
    };

    const handleProcessResult = () => {
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
                description="업로드하신 파일의 OCR 분석 결과입니다. 인식된 텍스트를 확인하고 필요한 경우 수정해주세요."
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
                <div className="an03-pane an03-ocr-text-pane">
                    <h3 className="an03-pane-title">OCR 분석 결과</h3>
                    <div className="an03-structured-data-form">
                        {Object.entries(contractFieldLabels).map(
                            ([fieldKey, label]) => {
                                const value =
                                    currentOcrData.structuredContractDataDTO?.[
                                        fieldKey as keyof StructuredContractDataDTO
                                    ];

                                return (
                                    <div
                                        key={fieldKey}
                                        className="an03-form-field"
                                    >
                                        <label htmlFor={fieldKey}>
                                            {label}
                                        </label>
                                        <input
                                            id={fieldKey}
                                            type="text"
                                            value={
                                                value != null
                                                    ? value.toString()
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                handleDataChange(
                                                    fieldKey as keyof StructuredContractDataDTO,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                );
                            }
                        )}
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
