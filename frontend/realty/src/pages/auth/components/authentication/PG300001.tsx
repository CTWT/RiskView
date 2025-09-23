import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import PG300002 from "./PG300002"; // 로그인
import PG300003 from "./PG300003"; // 회원유형 선택
import PG300004 from "./PG300004"; // 이메일 인증 요청
import PG300005 from "./PG300005"; // 인증번호 확인
import PG300006 from "./PG300006"; // 회원정보 입력
import PG300007 from "./PG300007"; // 추가정보 입력
import PG300008 from "./PG300008"; // 아이디 찾기
import PG300009 from "./PG300009"; // 비밀번호 찾기
import PG300010 from "./PG300010"; // 인증번호 입력
import PG300011 from "./PG300011"; // 새 비밀번호 설정

//  로그인 또는 회원가입 단계에 따라 컴포넌트를 렌더링

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.07.30
 * 파일명 : PG300001.tsx
 */

/**
 * @file PG300001.tsx
 * @description 로그인 및 회원가입 통합 루트 컴포넌트
 * 이 컴포넌트는 인증 흐름 전체를 관리하며,
 * 로그인(PG300002), 회원가입 절차(PG300003~PG300007)를 조건부로 렌더링
 */

const PG300001: React.FC = () => {
    // ================================
    // 상태 관리
    // ================================

    const [authStep, setAuthStep] = useState<number>(0); // 0: 로그인, 1~5: 회원가입 단계, -1: 아이디 찾기, -2: 비밀번호 찾기, -3: 인증번호 입력, -4: 비밀번호 재설정
    const [signupMode, setSignupMode] = useState<boolean>(false); // 회원가입 모드 여부
    const [userEmail, setUserEmail] = useState<string>(""); // 회원가입 과정에서 사용할 이메일
    const [signupData, setSignupData] = useState({
        // 회원가입 과정에서 사용할 데이터
        userId: "",
        password: "",
        userNickname: "",
        name: "",
        email: "",
        preferredLanguage: "",
    });
    const [resetUserId, setResetUserId] = useState<string>(""); // 비밀번호 재설정할 사용자 ID
    const [resetUserEmail, setResetUserEmail] = useState<string>(""); // 인증번호가 전송된 이메일
    const [resetEmailToken, setResetEmailToken] = useState<string>(""); // 인증번호가 전송된 이메일
    const location = useLocation();

    // ================================
    // useEffect 훅들
    // ================================

    // 컴포넌트 마운트 시 URL 파라미터 확인
    useEffect(() => {
        console.log("PG300001 컴포넌트 마운트됨");
        console.log("현재 위치:", window.location.pathname);

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(location.search);
        const isSignup = urlParams.get("signup") === "true";
        const isLogin = urlParams.get("login") === "true";

        if (isSignup) {
            console.log("회원가입 모드로 시작 - authStep을 1로 설정");
            // setAuthStep(1); // 바로 회원유형 선택 페이지로
            setAuthStep(4); // 바로 회원가입 페이지로 이동
            setSignupMode(true); // 회원가입 모드 활성화
        } else if (isLogin) {
            console.log("로그인 모드로 강제 설정");
            setAuthStep(0); // 로그인 페이지로
            setSignupMode(false); // 회원가입 모드 비활성화
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

    // ================================
    // 이벤트 핸들러 함수들
    // ================================

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
        setSignupData((prev) => ({ ...prev, email }));
        goToNextStep();
    };

    // 회원정보 입력 완료 후 다음 단계로 이동
    const handleBasicInfoSubmit = (data: {
        password: string;
        userId: string;
        nickname: string;
        email: string;
    }) => {
        // 입력한 회원정보 데이터 기억
        setSignupData((prev) => ({
            ...prev,
            password: data.password,
            userId: data.userId,
            userNickname: data.nickname,
            email: data.email,
        }));
        // 다음 단계로 이동
        goToNextStep();
    };

    // 아이디 찾기 페이지로 이동
    const goToFindId = () => {
        console.log("아이디 찾기 페이지로 이동");
        setAuthStep(-1);
    };

    // 인증번호 입력 페이지로 이동 (PG300010)
    const goToVerificationCode = (
        userId: string,
        email: string,
        emailToken: string
    ) => {
        console.log(
            "인증번호 입력 페이지로 이동, 사용자 ID:",
            userId,
            "이메일:",
            email,
            "emailToken:",
            emailToken ? "이메일 토큰 전달됨" : "전달되는 이메일 토큰 없음"
        );
        setResetUserId(userId);
        setResetUserEmail(email);
        setResetEmailToken(emailToken);
        setAuthStep(-3);
    };

    // 비밀번호 재설정 페이지로 이동 (PG300011)
    const goToPasswordReset = (userId: string) => {
        console.log("비밀번호 재설정 페이지로 이동, 사용자 ID:", userId);
        setResetUserId(userId);
        setAuthStep(-4);
    };

    // 비밀번호 찾기 페이지로 이동
    const goToFindPassword = () => {
        console.log("비밀번호 찾기 페이지로 이동");
        setAuthStep(-2);
    };

    // ================================
    // JSX 렌더링
    // ================================

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* 헤더 표시 조건: 로그인 페이지 또는 아이디/비밀번호 찾기 관련 페이지들 */}
            {(authStep === 0 && !signupMode) ||
            authStep === -1 ||
            authStep === -2 ||
            authStep === -3 ||
            authStep === -4 ? (
                <Header />
            ) : null}

            {/* 로그인 컴포넌트 (authStep === 0이고 signupMode가 false) */}
            {authStep === 0 && !signupMode && (
                <div>
                    <PG300002
                        onSignUpStart={handleSignUpStart}
                        onFindIdClick={goToFindId}
                        onFindPasswordClick={goToFindPassword}
                    />
                </div>
            )}

            {/* 회원가입 1단계 - 회원유형 선택 (authStep === 1) */}
            {authStep === 1 && <PG300003 onNext={goToNextStep} />}

            {/* 회원가입 2단계 - 이메일 인증 요청 */}
            {authStep === 2 && <PG300004 onNext={handleEmailSubmit} />}

            {/* 회원가입 3단계 - 인증번호 확인 */}
            {authStep === 3 && (
                <PG300005
                    onNext={goToNextStep}
                    onBackToEmail={() => setAuthStep(2)}
                    userEmail={userEmail}
                />
            )}

            {/* 회원가입 4단계 - 회원정보 입력 (비밀번호, 닉네임) */}
            {authStep === 4 && (
                <PG300006
                    onNext={handleBasicInfoSubmit}
                    // userEmail={userEmail}
                    onLogin={goToLogin}
                />
            )}

            {/* 회원가입 5단계 - 추가정보 입력 */}
            {authStep === 5 && (
                <PG300007
                    onLogin={goToLogin}
                    onBackToPrev={() => setAuthStep(4)}
                    signupData={signupData}
                />
            )}

            {/* 아이디 찾기 */}
            {authStep === -1 && (
                <PG300008
                    onLogin={goToLogin}
                    onFindPassword={goToFindPassword}
                />
            )}

            {/* 비밀번호 찾기 */}
            {authStep === -2 && (
                <PG300009
                    onLogin={goToLogin}
                    onFindId={goToFindId}
                    onPasswordReset={goToVerificationCode}
                />
            )}

            {/* 인증번호 입력 (PG300010) */}
            {authStep === -3 && (
                <PG300010
                    userId={resetUserId}
                    email={resetUserEmail}
                    emailToken={resetEmailToken}
                    onLogin={goToLogin}
                    onPasswordReset={goToPasswordReset}
                />
            )}

            {/* 비밀번호 재설정 (PG300011) */}
            {authStep === -4 && (
                <PG300011 userId={resetUserId} onLogin={goToLogin} />
            )}
        </div>
    );
};

export default PG300001;
