import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../styles/common/common.css";
import axios from "axios";
import useToast from "../../../../hooks/useToast";
import Toast from "../../../../components/ui/Toast";
import PageContainer from "../../../../components/layout/PageContainer";

// Login Component : 로그인 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.07.23
 * 파일명 : PG300002.tsx
 */

interface PG300002Props {
  onSignUpStart: () => void;
}

/**
 * 로그인 컴포넌트
 * 사용자 아이디와 비밀번호를 입력받아 로그인 처리를 수행하고,
 * 회원가입 페이지로의 전환
 * 
 * @param props - 컴포넌트 props
 * @param props.onSignUpStart - 회원가입 버튼 클릭 시 호출되는 회원가입 시작 함수
 * @returns JSX.Element - 로그인 폼과 유효성 검사 및 오류 처리가 포함된 UI 컴포넌트
 */

const PG300002: React.FC<PG300002Props> = ({ onSignUpStart }) => {
  useEffect(() => {
    console.log("PG300002 mounted - 로그인 컴포넌트 렌더링됨");
  }, []);

  // 상태 관리
  // 사용자 입력 아이디
  const [email, setEmail] = useState<string>("");
  // 사용자 입력 비밀번호
  const [password, setPassword] = useState<string>("");
  // 네비게이션 
  const navigate = useNavigate();

  const { toast, showToast } = useToast();

  /**
   *
   *
   * @param e React.FormEvent - 폼 제출 이벤트 객체
   * @returns void
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검사
    if (!email && !password) {
      showToast("아이디와 비밀번호를 모두 입력해주세요.", { type: "error" });
      return;
    }

    if (!email) {
      showToast("아이디를 입력해주세요.", { type: "error" });
      return;
    }

    if (!password) {
      showToast("비밀번호를 입력해주세요.", { type: "error" });
      return;
    }

    try {
      const res = await axios.post<{ token: string }>("/api/login", {
        email,
        password,
      });
      // 로그인 성공 시 메인 페이지로 이동 
      if (res.status === 200) {
        console.log("로그인 성공 - 메인 페이지로 이동");
        navigate("/"); // 메인 페이지로 이동
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast("아이디 또는 비밀번호가 올바르지 않습니다.", { type: "error" });
      } else {
        showToast("예기치 않은 오류가 발생했습니다.", { type: "error" });
      }
    }
  };

  const handleSignUpClick = () => {
    console.log("회원가입 버튼 클릭됨");
    onSignUpStart();
  };

  return (
    <>
      <PageContainer showBreadcrumb={false} centerContent={true}>
        {/* 로그인 폼 UI */}
        <div className="authWrapper">
          <div className="authContainer">
            <h1 className="authTitle">로그인</h1>

            <form onSubmit={handleSubmit}>
              {/* 아이디 입력 */}
              <input
                className="authInput"
                type="text"
                placeholder="아이디"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* 비밀번호 입력 */}
              <input
                className="authInput"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* 이메일/비밀번호 찾기 링크 */}
              <div className="authFindWrapper">
                <a href="/find-account" className="authFindLink">
                  이메일/비밀번호 찾기
                </a>
              </div>

              {/* 로그인 버튼 */}
              <button type="submit" className="authButton">
                로그인
              </button>

              {/* 또는 Divider */}
              <div className="authDividerWrapper">
                <div className="authDivider">
                  <span className="authDividerText">또는</span>
                </div>
              </div>

              {/* 회원가입 유도 문구 */}
              <p className="authPrompt">
                아직 Risk-View 회원이 아니신가요?
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="authLink"
                >
                  회원가입
                </button>
              </p>
            </form>
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={toast.isVisible}
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default PG300002;
