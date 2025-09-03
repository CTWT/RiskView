// src/hooks/useToast.ts

import { useState, useCallback } from "react";

/**
 * @file useToast.ts
 * @description 토스트 메시지를 작동하기 위해 만든 커스텀 훅 입니다
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.30
 * 파일명 : useToast.css
 * 수정자 : 박윤성
 * 수정일 : 25.09.03
 * 설명 : 토스트 메시지를 위한 커스텀 훅 useToast
 */

export type ToastType = "success" | "error" | "info" | "warning";

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
