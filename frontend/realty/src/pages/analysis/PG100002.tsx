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

import React, { useState, useRef } from "react";
import "../../styles/common/common.css"; // 공통 스타일 임포트

interface PG100002Props {
  onStartAnalysis: (contractData: File) => void; // 파일 객체를 넘기도록 명확화
}

const PG100002: React.FC<PG100002Props> = ({ onStartAnalysis }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // 업로드 중 상태
  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 인풋 참조
  const [isDragOver, setIsDragOver] = useState(false); // 드래그 오버 상태

  // 파일 선택 핸들러 (input[type="file"] 변경 시)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // 기본 동작(새 탭에서 파일 열기) 방지
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      // 파일 타입 검사 (이미지에서 PNG, JPG, PDF 파일만 허용한다고 되어있음)
      const acceptedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      if (acceptedTypes.includes(droppedFile.type)) {
        setSelectedFile(droppedFile);
      } else {
        alert(
          "지원되지 않는 파일 형식입니다. PNG, JPG, PDF 파일만 업로드 가능합니다."
        );
        setSelectedFile(null);
      }
    }
  };

  // "AI 분석 시작하기" 버튼 클릭 핸들러
  const handleAnalyzeClick = () => {
    if (selectedFile) {
      setIsUploading(true); // 분석 시작 = 파일 업로드 및 처리 시작으로 간주
      console.log("AI 분석 시작 (파일:", selectedFile.name, ")");

      // 실제로는 여기에 서버로 파일을 전송하는 API 호출 로직이 들어갑니다.
      // 예: const formData = new FormData(); formData.append('file', selectedFile);
      //     axios.post('/upload-and-analyze', formData).then(response => { ... })

      // 시뮬레이션: 1초 후 파일 처리 완료 및 PG100001에 데이터 전달, PG100003으로 이동
      setTimeout(() => {
        setIsUploading(false);
        onStartAnalysis(selectedFile); // 선택된 파일 객체를 상위로 전달
      }, 1000); // 1초 후 완료
    } else {
      alert("분석할 계약서 파일을 먼저 드래그하거나 클릭하여 선택해주세요.");
    }
  };

  // 드래그 영역 클릭 시 실제 파일 인풋 트리거
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="an02-header">
        <p>
          <br />
        </p>
        <h2 className="an02-subtitle">계약 분석</h2>
        <h1 className="an02-title">계약서 분석</h1>
        <p className="an02-description">
          부동산 계약서를 업로드하여 자동으로 내용을 분석해보세요
        </p>
      </div>

      <div className="an02-container">
        <div
          className={`an02-upload-area ${isDragOver ? "an02-drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput} // 클릭 시 파일 선택창 열기
        >
          <span className="an02-anupload-icon">
            {/* 이미지에 있는 아이콘과 유사하게 */}
            {/* SVG 또는 이미지로 교체할 수 있습니다. 여기서는 임시 텍스트 아이콘 */}
            🖼️➕
          </span>
          <p className="an02-upload-guide-text">
            계약서 또는 등기부등본 파일을 드래그하거나 클릭하여 업로드하세요
          </p>
          <p className="an02-upload-file-types">PNG, JPG, PDF 파일</p>
          {selectedFile && (
            <p className="an02-selected-file-name">
              선택된 파일: {selectedFile.name}
            </p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: "none" }} // 실제 파일 인풋은 숨김
          />
        </div>

        <button
          className="an02-ai-analyze-start-btn"
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "AI 분석 준비 중..." : "AI 분석 시작하기"}
        </button>

        <p className="an02-security-notice">
          <br />
          ⚠️ 업로드된 모든 문서는 안전하게 처리되며, 분석 목적으로만 사용됩니다.
        </p>
      </div>
    </>
  );
};

export default PG100002;
