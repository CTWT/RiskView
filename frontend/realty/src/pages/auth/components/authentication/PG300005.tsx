import React, { useState, useEffect } from "react";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
import { FiChevronLeft } from "react-icons/fi";
import "../../../../styles/common/common.css";
import axios from "axios";

// Signup_VerificationCodePage: 이메일 인증번호 입력 및 확인 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.07.28
 * 파일명 : PG300005.tsx
 */

interface PG300005Props {
  onNext: () => void;
  onBackToEmail: () => void;
  userEmail: string; // 부모 컴포넌트에서 전달받은 이메일
}

/**
 * 이메일 인증번호 확인 컴포넌트
 * 사용자가 입력한 인증번호를 검증하고 3분 타이머 기능을 제공
 * 인증번호가 올바르면 다음 단계로 진행하고, 시간이 만료되면 재전송 옵션을 제공
 * 
 * @param props - 컴포넌트 props
 * @param props.onNext - 인증번호 검증 완료 후 다음 단계로 진행하는 콜백 함수
 * @param props.userEmail - 인증 메일이 전송된 사용자의 이메일 주소
 * @returns JSX.Element - 인증번호 입력 폼과 타이머가 포함된 UI 컴포넌트
 */
const PG300005: React.FC<PG300005Props> = ({ onNext, onBackToEmail, userEmail }) => {
  // useToast 훅 사용
  const { toast, showToast } = useToast(); // toast 상태도 가져오기
  // 입력된 인증번호 상태
  const [verificationCode, setVerificationCode] = useState("");
  // 이메일 전송 상태
  const [isLoading, setIsLoading] = useState(false);
  // 이메일 재전송 상태
  const [isResending, setIsResending] = useState(false);
  // 인증번호 유효 시간 (3분 = 180초)
  const [timeLeft, setTimeLeft] = useState(180);
  // 타이머 만료 여부
  const isExpired = timeLeft <= 0;

  // 1초마다 타이머 감소
  useEffect(() => {
    if (isExpired) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isExpired]);

  /**
   * 인증번호 검증 핸들러
   * 사용자가 입력한 인증번호 검증
   */
  const handleVerifyCode = async () => {
    // 인증번호 입력 안 했으면
    if (!verificationCode) {
      showToast("인증번호를 입력해주세요.", { type: "error" });
      return;
    }

    setIsLoading(true);
  
    try {
      // 인증번호 검증 API 호출
      const response = await axios.post(
        "/api/verify-email-code",
        {
          // 유저이메일과 인증번호를 params로 전달
          code: verificationCode,
          email: userEmail,
        },
        {
          // 쿠키 포함
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json', // JSON 데이터 형식으로 명시
          },
        }
      );
  
      // 응답에서 메시지 추출
      const { message } = response.data;
      // 성공 메시지 표시
      showToast(message || "이메일 인증 성공!", { type: "success" });
      // 다음 단계로 이동
      onNext();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data || "이메일 인증 실패", { type: "error" });
      } else {
        showToast("알 수 없는 오류가 발생했습니다.", { type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 이메일 인증코드 재전송
   */
  const handleResendCode = async () => {
    // 이메일 재전송 상태: 전송 중
    setIsResending(true);
    try {
      setTimeLeft(180);  // 타이머 초기화
      setVerificationCode("");  // 입력 초기화

      // 이메일 인증코드 발송 API 호출
      const response = await axios.post(
        "/api/send-verification-email-code",
        {
          // JSON 형식으로 유저이메일을 params로 전달
          email: userEmail,
        },
        {
          // 쿠키 포함
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json', // JSON 데이터 형식으로 명시
          },
        }
      );

      // 응답에서 메시지 추출
      const { message } = response.data;
      showToast(message || "인증 메일이 다시 전송되었습니다.", { type: "success" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data?.message || "인증 메일 재전송 실패", { type: "error" });
      } else {
        showToast("인증 메일 재전송 실패", { type: "error" });
      }
    } finally {
      // 이메일 재전송 상태: 전송 중이 아님
      setIsResending(false);
    }
  };


  // 뒤로가기 핸들러
  const handleBack = () => {
    onBackToEmail();
  };

  return (
    <div className="authWrapper">
      <div className="authContainer">
        {/* 뒤로가기 버튼 */}
        <p onClick={handleBack} className="backTo">
          <FiChevronLeft />
          뒤로가기
        </p>
        {/* 서비스 로고 및 제목 */}
        <h1 className="authlogo">Risk-View</h1>
        <p className="authSubtitle">Team. Debugging Monster</p>

        {/* 페이지 안내 메시지 */}
        <p className="authwelcome">이메일 인증번호 입력</p>
        <p className="emailInfo">{userEmail}으로 메일이 전송되었습니다.</p>

        {/* 인증번호 입력 필드와 타이머 */}
        <div className="authInputWrapper">
          <input
            className="authCodeInput"
            type="text"
            placeholder="인증번호"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            readOnly={isResending}
          />

          {/* 남은 시간 표시 */}
          {!isExpired && (
            <span className="authTimerInside">
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* 다음 버튼 */}
        <button
          className="authButton"
          onClick={handleVerifyCode}
          disabled={isLoading}
        >
          {isLoading ? "확인 중..." : "다음"}
        </button>

        {/* 인증 메일 재전송 버튼 (항상 표시, 클릭은 만료 시에만) */}
        <button
          type="button"
          className="authResendButton"
          onClick={handleResendCode}
          disabled={isResending}
          style={{ pointerEvents: isResending ? "none" : "auto" }}
        >
          <span>
            {isResending ? "인증 메일 재전송 중..." : "인증 메일 재전송"}
          </span>
        </button>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
    </div>
  );
};

export default PG300005;
