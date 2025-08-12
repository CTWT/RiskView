// src/pages/analysis/PG100003.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import "../../styles/common/common.css";
import contractFieldLabels from "../../contracts/contractFieldLabels";
import { useNaverMap } from "../../hooks/useNaverMap";
import axios from "axios";

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

// window.naver 타입 선언 (내부 전용)
declare global {
    interface Window {
        naver: {
            maps: {
                Map: new (
                    element: string | HTMLElement,
                    options: {
                        center: NaverLatLng;
                        zoom?: number;
                        [key: string]: unknown;
                    }
                ) => NaverMapInstance;
                LatLng: new (lat: number, lng: number) => NaverLatLng;
                Circle: new (options: {
                    map: NaverMapInstance;
                    center: NaverLatLng;
                    radius: number;
                    strokeColor: string;
                    strokeOpacity: number;
                    strokeWeight: number;
                    fillColor: string;
                    fillOpacity: number;
                }) => void;
            };
        };
    }

    interface NaverLatLng {
        lat(): number;
        lng(): number;
    }

    interface NaverMapInstance {
        setCenter(latlng: NaverLatLng): void;
    }
}

export interface OcrDataType {
    documentsDTO: DocumentsDTO | null;
    fileStorageMetadataDTO: FileStorageMetadataDTO | null;
    structuredContractDataDTO: StructuredContractDataDTO | null;
    mapInfo: MapInfo | null;
}

interface PG100003Props {
    scannedFile: string;
    ocrData: OcrDataType;
    uploadedFilePreview: string | null;
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
    const isMapLoaded = useNaverMap();

    const [currentOcrData, setCurrentOcrData] = useState<OcrDataType>(ocrData);
    const recognizedAddress =
        currentOcrData.structuredContractDataDTO?.location || "주소 인식 실패";

    const mapRef = useRef<NaverMapInstance | null>(null);

    useEffect(() => {
        if (!isMapLoaded) {
            console.warn("지도 API 아직 로딩 안됨");
            return;
        }

        if (!currentOcrData.mapInfo) {
            console.warn("mapInfo 없음");
            return;
        }

        const naverMap = window.naver?.maps;
        if (!naverMap) {
            console.error("Naver 지도 객체 없음!");
            return;
        }

        const mapContainer = document.getElementById("naverMap");
        if (!mapContainer || mapContainer.childNodes.length > 0) {
            console.warn("지도 이미 생성되어 있음 또는 컨테이너 없음");
            return;
        }

        const { x, y } = currentOcrData.mapInfo;
        if (!x || !y) return;

        const lat = parseFloat(y);
        const lng = parseFloat(x);

        console.log("지도 좌표 확인", { lat, lng });

        if (isNaN(lat) || isNaN(lng)) return;

        if (mapRef.current) {
            mapRef.current.setCenter(new window.naver.maps.LatLng(lat, lng));
            return;
        }

        const map = new naverMap.Map("naverMap", {
            center: new naverMap.LatLng(lat, lng),
            zoom: 15,
        });

        new naverMap.Circle({
            map,
            center: new naverMap.LatLng(lat, lng),
            radius: 1000,
            strokeColor: "#007bff",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#cce5ff",
            fillOpacity: 0.3,
        });
    }, [isMapLoaded, currentOcrData.mapInfo]);

    const handleDataChange = (
        field: keyof StructuredContractDataDTO,
        value: string
    ) => {
        setCurrentOcrData((prevData) => {
            const prevStructuredData =
                prevData.structuredContractDataDTO ??
                ({} as StructuredContractDataDTO);

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

    const handleBackToUpload = () => {
        if (onBackToPreviousPhase) {
            onBackToPreviousPhase();
        } else {
            navigate("/pg100001");
        }
    };

    // OCR 결과를 서버로 전송하는 함수
    const handleProcessResult = async () => {
        try {
            // currentOcrData는 유저가 수정한 계약 정보 전체 상태
            // 이 중에서 mapInfo는 제외하고 나머지만 payload로 따로 추출
            const {
                documentsDTO,
                fileStorageMetadataDTO,
                structuredContractDataDTO,
            } = currentOcrData;

            // 실제 서버에 보낼 데이터 객체 구성 (mapInfo는 뺌!)
            const payload = {
                documentsDTO,
                fileStorageMetadataDTO,
                structuredContractDataDTO,
            };

            // POST 요청으로 "/contracts" 주소에 데이터 전송
            // headers에 Content-Type을 명시해서 JSON 형식임을 알림
            const response = await axios.post("http://localhost:8080/contracts", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            // 요청이 성공하면 콘솔에 응답 로그 출력
            console.log("전송 성공", response.data);

            // 성공 메시지를 사용자에게 알림
            alert("계약 정보가 정상적으로 전송되었습니다.");

            // 외부로부터 onAnalysisComplete 함수가 전달된 경우 실행
            // 다음 단계로 넘어가는 처리를 할 수 있게 함
            if (onAnalysisComplete) {
                onAnalysisComplete(currentOcrData); // 수정된 상태 전체 전달
            }
        } catch (error) {
            // 요청 중 에러가 발생한 경우 콘솔에 오류 로그 출력
            console.error("전송 실패", error);

            // 사용자에게 오류 메시지 표시
            alert("서버 전송 중 오류가 발생했습니다.");
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
                            <p className="an03-file-name">
                                파일: {scannedFile}
                            </p>
                        </div>
                    )}
                </div>

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

            <div className="an03-map-section">
                <h3 className="an03-section-title">주변 시세 비교 구역</h3>
                <p className="an03-map-description">
                    OCR로 인식된 주소지 **{recognizedAddress}** 의 1km 반경 내
                    시세 비교 구역입니다.
                </p>
                <div className="an03-map-placeholder">
                    {isMapLoaded ? (
                        <div
                            id="naverMap"
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
