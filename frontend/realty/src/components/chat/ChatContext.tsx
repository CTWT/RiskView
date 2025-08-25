import { createContext } from "react";

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.25
 * 파일명 : ChatContext.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : ChatWidget의 전역 상태를 위한 정의 파일입니다.
 */

// 컨텍스트에 담길 값의 타입
export type ChatContextValue = {
    open: boolean;
    openChat: () => void;
    closeChat: () => void;
    toggle: () => void;
};

// 컴포넌트가 아닌 컨텍스트 객체만 export (Fast Refresh 룰 통과)
export const ChatContext = createContext<ChatContextValue | undefined>(
    undefined
);
