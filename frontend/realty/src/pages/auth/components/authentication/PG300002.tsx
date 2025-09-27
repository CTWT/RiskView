import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../../styles/common/common.css";
import axios from "axios";
import useToast from "../../../../hooks/useToast";
import Toast from "../../../../components/ui/Toast";
import PageContainer from "../../../../components/layout/PageContainer";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
// Login Component : 로그인 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.07.23
 * 파일명 : PG300002.tsx
 */

interface PG300002Props {
    // 회원가입 시작 함수 호출용 콜백
    onSignUpStart: () => void;
    // 아이디 찾기 버튼 클릭 시 호출되는 함수
    onFindIdClick: () => void;
    // 비밀번호 찾기 버튼 클릭 시 호출되는 선택적 함수
    onFindPasswordClick?: () => void; // 비밀번호 찾기 콜백 추가
}

/**
 * 로그인 컴포넌트
 * 사용자로부터 아이디(이메일)와 비밀번호를 입력받아 로그인 요청을 수행하며,
 * 회원가입 및 아이디/비밀번호 찾기 페이지로의 이동 기능을 포함함.
 *
 * @param props - 컴포넌트 props
 * @param props.onSignUpStart - 회원가입 버튼 클릭 시 호출되는 함수
 * @param props.onFindIdClick - 아이디 찾기 버튼 클릭 시 호출되는 함수
 * @param props.onFindPasswordClick - 비밀번호 찾기 버튼 클릭 시 호출되는 함수 (선택적)
 * @returns JSX.Element - 로그인 폼 UI 및 관련 기능 포함 컴포넌트
 */
