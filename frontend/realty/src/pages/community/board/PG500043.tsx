import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import Toast from "../../../components/ui/Toast";
import useToast from "../../../hooks/useToast";

/**
 * @file PG500043.tsx
 * @description 게시글 작성/수정 공용 페이지
 */

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.08.26
 * 파일명 : PG500043.tsx
 */

interface NewPost {
  title: string;
  content: string;
  tags: string;
}


const logError = (scope: string, err: unknown, extra?: Record<string, any>) => {
  
  console.error(`[PG500043][${scope}]`, err, extra ?? "");
};
const logInfo = (scope: string, info?: Record<string, any>) => {
  
  console.log(`[PG500043][${scope}]`, info ?? "");
};

const PG500043: React.FC = () => {
  // 렌더 시점 로깅(디버깅용)
  console.log("[PG500043] render");

  // 라우팅 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 초기 보드 타입 결정
  // - 작성/수정 진입 시 상위에서 state로 board를 넘겨줬다면 그 값을 사용
  // - 아니면 기본값 'free'로 처리
  const initialBoard: 'free' | 'support' = ((location.state as any)?.board as any) || 'free';

  // 수정 모드로 진입했는지 판별
  // - PG500042 → 수정 버튼으로 들어올 때 state에 isEdit와 게시글 정보가 같이 담겨옴
  const editPost = (location.state as any)?.isEdit
    ? (location.state as any)
    : null;
  // 수정 모드 여부 (id 유무로 판별)
  const isEditMode = Boolean(editPost?.id);

  // 작성/수정 공용 폼 상태
  // - 수정 모드면 기존 값으로 프리필, 작성 모드면 공백
  const [newPost, setNewPost] = useState<NewPost>({
    title: editPost?.title ?? "",
    content: editPost?.content ?? "",
    tags: (editPost?.tags as string) ?? "",
  });

  // 전송 중 상태 (버튼 비활성/스피너 표시)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 커스텀 훅 초기화 (토스트)
  const { toast, showToast } = useToast();

  // === contentEditable 기반 에디터 헬퍼 ===
  const editorRef = useRef<HTMLDivElement | null>(null);

  // 수정 모드 진입 시 에디터에 기존 내용(HTML)을 주입
  // - 의존성 없이 1회만 실행(마운트 시)
  React.useEffect(() => {
    if (editorRef.current && newPost.content) {
      editorRef.current.innerHTML = newPost.content;
    }
  }, []);

  // 마지막 선택 영역(Range) 저장용
  const lastRangeRef = useRef<Range | null>(null);

  // 현재 selection이 에디터 내부에 있는지 확인
  const isSelectionInsideEditor = (sel: Selection | null) => {
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return false;
    const range = sel.getRangeAt(0);
    return editorRef.current.contains(range.commonAncestorContainer);
  };

  // 현재 selection을 lastRangeRef에 저장
  const saveSelection = () => {
    const sel = window.getSelection();
    if (isSelectionInsideEditor(sel)) {
      lastRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // 저장된 selection을 복원
  // - 저장값이 없거나 포커스가 날아갔으면 커서를 에디터 끝으로 이동
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (lastRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(lastRangeRef.current);
    } else if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      lastRangeRef.current = range.cloneRange();
    }
  };

  /**
   * caret만 있을 때 같은 텍스트 노드에서 공백이 아닌 문자(\S) 단위로 단어 경계를 확장
   * @param {Range} range - 현재 선택 범위(보통 collapsed caret). TEXT_NODE가 아니면 원본 range 반환.
   * @returns {Range} 단어의 시작~끝으로 확장된 새 Range. 확장 실패 시 원본 Range.
   */
  const expandRangeToWord = (range: Range) => {
    if (!range.collapsed) return range;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return range;
    const text = node.textContent || "";
    let start = range.startOffset;
    let end = range.startOffset;
    while (start > 0 && /\S/.test(text[start - 1] || "")) start--;
    while (end < text.length && /\S/.test(text[end] || "")) end++;
    const newRange = document.createRange();
    newRange.setStart(node, start);
    newRange.setEnd(node, end);
    return newRange;
  };

  /**
   * 브라우저의 Selection.modify(비표준) 기능이 지원되면 이를 이용해 단어 단위로 선택을 확장
   * 미지원 또는 공백만 선택된 경우에는 expandRangeToWord로 폴백
   * @returns {Range} 단어 단위로 확장된 Range. 실패 시 원본을 기반으로 한 폴백 Range.
   */
  const expandSelectionToWordSmart = (): Range => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return document.createRange();
    const original = sel.getRangeAt(0).cloneRange();

    try {
      // 일부 브라우저에서 selection.modify가 제공됨 (비표준이지만 폭넓게 동작)
      // 1) 현재 위치에서 단어 경계로 확장
      //    - 우선 selection을 collapse시켜 기준점만 유지
      const collapsed = original.cloneRange();
      collapsed.collapse(true);
      sel.removeAllRanges();
      sel.addRange(collapsed);
      // 단어 경계로 확장 (뒤로/앞으로)
      // backward/forward 순서를 바꿔가며 최대한 단어를 잡음
      // NOTE: modify가 없으면 예외 발생 → catch에서 폴백 처리
      if (typeof sel.modify === 'function') {
      
        sel.modify('extend', 'backward', 'word');
        
        sel.modify('extend', 'forward', 'word');
        const r = sel.getRangeAt(0).cloneRange();
        // 공백/제로폭만 선택되었으면 폴백 사용
        if (r.toString().replace(/[\u200B\s]/g, '').length > 0) {
          return r;
        }
      }
    } catch (_) {
      // ignore and fallback
    }

    // 폴백: 같은 텍스트 노드 내에서만 확장
    const fb = expandRangeToWord(original);
    return fb;
  };

  /**
   * 시작 노드가 요소 노드일 때, 가장 가까운 의미 있는 TEXT_NODE를 탐색
   * @param {Node | null} start - 기준 노드(보통 range.startContainer)
   * @returns {Text | null} 발견된 TEXT_NODE. 없으면 null.
   */
  const findNearestTextNode = (start: Node | null): Text | null => {
    if (!start || !editorRef.current) return null;

    // 1) 자신/자식에서 텍스트 찾기 
    const stack: Node[] = [start];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0) return n as Text;
      // 자식부터 먼저 검사
      const children = (n as Element).childNodes;
      for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
    }

    // 2) 형제/부모 방향으로 확장
    let cur: Node | null = start;
    // 위로 올라가며 좌우 형제 검색
    while (cur && cur !== editorRef.current) {
      // 이전 형제들 뒤에서 앞으로 검색
      let sib: Node | null = cur.previousSibling;
      while (sib) {
        if (sib.nodeType === Node.TEXT_NODE && (sib.textContent || '').trim().length > 0) return sib as Text;
        // sib의 마지막 자손부터 텍스트를 찾음
        const subStack: Node[] = [sib];
        while (subStack.length) {
          const sn = subStack.pop()!;
          if (sn.nodeType === Node.TEXT_NODE && (sn.textContent || '').trim().length > 0) return sn as Text;
          const kids = (sn as Element).childNodes;
          for (let i = kids.length - 1; i >= 0; i--) subStack.push(kids[i]);
        }
        sib = sib.previousSibling;
      }
      // 다음 형제들도 검사
      sib = cur.nextSibling;
      while (sib) {
        if (sib.nodeType === Node.TEXT_NODE && (sib.textContent || '').trim().length > 0) return sib as Text;
        const subStack: Node[] = [sib];
        while (subStack.length) {
          const sn = subStack.pop()!;
          if (sn.nodeType === Node.TEXT_NODE && (sn.textContent || '').trim().length > 0) return sn as Text;
          const kids = (sn as Element).childNodes;
          for (let i = kids.length - 1; i >= 0; i--) subStack.push(kids[i]);
        }
        sib = sib.nextSibling;
      }
      cur = cur.parentNode;
    }
    return null;
  };

  /**
   * 에디터 DOM의 현재 innerHTML을 상태(newPost.content)와 동기화
   * 버튼 활성/글자수 계산 등 UI 업데이트에 사용
   * @returns {void}
   */
  const syncFromEditor = () => {
    setNewPost((p) => ({
      ...p,
      content: editorRef.current?.innerHTML || p.content,
    }));
  };

  /**
   * 현재 선택 영역을 지정된 인라인 태그로 감쌈
   * 선택이 비어있으면 빈 래퍼를 삽입해 이후 입력에 스타일을 적용
   * @param {string} tagName - 감쌀 태그명(e.g., 'strong', 'em', 's').
   * @returns {void}
   */
  const wrapSelectionWith = (tagName: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let range = sel.getRangeAt(0);

    // 빈 래퍼 삽입
    if (range.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE) {
      const wrapper = document.createElement(tagName);
      const placeholder = document.createTextNode("");
      wrapper.appendChild(placeholder);
      range.insertNode(wrapper);

      const newRange = document.createRange();
      newRange.setStart(wrapper.firstChild as Text, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      syncFromEditor();
      return;
    }

    // 단어 경계 확장 후 감싸기
    range = expandRangeToWord(range);

    const frag = range.extractContents();
    const wrapper = document.createElement(tagName);
    wrapper.appendChild(frag);
    range.insertNode(wrapper);

    const newRange = document.createRange();
    newRange.setStartAfter(wrapper);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    syncFromEditor();
  };

  /**
   * 선택 텍스트를 줄 단위로 분리하여 순서있는/없는 목록으로 변환
   * @param {('ul'|'ol')} type - 목록 종류. 'ul'은 불릿, 'ol'은 숫자 목록.
   * @returns {void}
   */
  const makeList = (type: "ul" | "ol") => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = range.toString();
    const lines = text ? text.split("\n") : [""];
    const list = document.createElement(type);
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      list.appendChild(li);
    });
    range.deleteContents();
    range.insertNode(list);

    const newRange = document.createRange();
    newRange.setStartAfter(list);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    syncFromEditor();
  };

  /**
   * 선택 영역을 block 요소로 감쌈. 'pre'의 경우 내부에 <code>를 중첩
   * @param {('pre'|'blockquote')} tagName - 블록 태그명.
   * @returns {void}
   */
  const makeBlock = (tagName: "pre" | "blockquote") => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const frag = range.extractContents();
    const block = document.createElement(tagName);
    block.appendChild(frag);
    if (tagName === "pre") {
      const code = document.createElement("code");
      while (block.firstChild) code.appendChild(block.firstChild);
      block.appendChild(code);
    }
    range.insertNode(block);

    const newRange = document.createRange();
    newRange.setStartAfter(block);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    syncFromEditor();
  };

  /**
   * 현재 단어(또는 placeholder)를 h1/h2로 치환
   * @param {(1|2)} level - 헤딩 레벨(1 또는 2).
   * @returns {void}
   */
  const makeHeading = (level: 1 | 2) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const orig = sel.getRangeAt(0);
    const range = expandRangeToWord(orig);
    const text = range.toString();
    const h = document.createElement(`h${level}`);
    h.textContent = text || "제목";
    range.deleteContents();
    range.insertNode(h);
    const newRange = document.createRange();
    newRange.setStartAfter(h);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    syncFromEditor();
  };

  /**
   * 현재 선택 영역에 취소선을 적용(인라인 s 태그 래핑).
   * @returns {void}
   */
  const makeStrike = () => wrapSelectionWith("s");

  /**
   * 현재 커서 위치(또는 선택 영역)에 임의의 HTML 조각을 삽입
   * 이미지/링크/임베드 등을 추가할 때 사용
   * @param {string} html - 삽입할 안전한 HTML 문자열(신뢰된 소스만).
   * @returns {void}
   */
  const insertHtmlAtCursor = (html: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const temp = document.createElement("div");
    temp.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null;
    let lastNode: ChildNode | null = null;
    while ((node = temp.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);

    if (lastNode) {
      const newRange = document.createRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    syncFromEditor();
  };

  /**
   * 선택 영역(또는 caret 주변 단어)에 폰트 크기를 적용
   * 1) 이미 span 내부면 해당 span의 font-size만 업데이트
   * 2) Selection.modify로 단어 확장 시도 → 실패 시 최근접 TEXT_NODE 탐색
   * 3) 그래도 실패하면 제로폭 span 삽입하여 다음 입력부터 적용
   * @param {number} sizePx - 적용할 폰트 크기(px 단위)
   * @returns {void}
   */
  const setFontSize = (sizePx: number) => {
    // 선택 복원 및 selection 확보 → 없으면 종료
    logInfo("setFontSize.call", { sizePx });
    try {
      restoreSelection();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        logError("setFontSize.noSelection", "No selection available");
        return;
      }
      let range = sel.getRangeAt(0);
      logInfo("setFontSize.selection", {
        collapsed: range.collapsed,
        startNode: range.startContainer?.nodeName,
        endNode: range.endContainer?.nodeName,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      });

      if (range.collapsed) {
        // a) 이미 span 내부면 갱신
        const parentEl = (range.startContainer as Node)?.parentElement as HTMLElement | null;
        if (parentEl && parentEl.tagName === 'SPAN') {
          parentEl.style.fontSize = `${sizePx}px`;
          syncFromEditor();
          saveSelection();
          logInfo('setFontSize.updatedExistingSpan', { applied: `${sizePx}px` });
          return;
        }

        // b) 단어 확장 시도
        let expanded = expandSelectionToWordSmart();
        let selectedText = expanded.toString();
        logInfo('setFontSize.collapsed.tryExpand', { selectedText });
        if (!selectedText || selectedText.replace(/[\u200B\s]/g, '').length === 0) {
          // c) 최근접 텍스트 탐색
          const nearest = findNearestTextNode(range.startContainer);
          if (nearest) {
            const aux = document.createRange();
            aux.setStart(nearest, 0);
            aux.setEnd(nearest, nearest.length);
            expanded = expandRangeToWord(aux);
            selectedText = expanded.toString();
            logInfo('setFontSize.collapsed.nearestText', { selectedText });
          }
        }
        // d) 성공 시 감싸기
        if (selectedText && selectedText.replace(/[\u200B\s]/g, '').length > 0) {
          const frag = expanded.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = `${sizePx}px`;
          span.appendChild(frag);
          expanded.insertNode(span);

          // caret을 적용된 span 뒤로 이동
          const after = document.createRange();
          after.setStartAfter(span);
          after.collapse(true);
          const sel2 = window.getSelection();
          sel2?.removeAllRanges();
          sel2?.addRange(after);

          syncFromEditor();
          saveSelection();
          logInfo('setFontSize.rangeApplied(fromCollapsed)', { applied: `${sizePx}px` });
          return;
        }

        // e) 실패 시 제로폭 span
        const span = document.createElement("span");
        span.style.fontSize = `${sizePx}px`;
        const zwsp = document.createTextNode("\u200B");
        span.appendChild(zwsp);
        range.insertNode(span);

        // caret 이동/동기화 이유: 제로폭 뒤로 이동, 상태 반영
        const newRange = document.createRange();
        newRange.setStart(zwsp, 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        editorRef.current?.focus();
        requestAnimationFrame(() => {
          syncFromEditor();
          saveSelection();
          logInfo("setFontSize.collapsedApplied(zeroWidth)", {
            applied: `${sizePx}px`,
            htmlLen: editorRef.current?.innerHTML.length,
          });
          const around = editorRef.current?.innerHTML?.slice(Math.max(0, (editorRef.current?.innerHTML.length || 0) - 200));
          logInfo('setFontSize.zeroWidth.afterHTMLTail', { tail: around });
        });
        return;
      }

      // 선택 영역이 있을 때: 단어 경계로 확장 후 감싸기
      range = expandRangeToWord(range);
      const frag = range.extractContents();
      const span = document.createElement("span");
      span.style.fontSize = `${sizePx}px`;
      span.appendChild(frag);
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      syncFromEditor();
      logInfo("setFontSize.rangeApplied", { applied: `${sizePx}px` });
    } catch (err) {
      logError("setFontSize.exception", err, { requested: sizePx });
    }
  };

  /**
   * 문서 명령어(execCommand)로 굵게/기울임/취소선을 토글
   * deprecated API지만 폭넓게 지원되어 간단 토글용으로 사용
   * @param {'bold'|'italic'|'strikeThrough'} cmd - 실행할 토글 명령어
   * @returns {void}
   */
  const execToggle = (cmd: 'bold' | 'italic' | 'strikeThrough') => {
    restoreSelection();
    // 에디터에 포커스 유지
    editorRef.current?.focus();
    try {
      // execCommand는 deprecated지만 광범위 지원/토글 편의로 사용
      (document as any).execCommand(cmd, false, undefined);
    } catch (e) {
      // 실패 시 무시 (브라우저 차이 대비)
    }
    // 내부 상태 동기화
    syncFromEditor();
    // 커서 위치 저장 (다음 토글을 위해)
    saveSelection();
  };

  // === contentEditable 헬퍼 끝 ===

  /**
   * HTML 태그를 제거하고 순수 텍스트 길이 계산 등에 사용
   * @param {string} html - 원본 HTML 문자열
   * @returns {string} 태그 제거 후 트림된 문자열
   */
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  /**
   * 게시글 작성/수정 제출 핸들러.
   * - 제목/내용 검증 → payload 구성 → (수정/작성)
   * - 서버 성공 시 상세로 이동, 실패 시 로컬 폴백 저장 후 이동
   * @returns {Promise<void>}
   */
  const handleSubmitPost = async () => {
    // 입력 검증(제목/내용/길이)
    if (!newPost.title.trim()) {
      showToast("제목을 입력해주세요.", { type: "error" });
      return;
    }
    if (!newPost.content.trim()) {
      showToast("내용을 입력해주세요.", { type: "error" });
      return;
    }

    const plainLen = stripHtml(newPost.content).length;
    if (plainLen > 2000) {
      showToast("내용은 2000자를 초과할 수 없습니다.", { type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      // payload 작성/태그 정규화
      const payload = {
        board: initialBoard,
        title: newPost.title,
        content: newPost.content, // HTML 가능
        tags: newPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      // 수정/작성 분기
      if (isEditMode && editPost?.id) {
        // 수정
        try {
          const res = await fetch(`/api/posts/${editPost.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = res.ok
            ? await res.json()
            : { id: editPost.id, ...payload };
          showToast("게시글이 수정되었습니다.", { type: "success" });
          // 서버 성공 시 상세로 이동
          navigate(`/PG500001/PG500041/PG500042/${data.id ?? editPost.id}?board=${initialBoard}`, {
            replace: true,
          });
          return;
        } catch (e) {
          // 서버 실패 시 로컬 폴백 반영
          const posts = JSON.parse(
            localStorage.getItem("communityPosts") || "[]"
          );
          const idx = posts.findIndex((p: any) => p.id === editPost.id);
          if (idx >= 0) {
            posts[idx] = {
              ...posts[idx],
              title: payload.title,
              content: payload.content,
              tags: payload.tags,
            };
            localStorage.setItem("communityPosts", JSON.stringify(posts));
          }
          showToast("네트워크 오류로 로컬에만 수정 반영했습니다.", {
            type: "warning",
          });
          navigate(`/PG500001/PG500041/PG500042/${editPost.id}?board=${initialBoard}`, { replace: true });
          return;
        }
      }

      // 신규 작성
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = res.ok
          ? await res.json()
          : { id: `post-${Date.now()}`, ...payload };
        showToast("게시글이 성공적으로 작성되었습니다.", { type: "success" });
        navigate(`/PG500001/PG500041/PG500042/${data.id}?board=${initialBoard}`, { replace: true });
        return;
      } catch (e) {
        // 서버 실패 시 로컬스토리지 저장 후 상세 이동
        const posts = JSON.parse(
          localStorage.getItem("communityPosts") || "[]"
        );
        const newPostData = {
          id: `post-${Date.now()}`,
          board: initialBoard,
          title: newPost.title,
          content: newPost.content,
          author: "현재사용자",
          date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
          views: 0,
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          tags: payload.tags,
          type: determinePostType(newPost.tags, newPost.title, newPost.content),
        };
        posts.unshift(newPostData);
        localStorage.setItem("communityPosts", JSON.stringify(posts));
        showToast("(임시) 로컬에 게시글이 저장되었습니다.", {
          type: "success",
        });
        navigate(`/PG500001/PG500041/PG500042/${newPostData.id}?board=${initialBoard}`, {
          replace: true,
          state: { ...newPostData, __fromWrite: true },
        });
        return;
      }
    } catch (error) {
      // 기타 예외
      console.error("게시글 작성/수정 실패:", error);
      showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
    } finally {
      // finally에서 isSubmitting 해제
      setIsSubmitting(false);
    }
  };

  /**
   * 취소 버튼 핸들러.
   * - 수정 모드면 상세로, 작성 모드면 목록으로 이동
   * - 작성 중 내용이 있다면 confirm으로 사용자 확인
   * @returns {void}
   */
  const handleCancel = () => {
    const hasContent = newPost.title.trim() || newPost.content.trim();
    const go = () => {
      if (isEditMode && editPost?.id) {
        navigate(`/PG500001/PG500041/PG500042/${editPost.id}?board=${initialBoard}`);
      } else {
        navigate(`/PG500001/PG500041?board=${initialBoard}`);
      }
    };

    if (hasContent) {
      if (window.confirm("작성 중인 내용이 있습니다. 정말 취소하시겠습니까?")) {
        go();
      }
    } else {
      go();
    }
  };

  /**
   * 태그 입력 인풋의 키 입력 핸들러.
   * Enter로 submit되는 것을 방지하고, 필요 시 커스텀 태그 추가 로직 연결
   * @param {React.KeyboardEvent<HTMLInputElement>} e - 키보드 이벤트
   * @returns {void}
   */
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // 필요 시 태그 추가 로직
    }
  };

  return (
    <PageContainer showBreadcrumb={true} centerContent={true}>
      <div className="write-post-container">
        {/* 헤더 영역 */}
        <div className="write-header">
          <h1 className="write-title">
            {isEditMode ? "게시글 수정" : "새 게시글 작성"}
          </h1>
          <div className="breadcrumb-info">
            <span>부동산 거래 경험과 정보를 공유해보세요</span>
          </div>
        </div>

        {/* 작성/수정 폼 */}
        <div className="write-form">
          {/* 제목 입력 */}
          <div className="form-section">
            <label htmlFor="title" className="form-label">
              제목 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              placeholder="제목을 입력하세요"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
              className="form-input title-input"
              maxLength={100}
              disabled={isSubmitting}
            />
            <div className="input-help">{newPost.title.length}/100자</div>
          </div>

          {/* 내용 입력 */}
          <div className="form-section">
            <label htmlFor="content" className="form-label">
              내용 <span className="required">*</span>
            </label>

            {/* 커스텀 툴바 */}
            <div className="editor-toolbar">
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execToggle('bold')}
                title="굵게"
              >
                B
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execToggle('italic')}
                title="기울임"
              >
                <i>I</i>
              </button>
            <select
              className="tb-select"
              onChange={(e) => {
                const raw = (e.target as HTMLSelectElement).value;
                const val = Number(raw);
                logInfo("FontSizeSelect.change", { raw, val, isNaN: isNaN(val) });

                if (isNaN(val)) {
                  logError("FontSizeSelect.NaN", "Invalid font size value", { raw });
                  return;
                }
                try {
                  restoreSelection();
                  setFontSize(val);
                  editorRef.current?.focus();
                  saveSelection();
                  logInfo("FontSizeSelect.applied", { applied: val });
                } catch (err) {
                  logError("FontSizeSelect.apply", err, { requested: val });
                }
              }}
              defaultValue="16"
              title="글자 크기"
              aria-label="글자 크기"
            >
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
              <option value="24">24px</option>
            </select>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execToggle('strikeThrough')}
                title="취소선"
              >
                S
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  restoreSelection();
                  editorRef.current?.focus();
                  makeBlock("pre");
                }}
                title="코드"
              >
                {"</>"}
              </button>
              <span className="toolbar-sep" />
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  restoreSelection();
                  editorRef.current?.focus();
                  makeList("ul");
                }}
                title="순서없는 목록"
              >
                • List
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  restoreSelection();
                  editorRef.current?.focus();
                  makeList("ol");
                }}
                title="순서있는 목록"
              >
                1. List
              </button>
              <span className="toolbar-sep" />
              <label
                className="tb-btn"
                title="첨부파일"
                onMouseDown={(e) => e.preventDefault()}
              >
                📎
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // 5MB 제한
                    const MAX_SIZE = 5 * 1024 * 1024;
                    if (file.size > MAX_SIZE) {
                      const mb = (file.size / (1024 * 1024)).toFixed(2);
                      showToast(
                        `파일 크기가 5MB를 초과합니다. 현재 크기: ${mb}MB`,
                        { type: "error" }
                      );
                      e.target.value = "";
                      return;
                    }

                    const url = URL.createObjectURL(file);
                    if (editorRef.current) {
                      editorRef.current.focus();
                      insertHtmlAtCursor(
                        `<img src="${url}" alt="${file.name}" style="max-width:100%; height:auto;"/>`
                      );
                    }
                    showToast(`이미지 추가됨: ${file.name}`, {
                      type: "success",
                    });
                  }}
                />
              </label>
            </div>

            {/* 에디터 */}
            <div
              id="content"
              ref={editorRef}
              className="form-textarea content-textarea"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) =>
                setNewPost({
                  ...newPost,
                  content: (e.target as HTMLDivElement).innerHTML,
                })
              }
              onBeforeInput={saveSelection}
              onMouseUp={saveSelection}
              onKeyDown={saveSelection}
              onKeyUp={saveSelection}
              onFocus={saveSelection}
              onBlur={() =>
                setNewPost((p) => ({
                  ...p,
                  content: editorRef.current?.innerHTML || p.content,
                }))
              }
              style={{ minHeight: 260, overflow: "auto" }}
            />
            <div className="input-help">
              <span
                className={
                  stripHtml(newPost.content).length > 1800 ? "warning" : ""
                }
              >
                {stripHtml(newPost.content).length}/2000자
              </span>
            </div>
          </div>

          {/* 태그 입력 */}
          <div className="form-section">
            <label htmlFor="tags" className="form-label">
              태그 <span className="optional">(선택사항)</span>
            </label>
            <input
              type="text"
              id="tags"
              placeholder="태그를 쉼표로 구분해서 입력하세요 (예: 전세, 계약서, 강남구)"
              value={newPost.tags}
              onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              onKeyPress={handleTagKeyPress}
              className="form-input tags-input"
              disabled={isSubmitting}
            />
            <div className="input-help">
              게시글의 내용을 잘 나타내는 키워드를 입력해주세요
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="button"
              className="submit-button"
              onClick={handleSubmitPost}
              disabled={
                isSubmitting || !newPost.title.trim() || !newPost.content.trim()
              }
            >
              {isSubmitting
                ? isEditMode
                  ? "수정 저장 중..."
                  : "작성 중..."
                : isEditMode
                ? "수정 저장"
                : "게시글 작성"}
            </button>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
    </PageContainer>
  );
};

export default PG500043;