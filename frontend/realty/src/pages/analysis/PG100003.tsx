// src/pages/analysis/PG100003.tsx

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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 내부에서 다른 페이지로 이동할 경우 여전히 필요할 수 있음
import "../../styles/common/common.css"; // common.css 경로 확인

// ⭐ PG100001로부터 받을 props 인터페이스 정의 ⭐
interface PG100003Props {
  scannedFile: string; // 업로드된 파일 이름
  ocrData: string; // OCR로 인식된 텍스트
  uploadedFilePreview: string | null; // 원본 이미지 미리보기 URL
  onAnalysisComplete?: (result: string) => void; // (선택 사항) 다음 단계로 진행 시 부모에게 알리는 함수
  onBackToPreviousPhase?: () => void;
}

// ⭐ props를 구조 분해 할당으로 받도록 변경 ⭐
const PG100003: React.FC<PG100003Props> = ({
  scannedFile,
  ocrData,
  uploadedFilePreview,
  onAnalysisComplete,
  onBackToPreviousPhase,
}) => {
  const navigate = useNavigate();

  // ⭐ 상태 초기값을 props로 받은 값으로 설정 ⭐
  // 사용자가 텍스트를 수정할 수 있으므로, ocrData는 `useState`로 관리
  const [currentOcrText, setCurrentOcrText] = useState<string>(ocrData);
  // 파일 이름과 미리보기는 변경될 일이 없으므로 굳이 상태로 관리할 필요는 없지만, 일관성을 위해 유지
  const [currentScannedFileName] = useState<string>(scannedFile);
  const [currentUploadedFilePreview] = useState<string | null>(
    uploadedFilePreview
  );

  // OCR 결과에서 추출될 주소 정보 (더미 데이터)
  const [recognizedAddress, setRecognizedAddress] = useState<string | null>(
    null
  );

  // ⭐ useEffect에서 더 이상 useLocation.state를 사용하지 않고,
  // props로 받은 ocrData를 사용하여 주소 추출 로직을 실행합니다.
  useEffect(() => {
    // OCR 결과에서 주소 추출을 시뮬레이션
    const sampleAddressRegex =
      /(서울시|서울특별시|부산시|부산광역시|대구시|대구광역시|인천시|인천광역시|광주시|광주광역시|대전시|대전광역시|울산시|울산광역시|세종시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주도|제주특별자치도)\s+([가-힣\d\s,.-]+(길|로|읍|면|동|리)\s+\d+(-\d+)?)/;
    const match = ocrData.match(sampleAddressRegex); // ⭐ ocrData prop 사용
    if (match) {
      setRecognizedAddress(match[0]); // 매칭된 전체 주소 문자열 저장
    } else {
      setRecognizedAddress("주소 인식 실패 (샘플 주소가 없습니다)"); // 주소 인식 실패 시
    }
  }, [ocrData]); // ⭐ ocrData prop이 변경될 때만 이 효과가 실행되도록 의존성 추가

  const handleBackToUpload = () => {
    if (onBackToPreviousPhase) {
      onBackToPreviousPhase(); // ⭐ PG100001의 상태를 0으로 변경하도록 요청 ⭐
    } else {
      // fallback: 부모로부터 prop을 받지 못했을 경우의 처리 (SPA 이점 상실)
      navigate("/pg100001"); // navigate를 통한 라우팅 (PG100001 컴포넌트의 초기 상태를 가정)
    }
  };

  const handleProcessResult = () => {
    // '다음 단계로 진행' 버튼 클릭 시, 부모 컴포넌트(PG100001)에 완료를 알리고
    // 현재 수정된 텍스트(`currentOcrText`)를 전달
    if (onAnalysisComplete) {
      onAnalysisComplete(currentOcrText); // 수정된 텍스트를 부모로 전달
    } else {
      alert("OCR 결과 처리 (다음 단계로 이동) 로직 구현 예정");
      // 이 부분은 이제 PG100001이 analysisPhase를 2로 변경하여 PG100004를 렌더링하도록 합니다.
      // navigate('/pg100004'); // 이 부분은 이제 필요 없음
    }
  };

  return (
    <div className="an03-container">
      <div className="an03-header">
        <h2 className="an02-subtitle">계약 분석 결과</h2>
        <h1 className="an02-title">OCR 분석 결과 확인</h1>
        <p className="an02-description">
          업로드하신 파일의 OCR 분석 결과입니다. 인식된 텍스트를 확인하고 필요한
          경우 수정해주세요.
        </p>
      </div>

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
                <p className="an03-file-name">파일: {currentScannedFileName}</p>
              )}
            </div>
          )}
        </div>

        {/* 오른쪽: OCR 인식 텍스트 */}
        <div className="an03-pane an03-ocr-text-pane">
          <h3 className="an03-pane-title">OCR 인식 텍스트</h3>
          <textarea
            className="an03-ocr-textarea"
            value={currentOcrText}
            onChange={(e) => setCurrentOcrText(e.target.value)}
            placeholder="OCR 결과 텍스트가 여기에 표시됩니다."
          />
          <p className="an03-edit-guide">
            *인식된 텍스트는 수정할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 지도 API 구역 */}
      <div className="an03-map-section">
        <h3 className="an03-section-title">주변 시세 비교 구역</h3>
        <p className="an03-map-description">
          OCR로 인식된 주소지 **{recognizedAddress || "[주소 인식 중...]"}** 의
          1km 반경 내 시세 비교 구역입니다. (지도 API는 추후 연동 예정입니다.)
        </p>
        <div className="an03-map-placeholder">
          <div className="an03-map-dummy">
            <p>지도 API가 표시될 공간</p>
            <p>1km 반경 구역이 여기에 시각화됩니다.</p>
          </div>
        </div>
      </div>

      <div className="an03-actions">
        <button className="an02-secondary-btn" onClick={handleBackToUpload}>
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
