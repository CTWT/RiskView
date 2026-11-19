// src/componets/ui/OcrProgressModal.tsx

import React from "react";
import Modal from "./Modal"; // 범용 Modal 컴포넌트 임포트
import ProgressBar from "./ProgressBar"; // 범용 ProgressBar 컴포넌트 임포트
import "../components.css";

/**
 * @file OcrProgressModal.tsx
 * @description ocr 파트에서 사용될 프로그래스바가 적용된 모달창 입니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : OcrProgressModal.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 모달 창에서 뒷배경을 흐리게 적용되는 모달창이 필요하여 따로 ocr파트에서만 사용될 모달창입니다.
 */

interface OcrScanProgressModalProps {
    isOpen: boolean;
    progress: number;
}

const OcrProgressModal: React.FC<OcrScanProgressModalProps> = ({
    isOpen,
    progress,
}) => {
    return (
        <Modal isOpen={isOpen}>
            <div className="ocr-scan-progress-modal-content">
                <h2 className="ocr-scan-title">OCR 스캔 진행 중</h2>
                <p className="ocr-scan-message">
                    선택하신 계약서 파일을 스캔하고 있습니다.
                </p>
                <ProgressBar progress={progress} message="스캔 중..." />
                {/* 추가적인 설명 텍스트나 아이콘 등을 여기에 배치할 수 있습니다. */}
            </div>
        </Modal>
    );
};

export default OcrProgressModal;
