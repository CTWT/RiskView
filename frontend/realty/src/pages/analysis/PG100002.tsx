// src/pages/analysis/PG100002.tsx

import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import "../../styles/common/common.css";
import useToast from "../../hooks/useToast"; // useToast 훅 임포트
import Toast from "../../components/ui/Toast"; // Toast 컴포넌트 임포트
import OcrProgressModal from "../../components/ui/OcrProgressModal"; // OCR 진행 모달 컴포넌트 임포트 (이름 변경 반영)
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";
import PageContainer from "../../components/layout/PageContainer";

import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

import type {
    DocumentsDTO,
    FileStorageMetadataDTO,
    StructuredContractDataDTO,
    MapInfo,
} from "../../types/contract";

/**
 * @file PG100002.tsx
 * @description 계약서 분석 전 단계 (문서 업로드 및 촬영)를 담당하는 컴포넌트입니다.
 * 이 파일은 사용자가 계약서 파일을 업로드하거나 촬영할 수 있는 UI를 제공하고,
 * 분석 시작을 위한 데이터를 백단으로 넘기는 역할을 합니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.29
 * 파일명 : PG100002.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 계약서 분석을 시작하기 전, 문서 업로드 및 준비 과정등을 담당하는 페이지입니다.
 */

// PG100001로부터 받을 props 정의
interface PG100002Props {
    onStartAnalysis: (data: {
        ocrData: {
            documentsDTO: DocumentsDTO | null;
            fileStorageMetadataDTO: FileStorageMetadataDTO | null;
            structuredContractDataDTO: StructuredContractDataDTO | null;
            mapInfo: MapInfo | null;
        };
        uploadedFilePreview: string | null;
        scannedFile: string;
    }) => void;
}

