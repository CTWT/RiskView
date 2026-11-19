// src/componets/ui/Modal.tsx

import React from "react";
import "../components.css";

/**
 * @file Modal.tsx
 * @description 가장 상위 모달 창 생성에 관련된 파일 입니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : Modal.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 모달 창을 총괄하는 파일 입니다.
 */

interface ModalProps {
    isOpen: boolean;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">{children}</div>
        </div>
    );
};

export default Modal;
