import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageContainer from "../../../components/layout/PageContainer";
import Toast from "../../../components/ui/Toast";
import useToast from "../../../hooks/useToast";
import { type PostDetailWithFlags } from "./PG500042";
import RichTextEditorWithTinyMCE from "../../../components/text_editor/RichTextEditorWithTinyMCE";

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
  postType: "질문" | "후기" | "정보";
}

type BoardKey = 'free' | 'support';

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
    postType: editPost?.postType ?? "질문",
  });

  const [content, setContent] = useState(editPost?.content ?? "");
  // TinyMCE에서 변경 시
  const handleEditorChange = (value: string) => {
    setContent(value); // content 업데이트
    setNewPost((prev) => ({ ...prev, content: value }));
  };

  const uploadedImagesRef = useRef<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (fileName: string) => {
    setUploadedImages(prev => {
      const newArr = [...prev, fileName];
      uploadedImagesRef.current = newArr; // ref에 최신값 저장
      return newArr;
    });
};

  // 전송 중 상태 (버튼 비활성/스피너 표시)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 커스텀 훅 초기화 (토스트)
  const { toast, showToast } = useToast();

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
        imageNames: uploadedImagesRef.current,
        tags: newPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        postType: newPost.postType,
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
              image_names: payload.imageNames,
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
              내용
            </label>
          </div>

          <RichTextEditorWithTinyMCE
            content={content}
            handleEditorChange={handleEditorChange}
            onImageUpload={handleImageUpload}
          />

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

            <div className="form-section">
              <label className="form-label">게시글 유형</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="postType"
                    value="질문"
                    checked={newPost.postType === "질문"}
                    onChange={(e) =>
                      setNewPost({ ...newPost, postType: e.target.value as "질문" | "후기" | "정보" })
                    }
                  />
                  질문
                </label>
                <label>
                  <input
                    type="radio"
                    name="postType"
                    value="후기"
                    checked={newPost.postType === "후기"}
                    onChange={(e) =>
                      setNewPost({ ...newPost, postType: e.target.value as "질문" | "후기" | "정보" })
                    }
                  />
                  후기
                </label>
                <label>
                  <input
                    type="radio"
                    name="postType"
                    value="정보"
                    checked={newPost.postType === "정보"}
                    onChange={(e) =>
                      setNewPost({ ...newPost, postType: e.target.value as "질문" | "후기" | "정보" })
                    }
                  />
                  정보
                </label>
              </div>
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