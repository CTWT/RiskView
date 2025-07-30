// src/pages/analysis/PG100002.tsx

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
import React, { useState, useRef, useCallback } from "react";
import "../../styles/common/common.css";
import uploadIconImage from "../../assets/images/upload-img.png"; // 기본 업로드 아이콘 이미지 경로 확인
import useToast from "../../hooks/useToast"; // useToast 훅 임포트
import Toast from "../../components/Toast"; // Toast 컴포넌트 임포트
import OcrProgressModal from "../../components/OcrProgressModal"; // OCR 진행 모달 컴포넌트 임포트 (이름 변경 반영)

// PG100001로부터 받을 props 정의
interface PG100002Props {
  onStartAnalysis: (data: {
    ocrResult: string;
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

  // 파일 유효성 검사 및 설정 함수
  const processFile = useCallback(
    (file: File) => {
      // PNG, JPG, PDF 파일만 허용
      const acceptedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (acceptedTypes.includes(file.type)) {
        setSelectedFile(file);
        showToast(`파일이 성공적으로 선택되었습니다: ${file.name}`, {
          type: "success",
        });

        // 이미지 파일인 경우 미리보기 URL 생성
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result as string); // 파일을 Data URL로 읽어 미리보기 URL 설정
          };
          reader.readAsDataURL(file); // 파일을 Data URL 형식으로 읽기 시작
        } else {
          setPreviewImage(null); // 이미지 파일이 아니면 미리보기 제거
        }
        return true;
      } else {
        setSelectedFile(null);
        showToast(
          "지원되지 않는 파일 형식입니다. PNG, JPG, PDF 파일만 업로드 가능합니다.",
          { type: "error", duration: 4000 }
        );
        setPreviewImage(null); // 실패 시 미리보기 제거
        return false;
      }
    },
    [showToast]
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
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
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
      setIsModalOpen(true); // 모달 열기
      setProgress(0); // 프로그레스 바 초기화
      setIsUploading(true);
      showToast("계약서 파일 업로드 및 OCR 스캔 요청 중...", {
        type: "info",
        duration: 4000,
      });

      // ⭐ 실제 fetch 요청 대신 시뮬레이션된 비동기 처리 ⭐
      // job_id는 실제로는 백엔드에서 받아오지만, 여기서는 임의로 생성하거나 필요 없음

      // OCR 진행 시뮬레이션 (프로그레스 바 업데이트)
      let currentProgress = 0;
      const simulationInterval = setInterval(() => {
        currentProgress += 5; // 5%씩 증가
        if (currentProgress <= 100) {
          setProgress(currentProgress);
        } else {
          clearInterval(simulationInterval);
        }
      }, 100); // 0.1초마다 5% 증가 (총 2초)

      // OCR 완료 시뮬레이션 (2초 후)
      setTimeout(() => {
        clearInterval(simulationInterval); // 확실히 인터벌 종료
        setProgress(100); // 최종 100% 설정
        setIsUploading(false);
        setIsModalOpen(false); // 모달 닫기

        showToast("OCR 스캔 완료! 다음 단계로 이동합니다.", {
          type: "success",
        });

        // ⭐ 임시 OCR 결과 텍스트 (더미 데이터)
        const dummyOcrResult = `
        서울특별시 강남구 테헤란로 123
        (역삼동, 테헤란빌딩) 5층

        매매 계약서
        매도인: 김철수 (주민등록번호: 123456-1234567)
        매수인: 이영희 (주민등록번호: 765432-7654321)

        제1조 (목적) 본 계약은 매도인이 소유한 부동산의 매매에 관한 사항을 정함을 목적으로 한다.
        제2조 (부동산의 표시)
        소재지: 서울특별시 강남구 역삼동 123-456
        토지: 대 100㎡
        건물: 철근콘크리트조 단독주택 80㎡ (1층 40㎡, 2층 40㎡)
        제3조 (매매대금) 총 매매대금은 일금 오억원정 (500,000,000원)으로 하며, 다음과 같이 지불한다.
        계약금: 50,000,000원 (본 계약 체결 시 지불)
        중도금: 200,000,000원 (2025년 8월 15일 지불)
        잔금: 250,000,000원 (2025년 9월 30일 지불, 소유권 이전 등기 시)

        특약사항
        1. 현 시설 상태에서의 계약이며, 별도의 시설물 인수인계 목록은 작성하지 않는다.
        2. 잔금일은 상호 협의 하에 조정 가능하다.
        3. 등기부등본상 제3자 권리사항은 잔금일까지 매도인이 모두 말소한다.
      `.trim(); // 앞뒤 공백 제거

        onStartAnalysis({
          ocrResult: dummyOcrResult, // 더미 OCR 결과 전달
          uploadedFilePreview: previewImage,
          scannedFile: selectedFile.name,
        });
      }, 2000); // 2초 후에 완료 및 다음 단계로 이동
    } else {
      showToast("분석할 계약서 파일을 먼저 선택해주세요.", { type: "error" });
    }
  }, [selectedFile, previewImage, onStartAnalysis, showToast]);

  return (
    <div className="an02-container">
      <div className="an02-header">
        <h2 className="an02-subtitle">계약 분석</h2>
        <h1 className="an02-title">계약서 분석</h1>
        <p className="an02-description">
          부동산 계약서를 업로드하여 자동으로 내용을 분석해보세요
        </p>
      </div>

      <div
        className={`an02-upload-area ${isDragOver ? "an02-drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {/* 미리보기 이미지가 있으면 미리보기 이미지를, 없으면 기본 아이콘을 표시 */}
        {previewImage ? (
          <img
            src={previewImage}
            alt="업로드된 이미지 미리보기"
            className="an02-uploaded-preview-image"
          />
        ) : (
          <img
            src={uploadIconImage}
            alt="파일 업로드 아이콘"
            className="an02-upload-image-icon"
          />
        )}

        {/* PDF 파일일 경우, 파일 아이콘이나 텍스트로 미리보기 대체 (선택 사항) */}
        {selectedFile &&
          !previewImage &&
          selectedFile.type === "application/pdf" && (
            <p className="an02-pdf-placeholder">PDF 파일이 선택되었습니다</p>
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
        disabled={!selectedFile || isUploading || isModalOpen}
      >
        {isUploading ? "OCR 스캔 중..." : "AI 분석 시작하기"}
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
  );
};

export default PG100002;
