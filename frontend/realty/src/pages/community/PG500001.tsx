// src/pages/community/PG500001.tsx

import React from "react";
import { Routes, Route } from "react-router-dom";

// 모든 페이지 컴포넌트들을 직접 임포트
import PG500011 from "./PG500011";
import PG500021 from "./announcements/PG500021";
import PG500031 from "./legalDictionary/PG500031";
import PG500041 from "./board/PG500041";

/**
 * @file PG500001.tsx
 * @description 게시판 라우트 관리 페이지입니다
 *
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.13
 * 파일명 : PG500001.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 커뮤니티 탭에서 각 부분의 라우트를 관장하는 루트 페이지 입니다.
 * 여기서 라우트 한것들을 기준으로 각 페이지들의 이동이 가능하게 합니다.
 */

const PG500001 = () => {
    return (
        <Routes>
            <Route index element={<PG500011 />} />
            <Route path="PG500021" element={<PG500021 />} />
            <Route path="PG500031" element={<PG500031 />} />
            <Route path="PG500041/*" element={<PG500041 />} />
        </Routes>
    );
};
export default PG500001;
