import React from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";

import Breadcrumb from "../breadcrumb/Breadcrumb";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // 헤더를 숨겨야 하는 조건 확인
  const shouldHideHeader = () => {
    // PG300001 페이지에서 signup 파라미터가 있는 경우 (회원가입 플로우)
    if (location.pathname === "/PG300001") {
      const urlParams = new URLSearchParams(location.search);
      const isSignup = urlParams.get("signup") === "true";
      return isSignup; // 회원가입 플로우에서는 헤더 숨김
    }

    return false;
  };

  return (
    <div className="layout-container">
      {!shouldHideHeader() && <Header />}
      <main className="main-content">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};

export default Layout;
