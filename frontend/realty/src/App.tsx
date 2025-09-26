import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./pages/auth/components/authentication/AuthProvider";
import { AuthContext } from "./pages/auth/components/authentication/AuthContext";
import Layout from "./components/layout/Layout";
import PG200001 from "./pages/home/PG200001";
import useToast from "./hooks/useToast";
import PG100001 from "./pages/analysis/PG100001";
import PG300001 from "./pages/auth/components/authentication/PG300001";
import PG400001 from "./pages/news/PG400001";
import PG500001 from "./pages/community/PG500001";
import PG500043 from "./pages/community/board/PG500043";
import PG600001 from "./pages/serviceIntro/PG600001";
import CommonTest from "./pages/serviceIntro/CommonTest";
import PG700001 from "./pages/mypage/PG700001";

import { ChatProvider } from "./components/chat/ChatProvider";
import ChatWidget from "./components/chat/ChatWidget";
import ChatToggleButtonConnected from "./components/chat/ChatToggleButtonConnected";

import "./App.css";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn, isLoading } = useContext(AuthContext);
    const location = useLocation();
    const { showToast } = useToast();

    if (isLoading) {
        return <div className="loading-spinner">인증 정보를 확인하는 중...</div>;
    }

    if (!isLoggedIn) {
        showToast("로그인이 필요한 서비스입니다.", { type: "info" });
        return <Navigate to="/PG300001?login=true" state={{ from: location }} replace />;
    }

    // 로그인 상태일 경우, 요청한 페이지의 자식 컴포넌트를 렌더링합니다.
    return children;
};

function App() {
    // prettier-ignore
    return (
        <BrowserRouter>
            <AuthProvider>
                <ChatProvider>
                    <Routes>
                        {/* 인증 페이지는 Layout 없이 독립적으로 렌더링 */}
                        <Route path="/PG300001" element={<PG300001 />} />

                        {/* 나머지 페이지들은 Layout 안에서 렌더링 */}
                        <Route
                        path="/*"
                        element={
                            <Layout>
                            <ChatToggleButtonConnected />

                            <Routes>
                                {/* --- Public Routes (로그인 없이 접근 가능) --- */}
                                <Route path="/" element={<PG200001 />} />
                                <Route path="/PG600001" element={<PG600001 />} />
                                <Route path="/CommonTest" element={<CommonTest />} />{" "}

                                {/* --- Private Routes (로그인 필요) --- */}
                                <Route
                                    path="/PG100001"
                                    element={
                                        <PrivateRoute><PG100001 /></PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG400001"
                                    element={
                                        <PrivateRoute><PG400001 /></PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG500001/*"
                                    element={
                                        <PrivateRoute><PG500001 /></PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG500043"
                                    element={
                                        <PrivateRoute><PG500043 /></PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG700001/*"
                                    element={<PrivateRoute><PG700001 /></PrivateRoute>}
                                />
                                {/* 마이페이지 하위의 커뮤니티 경로도 PrivateRoute로 보호합니다. */}
                                <Route
                                    path="/PG700001/PG500001/*"
                                    element={<PrivateRoute><PG500001 /></PrivateRoute>}
                                />
                            </Routes>
                            </Layout>
                        }
                        />
                    </Routes>
                    <ChatWidget />
                </ChatProvider>
            </AuthProvider>
        </BrowserRouter>
            );
}

export default App;
