// src/pages/serviceIntro/PG600001.tsx

import React, { useState } from "react";
import "../../styles/common/common.css"; // 공통 스타일 임포트
import PageContainer from "../../components/layout/PageContainer";
import PG600002 from "./PG600002";

import {
    FaRegFileAlt,
    FaGlobeAmericas,
    FaChartLine,
    FaCommentDots,
    FaBook,
} from "react-icons/fa";
import CommonContainerHeader from "../../components/ui/CommonContainerHeader";

/**
 * @file PG600001.tsx
 * @description 서비스 소개에 대한 페이지 입니다.
 * 사용자가 들어와서 핵심 기능들에 대해 알아보고 왼쪽의 버튼을 클릭하지 않으면 이미지 캐러샐이 보여지고
 * 클릭하면 해당 기능의 상세한 내용을 보여주는 방식으로 진행이 됩니다.
 * 이미지 캐러셀에 대한 기능이 방대해질 가능성이 있어서 오른화면에 대한 부분은 600002로 따로 빼서
 * 캐러셀과 버튼을 눌렀을때의 반응을 useState로 받아 해당하는 화면만 보이도록 설정해둡니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.07.31
 * 파일명 : PG600001.tsx
 * 수정자 : 이주하
 * 수정일 : 25.09.09
 * 설명 : 서비스 소개를 총괄하는 페이지입니다.
 */

// PG600002 역할: 좌측 핵심 기능 버튼 목록
interface Feature {
    id: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

interface FeatureListProps {
    features: Feature[];
    selectedFeature: string | null;
    onSelectFeature: (featureId: string) => void;
}

const FeatureList: React.FC<FeatureListProps> = ({
    features,
    selectedFeature,
    onSelectFeature,
}) => {
    return (
        <div className="in01-feature-list">
            {features.map((feature) => (
                <button
                    key={feature.id}
                    className={`in01-feature-button ${
                        selectedFeature === feature.id
                            ? "in01-feature-button-active"
                            : ""
                    }`}
                    onClick={() => onSelectFeature(feature.id)}
                >
                    {/* ⭐ HTML 구조 변경: 아이콘과 텍스트를 감싸는 div 추가 ⭐ */}
                    <div className="in01-feature-icon-wrapper">
                        {feature.icon && (
                            <div className="in01-feature-icon">
                                {feature.icon}
                            </div>
                        )}
                    </div>
                    <div className="in01-feature-text-wrapper">
                        <span className="in01-feature-title">
                            {feature.title}
                        </span>
                        {/* ⭐ 부제목 렌더링 로직 추가 ⭐ */}
                        {feature.subtitle && (
                            <span className="in01-feature-subtitle">
                                {feature.subtitle}
                            </span>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};

const PG600001: React.FC = () => {
    // 선택된 기능의 상태를 관리
    const [selectedFeature, setSelectedFeature] = useState<string | null>(
    "riskAnalysis"
    );

    const features = [
        {
            id: "riskAnalysis",
            title: "계약서 위험 분석",
            subtitle: "AI가 숨겨진 리스크를 찾아냅니다",
            icon: <FaRegFileAlt size={24} />,
        },
        {
            id: "unusualTransaction",
            title: "실거래가 기반 이상 거래 탐지",
            subtitle: "시세를 벗어난 위험 거래를 사전에 알려드립니다",
            icon: <FaChartLine size={24} />,
        },
        {
            id: "multiLanguage",
            title: "다국어 지원",
            subtitle: "어떤 언어의 계약서든 문제없이 분석합니다",
            icon: <FaGlobeAmericas size={24} />,
        },
        {
            id: "community",
            title: "커뮤니티",
            subtitle: "안심하고 소통하는 익명 게시판",
            icon: <FaCommentDots size={24} />,
        },
        {
            id: "legalLexicon",
            title: "법률 용어 해설 사전",
            subtitle: "어려운 법률 용어를 AI가 쉽게 풀어드립니다",
            icon: <FaBook size={24} />,
        },
    ];

    const handleSelectFeature = (featureId: string) => {
        setSelectedFeature(featureId);
    };

    return (
    <PageContainer showBreadcrumb={true} centerContent={true}>
        <div className="in01-container">
          {/* 상단 제목 영역 */}
        <CommonContainerHeader
            subtitle="핵심 기능"
            title="숨겨진 리스크를 한눈에 파악하세요"
            description="RiskView는 AI 기술을 활용하여 부동산 계약서와 등기부등본을 분석하고 숨겨진 위험 요소를 찾아냅니다."
        />

          {/* 좌우 패널 영역 */}
        <div className="in01-content-wrapper">
            {/* 좌측 패널 */}
            <div className="in01-left-panel">
            <FeatureList
                features={features}
                selectedFeature={selectedFeature}
                onSelectFeature={handleSelectFeature}
            />
            </div>
            {/* 우측 패널 */}
            <div className="in01-right-panel">
            {selectedFeature ? (
                <PG600002 selectedFeature={selectedFeature} />
            ) : (
                <p>이미지 캐러셀이 들어갈 장면</p>
            )}
            </div>
        </div>
        </div>
    </PageContainer>
    );
};

export default PG600001;
