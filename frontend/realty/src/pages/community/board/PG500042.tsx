import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import useToast from "../../../hooks/useToast";
import { AuthContext } from "../../auth/components/authentication/AuthContext";
import axios from "axios";

/**
 * @file PG500042.tsx
 * @description 자유게시판 상세 페이지입니다
 *
 */

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.08.19
 * 수정일 : 25.09.03
 * 파일명 : PG500042.tsx
 */

// 게시글 상세 정보를 나타내는 인터페이스
// - 게시글 id, 제목, 작성자, 날짜, 내용, 조회수, 좋아요, 댓글 목록 등 포함
// - likedByMe: 현재 사용자가 좋아요를 눌렀는지 여부 (백엔드 연동 시 사용)
interface PostDetail {
  id: number;
  board: 'free' | 'support';
  title: string;
  author: string;
  authorId?: string; // 추가
  date: string;
  content: string;
  tags: string[];
  views: number;
  likes: number;
  likedByMe?: boolean; // 내가 좋아요 눌렀는지 (백엔드 연동 시)
  comments: Comment[];
}

// PostDetail에 추가적인 플래그(__fromWrite)를 포함한 확장 인터페이스
// - __fromWrite: 글 작성 후 이동 시 임시 상태임을 표시
export interface PostDetailWithFlags extends PostDetail {
  __fromWrite?: boolean;
  isEdit?: boolean;
}

// 댓글 정보를 나타내는 인터페이스
// - id, 작성자, 작성자 id, 날짜, 내용 포함
interface Comment {
  id: number;
  author: string;
  authorId?: string; // 추가
  date: string;
  content: string;
}

/**
 * localStorage에서 현재 사용자 정보를 읽어 반환
 * 저장 포맷: JSON 문자열 
 * @returns {any | null} 사용자 객체 또는 null
 */
const getCurrentUser = async () => {
  try {
    const res = await axios.get("/api/user/me", {
      withCredentials: true, // 세션 쿠키 포함
    })
    console.log(res.data)
    return res.data; // { success: true, user: { ... } }
  } catch (err) {
    console.error("사용자 정보 요청 실패:", err);
    return null;
  }
};

