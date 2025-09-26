import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./pages/auth/components/authentication/AuthProvider";
import { AuthContext } from "./pages/auth/components/authentication/AuthContext";
import Layout from "./components/layout/Layout";
import PG200001 from "./pages/home/PG200001";
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

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);
    const location = useLocation();

    if (!isLoggedIn) {
        // 사용자가 로그아웃 상태일 경우, 로그인 페이지로 리디렉션합니다.
        // 현재 요청했던 경로를 state로 전달하여 로그인 후 해당 경로로 돌아갈 수 있도록 합니다.
        console.log("PrivateRoute: 로그인이 필요하여 /PG300001?login=true로 리디렉션합니다.");
        return <Navigate to="/PG300001?login=true" state={{ from: location }} replace />;
    }

    // 로그인 상태일 경우, 요청한 페이지의 자식 컴포넌트를 렌더링합니다.
    return children;
};

function App() {
    // prettier-ignore
    return (
        <AuthProvider>
            <ChatProvider>
                <BrowserRouter>
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
                                        <PrivateRoute>
                                            <PG100001 />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG400001"
                                    element={
                                        <PrivateRoute>
                                            <PG400001 />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG500001/*"
                                    element={
                                        <PrivateRoute>
                                            <PG500001 />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG500043"
                                    element={
                                        <PrivateRoute>
                                            <PG500043 />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/PG700001/*"
                                    element={<PrivateRoute><PG700001 /></PrivateRoute>}
                                />
                            </Routes>
                            </Layout>
                        }
                        />
                    </Routes>
                    </BrowserRouter>
                    <ChatWidget />
                </ChatProvider>
                </AuthProvider>
            );
}

export default App;
