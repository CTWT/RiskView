import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Route path="/" element={<PG200001 />} /> {/* 메인페이지 */}
        <Route path="/PG300001" element={<PG300001 />} /> {/* 로그인 페이지 */}
        <Route path="/PG300002" element={<PG300002 />} /> {/* 회원유형 선택 페이지 */}
        <Route path="/PG300003" element={<PG300003 />} /> {/* 이메일 인증 페이지 */}
        <Route path="/PG300004" element={<PG300004 />} /> {/* 이메일 인증번호 입력 및 확인 페이지 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
