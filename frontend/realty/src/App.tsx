import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PG300001 from './pages/auth/components/authentication/PG300001';
import PG300002 from './pages/auth/components/authentication/PG300002';
import PG300003 from './pages/auth/components/authentication/PG300003';
import PG300004 from './pages/auth/components/authentication/PG300004';
import './App.css';

function App() {

  return (
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/PG300001" />} /> {/* /PG300001으로 리디렉트 */}
        <Route path="/PG300001" element={<PG300001 />} /> {/* 로그인 페이지 */}
        <Route path="/PG300002" element={<PG300002 />} /> {/* 회원유형 선택 페이지 */}
        <Route path="/PG300003" element={<PG300003 />} /> {/* 이메일 인증 페이지 */}
        <Route path="/PG300004" element={<PG300004 />} /> {/* 이메일 인증번호 입력 및 확인 페이지 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App
