import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useChat } from "../../hooks/useChat";

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.25
 * 파일명 : ChatWidget.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 채팅 위젯 화면 컴포넌트입니다.
 * 우하단에 도킹 패널로 어느 화면에서든지 랜더링되게 하였고 위젯과 패널로 나눠서
 * 패널이 닫히면 언마운트되어 메시지가 휘발되게 하였습니다.
 */

type Role = "assistant" | "user";
type DemoMessage = { id: string; role: Role; content: string };

const ChatWidget: React.FC = () => {
    const { open, closeChat } = useChat();
    if (!open || typeof document === "undefined") return null;
    return createPortal(<ChatPanel onClose={closeChat} />, document.body);
};

export default ChatWidget;

/**
 * 실제 패널:
 * - 메시지/입력/스크롤/ESC 닫기 등 화면 동작을 담당
 * - 컴포넌트가 언마운트되면 메시지 state도 함께 사라짐 → 다음에 열면 초기화
 */
const ChatPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [messages, setMessages] = useState<DemoMessage[]>(() => [
        {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
                "안녕하세요! 저는 AI 상담 위젯입니다.\n\n도와드릴 수 있는 항목:\n• 계약서 위험도 분석\n• 등기부등본 해석\n• 시세 정보\n\n무엇을 도와드릴까요?",
        },
    ]);
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    // 새 메시지마다 하단 스크롤
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ESC로 닫기
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // 전송(데모): 사용자 메시지 + 간단한 에코
    const send = () => {
        const text = input.trim();
        if (!text) return;
        const now = Date.now();
        setMessages((prev) => [
            ...prev,
            { id: `${now}-u`, role: "user", content: text },
            { id: `${now}-a`, role: "assistant", content: "데모 응답입니다." },
        ]);
        setInput("");
    };

    // 퀵칩(데모)
    const onPick = (label: string) => {
        const now = Date.now();
        setMessages((prev) => [
            ...prev,
            { id: `${now}-u`, role: "user", content: label },
        ]);
    };

    return (
        <aside
            className="chatpanel" // CSS는 나중에: position: fixed; right/bottom ...
            role="complementary"
            aria-label="AI 상담 위젯"
            id="chatwidget-root"
        >
            {/* Header */}
            <header className="chatpanel-header">
                <div className="chatpanel-title">AI 상담 위젯</div>
                <button
                    className="chatpanel-close"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ×
                </button>
            </header>

            {/* Body */}
            <main className="chatpanel-body">
                <div className="chatpanel-messages">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`row ${
                                m.role === "assistant" ? "left" : "right"
                            }`}
                        >
                            {m.role === "assistant" && (
                                <div className="avatar" aria-hidden>
                                    🤖
                                </div>
                            )}
                            <div className={`bubble ${m.role}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>

                {/* 퀵칩 3개 (데모) */}
                <div className="chatpanel-quickbar">
                    <button
                        className="chip chip-primary"
                        onClick={() => onPick("계약서 분석")}
                    >
                        계약서 분석
                    </button>
                    <button
                        className="chip chip-secondary"
                        onClick={() => onPick("전세사기 예방")}
                    >
                        전세사기 예방
                    </button>
                    <button
                        className="chip"
                        onClick={() => onPick("등기부등본 해석")}
                    >
                        등기부등본 해석
                    </button>
                </div>
            </main>

            {/* Composer */}
            <footer className="chatpanel-composer">
                <input
                    className="chatpanel-input"
                    placeholder="질문을 입력하세요"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter")
                            send();
                    }}
                />
                <button className="chatpanel-send" onClick={send}>
                    전송
                </button>
            </footer>
        </aside>
    );
};
