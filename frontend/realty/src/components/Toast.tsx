// src/components/Toast.tsx (수정)

import React from "react";
import "./components.css";
import type { ToastType } from "../hooks/useToast"; // ⭐ 정확한 경로로 ToastType 임포트

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
