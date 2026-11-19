import React, { useState, useEffect, useCallback } from "react";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import * as Common from "../../../../components/common";
import * as UserAPI from "../../../../components/api";

// Signup_InfoInputPage: 비밀번호 및 닉네임 설정 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.07.29
 * 수정일 : 25.09.25
 * 파일명 : PG300006.tsx
 */

/**
 * 회원정보 입력 컴포넌트 props 인터페이스
 */
interface PG300006Props {
    onNext: (data: {
        password: string;
        userId: string;
        nickname: string;
        email: string;
    }) => void; // 데이터와 함께 다음 단계로 이동
    // userEmail: string; // 부모 컴포넌트에서 전달받은 이메일
    onLogin: () => void; // 로그인으로 돌아가는 함수
}

/**
 * 회원정보 입력 컴포넌트 (비밀번호 및 닉네임 설정)
 * 사용자의 비밀번호와 닉네임을 입력받아 유효성 검사 수행,
 * 닉네임 중복 확인 후 모든 검증이 완료되면 다음 단계로 진행.
 *
 * @param props - 컴포넌트 props
 * @param props.onNext - 회원정보 입력 완료 후 다음 단계(추가정보 입력)로 진행하는 콜백 함수
 * @param props.userEmail - 이메일 인증 단계에서 검증된 사용자 이메일 주소 (읽기 전용으로 표시)
 * @param props.onLogin - 로그인 페이지로 돌아가는 콜백 함수
 * @returns JSX.Element - 이메일(읽기전용), 비밀번호, 닉네임 입력 폼이 포함된 UI 컴포넌트
 */
