// contexts/AuthProvider.tsx
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
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
    const logout = async () => {
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
        console.log("로그아웃 성공 - 메인 페이지로 이동");
    };

    // AuthContext.Provider로 로그인 상태와 로그인/로그아웃 함수를 하위 컴포넌트에 전달
    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
