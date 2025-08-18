import React, { useState, useEffect } from "react";
import { FiChevronLeft } from "react-icons/fi";
import axios from "axios";
import Toast from "../../../../components/ui/Toast";
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import PageContainer from "../../../../components/layout/PageContainer";

// 비밀번호 찾기 - 인증번호 입력 페이지 컴포넌트


/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.08.08
 * 파일명 : PG300010.tsx
 */

/**
 * PG300010 Props 인터페이스
 * @interface PG300010Props
 * @param {string} userId - 사용자 아이디
 * @param {string} email - 인증번호가 전송된 이메일 주소
 * @param {function} onLogin - 로그인 페이지로 이동하는 콜백 함수
 * @param {function} onPasswordReset - 인증 성공 후 비밀번호 재설정 페이지로 이동하는 콜백 함수
 */

interface PG300010Props {
  userId: string;
  email: string;
  emailToken: string;
  onLogin: () => void;
  onPasswordReset: (userId: string) => void;
}

/**
 * 인증번호 입력 컴포넌트 (PG300010)
 * 이메일로 전송된 인증번호를 입력받아 검증하는 페이지
 * - 인증번호 입력 및 검증
 * - 3분 타이머 관리
 * - 인증번호 재전송 기능
 * - 인증 성공 시 PG300011(비밀번호 재설정)로 이동
 *
 * @param {PG300010Props} props - 컴포넌트 props
 * @returns {JSX.Element} - 인증번호 입력 폼 UI 컴포넌트
 */
const PG300010: React.FC<PG300010Props> = ({
  userId,
  email,
  emailToken,
  onLogin,
  onPasswordReset,
}) => {

  // 커스텀 훅 초기화
  const { toast, showToast } = useToast();

  // 상태 관리
  /** 사용자 입력 인증번호 상태 */
  const [verificationCode, setVerificationCode] = useState<string>("");

  /** 로딩 상태 관리 */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** 이메일 재전송 상태 */
  const [isResending, setIsResending] = useState<boolean>(false);

  /** 인증번호 유효 시간 (3분 = 180초) */
  const [timeLeft, setTimeLeft] = useState<number>(180);

  /** 타이머 만료 여부 */
  const isExpired = timeLeft <= 0;


  // 타이머 관리 Effect
  /**
   * 인증번호 타이머 관리
   * 1초마다 남은 시간을 감소시킴
   */
  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired]);


  // 이벤트 핸들러 함수들
  /**
   * 인증번호 확인 처리 함수
   */
  const handleVerifyCode = async () => {
    // 입력값 검증
    if (!verificationCode.trim()) {
      showToast("인증번호를 입력해주세요.", { type: "error" });
      return;
    }

    setIsLoading(true);

    // 인증번호 검증
    try {
      console.log("handleVerifyCode 시작", { verificationCode });
      const res = await axios.post("/api/verify-email-code", 
        {
          email,
          code: verificationCode.trim(),
        },
        {
          withCredentials: true, // 쿠키 포함
          headers: {
            'Content-Type': 'application/json', // JSON 데이터 형식으로 명시
            'Authorization': `Bearer ${emailToken}`, // JWT 토큰 추가
          }
        }
      );

      console.log('전송 데이터:', { email, code: verificationCode.trim(), token: emailToken });
  
      // 성공: 인증번호 확인 완료, PG300011로 이동 
      if (res.status === 200) {
        showToast("인증이 완료되었습니다.", { type: "success" });
        
        setTimeout(() => {
          onPasswordReset(userId);
        }, 1000);
      } else {
        showToast("인증번호가 일치하지 않습니다.", { type: "error" });
      }
    } catch (error) {
      console.error("인증번호 확인 오류:", error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
    
        if (status === 400 || status === 401) {
          showToast("인증번호가 일치하지 않습니다.", { type: "error" });
        } else {
          showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
        }
      } else {
        showToast("알 수 없는 오류가 발생했습니다.", { type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 인증번호 재전송 핸들러
   */
  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await axios.post("/api/send-verification-email-code",
        {
          email,
        },
        {
          withCredentials: true, // 쿠키 포함
          headers: {
            'Content-Type': 'application/json', // JSON 데이터 형식으로 명시
            'Authorization': `Bearer ${emailToken}`, // JWT 토큰 추가
          },
        }
      );
  
      setVerificationCode("");
      setTimeLeft(180);
      showToast("인증번호가 다시 전송되었습니다.", { type: "success" });
    } catch (error) {
      console.error("재전송 실패:", error);
      showToast("인증번호 전송에 실패했습니다.", { type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 인증번호 확인 핸들러 호출
    handleVerifyCode();
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
            {/* 완료 아이콘 */}
            <div className="progressCompleted">1</div>

            {/* 연결선 */}
            <div className="progressConnector"></div>

            {/* 완료 전 아이콘 */}
            <div className="progressBefore">2</div>
          </div>

          {/* 페이지 제목 */}
          <h1 className="authTitle">비밀번호 찾기</h1>

          {/* 설명 텍스트 */}
          <p className="authDescription">{email}으로 메일이 전송되었습니다.</p>

          <form onSubmit={handleSubmit}>
            {/* 인증번호 입력 필드와 타이머 */}
            <div className="authInputWrapper">
              <input
                className="authCodeInput"
                type="text"
                placeholder="인증번호"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isExpired || isLoading}
              />

              {/* 남은 시간 표시 */}
              {!isExpired && (
                <span className="authTimerInside">
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </span>
              )}
            </div>

            <button
              type={isExpired ? "button" : "submit"} // 버튼 타입 조건부 설정
              className={isExpired ? "authResendButton" : "authButton"} // 버튼 클래스 조건부 설정
              onClick={isExpired ? handleResendCode : undefined} // 버튼 클릭 핸들러 조건부 설정
              disabled={isLoading} // 버튼 비활성화 조건
            >
              {isLoading
                ? "확인 중..."
                : "확인"}
            </button>
          </form>

          {/* 인증 메일 재전송 버튼 */}
          <button
            type="button"
            className="authResendButton"
            onClick={handleResendCode}
            disabled={isResending} // 인증 메일 재전송 중이면 버튼 비활성화
          >
            {isResending ? "인증 메일 재전송 중..." : "인증 메일 재전송"}
          </button>

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

export default PG300010;
