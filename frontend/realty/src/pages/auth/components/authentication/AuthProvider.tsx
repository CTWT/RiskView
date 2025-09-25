// contexts/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from "react";
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
    // 커스텀 훅을 사용하여 토스트 메시지 상태 및 표시 함수 획득
    const { toast, showToast } = useToast();

    // 컴포넌트가 마운트 될 때 작동
    useEffect(() => {
        /**
         * 로그인 여부 확인 함수
         * 백엔드에 인증된 유저 정보를 요청하여, accessToken이 유효한지 확인
         */
        const checkAuth = async () => {
            try {
                const res = await axios.get("/api/user/me", {
                    withCredentials: true, // 쿠키 포함해서 요청
                });

                if (res.data && res.data.user) {
                    setIsLoggedIn(true); // 사용자 정보가 있다면 로그인 상태로 간주
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.warn("사용자 인증 확인 실패", error);
                setIsLoggedIn(false);
            }
        };

        // 로그인 여부 확인
        checkAuth();
    }, []);

    // Axios 응답 인터셉터 설정
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response, // 성공적인 응답은 그대로 반환
            (error) => {
                // 401 Unauthorized 오류가 발생하면 자동 로그아웃 처리
                if (error.response && error.response.status === 401) {
                    // 이미 로그아웃 상태가 아니라면 로그아웃 처리 실행
                    if (isLoggedIn) {
                        console.warn("세션 만료 또는 인증 실패로 자동 로그아웃 처리합니다.");
                        // 서버의 쿠키는 이미 만료되었으므로, 프론트엔드 상태만 변경
                        setIsLoggedIn(false);
                        showToast("세션이 만료되었습니다. 다시 로그인해주세요.", {
                            type: "info",
                        });
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
    }, [isLoggedIn, showToast]); // isLoggedIn 상태가 바뀔 때마다 인터셉터 재설정

    /**
     * 로그인 처리 함수
     */
    const login = () => {
        // 로그인 상태를 true로 변경
        setIsLoggedIn(true);
    };

    /**
     * 로그아웃 처리 함수
     */
    const logout = useCallback(async () => {
        try {
            // 서버에 로그아웃 요청 (쿠키 삭제 등)
            await axios.post(
                "/api/user/logout",
                {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json", // JSON 데이터 형식으로 명시
                    },
                }
            );
        } catch (err) {
            console.error("서버 로그아웃 실패", err);
        }

        // 로그인 상태를 false로 변경
        setIsLoggedIn(false);
        showToast("로그아웃 되었습니다.", { type: "info" });
        console.log("로그아웃 성공 - 메인 페이지로 이동");
    }, [showToast]);

    // AuthContext.Provider로 로그인 상태와 로그인/로그아웃 함수를 하위 컴포넌트에 전달
    return (
        <>
            <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
                {children}
            </AuthContext.Provider>
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} />
        </>
    );
};
