// src/components/breadcrumb/Breadcrumb.tsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.01
 * 파일명 : Breadcrumb.tsx
 * 수정자 :
 * 수정일 :
 * 설명 : 화면의 바로가기를 위한 브레드크램 컴포넌트입니다
 */

const nameMap: { [key: string]: string } = {
    PG100001: "계약서 분석",
    PG400001: "부동산 뉴스",
    PG500001: "커뮤니티",
    PG600001: "서비스 소개",
    // ▼ 커뮤니티 하위
    PG500021: "공지사항",
    PG500031: "부동산 용어 사전",
    PG500041: "게시판",
    PG500042: "게시글 상세",
    PG500043: "게시글 작성",
    PG700001: "마이페이지",
    // ... 필요에 따라 다른 PG 코드 추가
};

const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const board = new URLSearchParams(location.search).get('board') || 'free';
    const pathnames = location.pathname.split("/").filter((x) => x);
    const state: any = location.state;
    // id 패턴: 게시글(post-123), 숫자(123), 공지(n-1 등 하이픈 포함)
    const isPostId = (seg: string) => /^(post-|notice-|n-)[A-Za-z0-9-]+$|^\d+$/.test(seg);
    const resolvePostTitle = (id: string): string | null => {
        if (state?.title) return state.title;
        try {
            const raw = localStorage.getItem('communityPosts');
            if (raw) {
                const arr = JSON.parse(raw);
                const found = Array.isArray(arr) ? arr.find((p: any) => String(p.id) === String(id)) : null;
                if (found?.title) return String(found.title);
            }
        } catch {}
        return null;
    };
    const resolveNoticeTitle = (id: string): string | null => {
        if (state?.title) return state.title;
        try {
            const raw = localStorage.getItem('noticePosts');
            if (raw) {
                const arr = JSON.parse(raw);
                const found = Array.isArray(arr) ? arr.find((p: any) => String(p.id) === String(id)) : null;
                if (found?.title) return String(found.title);
            }
        } catch {}
        return null;
    };

    if (pathnames.length === 0) {
        return null;
    }

    return (
        <div className="breadcrumb-container">
            <Link to="/" className="breadcrumb-item breadcrumb-home-link">
                <AiOutlineHome size={20} />
            </Link>
            {pathnames.map((name, index) => {
                // 기본 경로
                let routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;

                // 공지 상세 경로 처리: /PG500001/PG500021/detail/:id
                if (name === 'detail' && pathnames[index - 1] === 'PG500021') {
                    // 공지 목록으로 돌아가도록 링크 고정
                    routeTo = `/PG500001/PG500021`;
                }

                // 상세 경로(PG500042)는 목록으로
                if (name === 'PG500042') {
                    routeTo = `/PG500001/PG500041?board=${board}`;
                }

                // 마지막 여부 (PG500042 다음 id 조합, 혹은 공지 detail 다음 id 조합을 마지막으로 취급)
                const nextSeg = pathnames[index + 1];
                // detail 다음(공지) 또는 PG500042 다음(게시글)은 id 세그먼트로 간주
                const nextIsId = !!nextSeg && (isPostId(nextSeg) || name === 'detail' || name === 'PG500042');
                const isNoticeDetail = name === 'detail' && pathnames[index - 1] === 'PG500021';
                const isLast =
                    index === pathnames.length - 1 ||
                    (name === 'PG500042' && nextIsId && index === pathnames.length - 2) ||
                    (isNoticeDetail && nextIsId && index === pathnames.length - 2);

                // 텍스트 치환
                let displayText: string = nameMap[name] || name;
                if (name === 'PG500042' && nextIsId) {
                    displayText = resolvePostTitle(nextSeg) || '게시글 상세';
                }
                if (name === 'detail' && pathnames[index - 1] === 'PG500021' && nextIsId) {
                    displayText = resolveNoticeTitle(nextSeg) || '공지 상세';
                }

                // id 세그먼트는 이전 세그먼트 성격에 따라 건너뜀
                // 직전 세그먼트가 상세 식별자면(게시글/공지) 현재 id 세그먼트는 출력하지 않음
                if (pathnames[index - 1] === 'PG500042' || pathnames[index - 1] === 'detail') {
                    return null;
                }

                return (
                    <span key={`${name}-${index}`} className="breadcrumb-item-wrapper">
                        <span className="breadcrumb-separator"> &gt; </span>
                        {isLast ? (
                            <span className="breadcrumb-item breadcrumb-active">{displayText}</span>
                        ) : (
                            <Link to={routeTo} className="breadcrumb-item">{displayText}</Link>
                        )}
                    </span>
                );
            })}
        </div>
    );
};

export default Breadcrumb;
