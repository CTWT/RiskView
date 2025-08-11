import React, { useState } from "react";
import { FiEye, FiEyeOff, FiChevronLeft, FiCheck } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast";
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import PageContainer from "../../../../components/layout/PageContainer";

// 새 비밀번호 설정 페이지 컴포넌트

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.08.08
 * 파일명 : PG300011.tsx
 */

/**
 * PG300011 Props 인터페이스
 * @interface PG300011Props
 * @param {string} userId - 비밀번호를 재설정할 사용자 아이디
 * @param {function} onLogin - 재설정 완료 후 로그인 페이지로 이동하는 콜백 함수
 */
interface PG300011Props {
  userId: string;
  onLogin: () => void;
}

/**
 * 새 비밀번호 설정 컴포넌트 (PG300011)
 * 이메일 인증을 통과한 사용자의 새로운 비밀번호를 설정하는 페이지
 * - 새 비밀번호와 비밀번호 확인 입력
 * - 비밀번호 강도 검증
 * - 비밀번호 일치 여부 확인
 * - 비밀번호 보기/숨기기 토글
 * - 재설정 완료 후 로그인 페이지로 이동
 *
 * @param {PG300011Props} props - 컴포넌트 props
 * @returns {JSX.Element} - 새 비밀번호 설정 폼 UI 컴포넌트
 */
const PG300011: React.FC<PG300011Props> = ({ userId, onLogin }) => {

  // 커스텀 훅 초기화
  const { toast, showToast } = useToast();


  // 컴포넌트 상태 관리
  /** 새 비밀번호 상태 */
  const [newPassword, setNewPassword] = useState<string>("");

  /** 비밀번호 확인 상태 */
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  /** 새 비밀번호 표시/숨김 상태 */
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  /** 비밀번호 확인 표시/숨김 상태 */
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  /** 로딩 상태 관리 */
  const [isLoading, setIsLoading] = useState<boolean>(false);


  // 유효성 검사 함수들
  /**
   * 비밀번호 강도 검증 함수
   * 최소 6자 이상, 영문+숫자 조합 권장
   *
   * @param {string} password - 검사할 비밀번호
   * @returns {boolean} - 유효한 비밀번호면 true
   */
  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      showToast("비밀번호는 최소 6자 이상이어야 합니다.", { type: "error" });
      return false;
    }

    // 추가 보안 규칙 (필요시 활성화)
    // const hasLetter = /[a-zA-Z]/.test(password);
    // const hasNumber = /\d/.test(password);
    // if (!hasLetter || !hasNumber) {
    //   showToast("비밀번호는 영문과 숫자를 모두 포함해야 합니다.", { type: "error" });
    //   return false;
    // }

    return true;
  };

  /**
   * 비밀번호 일치 검증 함수
   *
   * @returns {boolean} - 비밀번호가 일치하면 true
   */
  const validatePasswordMatch = (): boolean => {
    if (newPassword !== confirmPassword) {
      showToast("비밀번호가 일치하지 않습니다.", { type: "error" });
      return false;
    }
    return true;
  };

  // 이벤트 핸들러 함수들
  /**
   * 비밀번호 재설정 처리 함수
   * 새 비밀번호를 서버에 전송하여 업데이트
   */
  const handlePasswordReset = async () => {
    // 입력값 검증
    if (!newPassword.trim()) {
      showToast("새 비밀번호를 입력해주세요.", { type: "error" });
      return;
    }

    if (!confirmPassword.trim()) {
      showToast("비밀번호 확인을 입력해주세요.", { type: "error" });
      return;
    }

    // 비밀번호 강도 검증
    if (!validatePassword(newPassword)) {
      return;
    }

    // 비밀번호 일치 검증
    if (!validatePasswordMatch()) {
      return;
    }

    setIsLoading(true);

    // 목업 데이터 처리 (네트워크 요청 없음)
    setTimeout(() => {
      try {
        // 성공: 비밀번호 재설정 완료
        showToast("비밀번호가 성공적으로 변경되었습니다.", { type: "success" });

        // 1.5초 후 로그인 페이지로 이동
        setTimeout(() => {
          onLogin();
        }, 1500);

        /* TODO: 실제 백엔드 연동 시 아래 코드로 교체
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            userId: userId,
            newPassword: newPassword.trim()
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          showToast("비밀번호가 성공적으로 변경되었습니다.", { type: "success" });
          setTimeout(() => {
            onLogin();
          }, 1000);
        } else {
          showToast(data.message || "비밀번호 재설정에 실패했습니다.", { type: "error" });
        }
        */
      } catch (error) {
        console.error("비밀번호 재설정 오류:", error);
        showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1초 로딩 시뮬레이션
  };

  /**
   * 폼 제출 핸들러
   *
   * @param {React.FormEvent} e - 폼 제출 이벤트
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordReset();
  };

  // JSX 렌더링
  return (
    <PageContainer showBreadcrumb={false} centerContent={true}>
      <div className="authWrapper">
        <div className="authContainer">

          {/* 로그인으로 돌아가기 버튼 */}
          <p onClick={onLogin} className="backToLogin">
            <FiChevronLeft />
            로그인으로 돌아가기
          </p>

          {/* 단계 표시 아이콘 */}
          <div className="progressContainer">
            {/* 1단계 완료 아이콘 */}
            <div className="progressCompleted">
              <FiCheck />
            </div>

            {/* 연결선 */}
            <div className="progressConnector"></div>

            {/* 2단계 완료 아이콘 */}
            <div className="progressCompleted">
              <FiCheck />
            </div>
          </div>

          {/* 페이지 제목 */}
          <h1 className="authTitle">새 비밀번호 설정</h1>

          {/* 설명 텍스트 */}
          <p className="authDescription">새로운 비밀번호를 입력해주세요.</p>

          <form onSubmit={handleSubmit}>
            {/* 새 비밀번호 입력 필드 */}
            <div className="authFormRow">
              <div className="passwordWrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호"
                  className="authInput"
                  disabled={isLoading}
                />
                <span
                  className="passwordIcon"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* 새 비밀번호 확인 입력 필드 */}
            <div className="authFormRow">
              <div className="passwordWrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  className="authInput"
                  disabled={isLoading}
                />
                <span
                  className="passwordIcon"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* 비밀번호 안내 텍스트 */}
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                marginBottom: "20px",
                lineHeight: "1.4",
                textAlign: "center",
              }}
            >
              비밀번호는 최소 6자 이상으로 설정해주세요.
            </p>

            {/* 비밀번호 재설정 완료 버튼 */}
            <button
              type="submit"
              className="authButton"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? "재설정 중..." : "비밀번호 재설정 완료"}
            </button>
          </form>

          {/* 토스트 메시지 컴포넌트 */}

          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default PG300011;
