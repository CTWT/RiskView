import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast";
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import PageContainer from "../../../../components/layout/PageContainer";

// 비밀번호 찾기 페이지 컴포넌트 (아이디+이메일 입력 → 인증번호 전송)

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.08.08
 * 파일명 : PG300009.tsx
 */

/**
 * PG300009 Props 인터페이스
 * @interface PG300009Props
 * @param {function} onLogin - 로그인 페이지로 돌아가는 콜백 함수
 * @param {function} onFindId - 아이디 찾기 페이지로 이동하는 콜백 함수 (선택사항)
 * @param {function} onPasswordReset - 인증번호 전송 후 PG300010으로 이동하는 콜백 함수 (선택사항)
 */
interface PG300009Props {
  onLogin: () => void;
  onFindId?: () => void;
  onPasswordReset?: (userId: string, email: string) => void; // 인증번호 전송 후 PG300010으로 이동
}

/**
 * 비밀번호 찾기 컴포넌트 (1단계)
 * 사용자의 아이디와 이메일을 입력받아 인증번호를 전송하는 페이지
 *
 * - 아이디와 이메일 입력 및 검증
 * - 이메일 인증번호 전송
 * - 전송 성공 시 PG300010(인증번호 입력 페이지)로 이동
 *
 * @param {PG300009Props} props - 컴포넌트 props
 * @returns {JSX.Element} - 비밀번호 찾기 폼 UI 컴포넌트
 */
const PG300009: React.FC<PG300009Props> = ({
  onLogin,
  onFindId,
  onPasswordReset,
}) => {
  
  // 라우터 및 커스텀 훅 초기화
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // 상태 관리
  /** 사용자 입력 아이디 상태 */
  const [userId, setUserId] = useState<string>("");

  /** 사용자 입력 이메일 상태 */
  const [email, setEmail] = useState<string>("");

  /** 로딩 상태 관리 */
  const [isLoading, setIsLoading] = useState<boolean>(false);


  // 임시 목업 데이터 (백엔드 연동 전 테스트용)
  /** 임시 사용자 데이터 - 실제로는 백엔드에서 검증 */
  const mockUser = {
    userId: "princess",
    email: "homeprotector@home.go",
  };


  // 유효성 검사 함수들
  /**
   * 이메일 형식 유효성 검사 함수
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email);
  };


  // 이벤트 핸들러 함수들
  /**
   * 아이디 찾기 클릭 핸들러
   */
  const handleFindIdClick = () => {
    if (onFindId) {
      onFindId();
    } else {
      navigate("/pg/PG300008");
    }
  };

  /**
   * 인증번호 전송 처리 함수 (목업 모드)
   * 아이디와 이메일을 검증하고 목업 데이터와 비교하여 PG300010으로 이동
   */
  const handleSendVerificationCode = async () => {
    // 1단계: 기본 입력값 검증
    if (!userId.trim()) {
      showToast("아이디를 입력해주세요.", { type: "error" });
      return;
    }

    if (!email.trim()) {
      showToast("이메일을 입력해주세요.", { type: "error" });
      return;
    }

    // 2단계: 이메일 형식 검증
    if (!validateEmail(email.trim())) {
      showToast("올바른 이메일 형식을 입력해주세요.", { type: "error" });
      return;
    }

    // 3단계: 로딩 시작
    setIsLoading(true);

    // 4단계: 목업 데이터 검증 (네트워크 요청 없음)
    setTimeout(() => {
      try {
        // 목업 데이터와 비교
        if (
          userId.trim() === mockUser.userId &&
          email.trim() === mockUser.email
        ) {
          // 성공: 인증번호 전송 완료, PG300010으로 이동
          showToast("인증번호가 이메일로 전송되었습니다.", { type: "success" });

          // 잠시 후 PG300010으로 이동
          setTimeout(() => {
            if (onPasswordReset) {
              onPasswordReset(userId, email);
            } else {
              navigate("/pg/PG300010", { state: { userId, email } });
            }
          }, 1000);
        } else {
          // 실패: 일치하는 계정이 없음
          showToast("입력하신 정보와 일치하는 계정이 없습니다.", {
            type: "error",
          });
        }
      } catch (error) {
        console.error("목업 검증 오류:", error);
        showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
      } finally {
        setIsLoading(false);
      }
    }, 1500); // 1.5초 로딩 시뮬레이션

    /* 
    ================================
    TODO: 실제 백엔드 연동 시 아래 주석을 해제하고 위의 목업 로직을 삭제
    ================================
    
    try {
      const response = await fetch("/api/forgot_pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: userId.trim(),
          email: email.trim()
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast("인증번호가 이메일로 전송되었습니다.", { type: "success" });
        setTimeout(() => {
          if (onPasswordReset) {
            onPasswordReset(userId, email);
          } else {
            navigate("/pg/PG300010", { state: { userId, email } });
          }
        }, 1000);
      } else {
        const errorMessage = data.message || "입력하신 정보와 일치하는 계정이 없습니다.";
        showToast(errorMessage, { type: "error" });
      }
    } catch (error) {
      console.error("인증번호 전송 오류:", error);
      showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
    */
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendVerificationCode();
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

          {/* 페이지 제목 */}
          <h1 className="authTitle">비밀번호 찾기</h1>

          {/* 설명 텍스트 */}
          <p className="authDescription">
            아이디와 이메일을 입력하시면 인증번호를 보내드립니다.
          </p>

          {/* 임시 데모 안내 */}
          <div
            style={{
              backgroundColor: "#e3f2fd",
              border: "1px solid #90caf9",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                fontWeight: "bold",
                color: "#1565c0",
              }}
            >
              🧪 데모 테스트 데이터
            </p>
            <p style={{ margin: "0", color: "#1976d2", lineHeight: "1.4" }}>
              • 아이디: <strong>princess</strong>
              <br />• 이메일: <strong>homeprotector@home.go</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 아이디 입력 */}
            <input
              type="text"
              placeholder="아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="authInput"
              disabled={isLoading}
            />

            {/* 이메일 입력 */}
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="authInput"
              disabled={isLoading}
            />

            {/* 인증번호 전송 버튼 */}
            <button type="submit" className="authButton" disabled={isLoading}>
              {isLoading ? "전송 중..." : "인증 메일 전송"}
            </button>

            {/* 아이디 찾기 링크 */}
            <div className="authLinkSection">
              <span className="authLinkText">아이디를 잊으셨나요? </span>
              <button
                type="button"
                onClick={handleFindIdClick}
                className="authLinkButton"
              >
                아이디 찾기
              </button>
            </div>
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

export default PG300009;