const PG300006: React.FC<PG300006Props> = ({ onNext, onLogin }) => {
    // useToast 훅 사용
    const { toast, showToast } = useToast(); // toast 상태도 가져오기
    // 아이디 중복 확인 중 여부 및 중단 제어
    const [isCheckingUserId, setIsCheckingUserId] = useState(false);
    // 비밀번호 관련 상태
    const [password, setPassword] = useState(""); // 사용자가 입력한 비밀번호
    const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 입력값
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 입력란 표시/숨김 상태
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인란 표시/숨김 상태

    // 아이디 관련 상태
    const [userId, setUserId] = useState(""); // 사용자가 입력한 아이디
    const [isUserIdValid, setIsUserIdValid] = useState<boolean | null>(null); // null: 미확인, true: 유효, false: 무효

    // 닉네임 관련 상태
    const [nickname, setNickname] = useState(""); // 사용자가 입력한 닉네임
    const [isNicknameValid, setIsNicknameValid] = useState<boolean | null>(
        null
    ); // null: 미확인, true: 유효, false: 무효

    // 이메일 상태
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    // 이메일 코드전송 상태
    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);

    // 폼 입력값 상태
    const [form, setForm] = useState({
        id: "",
        email: "",
        num: "",
        nickname: "",
    });

    // 입력 필드 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // 핸들러 내부에서 직접 상태 업데이트
        if (name === "id") setUserId(value);
        if (name === "nickname") setNickname(value);
    };
    // 입력 필드 포커스 아웃 핸들러 (유효성 검사)
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case "id": {
                const idResult = Common.validateId(value);
                if (idResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: idResult.value || "",
                    }));
                    if (name === "id") {
                        setUserId(value);
                    }
                } else {
                    showToast(idResult.message || "", { type: "error" });
                }
                break;
            }
            case "email": {
                const emailResult = Common.validateEmail(value);

                if (emailResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: emailResult.value || "",
                    }));
                } else {
                    showToast(emailResult.message || "", { type: "error" });
                }
                break;
            }
            case "num": {
                const numResult = Common.validateNum(value);

                if (numResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: numResult.value || "",
                    }));
                } else {
                    showToast(numResult.message || "", { type: "error" });
                }
                break;
            }
            case "nickname": {
                const nickanemResult = Common.validateNickName(value);

                if (nickanemResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: nickanemResult.value || "",
                    }));
                    setNickname(value);
                } else {
                    showToast(nickanemResult.message || "", { type: "error" });
                }
                break;
            }
        }
    };

    // 이메일 인증코드 발송 및 확인 핸들러
    const handleSendEmail = async () => {
        if (isEmailVerified) {
            showToast("인증이 이미 완료되었습니다.", { type: "error" });
            return;
        }

        // 1. 인증코드 발송 단계
        if (!isVerificationCodeSent) {
            const emailResult = Common.validateEmail(form.email);
            if (!emailResult.valid) {
                showToast(emailResult.message!, { type: "error" });
                return;
            }
            try {
                const available = await UserAPI.checkEmailDuplicate(emailResult.value!);
                if (!available) {
                    showToast("이미 사용중인 이메일 입니다.", { type: "error" });
                    return;
                }
    
                // 통합 이메일 인증 프로세스 사용
                await UserAPI.sendVerificationEmail(
                    emailResult.value!, 
                    "/api/send-verification-email-code"
                );
    
                showToast("인증코드가 전송되었습니다.", { type: "success" });
                setIsVerificationCodeSent(true);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "이메일 처리 중 오류가 발생했습니다.";
                showToast(errorMessage, { type: "error" });
            }
        } else {
            // 2. 인증코드 검증 단계
            if (!form.num || form.num.length !== 6) {
                showToast("6자리 인증번호를 입력해주세요", { type: "error" });
                return;
            }
            try {
                const result = await UserAPI.verifyEmailCode(form.email, form.num);
                if (result.code === "001") {
                    setIsEmailVerified(true);
                    showToast(result.message || "이메일 인증이 완료되었습니다.", { type: "success" });
                } else {
                    showToast(result.message || "인증번호가 올바르지 않습니다.", { type: "error" });
                }
            } catch (error) {
                console.error("인증코드 검증 오류:", error);
                showToast("인증 처리 중 오류가 발생했습니다.", { type: "error" });
            }
        }
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    
    const handleUserIdCheck = useCallback(
        async (userIdToCheck: string): Promise<boolean> => {
            try {
                setIsCheckingUserId(true);
                const result = await UserAPI.checkUserIdDuplicate(userIdToCheck);

                if (result.available) {
                    setIsUserIdValid(true);
                    showToast("사용 가능한 아이디 입니다.", { type: "success" });
                    return true;
                } else {
                    setIsUserIdValid(false);
                    showToast(result.message || "이미 사용 중인 아이디 입니다.", { type: "error" });
                    return false;
                }
            } catch (error) {
                setIsUserIdValid(false);
                showToast("아이디 확인 중 오류 발생", { type: "error" });
                console.log("User Id check error", error);
                return false;
            } finally {
                setIsCheckingUserId(false);
            }
        },
        [showToast]
    );

    const handleNicknameCheck = useCallback(
        async (nicknameToCheck: string): Promise<boolean> => {
            try {
                const result = await UserAPI.checkNickNameDuplicate(nicknameToCheck);
                if (result.available) {
                    setIsNicknameValid(true);
                    showToast("사용 가능한 닉네임입니다.", { type: "success" });
                    return true;
                } else {
                    setIsNicknameValid(false);
                    showToast(result.message || "이미 사용 중인 닉네임입니다.", { type: "error" });
                    return false;
                }
            } catch (error) {
                setIsNicknameValid(false);
                showToast("닉네임 확인 중 오류가 발생했습니다.", { type: "error" });
                console.error("Nickname check error:", error);
                return false;
            }
        },
        [showToast]
    );

    // id 중복확인 디바운스
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (userId.trim()) {
                handleUserIdCheck(userId.trim());
            } else {
                setIsUserIdValid(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [userId, handleUserIdCheck]);

    // nickname 중복확인 디바운스
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (nickname.trim()) {
                handleNicknameCheck(nickname.trim());
            } else {
                setIsNicknameValid(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [nickname, handleNicknameCheck]);

    /**
     * 비밀번호와 비밀번호 확인이 일치하지 않을 경우 또는 일치할 경우 토스트 메시지를 표시 (디바운스 적용)
     * 사용자가 비밀번호 확인 입력 중 실수하거나 정확하게 입력했을 때 즉시 피드백을 줌
     */
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (confirmPassword && password) {
                if (confirmPassword !== password) {
                    showToast("비밀번호가 일치하지 않습니다.", { type: "error" });
                } else {
                    showToast("비밀번호가 일치합니다.", { type: "success" });
                }
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [confirmPassword, password, showToast]);

    /**
     * 폼 제출 처리 핸들러
     * @param e 폼 이벤트 객체
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 상태만 최종 확인
        if (
            isUserIdValid === true &&
            isNicknameValid === true &&
            password.length >= 6 &&
            confirmPassword === password &&
            isEmailVerified === true
        ) {
            console.log("폼 제출 완료:", { email: form.email, password, userId, nickname });

            onNext({ password, userId, nickname, email: form.email });
        } else {
            showToast("입력 정보를 다시 확인해주세요.", { type: "error" });
        }
    };

    // 닉네임 유효성 검사 결과에 따른 상태
    const nicknameStatus = nickname
        ? isNicknameValid === false
            ? "error"
            : isNicknameValid === true
            ? "success"
            : ""
        : "";

    // 아이디 유효성 검사 결과에 따른 상태
    const userIdStatus = userId
        ? isUserIdValid === false
            ? "error"
            : isUserIdValid === true
            ? "success"
            : ""
        : "";

    /**
     * 사용자 비밀번호 및 닉네임 입력 폼
     * - 이메일은 인증 후 읽기 전용 필드로 설정됨
     * - 입력 검증 후 다음 단계(PG300007)로 이동
     */
    return (
        <div className="authWrapper">
            <div className="authContainer">
                {/* 서비스 로고 및 제목 */}
                <h1 className="authlogo">Risk-View</h1>
                <p className="authSubtitle">Team. Debugging Monster</p>
                <p className="authwelcome">사용자 정보 입력</p>

                {/* 단계 표시 아이콘 */}
                <div className="progressContainer">
                    {/* 완료 아이콘 */}
                    <div className="progressCompleted">1</div>

                    {/* 연결선 */}
                    <div className="progressConnector"></div>

                    {/* 완료 전 아이콘 */}
                    <div className="progressBefore">2</div>
                </div>

                {/* 회원정보 입력 폼 */}
                <form className="authForm" onSubmit={handleSubmit}>
                    {/* 이메일 필드 */}
                    <div className="authFormRow">
                        <input
                            className="authInput"
                            type="text"
                            name="email"
                            placeholder="이메일"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isEmailVerified}
                        />
                    </div>
                    {/* 인증번호 입력 필드 */}
                    <div className="authFormRowEmail">
                        <input
                            className="authInput"
                            type="text"
                            name="num"
                            placeholder="인증번호"
                            value={form.num}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={6}
                            disabled={isEmailVerified}
                        />
                        <button
                            type="button"
                            className="normalButton"
                            onClick={handleSendEmail}
                            disabled={isEmailVerified}
                        >
                            {isVerificationCodeSent ? "인증하기" : "인증코드발송"}
                        </button>
                    </div>

                    {/* 아이디 입력 필드 */}
                    <div className="authFormRow">
                        <input
                            type="text"
                            name="id"
                            value={form.id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="아이디"
                            className="authInput"
                        />
                        {/**
                         *  중복 여부를 시각적으로 표시하는 아이콘
                         * - 중복 확인 완료 && 사용 가능: 초록색 (success 클래스)
                         * - 중복 확인 완료 && 사용 불가: 빨간색 (error 클래스)
                         */}
                        <span className={`input-check-icon ${userIdStatus}`}>
                            <FiCheckCircle />
                        </span>
                    </div>

                    {/* 비밀번호 입력 필드 */}
                    <div className="authFormRow">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호"
                            className="authInput"
                        />
                        <span
                            className="password-toggle-icon"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>

                    {/* 비밀번호 확인 입력 필드 */}
                    <div className="authFormRow">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            className="authInput"
                        />
                        <span
                            className="password-toggle-icon"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>

                    {/* 닉네임 입력 필드 */}
                    <div className="authFormRow">
                        <input
                            type="text"
                            name="nickname"
                            value={form.nickname}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="닉네임"
                            className="authInput"
                        />

                        {/**
                         * 닉네임 중복 여부를 시각적으로 표시하는 아이콘
                         * - 중복 확인 완료 && 사용 가능: 초록색 (success 클래스)
                         * - 중복 확인 완료 && 사용 불가: 빨간색 (error 클래스)
                         */}
                        <span className={`input-check-icon ${nicknameStatus}`}>
                            <FiCheckCircle />
                        </span>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="authButtonWrapper">
                        <button
                            type="submit"
                            className="authButton"
                            disabled={
                                isNicknameValid !== true ||
                                !form.nickname.trim() ||
                                isUserIdValid !== true ||
                                !form.id.trim() ||
                                password.length < 6 ||
                                confirmPassword !== password ||
                                isCheckingUserId ||
                                isEmailVerified !== true
                            }
                        >
                            다음
                        </button>
                    </div>

                    {/* 구분선 */}
                    <div className="authDividerWrapper">
                        <div className="authDivider">
                            <span className="authDividerText">또는</span>
                        </div>
                    </div>

                    {/* 로그인 페이지로 이동 */}
                    <p className="authPrompt">
                        이미 계정이 있으신가요?
                        <button type="button" onClick={onLogin} className="authLink">
                            로그인
                        </button>
                    </p>
                </form>
            </div>
            {/* 토스트 컴포넌트 */}
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} />
        </div>
    );
};

export default PG300006;
