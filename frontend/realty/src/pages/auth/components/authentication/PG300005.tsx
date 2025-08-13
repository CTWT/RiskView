import React, { useState, useEffect } from "react";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
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
const PG300005: React.FC<PG300005Props> = ({ onNext, userEmail }) => {
  // useToast 훅 사용
  const { toast, showToast } = useToast(); // toast 상태도 가져오기
  // 입력된 인증번호 상태
  const [verificationCode, setVerificationCode] = useState("");

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
  
    // 이메일 토큰을 로컬스토리지에서 가져옴
    const token = localStorage.getItem("emailToken");
    // 토큰이 없으면
    if (!token) {
      showToast("인증 토큰이 없습니다.", { type: "error" });
      return;
    }
  
    try {
      // 인증번호 검증 API 호출
      const response = await axios.post("/api/verify-email-code", null, {
        // 유저이메일과 인증번호를 params로 전달
        params: { code: verificationCode, email: userEmail },
        // 토큰을 Authorization 헤더에 담아 전달
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // 응답에서 메시지와 jwt 토큰 추출
      const { message, token: jwtToken } = response.data;
      // jwt 토큰을 로컬스토리지에 저장
      localStorage.setItem("jwtToken", jwtToken);
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
    }
  };

  return (
    <div className="authWrapper">
      <div className="authContainer">
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
            disabled={isExpired} // 시간 만료 시 입력 비활성화
          />

          {/* 남은 시간 표시 */}
          {!isExpired && (
            <span className="authTimerInside">
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* 조건부 버튼 렌더링 */}
        {isExpired ? (
          // 시간 만료 시: 재전송 버튼
          <button
            className="authResendButton"
            onClick={() => window.location.reload()}
          >
            인증 메일 다시 보내기
          </button>
        ) : (
          <button
            className="authButton"
            onClick={handleVerifyCode}
            disabled={isExpired}
          >
            다음
          </button>
        )}
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
