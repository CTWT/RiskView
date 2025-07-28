import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PG200001 from './pages/auth/components/authentication/PG200001';
import PG200002 from './pages/auth/components/authentication/PG200002';
import './App.css';

function App() {

  return (
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/PG200001" />} /> {/* /PG200001으로 리디렉트 */}
        <Route path="/PG200001" element={<PG200001 />} /> {/* 로그인 페이지 */}
        <Route path="/PG200002" element={<PG200002 />} /> {/* 회원유형 선택 페이지 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App
