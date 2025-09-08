import React from "react";
import "../components.css";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 
 * 작성일 : 25.08.20
 * 파일명 : ChatToggleButton.tsx
 */

// 컴포넌트가 받을 props 정의
interface ChatToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

// ChatToggleButton 컴포넌트 정의
// 버튼 클릭 시 onClick 함수 실행, isOpen 상태에 따라 타이틀 변경
const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    // 버튼을 감싸는 컨테이너 (오른쪽 하단 고정)
    <div className="chat-toggle-top">
      {/* 채팅 열기/닫기 토글 버튼 */}
      <button
        className="chat-toggle-button"
        onClick={onClick}
        title={isOpen ? "실시간 채팅 닫기" : "실시간 채팅 열기"}
      >
        🤖
      </button>
    </div>
  );
};

// 컴포넌트 내보내기
export default ChatToggleButton;
