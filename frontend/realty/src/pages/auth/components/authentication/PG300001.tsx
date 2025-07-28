import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../../../styles/common/common.css";
import axios from "axios";

// Login Component : 로그인 페이지

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.07.23
* 파일명 : PG300001.tsx
*/

/**
 * 
 * 
 * @returns JSX.Element 로그인 폼과 유효성 검사 및 오류 처리 포함
 */

const PG300001 : React.FC = () => {

  // 사용자 입력 및 오류 상태 관리
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();


  /**
   * 
   *
   * @param e React.FormEvent - 폼 제출 이벤트 객체
   * @returns void
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // 입력값 검사
    if(!email || !password){
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return
    }

    try {
      const res = await axios.post<{ token: string }>("/api/login", {email, password});
      // 로그인 성공 시 홈으로 이동
      if(res.status === 200) {
        navigate("/home");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("예기치 않은 오류가 발생했습니다.");
      }
    }
  }

  return(
    <>
    {/* 로그인 폼 UI */}
    <div className="authWrapper">
      <div className="authContainer">
        <h1 className="authTitle">로그인</h1>

        <form onSubmit={handleSubmit}>{error && <p style={{color: "red", marginBottom: "12px"}}>{error}</p>}

        {/* 이메일 입력 */}
        <input className="authInput" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}/>
        {/* 비밀번호 입력 */}
        <input className="authInput" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}/>

        {/* 이메일/비밀번호 찾기 링크 */}
        <div className="authFindWrapper">
          <a href="/find-account" className="authFindLink">이메일/비밀번호 찾기</a>
        </div>

        {/* 로그인 버튼 */}
        <button type="submit" className="authButton">로그인</button>

        {/* 또는 Divider */}
        <div className="authDividerWrapper">
          <div className="authDivider">
            <span className="authDividerText">또는</span>
          </div>
        </div>

        {/* 회원가입 유도 문구 */}
        <p className="authPrompt">
          아직 Risk-View 회원이 아니신가요?
          <Link to="/PG300002" className="authLink">회원가입</Link>
        </p>
        </form>
      </div>
    </div>
    </>
  );
};

export default PG300001;