// 게시글 상세 화면 컴포넌트
// - 게시글 불러오기, 수정/삭제, 좋아요, 댓글 CRUD 지원
const PG500042: React.FC = () => {
  console.log('[PG500042] 컴포넌트 렌더링됨');
  const { isLoggedIn } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();
  // 댓글 입력창 상태
  const [newComment, setNewComment] = useState<string>("");
  // 좋아요 버튼 상태 (내가 눌렀는지)
  const [isLiked, setIsLiked] = useState<boolean>(false);
  // 댓글 작성 중 여부
  const [isCommentSubmitting, setIsCommentSubmitting] =
    useState<boolean>(false);
  // 댓글 수정 중인 댓글 id
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  // 댓글 수정 입력값
  const [editingContent, setEditingContent] = useState<string>("");
  // 댓글 수정 저장 중 여부
  const [isCommentUpdating, setIsCommentUpdating] = useState<boolean>(false);
  // 삭제 중인 댓글 id
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  // 게시글 수정 모드 여부
  const [isPostEditing, setIsPostEditing] = useState<boolean>(false);
  // 게시글 수정 제목/내용 상태
  const [postEditTitle, setPostEditTitle] = useState<string>("");
  const [postEditContent, setPostEditContent] = useState<string>("");
  // 게시글 수정/삭제 중 여부
  const [isPostUpdating, setIsPostUpdating] = useState<boolean>(false);
  const [isPostDeleting, setIsPostDeleting] = useState<boolean>(false);

  // 라우터 관련 훅
  const location = useLocation();
  const navigate = useNavigate();
  // 토스트 알림 훅
  const { showToast } = useToast();

  // 로딩/오류/게시글 데이터 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<PostDetailWithFlags | null>(null);

  // 게시글 제목을 브레드크럼(상단 경로)으로 동기화
  // - 게시글 로딩 후 제목이 바뀌면 react-router state로 전달
  const prevTitleRef = useRef<string | undefined>(post?.title);

  useEffect(() => {
    console.log('[PG500042] 제목 변경 시 브레드크럼 동기화');
    if (post?.title && post.title !== prevTitleRef.current) {
      prevTitleRef.current = post.title;
      navigate(location.pathname + location.search, {
        replace: true,
        state: { ...(location.state || {}), title: post.title },
      });
    }
  }, [post?.title, location.pathname, location.search, location.state, location.state?.title, navigate, prevTitleRef]);

  /**
   * 현재 라우트/쿼리/상태에서 게시글 ID를 추출
   * 우선순위: params → ?id= → location.state.id
   * @returns {string|null} 추출된 게시글 ID, 없으면 null
   */
  const getPostId = useCallback((): number | null => {
    const fromParams = id || null;
    if (fromParams) return parseInt(fromParams, 10);
    const search = new URLSearchParams(location.search);
    const fromQuery = search.get("id");
    if (fromQuery) return parseInt(fromQuery, 10);
    const st: Partial<PostDetailWithFlags> = location.state || {};
    if (st?.id) return Number(st.id);
    return null;
  }, [id, location.search, location.state]);

  /**
   * 서버 응답(JSON)을 화면 모델(PostDetailWithFlags)로 표준화
   * - 서버 필드명이 상이할 수 있어 여러 키 fallback 처리
   * - 누락값 기본값 세팅으로 렌더 오류 예방
   * - 댓글 배열도 표준화
   * @param {ApiPost} data 서버에서 내려온 원본 응답 객체
   * @returns {PostDetailWithFlags} 화면에서 사용 가능한 표준 모델
   */
  const normalize = useCallback((data: any): PostDetailWithFlags => {
    return {
      id: Number(data.id ?? 0),
      board: data.board ?? 'free',
      title: String(data.title ?? ""),
      author: String(data.author ?? "익명"),
      authorId: String(data.authorId ?? ""), // 추가
      date: String(data.date ?? ""),
      content: String(data.content ?? ""),
      tags: Array.isArray(data.tags) ? data.tags : [],
      views: Number(data.views ?? 0),
      likes: Number(data.likes ?? 0),
      likedByMe: Boolean(data.likedByMe ?? false),
      comments: Array.isArray(data.comments)
        ? data.comments.map((c: any) => ({
            id: Number(c.id ?? 0),
            author: String(c.author ?? "익명"),
            authorId: String(c.authorId ?? ""), // 추가
            date: String(c.date ?? ""),
            content: String(c.content ?? ""),
          }))
        : [],
      __fromWrite: Boolean((location.state as PostDetailWithFlags)?.__fromWrite ?? false),
    };
  }, [location.state]);

  /**
   * 문자열을 YYYY.MM.DD 형식으로 변환
   * 이미 포맷된 값은 그대로 반환
   * @param {string} raw 문자열 또는 이미 포맷된 날짜 문자열
   * @returns {string} YYYY.MM.DD 포맷의 문자열 또는 원본
   */
  const formatDate = (raw: string): string => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      const d = new Date(raw);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}.${m}.${day}`;
    }
    return raw;
  };

  /**
   * 간단한 인증 여부 판단
   * - accessToken/idToken/user 중 하나라도 존재하면 true
   * @returns {boolean} 인증 상태
   */
  const isAuthed = () => isLoggedIn;

  // 현재 사용자 정보 및 권한 플래그
  // - currentUser: 현재 사용자 정보
  // - currentUserId: 현재 사용자 id
  // - canEditPost: 게시글 수정/삭제 권한 여부(작성자 본인)

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    setCurrentUserId(user?.user?.userId || "");
    console.log("현재 사용자 ID:", user?.user?.userId);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);


  const canEditPost = Boolean(
    isAuthed() && post && post.authorId && currentUserId === post.authorId
  );

  // 초기 데이터 주입: 글 작성 후(작성페이지에서) state로 넘어온 경우 우선 반영
  React.useEffect(() => {
    const st: PostDetailWithFlags | undefined = location.state as PostDetailWithFlags;
    console.log('[PG500042] location.state에서 게시글 데이터 확인:', st);

    if (st && st.__fromWrite && st.id) {
      setPost(st);
    }
  }, [location.state]);

  // 게시글 상세 조회 (서버에서 데이터 fetch)
  // - id 없으면 목업 데이터로 대체 (버튼 활성화 목적)
  // - fetch 실패 시에도 목업으로 fallback
  React.useEffect(() => {
    // 1) 현재 라우터/쿼리/상태에서 게시글 ID를 결정
    const id = getPostId();
    console.log(`[PG500042] 게시글 ID ${id} 조회 시도`);
    console.log(`[PG500042] currentUserId: ${localStorage.getItem("accessToken")}`);
    
    if (!id) {
      setError("게시글 ID를 찾을 수 없습니다.");
      return;
    }

    // 3) 로딩 시작: 스피너/버튼 비활성화 등을 위한 플래그
    setIsLoading(true);
    // 4) 기존 오류 메시지 초기화
    setError(null);

    // 5) 서버에 상세 조회 요청
    fetch(`/api/posts/${id}`)
      // 5-1) HTTP 에러 상태를 명시적으로 처리 (200~299가 아니면 throw)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text(); // 서버가 보낸 에러 메시지 본문 확보(가능한 경우)
          throw new Error(text || `HTTP ${res.status}`); // 잡힐 수 있는 에러 객체로 변환
        }
        return res.json(); // 정상 응답(JSON) 파싱
      })
      // 6) 성공 시: 서버 응답을 화면 표준 모델로 정규화해서 상태에 반영
      .then((data) => {
        console.log('[PG500042] 게시글 데이터 로딩 성공:', data);
        setPost(normalize(data));
      })
      // 7) 실패 시: 콘솔 경고 + 사용자용 에러 메시지 설정
      .catch((error) => {
        console.error("[PG500042] 게시글 조회 실패:", error);
        setError(error.message || "게시글을 불러오지 못했습니다.");
      })
      // 8) 성공/실패와 관계없이 로딩 종료
      .finally(() => setIsLoading(false));
    
    // 9) 의존성: URL 파라미터 id 또는 쿼리스트링이 바뀔 때마다 재요청
  }, [id, location.search, location.state, getPostId, normalize]);

  // 좋아요 수 계산 (서버 값 사용)
  const likeCount = Number(post?.likes ?? 0);
  // 서버 likedByMe 동기화 (post 변경 시)
  React.useEffect(() => {
    if (post) setIsLiked(Boolean(post.likedByMe));
  }, [post, post?.id, post?.likedByMe, setIsLiked]);

  // 조회수 증가 요청 (마운트 시 1회만)
  const viewedOnceRef = React.useRef(false);
  React.useEffect(() => {
    const pid = getPostId();
    if (!pid) return;
    console.log(`[PG500042] 게시글 ID ${pid} 조회수 증가 시도`);
    if (viewedOnceRef.current) return;
    viewedOnceRef.current = true;
    fetch(`/api/posts/${pid}/views`, { method: "POST" }).catch(() => {});
  }, [getPostId]);


  /*
  const addLocalComment = (content: string) => {
    // 1) 현재 시각을 표시용 문자열로 구성 (YYYY.MM.DD HH:mm)
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    // 2) 서버 미연동 시 표시할 작성자 이름(임시)
    const authorName = currentUser?.name || "나";

    // 3) 클라이언트에서 임시로 생성한 댓글 객체
    const newC: Comment = {
      id: Date.now(), // 로컬 임시 ID
      authorId: currentUserId,
      author: authorName,                // 작성자명
      date: `${y}.${m}.${d} ${hh}:${mm}`,// 표시용 날짜
      content,                           // 댓글 본문
    };

    // 4) 게시글 상태에 댓글을 추가
    setPost((prev) => {
      if (prev) {
        // 기존 게시글 상태가 있으면 그 배열 뒤에 추가
        return { ...prev, comments: [...prev.comments, newC] };
      }
      // prev가 null이면 임시 게시글을 만들어서 댓글을 붙임 (백엔드 미연결 대비)
      return {
        id: 0,
        board: 'free',
        title: "",
        author: currentUser?.name || "나",
        date: new Date().toISOString(),
        content: "",
        views: 0,
        tags: [],
        likes: 0,
        comments: [newC],
        __fromWrite: true,
      } as PostDetailWithFlags;
    });
  };
  */

  /**
   * 로컬 상태의 댓글 내용을 수정
   * @param {string} commentId 대상 댓글 ID
   * @param {string} content 새 댓글 내용
   * @returns {void}
   */
  const updateLocalComment = (commentId: number, content: string) => {
    // 댓글 배열에서 대상 ID를 찾아 내용만 교체
    setPost((prev) => {
      if (!prev) return prev; // 게시글 없음 → 그대로 반환
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId ? { ...c, content } : c
        ),
      };
    });
  };

  /**
   * 로컬 상태에서 댓글을 제거
   * @param {string} commentId 삭제할 댓글 ID
   * @returns {void}
   */
  const removeLocalComment = (commentId: number) => {
    // 댓글 배열에서 대상 ID를 제거
    setPost((prev) => {
      if (!prev) return prev; // 게시글 없음 → 그대로 반환
      return {
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      };
    });
  };

  /**
   * 댓글 수정 모드로 진입
   * @param {string} commentId 수정할 댓글 ID
   * @param {string} current 현재 댓글 내용
   * @returns {void}
   */
  const startEditComment = (commentId: number, current: string) => {
    console.log(`[PG500042] 댓글 수정 시작, ID: ${commentId}`);
    setEditingCommentId(commentId);
    setEditingContent(current);
  };

  /**
   * 댓글 수정 모드를 취소하고 입력값을 초기화
   * @returns {void}
   */
  const cancelEditComment = () => {
    console.log('[PG500042] 댓글 수정 취소됨');
    setEditingCommentId(null);
    setEditingContent("");
  };

  /**
   * 댓글 수정 내용을 서버에 저장
   * - 서버 실패 시 로컬 상태만 업데이트하여 UI 일관성을 유지
   * @param {string} commentId 수정 대상 댓글 ID
   * @returns {Promise<void>}
   */
  const submitEditComment = async (commentId: number) => {
    // 1) 현재 게시글 ID 확인
    console.log(`[PG500042] 댓글 수정 제출, ID: ${commentId}`);
    const id = getPostId();
    // 2) 입력값 트림 및 공백 방지
    const content = editingContent.trim();
    if (!content) return; // 빈 문자열이면 무시

    setIsCommentUpdating(true); // 저장 중 UI 상태
    try {
      if (id) {
        // 3) 서버에 댓글 수정 요청 (PUT)
        const res = await fetch(`/api/posts/${id}/comments/${commentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 쿠키를 포함하도록 설정
          body: JSON.stringify({
            content
          }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP error! status: ${res.status}`);
        }
        // 성공 시 로컬 상태 업데이트
        updateLocalComment(commentId, content);
        showToast("댓글이 수정되었습니다.", { type: "success" });
      }
      // 게시글 ID가 없으면 아무것도 하지 않음 (이론상 발생 불가)
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 수정에 실패했습니다.";
      showToast(message, { type: "error" });
      console.error("댓글 수정 실패:", error);
    } finally {
      // 7) 저장 종료 + 수정모드 해제
      setIsCommentUpdating(false);
      cancelEditComment();
    }
  };

  /**
   * 댓글을 서버에서 삭제
   * - 성공 시 로컬 상태에서도 제거
   * - 실패 시 별도 복구는 수행하지 않음
   * @param {string} commentId 삭제 대상 댓글 ID
   * @returns {Promise<void>}
   */
  const deleteComment = async (commentId: number) => {
    // 1) 현재 게시글 ID 확인
    console.log(`[PG500042] 댓글 삭제 시도, ID: ${commentId}`);
    const id = getPostId();
    if (!id) return;

    setDeletingCommentId(commentId);
    try {
      // 2) 서버 삭제 요청
      const res = await fetch(`/api/posts/${id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }
      // 3) 성공 시 로컬 목록에서도 제거
      removeLocalComment(commentId);
      showToast("댓글이 삭제되었습니다.", { type: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.";
      showToast(message, { type: "error" });
      console.error("댓글 삭제 실패:", error);
    } finally {
      setDeletingCommentId(null); // 버튼 상태 원복
    }
  };

  /**
   * 게시글 수정 모드를 종료하고 편집 버퍼를 초기화
   * @returns {void}
   */
  const cancelPostEdit = () => {
    console.log('[PG500042] 게시글 수정 취소됨');
    setIsPostEditing(false);
    setPostEditTitle("");
    setPostEditContent("");
  };

  /**
   * 게시글 수정 내용을 서버에 저장
   * - 서버 실패 시 로컬 상태만 업데이트하여 UI 일관성을 유지
   * @returns {Promise<void>}
   */
  const submitPostEdit = async () => {
    console.log('[PG500042] 게시글 수정 제출');
    if (!post) return; // 게시글이 없으면 무시
    const id = getPostId();

    // 1) 서버에 보낼 페이로드 구성 (제목은 트림)
    const payload = {
      title: postEditTitle.trim(),
      content: postEditContent,
      tags: post.tags || [],
    };
    if (!payload.title) return; // 빈 제목 방지

    setIsPostUpdating(true); // 저장 중 UI 상태
    try {
      if (id) {
        // 2) 서버 수정 요청 (PUT)
        const res = await fetch(`/api/posts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP error! status: ${res.status}`);
        }
        const updatedPost = await res.json();
        console.log('[PG500042] 게시글 수정 성공, 새 데이터:', updatedPost);
        setPost(normalize(updatedPost));
        showToast("게시글이 수정되었습니다.", { type: "success" });
        setIsPostEditing(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "게시글 수정에 실패했습니다.";
      showToast(message, { type: "error" });
      console.error("게시글 수정 실패:", error);
    } finally {
      setIsPostUpdating(false); // 저장 중 상태 해제
    }
  };

  /**
   * 현재 게시글을 서버에서 삭제
   * - 성공 시 목록 페이지로 이동
   * - 삭제 전 인증/확인 모달 처리 포함
   * @returns {Promise<void>}
   */
  const deletePostNow = async () => {
    console.log('[PG500042] 게시글 삭제 시도');
    const id = getPostId();
    if (!id) return; // ID 없으면 무시

    // 1) 인증 검사: 비로그인 시 로그인 페이지로 이동
    if (!isAuthed()) {
      showToast("로그인이 필요합니다.", { type: "error" });
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    // 2) 사용자 확인 모달
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    setIsPostDeleting(true); // 삭제 중 상태
    try {
      // 3) 서버 삭제 요청
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }
      // 4) 성공: 목록으로 이동
      console.log(`[PG500042] 게시글 ID ${id} 삭제 성공. 목록으로 이동합니다.`);
      showToast("게시글이 삭제되었습니다.", { type: "success" });
      navigate(`/PG500001/PG500041?board=${post?.board || 'free'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.";
      showToast(message, { type: "error" });
      console.error("게시글 삭제 실패:", error);
      // 네트워크 예외: 상태 원복
      setIsPostDeleting(false);
    }
  };

  /**
   * 게시글 수정 페이지(PG500043)로 이동
   * - 미인증 시 로그인 페이지로 리다이렉트
   * - 현재 게시글 정보를 state로 전달
   * @returns {void}
   */
  const goToEditPage = () => {
    console.log('[PG500042] 수정 페이지로 이동');
    if (!post) return; // 게시글이 없으면 무시

    // 1) 인증 검사: 비로그인 시 로그인 페이지로 이동
    if (!isAuthed()) {
      showToast("로그인이 필요합니다.", { type: "error" });
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    // 2) 수정 페이지(PG500043)로 이동하며 현재 게시글 정보를 state로 전달
    navigate("../PG500041/PG500043", { state: { ...post, isEdit: true } });
  };

  /**
   * 좋아요 토글 핸들러
   * 1) 로그인 필수 (미인증 시 로그인으로 리다이렉트)
   * 2) 즉시 UI 반영
   * 3) 서버에 POST/DELETE 요청 전송
   * 4) 성공 시 서버 응답으로 동기화, 실패 시 롤백
   * @returns {Promise<void>}
   */
  const handleLike = async () => {
    console.log('[PG500042] 좋아요 버튼 클릭됨');
    // 1) 인증 검사: 비로그인 시 로그인 페이지로 이동
    if (!isAuthed()) {
      showToast("로그인이 필요합니다.", { type: "error" });
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!post) return; // 게시글 없으면 무시

    const pid = post.id;
    const prevLiked = isLiked; // 이전 좋아요 상태 저장(롤백용)

    console.log(`[PG500042] 게시글 ID ${pid} 좋아요 토글. 이전 상태: ${prevLiked}`);
    // 2) 낙관적 토글: 즉시 UI 반영 (느린 네트워크 대비 체감 개선)
    setIsLiked(!prevLiked);
    setPost((prev) =>
      prev
        ? {
            ...prev,
            likes: Math.max(0, Number(prev.likes ?? 0) + (prevLiked ? -1 : 1)),
            likedByMe: !prevLiked,
          }
        : prev
    );

    try {
      // 3) 서버에 토글 요청 (좋아요 추가: POST / 취소: DELETE)
      const method = prevLiked ? "DELETE" : "POST";
      const res = await fetch(`/api/posts/${pid}/likes`, { method, headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        // 4) 성공: 서버 응답값으로 동기화 (정확한 카운트/상태 적용)
        const data = await res.json().catch(() => null);
        console.log('[PG500042] 좋아요 토글 성공. 서버 응답:', data);
        setIsLiked(Boolean(data?.likedByMe ?? !prevLiked));
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likes: Number(data?.likes ?? prev.likes ?? 0),
                likedByMe: Boolean(data?.likedByMe ?? !prevLiked),
              }
            : prev
        );
      } else {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
        /* This part is now unreachable due to the throw, but kept for logic reference
        // 5) 실패: 낙관적 업데이트 롤백
        setIsLiked(prevLiked);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likes: Math.max(
                  0,
                  Number(prev.likes ?? 0) + (prevLiked ? 1 : -1)
                ),
                likedByMe: prevLiked,
              }
            : prev
        );
        */
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.";
      showToast(message, { type: "error" });
      console.error("좋아요 토글 실패:", error);
      // 6) 네트워크 예외: 롤백
      setIsLiked(prevLiked);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likes: Math.max(
                0,
                Number(prev.likes ?? 0) + (prevLiked ? 1 : -1)
              ),
              likedByMe: prevLiked,
            }
          : prev
      );
    }
  };

  /**
   * 댓글 작성 핸들러
   * - 로그인 필요
   * - 서버 POST 실패 시 로컬 상태에만 추가하여 경험 보장
   * @returns {Promise<void>}
   */
  const handleCommentSubmit = async () => {
    console.log('[PG500042] 새 댓글 제출');
    // 1) 인증 검사: 비로그인 시 로그인 페이지로 이동
    if (!isAuthed) {
      showToast("댓글 작성은 로그인 후 이용 가능합니다.", { type: "error" });
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    console.log('인증 상태:', isLoggedIn);

    // 2) 입력값 정리 및 공백 방지
    const content = newComment.trim();
    if (!content) return; // 빈 댓글 방지

    const id = getPostId();
    setIsCommentSubmitting(true); // 작성 중 상태
    try {
      if (id) {
        console.log(`[PG500042] 게시글 ID ${id}에 댓글 작성 시도`);
        // 3) 서버에 댓글 작성 요청 (POST)
        const res = await fetch(`/api/posts/${id}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 쿠키를 포함하도록 설정
          body: JSON.stringify({
            content,
          }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP error! status: ${res.status}`);
        }
        // 4) 서버 성공: 응답값으로 상태 업데이트
        const newCommentData = await res.json();
        console.log('[PG500042] 댓글 제출 성공. 새 댓글 데이터:', newCommentData);
        setPost((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: [...prev.comments, newCommentData],
          };
        });
        showToast("댓글이 작성되었습니다.", { type: "success" });
      }

      // 6) 입력창 초기화
      setNewComment("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 작성에 실패했습니다.";
      showToast(message, { type: "error" });
      console.error("댓글 작성 실패:", error);
    } finally {
      setIsCommentSubmitting(false); // 작성 중 상태 해제
    }
  };

  return (
    // PageContainer: 상단 브레드크럼/중앙정렬 레이아웃 컴포넌트
    <PageContainer showBreadcrumb={true} centerContent={true}>
      <div className="post-detail">
        {error && <div className="post-error">오류: {error}</div>}
        {/* 게시글 로딩 중 표시 */}
        {isLoading && <div className="post-loading">게시글을 불러오는 중…</div>}
        {/* 게시물 상세 헤더/제목/수정삭제 버튼 */}
        <header className="post-header">
          {/* 제목 및 수정/삭제 버튼 영역 */}
          <div className="post-header-top">
            {/* 게시글 제목 */}
            <h1 className="post-title">{post?.title ?? ""}</h1>
            {/* 게시글 수정/삭제 버튼 (작성자 본인에게만 노출) */}
            {canEditPost &&
              (!isPostEditing ? (
                <div className="post-header-actions">
                  <button
                    className="post-edit-btn"
                    onClick={goToEditPage}
                    disabled={!post}
                  >
                    게시글 수정
                  </button>
                  <button
                    className="post-delete-btn"
                    onClick={deletePostNow}
                    disabled={isPostDeleting || !post}
                  >
                    {isPostDeleting ? "삭제 중…" : "게시글 삭제"}
                  </button>
                </div>
              ) : (
                <div className="post-header-actions">
                  <button
                    className="post-save-btn"
                    onClick={submitPostEdit}
                    disabled={isPostUpdating || !postEditTitle.trim()}
                  >
                    {isPostUpdating ? "저장 중…" : "수정 저장"}
                  </button>
                  <button
                    className="post-cancel-btn"
                    onClick={cancelPostEdit}
                    disabled={isPostUpdating}
                  >
                    수정 취소
                  </button>
                </div>
              ))}
          </div>
          {/* 작성자/작성일 정보 */}
          <div className="post-meta">
            <span className="post-author">작성자: {post?.author ?? ""}</span>
            <span className="post-date">{formatDate(post?.date ?? "")}</span>
          </div>
          <hr className="post-divider" />
        </header>

        {/* 게시글 내용 영역 (수정모드/조회모드 분기) */}
        {!isPostEditing ? (
          <div className="post-content">
            {post?.content ? (
              post.__fromWrite ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                post.content
                  .split("\n")
                  .map((line, index) => <p key={index}>{line}</p>)
              )
            ) : isLoading ? (
              <p>불러오는 중...</p>
            ) : (
              <p>내용이 없습니다.</p>
            )}
          </div>
        ) : (
          // 게시글 수정 폼
          <div className="post-editing" style={{ marginTop: 12 }}>
            <div className="form-section" style={{ marginBottom: 12 }}>
              <label className="form-label">제목</label>
              <input
                className="form-input title-input"
                value={postEditTitle}
                onChange={(error) => setPostEditTitle(error.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div className="form-section">
              <label className="form-label">내용 (HTML 가능)</label>
              <textarea
                className="form-textarea content-textarea"
                rows={12}
                value={postEditContent}
                onChange={(error) => setPostEditContent(error.target.value)}
                placeholder="내용을 입력하세요"
              />
            </div>
          </div>
        )}
        <hr className="post-divider" />

        {/* 좋아요/조회수 영역 */}
        <div className="post-actions">
          {/* 좋아요 버튼 (로그인 필요, 낙관적 토글) */}
          <button
            className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            👍 좋아요 {likeCount}
          </button>
          <div className="post-stats">
            <span>조회 {(post?.views ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* AI 감성분석 섹션 (샘플/목업) */}
        <section className="ai-analysis">
          <h3 className="analysis-title">AI 감성분석</h3>
          <div className="analysis-content">
            <div className="emotion-badges">
              <div className="score-item sentiment-score">
                <div className="sentiment-label">
                  <span className="sentiment-emoji">😊</span>
                  <span className="sentiment-text">긍정적 정보 공유</span>
                </div>
                <div className="sentiment-bar-wrapper">
                  <span className="sentiment-score-label">감정 점수:</span>
                  <div className="sentiment-bar-bg">
                    <div
                      className="sentiment-bar-fill"
                      style={{ width: "82%" }}
                    />
                  </div>
                  <span className="sentiment-score-number">82/100</span>
                </div>
              </div>
              <hr className="emotion-divider" />
              <span className="emotion-badge neutral">🤖 AI 분석 결과</span>
            </div>

            <p className="analysis-text">
              이 게시글은 실제 경험을 바탕으로 한 유용한 정보를 담고 있습니다.
              특히 전세 계약 시 주의사항과 RiskView 서비스 사용 후기가 다른
              사용자들에게 큰 도움이 될 것으로 분석됩니다. 긍적적이고 건설적인
              내용으로 커뮤니티에 가치를 더하는 게시글입니다.
            </p>

            <div className="analysis-scores">
              <div className="score-item">
                <span className="score-label">정보 가치</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: "82%" }}></div>
                </div>
                <span className="score-number">82/100</span>
              </div>

              <div className="score-item">
                <span className="score-label">특히 만족</span>
                <div className="score-bar">
                  <div
                    className="score-fill positive"
                    style={{ width: "78%" }}
                  ></div>
                </div>
                <span className="score-number">매우 정확한</span>
              </div>

              <div className="score-item">
                <span className="score-label">유용도</span>
                <div className="score-bar">
                  <div
                    className="score-fill excellent"
                    style={{ width: "91%" }}
                  ></div>
                </div>
                <span className="score-number">구체 유용</span>
              </div>
            </div>

            <hr className="emotion-divider" />
            <div className="analysis-footer">
              <small>
                🔎 분석 기준: 키워드 감정 분석, 정보 유용성, 커뮤니티 기여도
              </small>
              <span className="analysis-timestamp">
                🕐 분석 시간: 2025.08.15 오후 17:39:48
              </span>
            </div>
          </div>
        </section>

        {/* 댓글 섹션 */}
        <section className="comments-section">
          {/* 댓글 개수 타이틀 */}
          <h3 className="comments-title">댓글 {post?.comments.length ?? 0}</h3>

          {/* 댓글 목록 */}
          <div className="comments-list">
            {(post?.comments ?? []).map((comment) => {
              const isEditing = editingCommentId === comment.id;
              const isDeleting = deletingCommentId === comment.id;
              return (
                <div key={comment.id} className="comment-item">
                  <div className="comment-top">
                    <div className="comment-author">{comment.author}</div>
                    <div className="comment-date">{comment.date}</div>
                  </div>

                  {/* 댓글 수정모드/일반모드 분기 */}
                  {isEditing ? (
                    // 댓글 수정 폼
                    <div className="comment-editing">
                      <textarea
                        className="comment-edit-input"
                        rows={3}
                        value={editingContent}
                        onChange={(error) => setEditingContent(error.target.value)}
                        disabled={isCommentUpdating}
                      />
                      <div className="comment-edit-actions">
                        <button
                          className="comment-save-btn"
                          onClick={() => submitEditComment(comment.id)}
                          disabled={isCommentUpdating || !editingContent.trim()}
                        >
                          {isCommentUpdating ? "저장 중…" : "저장"}
                        </button>
                        <button
                          className="comment-cancel-btn"
                          onClick={cancelEditComment}
                          disabled={isCommentUpdating}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 댓글 내용 + 수정/삭제 버튼 (작성자 본인만 노출)
                    <div className="comment-content-row">
                      <div className="comment-content">{comment.content}</div>
                      {(canEditPost || (isAuthed() &&
                        currentUserId === (comment.authorId || ""))) && (
                          <div className="comment-actions">
                            <button
                              className="comment-edit-btn"
                              onClick={() =>
                                startEditComment(comment.id, comment.content)
                              }
                              disabled={Boolean(deletingCommentId)}
                            >
                              수정
                            </button>
                            <button
                              className="comment-delete-btn"
                              onClick={() => deleteComment(comment.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "삭제 중…" : "삭제"}
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 댓글 입력 폼 */}
          <div className="comment-form">
            <textarea
              value={newComment}
              onChange={(error) => setNewComment(error.target.value)}
              onKeyDown={(error) => {
                if ((error.ctrlKey || error.metaKey) && error.key === "Enter") {
                  error.preventDefault();
                  if (!isCommentSubmitting && newComment.trim()) {
                    handleCommentSubmit();
                  }
                }
              }}
              placeholder="댓글을 입력하세요..."
              className="comment-input"
              rows={4}
              disabled={isCommentSubmitting}
            />
            <button
              onClick={handleCommentSubmit}
              className="comment-submit-btn"
              disabled={isCommentSubmitting || !newComment.trim()}
            >
              {isCommentSubmitting ? "작성 중..." : "댓글 작성"}
            </button>
          </div>
        </section>

        {/* 하단 네비게이션 (목록으로 돌아가기) */}
        <div className="post-navigation">
          <Link to={`/PG500001/PG500041?board=${post?.board || 'free'}`} className="nav-btn back-btn">
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

// 게시글 상세 컴포넌트 export
export default PG500042;
