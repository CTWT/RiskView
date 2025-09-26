import { createContext } from "react";

// AuthContext : 인증 상태 관리

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.08.15
 * 파일명 : AuthContext.ts
 */

// AuthContext가 제공하는 값의 구조와 타입 정의
interface AuthContextType {
    isLoggedIn: boolean; // 로그인 여부
    login: () => void; // 로그인 함수
    logout: () => void; // 로그아웃 함수
    isLoading: boolean; // 인증 상태 로딩 여부
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false, // 초기값: 로그인되지 않은 상태
    login: () => {},
    logout: () => {},
    isLoading: true, // 초기값: 로딩 중
});
