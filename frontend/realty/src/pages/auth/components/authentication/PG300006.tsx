import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";

// Signup_InfoInputPage: 비밀번호 및 닉네임 설정 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.07.29
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
    }) => void; // 데이터와 함께 다음 단계로 이동
    userEmail: string; // 부모 컴포넌트에서 전달받은 이메일
    onLogin: () => void; // 로그인으로 돌아가는 함수
}

/**
 * API 응답 타입 정의
 */
interface ApiResponse {
    available: boolean;
    message: string;
}

// 아이디 규칙: 영문 소문자/숫자/._- 조합 4~20자 (필요시 수정)
const userIdRegex = /^[a-z0-9._-]{4,20}$/;

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
const PG300006: React.FC<PG300006Props> = ({ onNext, userEmail, onLogin }) => {
    // useToast 훅 사용
    const { toast, showToast } = useToast(); // toast 상태도 가져오기
    // 아이디 중복 확인 중 여부 및 중단 제어
    const [isCheckingUserId, setIsCheckingUserId] = useState(false);
    const userIdAbortRef = useRef<AbortController | null>(null);
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

    /**
     * 비밀번호 보기/숨기기 토글 핸들러
     */
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    /**
     * 아이디 중복 확인 함수
     * 입력된 아이디의 중복 여부를 확인
     *
     * @param userIdToCheck - 중복 여부를 확인할 아이디 문자열
     */
    const handleUserIdCheck = useCallback(
        async (userIdToCheck: string): Promise<boolean> => {
            const id = userIdToCheck.trim();

            if (!id) {
                showToast("아이디를 입력해주세요.", { type: "error" });
                setIsUserIdValid(false);
                return false;
            }

            // 형식 사전 검증(불필요한 API 호출 방지)
            if (!userIdRegex.test(id)) {
                setIsUserIdValid(false);
                showToast(
                    "아이디는 영문 소문자, 숫자, '.', '_', '-' 포함 4~20자여야 합니다.",
                    { type: "error" }
                );
                return false;
            }

            // 이전 요청이 진행 중이면 취소
            if (userIdAbortRef.current) {
                userIdAbortRef.current.abort();
            }
            const controller = new AbortController();
            userIdAbortRef.current = controller;

            try {
                setIsCheckingUserId(true);
                const response = await fetch(
                    `/api/user/check-userid/${encodeURIComponent(id)}`,
                    {
                        method: "GET",
                        signal: controller.signal,
                        headers: { Accept: "application/json" },
                    }
                );

                let data: ApiResponse | null = null;
                try {
                    data = await response.json();
                } catch {
                    data = null;
                }

                if (response.ok) {
                    if (data && data.available) {
                        setIsUserIdValid(true);
                        showToast("사용 가능한 아이디입니다.", {
                            type: "success",
                        });
                        return true;
                    } else {
                        setIsUserIdValid(false);
                        showToast(
                            (data && data.message) ||
                                "이미 사용 중인 아이디입니다.",
                            { type: "error" }
                        );
                        return false;
                    }
                } else {
                    setIsUserIdValid(false);
                    showToast(
                        (data && data.message) ||
                            "아이디 확인 중 오류가 발생했습니다.",
                        { type: "error" }
                    );
                    return false;
                }
            } catch (error) {
                if (
                    typeof error === "object" && // 오류가 객체인지 확인
                    error !== null && // null이 아닌지 확인
                    "name" in error && // name 속성이 있는지 확인
                    (error as { name?: string }).name === "AbortError" // AbortError인지 확인
                ) {
                    // 요청 중단된 경우 조용히 무시
                    return false;
                }
                setIsUserIdValid(false);
                showToast("아이디 확인 중 네트워크 오류가 발생했습니다.", {
                    type: "error",
                });
                console.error("Username check error:", error);
                return false;
            } finally {
                setIsCheckingUserId(false);
            }
        },
        [showToast]
    );

    /**
     * 닉네임 중복 확인 함수
     * 입력된 닉네임의 중복 여부를 확인
     *
     * @param nicknameToCheck - 중복 여부를 확인할 닉네임 문자열
     */
    const handleNicknameCheck = useCallback(
        async (nicknameToCheck: string) => {
            // 닉네임 입력 여부 확인
            if (!nicknameToCheck.trim()) {
                showToast("닉네임을 입력해주세요.", { type: "error" });
                return;
            }

            try {
                // 백엔드에 닉네임 중복 여부를 확인하는 API 요청을 보냄
                const response = await fetch(
                    `/api/user/check-nickname/${encodeURIComponent(
                        nicknameToCheck
                    )}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                // API 응답 데이터 가져옴
                const data: ApiResponse = await response.json();

                // API 응답이 성공적이면
                if (response.ok) {
                    // 사용 가능한 닉네임이라면
                    if (data.available) {
                        setIsNicknameValid(true);
                        showToast("사용 가능한 닉네임입니다.", {
                            type: "success",
                        });
                        return true;
                    } else {
                        setIsNicknameValid(false);
                        showToast(data.message, { type: "error" });
                        return false;
                    }
                } else {
                    const errorMessage =
                        data.message || "닉네임 확인 중 오류가 발생했습니다.";
                    setIsNicknameValid(false);
                    showToast(errorMessage, { type: "error" });
                    return false;
                }
            } catch (error) {
                const errorMessage =
                    "닉네임 확인 중 네트워크 오류가 발생했습니다.";
                setIsNicknameValid(false);
                showToast(errorMessage, { type: "error" });
                console.error("Nickname check error:", error);
                return false;
            }
        },
        [showToast]
    );

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const id = userId.trim();
            if (id && userIdRegex.test(id)) {
                handleUserIdCheck(id);
            } else if (!id) {
                setIsUserIdValid(null);
            } else {
                setIsUserIdValid(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [userId, handleUserIdCheck]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (nickname.trim()) {
                handleNicknameCheck(nickname);
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
                    showToast("비밀번호가 일치하지 않습니다.", {
                        type: "error",
                    });
                } else {
                    showToast("비밀번호가 일치합니다.", { type: "success" });
                }
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [confirmPassword, password, showToast]);

    /**
     * 비밀번호 유효성 검사 함수
     * @returns boolean - 유효하면 true, 아니면 false
     */
    const validatePassword = (password: string): boolean => {
        if (password.length < 6) {
            showToast("비밀번호는 최소 6자 이상이어야 합니다.", {
                type: "error",
            });
            return false;
        }
        if (confirmPassword !== password) {
            showToast("비밀번호가 일치하지 않습니다.", { type: "error" });
            return false;
        }
        return true;
    };

    /**
     * 닉네임 유효성 검사 함수
     * @returns boolean - 유효하면 true, 아니면 false
     */
    const validateNickname = (): boolean => {
        if (!nickname.trim()) {
            showToast("닉네임을 입력해주세요.", { type: "error" });
            return false;
        }
        if (!isNicknameValid) {
            showToast("사용 불가능한 닉네임입니다.", { type: "error" });
            return false;
        }
        return true;
    };

    /**
     * 아이디 유효성 검사 함수
     * @returns boolean - 유효하면 true, 아니면 false
     */
    const validateUserId = (): boolean => {
        const id = userId.trim();
        if (!id) {
            showToast("아이디를 입력해주세요.", { type: "error" });
            return false;
        }
        if (!userIdRegex.test(id)) {
            showToast("아이디 형식을 확인해주세요. (영문/숫자/._- 4~20자)", {
                type: "error",
            });
            return false;
        }
        if (isCheckingUserId) {
            showToast("아이디 중복 확인 중입니다. 잠시만 기다려주세요.", {
                type: "error",
            });
            return false;
        }
        if (isUserIdValid !== true) {
            showToast("아이디 중복 확인이 필요합니다.", { type: "error" });
            return false;
        }
        return true;
    };

    /**
     * 폼 제출 처리 핸들러
     * @param e 폼 이벤트 객체
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validPassword = validatePassword(password);
        const validNickname = validateNickname();

        // 아이디 유효성/중복체크가 확실하지 않으면 서버 재확인
        let validUserIdFinal = validateUserId();
        if (!validUserIdFinal) {
            // 마지막으로 규칙을 통과했다면 한 번 더 확인 시도
            const id = userId.trim();
            if (id && userIdRegex.test(id)) {
                validUserIdFinal = await handleUserIdCheck(id);
            }
        }

        if (validPassword && validNickname && validUserIdFinal) {
            // 모든 조건 통과 시 다음 페이지로 이동
            console.log("폼 제출 완료:", {
                email: userEmail,
                password,
                nickname,
                userId,
            });
            onNext({ password, userId, nickname });
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
                    {/* 이메일 필드 (읽기 전용) */}
                    <div className="authFormRow">
                        <input
                            type="email"
                            value={userEmail}
                            readOnly
                            className="authInput"
                            style={{
                                backgroundColor: "#d9d9d9",
                                color: "#828282",
                                userSelect: "none",
                            }}
                            onMouseDown={(e) => e.preventDefault()} // 드래그 차단
                        />
                    </div>

                    {/* 아이디 입력 필드 */}
                    <div className="authFormRow">
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
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
                            onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                        >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                    </div>

                    {/* 닉네임 입력 필드 */}
                    <div className="authFormRow">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
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
                                !nickname.trim() ||
                                isUserIdValid !== true ||
                                !userId.trim() ||
                                password.length < 6 ||
                                confirmPassword !== password ||
                                isCheckingUserId
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
                        <button
                            type="button"
                            onClick={onLogin}
                            className="authLink"
                        >
                            로그인
                        </button>
                    </p>
                </form>
            </div>
            {/* 토스트 컴포넌트 */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
            />
        </div>
    );
};

export default PG300006;
