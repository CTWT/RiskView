// contexts/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import useToast from "../../../../hooks/useToast";
import Toast from "../../../../components/ui/Toast";
// AuthProvider : 인증 상태 관리

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 박윤성
 * 작성일 : 25.08.15
 * 파일명 : AuthProvider.tsx
 */

/**
 * 애플리케이션 전역에서 인증 상태 관리
 * @param children : 하위 컴포넌트
 * @returns AuthContext.Provider로 로그인 상태와 로그인/로그아웃 함수를 하위 컴포넌트에 전달
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // 로그인 상태를 관리하는 상태값
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // 인증 상태 확인 로딩 상태 추가
    // 세션 만료 시간을 관리하는 상태값 (타임스탬프)
    const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(
        null
    );
    // 세션 만료까지 남은 시간 (초)
    const [timeLeft, setTimeLeft] = useState(0);
    // 커스텀 훅을 사용하여 토스트 메시지 상태 및 표시 함수 획득
    const { toast, showToast } = useToast();
    // 페이지 이동을 위한 navigate 훅
    const navigate = useNavigate();

    // 컴포넌트가 마운트 될 때 작동
    useEffect(() => {
        /**
         * 로그인 여부 확인 함수
         * 백엔드에 인증된 유저 정보를 요청하여, accessToken이 유효한지 확인
         */
        const checkAuth = async () => {
            try {
                const res = await axios.get<{
                    success: boolean;
                    user: any;
                    sessionExpiresAt?: number; // `remainingSessionTime` 대신 `sessionExpiresAt` 사용
                }>(`/api/user/me`, {
                    withCredentials: true, // 쿠키 포함해서 요청
                });

                if (res.data && res.data.user) {
                    setIsLoggedIn(true); // 사용자 정보가 있다면 로그인 상태로 간주
                    // 페이지 로드 시 백엔드에서 받은 절대 만료 시각으로 타이머를 설정합니다.
                    setSessionExpiresAt(res.data.sessionExpiresAt || null);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.warn("사용자 인증 확인 실패", error);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false); // 인증 확인 완료
            }
        };

        // 로그인 여부 확인
        checkAuth();
    }, []);

    // 세션 만료 카운트다운 효과
    useEffect(() => {
        // 세션 만료 시간이 설정되어 있을 때만 인터벌 실행
        if (sessionExpiresAt) {
            const interval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.round((sessionExpiresAt - now) / 1000);

                if (remaining > 0) {
                    setTimeLeft(remaining);
                } else {
                    // 시간이 만료되면 인터벌 정리
                    setTimeLeft(0);
                    clearInterval(interval);
                    // 세션이 만료되었으므로 자동 로그아웃 처리
                    logout(true);
                }
            }, 1000); // 1초마다 실행

            // 컴포넌트 언마운트 또는 sessionExpiresAt 변경 시 인터벌 정리
            return () => clearInterval(interval);
        } else {
            setTimeLeft(0);
        }
    }, [sessionExpiresAt]);

    // 사용자 활동 감지 및 세션 갱신 로직
    useEffect(() => {
        if (!isLoggedIn) return;

        let lastCall = 0;
        const minInterval = 2000; // 최소 호출 간격 (2초)

        const handleActivity = async () => {
            const now = Date.now();
            if (now - lastCall < minInterval) {
                return; // 마지막 호출 후 2초가 지나지 않았으면 무시
            }
            lastCall = now;

            try {
                console.log("사용자 활동 감지, 세션 갱신 시도...");
                const res = await axios.post<{
                    success: boolean;
                    sessionExpiresAt?: number;
                }>(`/api/user/refresh-session`, {}, { withCredentials: true });

                if (res.data.success && res.data.sessionExpiresAt) {
                    setSessionExpiresAt(res.data.sessionExpiresAt);
                    console.log("세션이 성공적으로 갱신되었습니다.");
                }
            } catch (error) {
                // 401 오류 등은 Axios 인터셉터에서 처리하므로 여기서는 별도 처리 안 함
                console.warn(
                    "세션 갱신 중 오류 발생 (인터셉터에서 처리될 수 있음)",
                    error
                );
            }
        };

        const activityEvents: (keyof WindowEventMap)[] = [
            "click",
            "keydown",
            "scroll",
        ];
        activityEvents.forEach((event) =>
            window.addEventListener(event, handleActivity)
        );

        return () => {
            activityEvents.forEach((event) =>
                window.removeEventListener(event, handleActivity)
            );
        };
    }, [isLoggedIn]);

    // 전역 사용자 활동 이벤트 리스닝 (클릭/키입력/마우스 이동/스크롤)
    const logout = useCallback(
        async (sessionExpired = false) => {
            // 사용자가 직접 로그아웃하는 경우에만 서버에 요청
            if (!sessionExpired) {
                try {
                    await axios.post(
                        `/api/user/logout`,
                        {},
                        { withCredentials: true }
                    );
                } catch (err) {
                    console.error("서버 로그아웃 요청 실패", err);
                }
            }

            // 로그인 상태를 false로 변경
            setIsLoggedIn(false);
            setSessionExpiresAt(null); // 로그아웃 시 타이머 초기화
            const message = sessionExpired
                ? "세션이 만료되었습니다. 다시 로그인해주세요."
                : "로그아웃 되었습니다.";
            showToast(message, { type: "info" });

            // 로그아웃 후 항상 홈페이지로 이동
            navigate("/");
            console.log(
                sessionExpired
                    ? "세션 만료로 자동 로그아웃 처리 후 홈페이지로 이동합니다."
                    : "로그아웃 처리 후 홈페이지로 이동합니다."
            );
        },
        [showToast, navigate]
    );

    // Axios 응답 인터셉터 설정
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response, // 성공적인 응답은 그대로 반환
            (error) => {
                // 401 Unauthorized 오류가 발생하면 자동 로그아웃 처리
                if (error.response && error.response.status === 401) {
                    // 이미 로그아웃 상태가 아니라면 로그아웃 처리 실행
                    if (isLoggedIn) {
                        logout(true);
                    }
                }
                // 다른 오류는 그대로 반환하여 각 API 호출부에서 처리하도록 함
                return Promise.reject(error);
            }
        );

        // 컴포넌트가 언마운트될 때 인터셉터 정리
        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [isLoggedIn, showToast, logout]); // isLoggedIn 상태가 바뀔 때마다 인터셉터 재설정

    /**
     * 로그인 처리 함수
     */
    const login = useCallback((expiresAt: number) => {
        // 로그인 상태를 true로 변경
        setIsLoggedIn(true);
        // 로그인 시 백엔드에서 받은 절대 만료 시각으로 타이머 설정
        setSessionExpiresAt(expiresAt);
    }, []);

    /**
     * 로그아웃 처리 함수
     */
    // const logout = useCallback(async () => {
    //     try {
    //         // 서버에 로그아웃 요청 (쿠키 삭제 등)
    //         await axios.post(
    //             "/api/user/logout",
    //             {},
    //             {
    //                 withCredentials: true,
    //                 headers: {
    //                     "Content-Type": "application/json", // JSON 데이터 형식으로 명시
    //                 },
    //             }
    //         );
    //     } catch (err) {
    //         console.error("서버 로그아웃 실패", err);
    //     }

    //     // 로그인 상태를 false로 변경
    //     setIsLoggedIn(false);
    //     showToast("로그아웃 되었습니다.", { type: "info" });
    //     console.log("로그아웃 성공 - 메인 페이지로 이동");
    // }, [showToast]);

    // AuthContext.Provider로 로그인 상태와 로그인/로그아웃 함수를 하위 컴포넌트에 전달
    return (
        <>
            <AuthContext.Provider
                value={{ isLoggedIn, login, logout, isLoading, timeLeft }}
            >
                {children}
            </AuthContext.Provider>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
            />
        </>
    );
};
