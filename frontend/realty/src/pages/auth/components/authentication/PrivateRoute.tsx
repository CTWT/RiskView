import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import useToast from "../../../../hooks/useToast";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.26
 * 파일명 : PrivateRoute.tsx
 * 설명 : 로그인이 필요한 페이지에 대한 접근을 제어하는 라우트 컴포넌트
 */

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn, isLoading } = useContext(AuthContext);
    const location = useLocation();
    const { showToast } = useToast();

    if (isLoading) {
        // 인증 상태를 확인하는 동안 로딩 상태를 표시합니다.
        // 이렇게 하면 성급한 리디렉션을 방지할 수 있습니다.
        return <div className="loading-spinner">인증 정보를 확인하는 중...</div>;
    }

    if (!isLoggedIn) {
        // 사용자가 로그아웃 상태일 경우, 로그인 페이지로 리디렉션합니다.
        // 현재 요청했던 경로를 state로 전달하여 로그인 후 해당 경로로 돌아갈 수 있도록 합니다.
        console.log("PrivateRoute: 로그인이 필요하여 /PG300001?login=true로 리디렉션합니다.");
        showToast("로그인이 필요한 서비스입니다.", { type: "info" });
        return <Navigate to="/PG300001?login=true" state={{ from: location }} replace />;
    }

    // 로그인 상태일 경우, 요청한 페이지의 자식 컴포넌트를 렌더링합니다.
    return children;
};

export default PrivateRoute;