import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import PG300002 from "./PG300002"; // 로그인
import PG300003 from "./PG300003"; // 회원유형 선택
import PG300004 from "./PG300004"; // 이메일 인증 요청
import PG300005 from "./PG300005"; // 인증번호 확인
import PG300006 from "./PG300006"; // 회원정보 입력
import PG300007 from "./PG300007"; // 추가정보 입력

/*
 * 생성자 : 이주하
 * 생성일 : 25.07.30
 * 파일명 : PG300001.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 로그인 또는 회원가입 단계에 따라 컴포넌트를 렌더링
 */

/**
 * @file PG300001.tsx
 * @description 로그인 및 회원가입 통합 루트 컴포넌트
 * 이 컴포넌트는 인증 흐름 전체를 관리하며,
 * 로그인(PG300002), 회원가입 절차(PG300003~PG300007)를 조건부로 렌더링
 */

const PG300001: React.FC = () => {
  // 상태 관리
  const [authStep, setAuthStep] = useState<number>(0); // 0: 로그인, 1~5: 회원가입 단계
  const [signupMode, setSignupMode] = useState<boolean>(false); // 회원가입 모드 여부
  const [userEmail, setUserEmail] = useState<string>(""); // 회원가입 과정에서 사용할 이메일
  const location = useLocation();

  // 컴포넌트 마운트 시 URL 파라미터 확인
  useEffect(() => {
    console.log("PG300001 컴포넌트 마운트됨");
    console.log("현재 위치:", window.location.pathname);

    // URL 파라미터 확인하여 회원가입 모드인지 체크
    const urlParams = new URLSearchParams(location.search);
    const isSignup = urlParams.get("signup") === "true";

    if (isSignup) {
      console.log("회원가입 모드로 시작 - authStep을 1로 설정");
      setAuthStep(1); // 바로 회원유형 선택 페이지로
      setSignupMode(true); // 회원가입 모드 활성화
    }
  }, [location]);

  // authStep 변화 로깅
  useEffect(() => {
    console.log(
      "PG300001: 현재 authStep =",
      authStep,
      "signupMode =",
      signupMode
    );
  }, [authStep, signupMode]);

  // 다음 단계로 이동
  const goToNextStep = () => {
    console.log("다음 단계로 이동:", authStep + 1);
    setAuthStep((prev) => prev + 1);
  };

  // 로그인 페이지로 돌아가기
  const goToLogin = () => {
    console.log("로그인 페이지로 돌아가기");
    setAuthStep(0);
    setSignupMode(false); // 회원가입 모드 종료
  };

  // 회원가입 시작 - 한 번에 상태 변경
  const handleSignUpStart = () => {
    console.log("회원가입 시작");
    setAuthStep(1); // authStep을 먼저 변경
    setSignupMode(true); // 그 다음 signupMode 변경
  };

  // 이메일 인증 완료 후 다음 단계로 이동
  const handleEmailSubmit = (email: string) => {
    console.log("이메일 설정:", email);
    setUserEmail(email);
    goToNextStep();
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* 로그인 페이지일 때만 헤더 표시 (authStep === 0이고 signupMode가 false) */}
      {authStep === 0 && !signupMode && <Header />}

      {/* 로그인 컴포넌트 (authStep === 0이고 signupMode가 false) */}
      {authStep === 0 && !signupMode && (
        <div>
          <PG300002 onSignUpStart={handleSignUpStart} />
        </div>
      )}

      {/* 회원가입 1단계 - 회원유형 선택 (authStep === 1) */}
      {authStep === 1 && <PG300003 onNext={goToNextStep} />}

      {/* 회원가입 2단계 - 이메일 인증 요청 */}
      {authStep === 2 && <PG300004 onNext={handleEmailSubmit} />}

      {/* 회원가입 3단계 - 인증번호 확인 */}
      {authStep === 3 && (
        <PG300005 onNext={goToNextStep} userEmail={userEmail} />
      )}

      {/* 회원가입 4단계 - 회원정보 입력 (비밀번호, 닉네임) */}
      {authStep === 4 && (
        <PG300006
          onNext={goToNextStep}
          userEmail={userEmail}
          onLogin={goToLogin}
        />
      )}

      {/* 회원가입 5단계 - 추가정보 입력 */}
      {authStep === 5 && <PG300007 onLogin={goToLogin} />}
    </div>
  );
};

export default PG300001;
