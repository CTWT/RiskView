import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../styles/common/common.css";

// Signup_EmailInputComponent : 이메일 인증 페이지

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.07.28
* 파일명 : PG300003.tsx
*/

/**
 * 개인회원 이메일 인증 시작 컴포넌트
 * @returns JSX.Element - 이메일 입력과 인증 메일 전송 버튼 UI
 */
const PG300003 : React.FC  = () => {
  // 사용자 입력 이메일 상태
  const [email, setEmail] = useState("");
  // 이메일 유효성 검사용 에러 메시지 상태
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();

  // 인증 메일 전송 버튼 클릭 시 호출되는 함수
  const handleSendEmail = () => {

    if (!email) {
    // 이메일이 비어있을 경우 에러 메시지 설정
    setEmailError("이메일을 입력해주세요.");
  } else {
    setEmailError(""); // 에러 없으면 초기화
    navigate("/PG300004", { state: { email } }); // 이메일 전달
  }
  }

  return (
    <div className="authCotainer">
        <div className="authHeader">
          <h1 className="authlogo">Risk-View</h1>
          <p className="authSubtitle">Team. Debugging Monster</p>
          <p className="authwelcome">이메일 인증부터 시작해보세요</p>
        </div>

      <div className="authFormRow">
          <input className="authInput" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}/>
      </div>
        {emailError && <p className="authError">{emailError}</p>}
        <button className="authButton" onClick={handleSendEmail}>인증 메일 전송</button>
    </div>
  );
};

export default PG300003;