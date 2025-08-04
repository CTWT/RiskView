// src/pages/community/PG500001.tsx

import React from "react";
import { Routes, Route } from "react-router-dom";

// 모든 페이지 컴포넌트들을 직접 임포트
import PG500011 from "./PG500011";
import PG500021 from "./announcements/PG500021";
import PG500031 from "./legalDictionary/PG500031";
import PG500041 from "./board/PG500041";

const PG500001 = () => {
    return (
        <Routes>
            <Route index element={<PG500011 />} />
            <Route path="announcements" element={<PG500021 />} />
            <Route path="legal-dictionary" element={<PG500031 />} />
            <Route path="board/*" element={<PG500041 />} />
        </Routes>
    );
};
export default PG500001;
