// src/components/ui/Toast.tsx

import React from "react";
import "../components.css";
import type { ToastType } from "../../hooks/useToast"; // ⭐ 정확한 경로로 ToastType 임포트

/**
 * @file Toast.tsx
 * @description 토스트 메시지(잠깐 나왔다 사라지는 메시지)를 위해 위치를 지정해둔 파일 입니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : Toast.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 각 페이지에서 사용될 컴포넌트 중 하나인 토스트 메시지에 관련된 파일 입니다.
 */

interface ToastProps {
    message: string;
    type: ToastType; // 정의된 ToastType 사용
    isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className={`toast-container toast-${type}`}>
            <div className="toast-message">{message}</div>
        </div>
    );
};

export default Toast;
