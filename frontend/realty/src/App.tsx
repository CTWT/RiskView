import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import PG200001 from "./pages/home/PG200001";
import PG300001 from "./pages/auth/components/authentication/PG300001";
import PG300002 from "./pages/auth/components/authentication/PG300002";
import PG300003 from "./pages/auth/components/authentication/PG300003";
import PG300004 from "./pages/auth/components/authentication/PG300004";
import "./App.css";

function App() {
  // prettier-ignore
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout 없이 렌더링할 페이지들 */}
        <Route path="/PG300002" element={<PG300002 />} />
        <Route path="/PG300003" element={<PG300003 />} />
        <Route path="/PG300004" element={<PG300004 />} />

        {/* Layout이 필요한 페이지들 */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<PG200001 />} /> {/* 메인페이지 */}
                <Route path="/PG300001" element={<PG300001 />} /> {/* 로그인 페이지 */}
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
