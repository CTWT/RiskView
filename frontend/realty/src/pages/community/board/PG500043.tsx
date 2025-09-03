import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import Toast from "../../../components/ui/Toast";
import useToast from "../../../hooks/useToast";
import { type PostDetailWithFlags } from "./PG500042";

/**
 * @file PG500043.tsx
 * @description 게시글 작성/수정 공용 페이지
 */

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.08.26
 * 수정일 : 25.09.02
 * 파일명 : PG500043.tsx
 */

interface NewPost {
  title: string;
  content: string;
  tags: string;
}

type BoardKey = 'free' | 'support';

// Undo/Redo를 위한 히스토리 인터페이스
interface EditorHistory {
  content: string;
  selection?: {
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  };
}

const logError = (scope: string, error: unknown, extra?: Record<string, unknown>) => {
  console.error(`[PG500043][${scope}]`, error, extra ?? "");
};
const logInfo = (scope: string, info?: Record<string, unknown>) => {
  console.log(`[PG500043][${scope}]`, info ?? "");
};

const PG500043: React.FC = () => {
  // 렌더 시점 로깅(디버깅용)
  console.log('[PG500043] 컴포넌트 렌더링됨.');

  // 라우팅 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 초기 보드 타입 결정
  const initialBoard: BoardKey = (new URLSearchParams(location.search).get('board') as BoardKey) || (location.state as PostDetailWithFlags)?.board || 'free';
  logInfo('컴포넌트.초기화', { initialBoard });

  // 수정 모드로 진입했는지 판별
  const editPost = (location.state as PostDetailWithFlags)?.isEdit
    ? (location.state as PostDetailWithFlags)
    : null;
  console.log('[PG500043] 수정 모드 데이터:', editPost);
  logInfo('컴포넌트.초기화', { isEditMode: Boolean(editPost?.id), postId: editPost?.id });
  const isEditMode = Boolean(editPost?.id);

  // 작성/수정 공용 폼 상태
  const [newPost, setNewPost] = useState<NewPost>({
    title: editPost?.title ?? "",
    content: editPost?.content ?? "",
    tags: Array.isArray(editPost?.tags) ? editPost.tags.join(", ") : "",
  });

  // 전송 중 상태 (버튼 비활성/스피너 표시)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 커스텀 훅 초기화 (토스트)
  const { toast, showToast } = useToast();

  // === contentEditable 기반 에디터 헬퍼 ===
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Undo/Redo 히스토리 관리
  const historyRef = useRef<EditorHistory[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false); // Undo/Redo 중인지 확인용

  // 수정 모드 진입 시 에디터에 기존 내용(HTML)을 주입
  React.useEffect(() => {
    console.log('[PG500043] 수정 모드 초기 콘텐츠 설정 useEffect 실행');
    if (editorRef.current && newPost.content) {
      logInfo('useEffect.초기콘텐츠설정', { contentLength: newPost.content.length });
      editorRef.current.innerHTML = newPost.content;
      // 초기 히스토리 저장
      saveToHistory();
    }
  }, []);

  // 마지막 선택 영역(Range) 저장용
  const lastRangeRef = useRef<Range | null | undefined>(null);

  // 현재 selection이 에디터 내부에 있는지 확인
  const isSelectionInsideEditor = React.useCallback((sel: Selection | null) => {
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return false;
    const range = sel.getRangeAt(0);
    return editorRef.current.contains(range.commonAncestorContainer);
  }, []);

  // 현재 selection을 lastRangeRef에 저장
  const saveSelection = React.useCallback(() => {
    const sel = window.getSelection();
    if (isSelectionInsideEditor(sel)) {
      lastRangeRef.current = sel?.getRangeAt(0).cloneRange();
    }
  }, [isSelectionInsideEditor]);

  // 히스토리에 현재 상태 저장
  const saveToHistory = () => {
    if (!editorRef.current || isUndoRedoRef.current) return;
    
    const currentContent = editorRef.current.innerHTML;
    const history = historyRef.current;
    const currentIndex = historyIndexRef.current;
    
    // 마지막 히스토리와 같으면 저장하지 않음
    if (history[currentIndex]?.content === currentContent) return;
    
    // 현재 인덱스 이후의 히스토리 제거 (새로운 변경사항)
    historyRef.current = history.slice(0, currentIndex + 1);
    
    // 새 히스토리 추가
    historyRef.current.push({
      content: currentContent
    });
    
    // 히스토리 크기 제한 (50개)
    if (historyRef.current.length > 50) {
      historyRef.current = historyRef.current.slice(-50);
    }
    
    historyIndexRef.current = historyRef.current.length - 1;
    logInfo('히스토리.저장', { index: historyIndexRef.current, length: historyRef.current.length });
  };

  // Undo 실행
  const performUndo = () => {
    if (!editorRef.current || historyIndexRef.current <= 0) return false;
    
    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    const historyItem = historyRef.current[historyIndexRef.current];
    
    if (historyItem) {
      editorRef.current.innerHTML = historyItem.content;
      syncFromEditor();
      logInfo('Undo.실행', { index: historyIndexRef.current });
    }
    
    isUndoRedoRef.current = false;
    return true;
  };

  // Redo 실행
  const performRedo = () => {
    if (!editorRef.current || historyIndexRef.current >= historyRef.current.length - 1) return false;
    
    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    const historyItem = historyRef.current[historyIndexRef.current];
    
    if (historyItem) {
      editorRef.current.innerHTML = historyItem.content;
      syncFromEditor();
      logInfo('Redo.실행', { index: historyIndexRef.current });
    }
    
    isUndoRedoRef.current = false;
    return true;
  };

  // 에디터의 onInput 핸들러
  const handleInput = React.useCallback(() => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      setNewPost(p => {
        if (p.content !== currentHtml) {
          return { ...p, content: currentHtml };
        }
        return p;
      });
      
      // 히스토리 저장 (디바운스)
      clearTimeout(handleInput.timeoutId);
      handleInput.timeoutId = setTimeout(() => {
        saveToHistory();
      }, 500);
    }
  }, []);
  handleInput.timeoutId = null;

  // 키보드 이벤트 핸들러 (Ctrl+Z, Ctrl+Y)
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
        return;
      }
      if (e.key === 'z' && e.shiftKey || e.key === 'y') {
        e.preventDefault();
        performRedo();
        return;
      }
    }
    
    // 일반 키 입력 시 selection 저장
    saveSelection();
  }, []);

  // 에디터 포커스가 해제될 때 최종 내용을 동기화
  const handleBlur = React.useCallback(() => {
    logInfo('에디터.onBlur', { contentLength: editorRef.current?.innerHTML.length });
    handleInput();
    saveToHistory(); // 포커스 해제 시 히스토리 저장
  }, [handleInput]);

  // 저장된 selection을 복원
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
   * 에디터 DOM의 현재 innerHTML을 상태와 동기화
   */
  const syncFromEditor = () => {
    setNewPost((p) => ({
      ...p,
      content: editorRef.current?.innerHTML || p.content,
    }));
  };

  /**
   * 선택 텍스트를 줄 단위로 분리하여 순서있는/없는 목록으로 변환
   */
  const makeList = (type: "ul" | "ol") => {
    logInfo('에디터.makeList', { type });
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
    saveToHistory();
  };

  /**
   * 선택 영역을 block 요소로 감쌈
   */
  const makeBlock = (tagName: "pre" | "blockquote") => {
    logInfo('에디터.makeBlock', { tagName });
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
    saveToHistory();
  };

  /**
   * 현재 커서 위치에 HTML 조각을 삽입
   */
  const insertHtmlAtCursor = (html: string) => {
    logInfo('에디터.insertHtmlAtCursor', { htmlLength: html.length });
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
    saveToHistory();
  };

  /**
   * 선택 영역에 인라인 스타일을 토글
   */
  /**
 * 선택 영역에 인라인 스타일을 토글 (개선된 버전 - 띄어쓰기 포함 처리)
 */
  const toggleInlineStyle = (tagName: 'b' | 'i' | 's') => {
    logInfo('에디터.toggleInlineStyle', { tagName });
    restoreSelection();
    editorRef.current?.focus();

    const sel = window.getSelection();
    console.log('[선택 영역]', sel);
    if (!sel || sel.rangeCount === 0) {
      logError('toggleInlineStyle.선택없음', '선택된 범위가 없습니다');
      return;
    }

    console.log('[선택된 텍스트]', sel.getRangeAt(0).toString());

    let range = sel.getRangeAt(0);

    // 선택된 텍스트 정규화
    const selectedText = range.toString().trim();
    const isCollapsed = range.collapsed;
    const isOnlyWhitespace = !selectedText || /^\s*$/.test(range.toString());

    // 현재 선택 영역이 해당 스타일로 감싸져 있는지 확인
    const hasStyle = (node: Node): boolean => {
      let current: Node | null = node;
      while (current && current !== editorRef.current) {
        if (
          current.nodeType === Node.ELEMENT_NODE &&
          (current as HTMLElement).tagName.toLowerCase() === tagName
        ) {
          return true;
        }
        current = current.parentNode;
      }
      return false;
    };

    const isStyled = hasStyle(range.startContainer) && hasStyle(range.endContainer);

    try {
      if (isStyled) {
        // 스타일 제거: 해당 태그만 unwrap
        const walker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) =>
              (node as HTMLElement).tagName.toLowerCase() === tagName
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP,
          }
        );

        const elementsToUnwrap: HTMLElement[] = [];
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const element = node as HTMLElement;
          if (range.intersectsNode(element)) {
            elementsToUnwrap.push(element);
          }
        }

        elementsToUnwrap.forEach((element) => {
          const parent = element.parentNode;
          if (parent) {
            // 자식 노드를 부모 앞에 삽입
            while (element.firstChild) {
              parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
          }
        });

        // DOM 정규화
        editorRef.current?.normalize();
      } else {
        // 스타일 적용
        if (isCollapsed || isOnlyWhitespace) {
          // 커서가 있거나 공백만 선택된 경우: 빈 wrapper 삽입
          const wrapper = document.createElement(tagName);
          const placeholder = document.createTextNode('\u200B'); // Zero-width space
          wrapper.appendChild(placeholder);
          range.insertNode(wrapper);

          const newRange = document.createRange();
          newRange.setStart(placeholder, 1);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        } else {
          // 선택된 텍스트에 스타일 적용
          // 띄어쓰기 포함 범위 확장
          range = expandSelectionToWordSmart();
          const contents = range.extractContents();
          const wrapper = document.createElement(tagName);
          wrapper.appendChild(contents);
          range.insertNode(wrapper);

          // 래퍼 다음에 커서 이동
          const newRange = document.createRange();
          newRange.setStartAfter(wrapper);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);

          // DOM 정규화
          editorRef.current?.normalize();
        }
      }

      syncFromEditor();
      saveToHistory();
      saveSelection();
    } catch (error) {
      logError('toggleInlineStyle.예외', error, { tagName });
    }
  };

  /**
   * 선택 범위를 단어 경계로 확장 (띄어쓰기 포함 처리 개선)
   */
  const expandSelectionToWordSmart = (): Range => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      logError('expandSelectionToWordSmart.선택없음', '선택된 범위가 없습니다');
      return document.createRange();
    }

    let range = sel.getRangeAt(0).cloneRange();

    try {
      if (range.collapsed) {
        // 커서만 있는 경우: 단어 경계로 확장
        const textNode = findNearestTextNode(range.startContainer);
        if (textNode && textNode.textContent) {
          const text = textNode.textContent;
          let start = range.startOffset;
          let end = range.startOffset;

          // 단어 시작점 찾기 (공백 아닌 문자까지)
          while (start > 0 && /\S/.test(text[start - 1])) {
            start--;
          }
          // 단어 끝점 찾기 (공백 포함)
          while (end < text.length && !/\s/.test(text[end])) {
            end++;
          }

          range = document.createRange();
          range.setStart(textNode, start);
          range.setEnd(textNode, end);
        }
      } else {
        // 선택된 범위가 있는 경우
        const startNode = range.startContainer;
        const endNode = range.endContainer;

        if (startNode.nodeType === Node.TEXT_NODE && startNode.textContent) {
          let start = range.startOffset;
          const text = startNode.textContent;
          // 시작점 확장 (공백 아닌 문자까지)
          while (start > 0 && /\S/.test(text[start - 1])) {
            start--;
          }
          range.setStart(startNode, start);
        }

        if (endNode.nodeType === Node.TEXT_NODE && endNode.textContent) {
          let end = range.endOffset;
          const text = endNode.textContent;
          // 끝점 확장 (공백 포함)
          while (end < text.length && !/\s/.test(text[end])) {
            end++;
          }
          range.setEnd(endNode, end);
        }
      }

      // 선택된 텍스트가 공백만 있는지 확인
      const selectedText = range.toString();
      if (!selectedText || /^\s*$/.test(selectedText)) {
        // 공백만 있는 경우: 원래 범위 반환
        return sel.getRangeAt(0).cloneRange();
      }

      return range;
    } catch (error) {
      logError('expandSelectionToWordSmart.예외', error);
      return range;
    }
  };

  /**
   * 가장 가까운 텍스트 노드 찾기 (개선된 버전)
   */
  const findNearestTextNode = (start: Node | null): Text | null => {
    if (!start || !editorRef.current) return null;

    // 깊이 우선 탐색 (DFS)로 텍스트 노드 찾기
    const stack: Node[] = [start];
    while (stack.length) {
      const node = stack.pop()!;
      if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) {
        return node as Text;
      }
      const children = Array.from(node.childNodes);
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }

    // 부모/형제 방향으로 탐색
    let current: Node | null = start;
    while (current && current !== editorRef.current) {
      // 이전 형제
      let sibling = current.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && (sibling.textContent || '').trim().length > 0) {
          return sibling as Text;
        }
        stack.push(sibling);
        while (stack.length) {
          const subNode = stack.pop()!;
          if (subNode.nodeType === Node.TEXT_NODE && (subNode.textContent || '').trim().length > 0) {
            return subNode as Text;
          }
          const children = Array.from(subNode.childNodes);
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
          }
        }
        sibling = sibling.previousSibling;
      }

      // 다음 형제
      sibling = current.nextSibling;
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && (sibling.textContent || '').trim().length > 0) {
          return sibling as Text;
        }
        stack.push(sibling);
        while (stack.length) {
          const subNode = stack.pop()!;
          if (subNode.nodeType === Node.TEXT_NODE && (subNode.textContent || '').trim().length > 0) {
            return subNode as Text;
          }
          const children = Array.from(subNode.childNodes);
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
          }
        }
        sibling = sibling.nextSibling;
      }

      current = current.parentNode;
    }

    return null;
  };

  /**
   * H1, H2 헤딩을 span + font-size로 적용 (개선된 버전)
   */
  const toggleHeading = (level: 1 | 2) => {
    logInfo('에디터.toggleHeading', { level });
    restoreSelection();
    editorRef.current?.focus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // 헤딩 크기 정의
    const headingSizes = {
      1: 32, // H1 = 32px
      2: 24  // H2 = 24px
    };

    const targetSize = headingSizes[level];
    
    // 현재 커서 위치에서 폰트 크기 적용
    setFontSize(targetSize);
    
    logInfo('에디터.toggleHeading완료', { level, appliedSize: targetSize });
  };

  /**
   * 폰트 크기 적용 (개선된 버전 - 서식 중첩 고려)
   */
  const setFontSize = (sizePx: number) => {
    logInfo("글자크기변경.호출", { sizePx });
    try {
      restoreSelection();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        logError("글자크기변경.선택없음", "선택된 영역이 없습니다");
        return;
      }
      let range = sel.getRangeAt(0);

      if (range.collapsed) {
        // 현재 위치에서 기존 span 찾기
        let parentSpan: HTMLSpanElement | null = null;
        let current: Node | null = range.startContainer;
        
        while (current && current !== editorRef.current) {
          if (current.nodeType === Node.ELEMENT_NODE && 
              (current as HTMLElement).tagName === 'SPAN') {
            parentSpan = current as HTMLSpanElement;
            break;
          }
          current = current.parentNode;
        }

        if (parentSpan) {
          // 기존 span의 font-size만 업데이트
          parentSpan.style.fontSize = `${sizePx}px`;
          logInfo('글자크기변경.기존span업데이트', { applied: `${sizePx}px` });
        } else {
          // 단어 확장 시도
          let expanded = expandSelectionToWordSmart();
          let selectedText = expanded.toString();
          
          if (!selectedText || selectedText.replace(/[\u200B\s]/g, '').length === 0) {
            // 최근접 텍스트 탐색
            const nearest = findNearestTextNode(range.startContainer);
            if (nearest) {
              const aux = document.createRange();
              aux.setStart(nearest, 0);
              aux.setEnd(nearest, nearest.length);
              expanded = expandRangeToWord(aux);
              selectedText = expanded.toString();
            }
          }

          if (selectedText && selectedText.replace(/[\u200B\s]/g, '').length > 0) {
            // 확장된 단어에 적용
            const frag = expanded.extractContents();
            const span = document.createElement('span');
            span.style.fontSize = `${sizePx}px`;
            span.appendChild(frag);
            expanded.insertNode(span);

            const after = document.createRange();
            after.setStartAfter(span);
            after.collapse(true);
            sel.removeAllRanges();
            sel.addRange(after);
            
            logInfo('글자크기변경.확장된단어적용', { applied: `${sizePx}px` });
          } else {
            // 빈 span 삽입
            const span = document.createElement("span");
            span.style.fontSize = `${sizePx}px`;
            const zwsp = document.createTextNode("\u200B");
            span.appendChild(zwsp);
            range.insertNode(span);

            const newRange = document.createRange();
            newRange.setStart(zwsp, 1);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            
            logInfo("글자크기변경.빈영역적용", { applied: `${sizePx}px` });
          }
        }
      } else {
        // 선택된 영역에 적용
        const contents = range.extractContents();
        const span = document.createElement("span");
        span.style.fontSize = `${sizePx}px`;
        span.appendChild(contents);
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        
        logInfo("글자크기변경.선택영역적용", { applied: `${sizePx}px` });
      }

      syncFromEditor();
      saveToHistory();
      saveSelection();
    } catch (error) {
      logError("글자크기변경.예외", error, { requested: sizePx });
    }
  };

  // === contentEditable 헬퍼 끝 ===

  /**
   * HTML 태그를 제거하고 순수 텍스트 길이 계산
   */
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  const determinePostType = (tags: string, title: string, content: string): string => {
    const allText = `${tags} ${title} ${stripHtml(content)}`.toLowerCase();
  
    if (allText.includes("질문") || allText.includes("?")) return "질문";
    if (allText.includes("후기") || allText.includes("경험")) return "후기";
    if (allText.includes("정보") || allText.includes("팁")) return "정보";
    return "기타";
  };

  /**
   * 게시글 작성/수정 제출 핸들러
   */
  const handleSubmitPost = async () => {
    logInfo('게시글제출.시작', { isEditMode });
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
      const payload = {
        board: initialBoard,
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      logInfo('게시글제출.페이로드', payload);
      
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
          logInfo('게시글제출.수정성공', { response: data });
          showToast("게시글이 수정되었습니다.", { type: "success" });
          navigate(`/PG500001/PG500041/PG500042/${data.id ?? editPost.id}?board=${initialBoard}`, {
            replace: true,
          });
          return;
        } catch (error) {
          logError("게시글제출.오류", error);
          const posts = JSON.parse(
            localStorage.getItem("communityPosts") || "[]"
          );
          const idx = posts.findIndex((p: PostDetailWithFlags) => p.id === editPost.id);
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
        logInfo('게시글제출.생성성공', { response: data });
        showToast("게시글이 성공적으로 작성되었습니다.", { type: "success" });
        navigate(`/PG500001/PG500041/PG500042/${data.id}?board=${initialBoard}`, { replace: true });
        return;
      } catch (error) {
        logError("게시글제출.오류", error);
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
      console.error("게시글 작성/수정 실패:", error);
      showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = () => {
    logInfo('취소처리.시작');
    const hasContent = newPost.title.trim() || newPost.content.trim();
    const go = () => {
      if (isEditMode && editPost?.id) {
        logInfo('취소처리.상세페이지로 이동', { postId: editPost.id });
        navigate(`/PG500001/PG500041/PG500042/${editPost.id}?board=${initialBoard}`);
      } else {
        logInfo('취소처리.목록페이지로 이동', { board: initialBoard });
        navigate(`/PG500001/PG500041?board=${initialBoard}`);
      }
    };

    if (hasContent) {
      logInfo('취소처리.내용있음.확인요청');
      if (window.confirm("작성 중인 내용이 있습니다. 정말 취소하시겠습니까?")) {
        go();
      } else {
        logInfo('취소처리.사용자취소');
      }
    } else {
      go();
    }
  };

  /**
   * 태그 입력 핸들러
   */
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      logInfo('태그입력.엔터키', { value: e.currentTarget.value });
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
                onClick={() => toggleHeading(1)}
                title="제목1 (32px)"
              >
                H1
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleHeading(2)}
                title="제목2 (24px)"
              >
                H2
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleInlineStyle('b')}
                title="굵게"
              >
                B
              </button>
              <button
                type="button"
                className="tb-btn"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleInlineStyle('i')}
                title="기울임"
              >
                <i>I</i>
              </button>
              <select
                className="tb-select"
                onChange={(e) => {
                  const raw = (e.target as HTMLSelectElement).value;
                  const val = Number(raw);
                  logInfo("폰트크기선택.변경", { raw, val, isNaN: isNaN(val) });

                  if (isNaN(val)) {
                    logError("폰트크기선택.NaN", "유효하지 않은 폰트 크기 값", { raw });
                    return;
                  }
                  try {
                    restoreSelection();
                    setFontSize(val);
                    editorRef.current?.focus();
                    saveSelection();
                    logInfo("폰트크기선택.적용됨", { applied: val });
                  } catch (error) {
                    logError("폰트크기선택.적용실패", error, { requested: val });
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
                onClick={() => toggleInlineStyle('s')}
                title="취소선"
              >
                S
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
                    logInfo('파일첨부.선택', { name: file.name, size: file.size, type: file.type });

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
              onInput={handleInput}
              onBeforeInput={saveSelection}
              onMouseUp={saveSelection}
              onKeyDown={handleKeyDown}
              onKeyUp={saveSelection}
              onFocus={saveSelection}
              onBlur={handleBlur}
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
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                Ctrl+Z: 실행취소, Ctrl+Y: 다시실행
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
              disabled={isSubmitting}
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