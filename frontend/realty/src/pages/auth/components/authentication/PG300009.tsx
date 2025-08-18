import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import axios, { AxiosError } from "axios";
import Toast from "../../../../components/ui/Toast";
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import PageContainer from "../../../../components/layout/PageContainer";

// 비밀번호 찾기 페이지 컴포넌트 (아이디+이메일 입력 → 인증번호 전송)

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
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
  /** 아이디 찾기 페이지로 이동하는 콜백 함수 */
  onFindId?: () => void;
  /** 인증번호 전송 후 PG300010으로 이동하는 콜백 함수 */
  onPasswordReset?: (
    userId: string, 
    email: string
  ) => void;
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
    // onFindId 콜백이 제공된 경우
    if (onFindId) {
      // 아이디 찾기 페이지로 이동
      onFindId();
    } else {
      // 콜백이 없다면 기본 이동 처리: 아이디 찾기 페이지(PG300008)로 이동
      navigate("/pg/PG300008");
    }
  };

  /**
   * 인증번호 전송 처리 함수
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

    // 4단계: 사용자 존재 여부 확인 및 인증코드 발송
    try {
      // 이메일 인증코드 발송 요청
      const codeRequestRes = await axios.post(
        "/api/user/send-password-reset-code",
        {
          // JSON 형식으로 전달
          userId: userId.trim(),
          email: email.trim(),
        },
        {
          // 쿠키 포함
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json', // JSON 데이터 형식으로 명시
          },
        }
      );
      
      if (codeRequestRes.status !== 200) {
        showToast("이메일 인증 요청 실패", { type: "error" });
        return;
      }

      showToast("인증번호가 이메일로 전송되었습니다.", { type: "success" });

      // 인증번호 입력 페이지로 이동 (사용자 ID와 이메일 전달)
      if (onPasswordReset) {
        // 부모 컴포넌트에서 콜백이 제공된 경우 userId, email 정보를 가지고 인증번호 입력 페이지로 이동
        onPasswordReset(userId.trim(), email.trim());
      } else {
        // 콜백이 없다면 기본 이동 처리: 인증번호 입력 페이지(PG300010)로 이동
        navigate("/pg/PG300010", { 
          state: { // state로 userId, email 전달
            userId: userId.trim(),
            email: email.trim()
          }
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error("인증번호 전송 오류:", axiosError);
      // AxiosError로부터 응답 메시지 추출
      const serverMessage = axiosError?.response?.data?.message || "오류가 발생했습니다. 다시 시도해주세요.";
      showToast(serverMessage, { type: "error" });
    } finally {
      // 로딩 종료
      setIsLoading(false);
    }
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendVerificationCode(); // 인증코드 전송 핸들러 호출
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