const PG300002: React.FC<PG300002Props> = ({
    onSignUpStart,
    onFindIdClick,
    onFindPasswordClick,
}) => {
    // 컴포넌트가 마운트될 때 한 번 실행되는 useEffect
    useEffect(() => {
        console.log("PG300002 mounted - 로그인 컴포넌트 렌더링됨");
    }, []);

    /**
     * 상태 관리 영역
     */
    // 사용자 입력 아이디
    const [userId, setUserId] = useState<string>("");
    // 사용자 입력 비밀번호
    const [password, setPassword] = useState<string>("");
    // react-router-dom의 네비게이션 훅으로 페이지 이동 제어
    const navigate = useNavigate();
    const location = useLocation();

    // 커스텀 훅을 사용하여 토스트 메시지 상태 및 표시 함수 획득
    const { toast, showToast } = useToast();
    // AuthContext에서 login 함수 불러옴: 함수 로직은 AuthProvider에서 정의됨
    const { login } = useContext(AuthContext);

    /**
     * 로그인 폼 제출 이벤트 핸들러
     * - 입력값 유효성 검사 수행
     * - axios를 통해 로그인 API 호출
     * - 성공 시 메인 페이지로 이동
     * - 실패 시 적절한 에러 메시지 토스트로 표시
     *
     * @param e React.FormEvent - 폼 제출 이벤트 객체
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 아이디와 비밀번호가 모두 비어있으면 에러 메시지 출력 후 종료
        if (!userId && !password) {
            showToast("아이디와 비밀번호를 모두 입력해주세요.", {
                type: "error",
            });
            return;
        }

        // 아이디가 비어있으면 에러 메시지 출력 후 종료
        if (!userId) {
            showToast("아이디를 입력해주세요.", { type: "error" });
            return;
        }

        // 비밀번호가 비어있으면 에러 메시지 출력 후 종료
        if (!password) {
            showToast("비밀번호를 입력해주세요.", { type: "error" });
            return;
        }

        try {
            // 로그인 API 호출, 성공 시 토큰 반환 예상
            const res = await axios.post<{
                success: boolean;
                message?: string;
                sessionExpiresAt?: number; // `accessTokenExpiration` 대신 `sessionExpiresAt` 사용
            }>(
                "http://1.209.19.40:8080/api/user/login", // 요청 보낼 URL
                { userId, password }, // 요청 보낼 데이터(Body 부분)
                {
                    withCredentials: true, // 요청 설정: 쿠키 포함 여부
                    headers: {
                        "Content-Type": "application/json", // JSON 데이터 형식으로 명시
                    },
                }
            );
            // HTTP 상태 코드 200이면 로그인 성공으로 간주하고 메인 페이지로 이동
            // 응답 데이터에서 성공 여부 확인
            if (res.data.success) {
                // 로그인 함수 호출
                // 백엔드에서 받은 만료 타임스탬프를 login 함수에 전달
                if (res.data.sessionExpiresAt) {
                    login(res.data.sessionExpiresAt);
                } else {
                    throw new Error(
                        "서버로부터 세션 만료 시간을 받지 못했습니다."
                    );
                }
                console.log("로그인 성공 - 메인 페이지로 이동");
                showToast("로그인 되었습니다.", { type: "success" });

                // 리디렉션된 경우, 이전 페이지로 이동합니다.
                const from = location.state?.from?.pathname || "/";
                console.log(`로그인 성공 후 ${from} 경로로 이동합니다.`);
                navigate(from, { replace: true });
            } else {
                // 서버에서 보낸 구체적인 에러 메시지 사용
                showToast(res.data.message || "로그인에 실패했습니다.", {
                    type: "error",
                });
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                // 서버에서 보낸 에러 메시지가 있으면 사용, 없으면 기본 메시지
                const errorMessage =
                    err.response?.data?.message ||
                    "아이디 또는 비밀번호가 올바르지 않습니다.";
                showToast(errorMessage, { type: "error" });
            } else {
                showToast("예기치 않은 오류가 발생했습니다.", {
                    type: "error",
                });
            }
        }
    };

    /**
     * 회원가입 버튼 클릭 핸들러
     * 부모 컴포넌트로부터 전달받은 onSignUpStart 콜백 호출
     */
    const handleSignUpClick = () => {
        console.log("회원가입 버튼 클릭됨");
        onSignUpStart();
    };

    /**
     * 비밀번호 찾기 버튼 클릭 핸들러
     * - onFindPasswordClick 콜백이 있으면 호출
     * - 없으면 기본 경로로 네비게이션 처리 (폴백)
     */
    const handleFindPasswordClick = () => {
        console.log("비밀번호 찾기 버튼 클릭됨");
        if (onFindPasswordClick) {
            onFindPasswordClick();
        } else {
            // 직접 네비게이션
            navigate("/pg/PG300009");
        }
    };

    /**
     * JSX 반환부
     * - 로그인 폼 UI 구성
     * - 아이디, 비밀번호 입력 필드
     * - 아이디/비밀번호 찾기 링크
     * - 로그인 및 회원가입 버튼
     * - 토스트 메시지 컴포넌트 포함
     */
    return (
        <>
            <PageContainer showBreadcrumb={false} centerContent={true}>
                {/* 로그인 폼 UI 래퍼 */}
                <div className="authWrapper">
                    <div className="authContainer">
                        <h1 className="authTitle">로그인</h1>

                        <form onSubmit={handleSubmit}>
                            {/* 사용자 아이디 입력 필드 */}
                            <input
                                className="authInput"
                                type="text"
                                placeholder="아이디"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                            {/* 비밀번호 입력 필드 */}
                            <input
                                className="authInput"
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {/* 아이디 찾기, 비밀번호 찾기 링크 영역 */}
                            <div className="authFindWrapper">
                                <span
                                    onClick={onFindIdClick}
                                    className="authFindLink"
                                    style={{ cursor: "pointer" }}
                                >
                                    아이디 찾기
                                </span>
                                /
                                <span
                                    onClick={handleFindPasswordClick}
                                    className="authFindLink"
                                    style={{ cursor: "pointer" }}
                                >
                                    비밀번호 찾기
                                </span>
                            </div>

                            {/* 로그인 제출 버튼 */}
                            <button type="submit" className="authButton">
                                로그인
                            </button>

                            {/* 또는 Divider */}
                            <div className="authDividerWrapper">
                                <div className="authDivider">
                                    <span className="authDividerText">
                                        또는
                                    </span>
                                </div>
                            </div>

                            {/* 회원가입 유도 문구 및 버튼 */}
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
                        {/* 토스트 메시지 컴포넌트 렌더링 */}
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
