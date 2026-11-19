import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.27
 * 파일명 : ErrorBoundary.tsx
 * 설명 : 자식 컴포넌트 트리에서 발생하는 에러를 처리하고 대체 UI를 보여주는 컴포넌트
 */

interface Props {
    children: ReactNode;
    fallback: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * @class ErrorBoundary
 * @description 자식 컴포넌트 트리에서 발생하는 에러를 처리하고 대체 UI를 보여주는 컴포넌트
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    /**
     * 에러가 발생했을 때 호출되며, state를 업데이트하여 대체 UI를 렌더링하도록 합니다.
     * @param {Error} error - 발생한 에러 객체
     * @returns {State} - 업데이트할 state
     */
    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    /**
     * 에러가 발생했을 때 호출되며, 에러 로깅 등의 부수 효과를 처리합니다.
     * @param {Error} error - 발생한 에러 객체
     * @param {ErrorInfo} errorInfo - 에러에 대한 추가 정보 (컴포넌트 스택 등)
     */
    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 에러 리포팅 서비스에 에러를 기록할 수 있습니다. (e.g., Sentry, LogRocket)
        console.error("ErrorBoundary가 포착한 에러:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;