const PG100002: React.FC<PG100002Props> = ({ onStartAnalysis }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null); // 업로드 이미지 미리보기 URL
    const [isUploading, setIsUploading] = useState(false); // 파일 업로드 및 OCR 스캔 진행 중 상태
    const fileInputRef = useRef<HTMLInputElement>(null); // 숨겨진 파일 input 참조
    const [isDragOver, setIsDragOver] = useState(false); // 드래그 오버 상태 (스타일 변경용)

    // useToast 훅 사용
    const { toast, showToast } = useToast();

    // OCR 진행 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태
    const [progress, setProgress] = useState(0); // 프로그레스 바 진행률 (0-100)

    // PDF 파일을 이미지로 렌더링하는 비동기 함수
    const renderPdfToImage = useCallback(
        async (file: File): Promise<string> => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    if (!arrayBuffer) {
                        reject("PDF 파일을 읽을 수 없습니다.");
                        return;
                    }
                    try {
                        const loadingTask = pdfjs.getDocument(arrayBuffer);
                        const pdf = await loadingTask.promise;
                        const page = await pdf.getPage(1);
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement("canvas");
                        const canvasContext = canvas.getContext("2d");

                        if (canvasContext) {
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            // ⭐ 수정된 부분: canvas 속성 추가 ⭐
                            await page.render({
                                canvasContext,
                                viewport,
                                canvas,
                            }).promise;

                            resolve(canvas.toDataURL("image/png"));
                        } else {
                            reject("Canvas Context를 가져올 수 없습니다.");
                        }
                    } catch (error) {
                        reject(`PDF 렌더링 오류: ${error}`);
                    }
                };
                reader.onerror = (error) => reject(`파일 읽기 오류: ${error}`);
                reader.readAsArrayBuffer(file);
            });
        },
        []
    );

    // 파일 유효성 검사 및 설정 함수
    const processFile = useCallback(
        async (file: File) => {
            // ⭐ [수정된 부분] 파일 유효성 검사 후 미리보기 생성 로직 분리 ⭐
            const acceptedTypes = [
                "application/pdf",
                "image/png",
                "image/jpeg",
                "image/jpg",
            ];

            if (!acceptedTypes.includes(file.type)) {
                setSelectedFile(null);
                setPreviewImage(null);
                showToast(
                    "지원되지 않는 파일 형식입니다. PNG, JPG, PDF 파일만 업로드 가능합니다.",
                    { type: "error", duration: 4000 }
                );
                return;
            }

            setSelectedFile(file);
            showToast(`파일이 성공적으로 선택되었습니다: ${file.name}`, {
                type: "success",
            });

            // 파일 타입에 따라 미리보기 생성
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else if (file.type === "application/pdf") {
                try {
                    const pdfPreview = await renderPdfToImage(file);
                    setPreviewImage(pdfPreview);
                } catch (error) {
                    console.error("PDF 미리보기 생성 실패:", error);
                    setPreviewImage(null);
                    showToast("PDF 미리보기 생성에 실패했습니다.", {
                        type: "error",
                    });
                }
            }
        },
        [showToast, renderPdfToImage]
    );

    // 파일 선택 input 변경 핸들러
    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files.length > 0) {
                processFile(event.target.files[0]);
            } else {
                setSelectedFile(null);
                setPreviewImage(null); // 파일 선택 취소 시 미리보기 제거
            }
        },
        [processFile]
    );

    // 드래그 오버 핸들러
    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault(); // 기본 동작(브라우저에서 파일 열기) 방지
            setIsDragOver(true); // 드래그 오버 상태로 변경하여 CSS 스타일 적용
        },
        []
    );

    // 드래그 리브 핸들러
    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false); // 드래그 오버 상태 해제
        },
        []
    );

    // 드롭 핸들러
    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault(); // 기본 동작 방지
            setIsDragOver(false); // 드래그 오버 상태 해제
            if (
                event.dataTransfer.files &&
                event.dataTransfer.files.length > 0
            ) {
                processFile(event.dataTransfer.files[0]); // 드롭된 파일 처리
            } else {
                setSelectedFile(null); // 파일 선택 상태 초기화
                showToast("파일을 드롭하지 못했습니다.", { type: "error" }); // 토스트 메시지
                setPreviewImage(null); // 미리보기 이미지 제거 (실패 시)
            }
        },
        [processFile, showToast]
    );

    // 드래그 영역 또는 이미지 클릭 시 실제 파일 인풋 트리거
    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click(); // ref를 통해 숨겨진 input을 클릭
    }, []);

    // "AI 분석 시작하기" 버튼 클릭 핸들러
    const handleAnalyzeClick = useCallback(async () => {
        if (selectedFile) {
            setIsModalOpen(true);
            setProgress(0);
            setIsUploading(true);
            showToast("계약서 파일 업로드 및 AI 분석 요청 중...", {
                type: "info",
                duration: 4000,
            });

            const formData = new FormData();
            formData.append("file", selectedFile);

            try {
                // progress 이벤트 추적을 위해 axios 옵션에 onUploadProgress를 추가할 수 있지만,
                // 여기서는 단순화하여 요청이 시작되면 모달을 열고, 완료되면 닫는 방식으로 구현.
                const response = await axios.post(
                    `http://localhost:8080/upload`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        withCredentials: true,
                    }
                );

                // 요청 성공 시
                // ⭐ 이 부분을 수정해야 합니다.
                // 백엔드 응답이 HTML 템플릿의 데이터 구조와 동일한 객체라고 가정합니다.
                const backendOcrResult = response.data; // ContractResponse 객체
                const contractInfo = backendOcrResult.contractInfo ?? {
                    documentsDTO: null,
                    fileStorageMetadataDTO: null,
                    structuredContractDataDTO: null,
                };
                const mapInfo = backendOcrResult.mapInfo ?? null;

                const ocrDataPayload = {
                    ...contractInfo,
                    mapInfo,
                };

                // OCR 완료 시 모달 및 상태 업데이트
                setProgress(100);
                setIsUploading(false);
                setIsModalOpen(false);

                showToast("OCR 스캔 완료! 다음 단계로 이동합니다.", {
                    type: "success",
                });

                // 부모 컴포넌트로 OCR 결과와 파일 정보 전달
                // ⭐ ocrResult 키 대신 ocrData 키를 사용하고 객체를 전달합니다.
                onStartAnalysis({
                    ocrData: ocrDataPayload,
                    uploadedFilePreview: previewImage,
                    scannedFile: selectedFile.name,
                });
            } catch (error) {
                // 요청 실패 시
                if (axios.isAxiosError(error) && error.response) {
                    console.error("서버 응답:", error.response.data);
                    showToast(
                        `서버 오류: ${error.response.status} - ${
                            error.response.data.message || "알 수 없는 오류"
                        }`,
                        { type: "error" }
                    );
                } else {
                    showToast("네트워크 오류 또는 서버가 응답하지 않습니다.", {
                        type: "error",
                    });
                }
            }
        } else {
            showToast("분석할 계약서 파일을 먼저 선택해주세요.", {
                type: "error",
            });
        }
    }, [selectedFile, previewImage, onStartAnalysis, showToast]);

    const cancelUpload = useCallback(() => {
        setPreviewImage(null);
    }, []);

    return (
        <PageContainer showBreadcrumb={true} centerContent={true}>
        <div className="an02-container">
            <CommonContainerHeader
                subtitle="계약 분석"
                title="계약서 분석"
                description="부동산 계약서를 업로드하여 자동으로 내용을 분석해보세요"
            />

            <div
                className={`an02-upload-area ${
                    isDragOver ? "an02-drag-over" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
            >
                {/* 미리보기 이미지가 있으면 미리보기 이미지를, 없으면 기본 아이콘(인라인 SVG) 표시 */}
                {previewImage ? (
                    <img
                        src={previewImage}
                        alt="업로드된 이미지 미리보기"
                        className="an02-uploaded-preview-image"
                    />
                ) : (
                    <div className="an02-upload-placeholder-icon">
                    <svg
                        width="128"
                        height="128"
                        viewBox="0 0 140 128"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect x="8" y="24" width="112" height="72" rx="10" fill="url(#grad1)" />
                        <path d="M16 84L40 44L64 84L88 44L112 68" stroke="white" strokeWidth="6" />
                        <path
                        d="M112 0H122V10H132V20H122V30H112V20H102V10H112V0Z"
                        fill="url(#grad1)"
                        />
                        <defs>
                        <linearGradient id="grad1" x1="8" y1="24" x2="120" y2="96" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#c4e5fb"/>
                            <stop offset="1" stopColor="#c3b5fb"/>
                        </linearGradient>
                        </defs>
                    </svg>
                    <p className="an02-upload-placeholder-text">
                        계약서 또는 등기부등본 파일을 드래그하거나 클릭하여 업로드하세요<br />
                        PNG, JPG, PDF 파일
                    </p>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                />
            </div>

            <button
                className="an02-ai-analyze-start-btn"
                onClick={handleAnalyzeClick}
                disabled={!selectedFile || isUploading || isModalOpen || !previewImage}
            >
                {isUploading ? "OCR 스캔 중..." : "AI 분석 시작하기"}
            </button>

            <button
                className="an02-ai-analyze-start-btn"
                onClick={cancelUpload}
                disabled={!selectedFile || isUploading || isModalOpen || !previewImage}
            >
                업로드 취소하기
            </button>

            {/* OCR 스캔 진행 모달 컴포넌트 사용 */}
            <OcrProgressModal isOpen={isModalOpen} progress={progress} />

            {/* 토스트 컴포넌트 */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
            />
            </div>
            </PageContainer>
    );
};

export default PG100002;
