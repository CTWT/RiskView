import React from "react";
import type { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;