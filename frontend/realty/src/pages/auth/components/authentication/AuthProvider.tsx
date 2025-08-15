// contexts/AuthProvider.tsx
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

// AuthProvider : 인증 상태 관리

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 : 
 * 작성일 : 25.08.15
 * 파일명 : AuthProvider.tsx
 */

/**
 * 애플리케이션 전역에서 인증 상태 관리
 * @param children : 하위 컴포넌트
 * @returns AuthContext.Provider로 로그인 상태와 로그인/로그아웃 함수를 하위 컴포넌트에 전달
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 로그인 상태를 관리하는 상태값
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 컴포넌트가 마운트 될 때 작동
  useEffect(() => {
    // 로컬 스토리지에서 토큰을 가져옴
    const token = localStorage.getItem("token");
    // 토큰이 있으면 로그인 상태를 true로 변경
    setIsLoggedIn(!!token);
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
  const logout = () => {
    // 로컬 스토리지에서 토큰 삭제
    localStorage.removeItem("token");
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