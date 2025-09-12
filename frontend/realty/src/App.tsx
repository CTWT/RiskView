import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/auth/components/authentication/AuthProvider";
import Layout from "./components/layout/Layout";
import PG200001 from "./pages/home/PG200001";
import PG100001 from "./pages/analysis/PG100001";
import PG300001 from "./pages/auth/components/authentication/PG300001";
import PG400001 from "./pages/news/PG400001";
import PG500001 from "./pages/community/PG500001";
import PG500043 from "./pages/community/board/PG500043";
import PG600001 from "./pages/serviceIntro/PG600001";
import PG700001 from "./pages/mypage/PG700001";

import { ChatProvider } from "./components/chat/ChatProvider";
import ChatWidget from "./components/chat/ChatWidget";
import ChatToggleButtonConnected from "./components/chat/ChatToggleButtonConnected";

import "./App.css";

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
                      {/* 서비스 소개 페이지 */}
                      <Route path="/" element={<PG200001 />} />
                      {/* 메인페이지 */}
                      <Route path="/PG100001" element={<PG100001 />} />{" "}
                      {/* 계약서분석 페이지 */}
                      <Route path="/PG400001" element={<PG400001 />} />{" "}
                      {/* 부동산 뉴스 페이지 */}
                      <Route path="/PG500001/*" element={<PG500001 />} />{" "}
                      {/* 커뮤니티 페이지 */}
                      <Route path="/PG500043" element={<PG500043 />} />{" "}
                      <Route path="/PG600001" element={<PG600001 />} />{" "}
                      <Route path="/PG700001" element={<PG700001 />} />{" "}
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
