// src/pages/analysis/PG100003.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import "../../styles/common/common.css";
import contractFieldLabels from "../../contracts/contractFieldLabels";
import { useKakaoMap } from "../../hooks/useKakaoMap";

import type {
    DocumentsDTO,
    FileStorageMetadataDTO,
    StructuredContractDataDTO,
    MapInfo,
} from "../../types/contract";

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : PG100003.tsx
 * 수정자 : 김관호
 * 수정일 : 25.08.13
 * 설명 : 계약서 분석 중 OCR 추출한 이후 사용자가 보고 AI 추출을 하기 전 검증하는 페이지 입니다
 */

// OCR 데이터 구조 정의
export interface OcrDataType {
    documentsDTO: DocumentsDTO | null; // 문서 정보
    fileStorageMetadataDTO: FileStorageMetadataDTO | null; // 파일 메타데이터
    structuredContractDataDTO: StructuredContractDataDTO | null; // 구조화된 계약 데이터
    mapInfo: MapInfo | null; // 지도 좌표 정보
}

interface PG100003Props {
    scannedFile: string; // 업로드된 파일명
    ocrData: OcrDataType; // OCR 분석 결과 데이터
    uploadedFilePreview: string | null; // 파일 미리보기 이미지 URL
    onAnalysisComplete?: (result: OcrDataType) => void; // 분석 완료 콜백
    onBackToPreviousPhase?: () => void; // 이전 단계로 돌아가는 콜백
}

