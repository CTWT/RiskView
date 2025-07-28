import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../../../styles/common/common.css";

// Signup_VerificationCodePage: 이메일 인증번호 입력 및 확인 페이지

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.07.28
* 파일명 : PG300004.tsx
*/

/**
 * 
 * @returns 
 */
const PG300004 : React.FC = () => {

  // 이전 페이지에서 전달된 이메일 정보를 받기 위해 useLocation 사용
  const location = useLocation();
  // 인증 실패 메시지 상태
  const [sendError, setSendError] = useState("");
  // 입력된 인증번호 상태
  const [verificationCode, setVerificationCode] = useState("");
  // 이메일 값 추출, 기본값은 공백
  const {email} = location.state || {email: ''};

  // 타이머 (3분)
  const [timeLeft, setTimeLeft] = useState(180); 
  // 타이머 만료 여부
  const isExpired = timeLeft <= 0;

  // 1초마다 타이머 감소
  useEffect(() => {
    if (isExpired) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);


  // 인증번호 검증 로직은 백엔드와 연동되어야 하며, 현재는 프론트에서 처리하지 않음.
  // 추후 fetch 또는 axios 요청으로 검증 결과 받아올 예정.
  const handleVerifyCode = () => {
  // 임시 로직: 인증번호가 "123456"이 아니면 에러 표시
  if (verificationCode !== "123456") {
    setSendError("인증번호가 일치하지 않습니다.");
  } else {
    setSendError(""); // 에러 초기화
    console.log("인증번호 확인 완료");
    // TODO: 다음 페이지로 이동 로직
  };
  }


  return(
    <div className="authCotainer">
      <div className="authHeader">
        <h1 className="authlogo">Risk-View</h1>
        <p className="authSubtitle">Team. Debugging Monster</p>
        <p className="authwelcome">이메일 인증번호 입력</p>
        <p className="emailInfo">{email}으로 메일이 전송되었습니다.</p>

        
        </div>
      <div className="authInputWrapper">
        <input
          className="authCodeInput"
          type="text"
          placeholder="인증번호"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          disabled={isExpired}
        />
        {!isExpired && ( 
          <span className="authTimerInside">
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        )}
      </div>
        {sendError && <p className="authError">{sendError}</p>}
        
        {isExpired && (
          <div className="resendWrapper">
            {/* 
              TODO: 추후 실제 인증 메일 재발송 기능을 백엔드와 연동해야 함.
              현재는 단순 페이지 새로고침만 수행함. 
            */}
            <button className="authResendButton" onClick={() => window.location.reload()}>
              인증 메일 다시 보내기
            </button>
          </div>
        )}
        <button className="authButton" onClick={handleVerifyCode} disabled={isExpired}>다음</button>
    </div>
  );
};

export default PG300004;