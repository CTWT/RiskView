import React, { useState } from "react";
import axios from "axios";
import "../../../../styles/common/common.css";

// Signup_personal Component

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.07.25
* 파일명 : PG200003.tsx
*/

const PG200003 : React.FC = () => {

  const [email, setEmail] = useState("");

  const handleSendEmail = async () => {
    try{
      await axios.post("/api/send-email", {email});
      alert("인증 메일이 전송되었습니다.");
    } catch(error){
      console.log("인증 메일 전송 실패:", error);
      alert("메일 전송에 실패했습니다.");
    }
  };

  return(
    <div className="authCotainer">
      <h1 className="authlogo">Risk-View</h1>
      <p className="authSubtitle">Team. Debugging Monster</p>
      <p className="authwelcome">이메일 인증번호 입력</p>
      <p className="authwelcome">{email}으로 메일이 전송되었습니다.</p>

      <input className="authInput" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}/>
      <button className="authButton" onClick={handleSendEmail}>인증 메일 전송</button>
    </div>
  );
};

export default PG200003;