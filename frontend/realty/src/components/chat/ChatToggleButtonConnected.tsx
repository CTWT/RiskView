import React from "react";
import ChatToggleButton from "./ChatToggleButton"; // 네가 만든 프리젠테이셔널
import { useChat } from "../../hooks/useChat"; // ⬅️ 분리된 훅 사용

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.25
 * 파일명 : ChatToggleButtonConnected.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : ChatContext와 ChatToggleButton을 연결하는 wrapper 컴포넌트입니다.
 */

const ChatToggleButtonConnected: React.FC = () => {
    const { open, toggle } = useChat();
    return <ChatToggleButton isOpen={open} onClick={toggle} />;
};

export default ChatToggleButtonConnected;
