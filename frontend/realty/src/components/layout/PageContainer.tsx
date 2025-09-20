import React from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import "../../styles/common/common.css";

interface Props {
  children: React.ReactNode;
  className?: string;
  // 브레드크럼 관련
  showBreadcrumb?: boolean; // 브레드크럼 표시 여부
  // 레이아웃 관련
  fullWidth?: boolean;
  centerContent?: boolean;
  backgroundColor?: string;
}

const PageContainer: React.FC<Props> = ({
  children,
  className = "",
  showBreadcrumb = true, // 기본값: 브레드크럼 표시
  fullWidth = false,
  centerContent = true,
  backgroundColor,
}) => {
  const containerStyle: React.CSSProperties = {
    ...(fullWidth && { maxWidth: "none", width: "100vw" }),
    ...(backgroundColor && { backgroundColor }),
    justifyContent: centerContent ? "center" : "flex-start",
    flexDirection: "column",
    alignItems: "center", // 항상 가로 중앙 정렬을 유지
  };

  return (
    <div className={`pageContainer ${className}`} style={containerStyle}>
      {/* 브레드크럼을 상단 왼쪽에 고정 */}
      {showBreadcrumb && (
        <div
          style={{
            width: "100%",
            maxWidth: fullWidth ? "none" : "1200px", // 콘텐츠 최대 너비와 동일
            alignSelf: "stretch", // 전체 너비 사용
            marginBottom: "20px",
            paddingLeft: fullWidth ? "20px" : "0", // fullWidth일 때만 왼쪽 패딩
          }}
        >
          <Breadcrumb />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        style={{
          flex: centerContent ? 1 : "none",
          display: centerContent ? "flex" : "block",
          alignItems: centerContent ? "center" : "flex-start",
          justifyContent: centerContent ? "center" : "flex-start",
          width: "100%",
          maxWidth: fullWidth ? "none" : "1200px",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer;