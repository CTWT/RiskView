import React, { useState, useEffect } from "react";
import "../../../../styles/common/common.css";

// Signup_VerificationCodePage: 이메일 인증번호 입력 및 확인 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
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
  // 인증 실패 메시지 상태
  const [sendError, setSendError] = useState("");
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
   * 사용자가 입력한 인증번호 검증합
   * 현재는 테스트용 값("123456")으로 검증,
   * 추후 백엔드 API와 연동하여 실제 검증을 수행 예정
   */
  const handleVerifyCode = () => {
    // TODO: 백엔드 API와 연동하여 실제 인증번호 검증 구현 예정

    // 임시 검증 로직 (테스트용)
    if (verificationCode !== "123456") {
      setSendError("인증번호가 일치하지 않습니다.");
    } else {
      setSendError(""); // 에러 초기화
      console.log("인증번호 확인 완료");

      // 인증번호 확인이 완료되면 다음 페이지(PG300006)로 이동
      // 테스트 단계에서는 인증번호 "123456"이 일치하면 인증 완료 처리함.
      // 추후 백엔드 응답에 따라 인증 상태 판단 및 isVerified 설정 필요
      onNext();
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

        {/* 인증번호 검증 오류 메시지 */}
        {sendError && <p className="authError">{sendError}</p>}

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
    </div>
  );
};

export default PG300005;
