// 기존: import { useMemo, useState } from "react";
import { useMemo, useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import { ChatContext } from "./ChatContext";

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.25
 * 파일명 : ChatProvider.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : ChatWidget의 전역 상태 Provider 컴포넌트입니다.
 * 핫키 esc와 +를 이용하여 닫기와 열기를 지원합니다.
 */

export function ChatProvider({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);

    // (추가) 글로벌 핫키: 숫자패드 '+' 또는 상단 '+'로 위젯 열기
    useEffect(() => {
        const isEditableTarget = (t: EventTarget | null): boolean => {
            const el = t as HTMLElement | null;
            if (!el) return false;
            const tag = el.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select")
                return true;
            if (el.isContentEditable) return true;
            return false;
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) return; // 폼 입력 중이면 방해 금지

            // 숫자패드 + 키
            if (e.code === "NumpadAdd") {
                setOpen(true); // 필요하면 toggle()로 바꿔도 됨
                return;
            }
            // 키보드 상단 + (Shift + =)
            if (e.key === "+" && !e.ctrlKey && !e.metaKey && !e.altKey) {
                setOpen(true);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []); // 전역 1회 등록

    const value = useMemo(
        () => ({
            open,
            openChat: () => setOpen(true),
            closeChat: () => setOpen(false), // ESC 닫기는 ChatPanel에서 onClose() 호출
            toggle: () => setOpen((v) => !v),
        }),
        [open]
    );

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
}
