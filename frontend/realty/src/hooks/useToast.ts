// src/hooks/useToast.ts (수정)

import { useState, useCallback /*, useEffect */ } from "react"; // useEffect 제거

export type ToastType = "success" | "error" | "info";

interface ToastOptions {
  duration?: number;
  type?: ToastType;
}

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    setToast({
      message,
      type: options?.type || "info",
      isVisible: true,
    });

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, options?.duration || 3500);

    return () => clearTimeout(timer);
  }, []); // 의존성 배열에 아무것도 없으므로 함수는 한 번만 생성됩니다.

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};

export default useToast;
