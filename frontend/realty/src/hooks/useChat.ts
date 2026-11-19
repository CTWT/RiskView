import { useContext } from "react";
import { ChatContext } from "../components/chat/ChatContext";
import type { ChatContextValue } from "../components/chat/ChatContext";

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.25
 * 파일명 : useChat.ts
 * 수정자 :
 * 수정일 :
 * 설명 : Chatcontext를 안전하게 조회하기 위한 커스텀 훅 입니다.
 */

export function useChat(): ChatContextValue {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within <ChatProvider>");
    return ctx;
}
