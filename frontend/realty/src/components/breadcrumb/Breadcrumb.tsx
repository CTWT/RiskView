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
  // ... 필요에 따라 다른 PG 코드 추가
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="breadcrumb-container">
      <Link to="/" className="breadcrumb-item breadcrumb-home-link">
        <AiOutlineHome size={20} />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <span key={name} className="breadcrumb-item-wrapper">
            <span className="breadcrumb-separator"> &gt; </span>
            {isLast ? (
              // nameMap을 사용하여 PG 코드를 사용자 친화적인 이름으로 표시
              <span className="breadcrumb-item breadcrumb-active">
                {nameMap[name] || name}
              </span>
            ) : (
              <Link to={routeTo} className="breadcrumb-item">
                {nameMap[name] || name}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