const PG100003: React.FC<PG100003Props> = ({
    scannedFile,
    ocrData,
    uploadedFilePreview,
    onAnalysisComplete,
    onBackToPreviousPhase,
}) => {
    const navigate = useNavigate();

    // Kakao Map API 로딩 여부
    const isMapLoaded = useKakaoMap();

    // 현재 OCR 데이터 상태
    const [currentOcrData, setCurrentOcrData] = useState<OcrDataType>(ocrData);

    // 주소(위치) 인식 값
    const recognizedAddress =
        currentOcrData.structuredContractDataDTO?.location || "주소 인식 실패";

    // Kakao 지도 객체를 저장할 ref
    const mapRef = useRef<kakao.maps.Map | null>(null);

    const dateFields = ["middlePaymentDate", "balanceDate", "rentDate","leasePeriodStart","leasePeriodEnd", "contractDate"];

    /**
     * Kakao 지도 초기화 useEffect
     * - API 로드 완료 & mapInfo 존재 시 지도 생성
     */
    useEffect(() => {
        if (!isMapLoaded) {
            console.warn("지도 API 아직 로딩 안됨");
            return;
        }

        if (!currentOcrData.mapInfo) {
            console.warn("mapInfo 없음");
            return;
        }

        const kakaoMaps = window.kakao?.maps;
        if (!kakaoMaps) {
            console.error("Kakao 지도 객체 없음!");
            return;
        }

        // 지도 컨테이너 DOM 요소
        const mapContainer = document.getElementById("kakaoMap");
        if (!mapContainer || mapContainer.childNodes.length > 0) {
            console.warn("지도 이미 생성되어 있음 또는 컨테이너 없음");
            return;
        }

        // 좌표 추출 (x=경도, y=위도)
        const { x, y } = currentOcrData.mapInfo;
        if (!x || !y) return;

        const lat = parseFloat(y);
        const lng = parseFloat(x);

        console.log("지도 좌표 확인", { lat, lng });

        if (isNaN(lat) || isNaN(lng)) return;

        // 이미 지도 객체가 있으면 중심좌표만 업데이트
        if (mapRef.current) {
            mapRef.current.setCenter(new kakaoMaps.LatLng(lat, lng));
            return;
        }

        // 지도 생성
        const map = new kakaoMaps.Map(mapContainer, {
            center: new kakaoMaps.LatLng(lat, lng),
            level: 3,
        });

        // 반경 1km 원 표시
        new kakaoMaps.Circle({
            map,
            center: new kakaoMaps.LatLng(lat, lng),
            radius: 1000,
            strokeColor: "#007bff",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#cce5ff",
            fillOpacity: 0.3,
        });

        // ref에 저장
        mapRef.current = map;
    }, [isMapLoaded, currentOcrData.mapInfo]);

    /**
     * OCR 데이터 수정 시 상태 업데이트
     * - deposit(보증금) 필드는 숫자로 변환
     */
    const handleDataChange = (
        field: keyof StructuredContractDataDTO,
        value: string
    ) => {
        setCurrentOcrData((prevData) => {
            const prevStructuredData =
                prevData.structuredContractDataDTO ?? {} as StructuredContractDataDTO;

            let newValue: string | number | null = value;

            if (field === "deposit") {
                newValue = value ? Number(value) : null;
                if (isNaN(Number(newValue))) {
                    newValue = null;
                }
            }

            return {
                ...prevData,
                structuredContractDataDTO: {
                    ...prevStructuredData,
                    [field]: newValue,
                },
            };
        });
    };

    /**
     * 업로드 단계로 돌아가기
     */
    const handleBackToUpload = () => {
        if (onBackToPreviousPhase) {
            onBackToPreviousPhase();
        } else {
            navigate("/pg100001");
        }
    };

    /**
     * 분석 결과 서버 전송
     */
    const handleProcessResult = async () => {
        try {
            if (onAnalysisComplete) {
                 onAnalysisComplete(currentOcrData); // ocr 데이터 전달
            }

        } catch (error) {
            console.error("전송 실패", error);
            alert("서버 전송 중 오류가 발생했습니다.");
        }
    };

    return (
    <div className="an03-container">
        {/* 페이지 상단 헤더 */}
        <CommonContainerHeader
        subtitle="계약 분석 결과"
        title="OCR 분석 결과 확인"
        description="업로드하신 파일의 OCR 분석 결과입니다. 인식된 텍스트를 확인하고 필요한 경우 수정해주세요."
        />

        {/* 원본 파일 & OCR 결과 */}
        <div className="an03-content-wrapper">
          {/* 왼쪽: 업로드 파일 미리보기 */}
        <div className="an03-pane an03-original-file-pane">
            <h3 className="an03-pane-title">원본 파일</h3>
            {uploadedFilePreview ? (
            <img
                src={uploadedFilePreview}
                alt="업로드된 이미지"
                className="an03-uploaded-image-preview"
            />
            ) : (
            <div className="an03-no-preview">
                <span className="an03-file-icon">📄</span>
                <p>미리보기를 지원하지 않는 파일 형식입니다.</p>
                <p className="an03-file-name">파일: {scannedFile}</p>
            </div>
            )}
        </div>

        <div className="an03-pane an03-ocr-text-pane">
            <h3 className="an03-pane-title">OCR 분석 결과</h3>
            <div className="an03-structured-data-form">
                {Object.entries(contractFieldLabels).map(([fieldKey, label]) => {
                    const value =
                        currentOcrData.structuredContractDataDTO?.[
                        fieldKey as keyof StructuredContractDataDTO
                        ];

                    if (fieldKey === "leaseType") {
                        return (
                            <div key={fieldKey} className="an03-form-field">
                                <label>{label}</label>
                                <select
                                    value={value as string}
                                    onChange={(e) =>
                                        setCurrentOcrData((prev) => {
                                            const prevStructuredData =
                                                prev.structuredContractDataDTO || {} as StructuredContractDataDTO;
                                            return {
                                                ...prev,
                                                structuredContractDataDTO: {
                                                    ...prevStructuredData,
                                                    [fieldKey]: e.target.value,
                                                },
                                            };
                                        })
                                    }
                                >
                                    <option value="">선택</option>
                                    <option value="JEONSE">전세</option>
                                    <option value="MONTHLY">월세</option>
                                </select>
                            </div>
                        );
                    } else if (fieldKey === "downPaymentSigned") {
                        return (
                            <div key={fieldKey} className="an03-form-field">
                                <label>{label}</label>
                                <select
                                    value={value ? "true" : "false"}
                                    onChange={(e) =>
                                        setCurrentOcrData((prev) => {
                                            const prevStructuredData =
                                                prev.structuredContractDataDTO || {} as StructuredContractDataDTO;
                                            return {
                                                ...prev,
                                                structuredContractDataDTO: {
                                                    ...prevStructuredData,
                                                    [fieldKey]: e.target.value === "true", // string을 boolean으로 변환
                                                },
                                            };
                                        })
                                    }
                                >
                                    <option value="true">예</option>
                                    <option value="false">아니오</option>
                                </select>
                            </div>
                        );
                    } else if (dateFields.includes(fieldKey)) { // 👈 이 부분을 추가하여 dateFields 배열 사용
                        // value가 string인지, 아니면 Date 객체인지 확인하고 포맷팅합니다.
                        const formattedDate = value && typeof value === 'string'
                            ? value.split('T')[0]
                            : '';

                        return (
                            <div key={fieldKey} className="an03-form-field">
                                <label htmlFor={fieldKey}>{label}</label>
                                <input
                                    id={fieldKey}
                                    type="date" // 👈 input 타입을 date로 변경
                                    value={formattedDate}
                                    onChange={(e) =>
                                        handleDataChange(
                                            fieldKey as keyof StructuredContractDataDTO,
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        );
                    } else {
                        // 나머지 필드 input 처리
                        return (
                            <div key={fieldKey} className="an03-form-field">
                                <label htmlFor={fieldKey}>{label}</label>
                                <input
                                    id={fieldKey}
                                    type="text"
                                    value={value != null ? value.toString() : ""}
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
                })}
            </div>
        </div>
        </div>

        {/* Kakao 지도 섹션 */}
        <div className="an03-map-section">
        <h3 className="an03-section-title">주변 시세 비교 구역</h3>
        <p className="an03-map-description">
            OCR로 인식된 주소지 **{recognizedAddress}** 의 1km 반경 내 시세 비교
            구역입니다.
        </p>
        <div className="an03-map-placeholder">
            {isMapLoaded ? (
            <div
                id="kakaoMap"
                style={{
                width: "100%",
                height: "100%",
                borderRadius: "4px",
                }}
            />
            ) : (
            <div className="an03-map-dummy">
                <p>지도를 불러오는 중...</p>
            </div>
            )}
        </div>

        
        </div>
        {/* 하단 버튼 */}
        <div className="an03-actions">
            <button
                className="an02-ai-analyze-start-btn"
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