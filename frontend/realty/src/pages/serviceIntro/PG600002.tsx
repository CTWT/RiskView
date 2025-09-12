import React from "react";
import "../../styles/common/common.css"; // 공통 스타일 임포트
import { FaCheckCircle, FaFileContract, FaChartBar, FaLightbulb, FaGlobeAmericas, FaCommentDots, FaBook } from "react-icons/fa";

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.09.09
* 파일명 : PG600002.tsx
*/

// 선택된 기능을 나타내는 문자열 ID를 props로 받음
interface FeatureDetailProps {
    selectedFeature: string;
}

// 개별 기능 항목의 구성 요소를 정의
interface FeatureItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}

// 전체 기능 상세 정보 구조를 정의
interface FeatureContent {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    description: React.ReactNode;
    features: FeatureItem[];
    tip?: string;
}

/**
 * 선택된 기능 ID에 따라 대응되는 설명과 기능 리스트를 보여주는 컴포넌트
 *
 * @param selectedFeature - 선택된 기능 식별자 (예: "riskAnalysis", "unusualTransaction" 등)
 * @returns 기능에 대한 설명, 주요 기능 리스트, 팁을 포함한 JSX 요소를 반환
 */
const PG600002: React.FC<FeatureDetailProps> = ({ selectedFeature }) => {
    const getFeatureContent = (featureId: string): FeatureContent | null => {
        switch (featureId) {
            // 계약서 위험 분석 
            case "riskAnalysis":
                return {
                    icon: <FaFileContract size={32} color="white" />,
                    title: "계약서 위험 분석",
                    subtitle: "AI가 숨겨진 리스크를 찾아냅니다",
                    description: (
                        <>
                            최신 AI 기술을 활용하여 부동산 계약서의 모든 조항을 면밀히
                            분석합니다.
                            <br />
                            숨겨진 불리한 조건, 애매한 표현, 법적 위험 요소를 자동으로
                            탐지하여 안전한 거래를 도와드립니다.
                        </>
                    ),
                    features: [
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "위험 조항 자동 탐지",
                            description:
                                "불리한 특약사항, 과도한 위약금 조건 등을 즉시 식별",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "위험도 점수 제공",
                            description:
                                "계약서 전체의 위험도를 0-100점으로 수치화하여 제공",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "개선 방안 제시",
                            description:
                                "발견된 문제점에 대한 구체적인 해결책과 대안 제시",
                        },
                    ],
                    tip: "계약서를 업로드하면 30초 내에 상세한 분석 결과를 받아볼 수 있습니다.",
                };

            // 실거래가 기반 이상 거래 탐지 
            case "unusualTransaction":
                return {
                    icon: <FaChartBar size={32} color="white" />,
                    title: "실거래가 기반 이상 거래 탐지",
                    description: (
                        <>
                            국토교통부 실거래가 데이터와 AI 분석을 통해 시세 대비
                            비정상적인 거래 가격을 실시간으로 감지합니다.
                            <br />
                            과도한 금액이나 의심스러운 저가 거래를 미리 파악할 수
                            있습니다.
                        </>
                    ),
                    features: [
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "실시간 시세 비교",
                            description: "주변 지역 최근 실거래가와 즉시 비교 분석",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "이상 거래 알림",
                            description: "시세 대비 차이나는 거래에 대한 경고 알림",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "시장 동향 분석",
                            description: "해당 지역의 가격 상승/하락 트렌드 및 전망 제공",
                        },
                    ],
                    tip: "실거래가 데이터를 활용해 이상 거래를 빠르게 파악할 수 있습니다.",
                };

            // 다국어 지원 
            case "multiLanguage":
                return {
                    icon: <FaGlobeAmericas size={32} color="white" />,
                    title: "다국어 지원",
                    subtitle: "어떤 언어의 계약서든 문제없이 분석합니다",
                    description: (
                        <>
                            한국어, 영어, 중국어, 일본어 등 다양한 언어로 작성된 계약서를
                            정확하게 분석합니다.
                        </>
                    ),
                    features: [
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "4개 언어 지원",
                            description: "분석 한 계약서를 리포트를 통해 다양한 언어로 제공",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "법률 용어 번역",
                            description: "복잡한 법률 용어도 번역하여 이해하기 쉽게 제공",
                        },
                    ],
                    tip: "언어 장벽 없이 다양한 국적의 사용자들이 계약서를 이해할 수 있도록 지원합니다.",
                };

            // 커뮤니티 
            case "community":
                return {
                    icon: <FaCommentDots size={32} color="white" />,
                    title: "커뮤니티",
                    subtitle: "안심하고 소통하는 익명 게시판",
                    description: (
                        <>
                            실제 부동산 거래를 경험했거나 처음인 사용자들이 자유롭게 정보를 나누는
                            공간입니다.
                            <br />
                            계약 시 주의할 점, 지역별 특징, 리스크 사례 등 다양한 주제를
                            함께 이야기하며,
                            <br />
                            서로의 경험을 통해 안전하고 현명한 의사결정을 도울 수
                            있습니다.
                        </>
                    ),
                    features: [
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "거래 후기 공유",
                            description:
                                "실제 거래 경험담과 주의사항 등 자유로운 의견 공유 가능",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "지역별 정보 공유",
                            description: "관심 지역에 대한 사용자 경험과 팁 공유",
                        },
                    ],
                    tip: "다른 사용자들과 생생한 거래 경험을 공유하며 정보를 나눌 수 있는 공간입니다.",
                };

            // 법률 용어 해설 사전
            case "legalLexicon":
                return {
                    icon: <FaBook size={32} color="white" />,
                    title: "법률 용어 해설 사전",
                    description: (
                        <>
                            부동산 계약서를 읽다가 이해되지 않는 법률 용어가 있다면,
                            <br />
                            누구나 쉽게 검색하고 의미를 바로 확인할 수 있도록 도와주는 용어
                            사전입니다.
                        </>
                    ),
                    features: [
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "법률 용어 데이터 연동",
                            description:
                                "다양한 법률 용어를 API를 통해 실시간으로 제공합니다",
                        },
                        {
                            icon: <div className="circle-icon"></div>,
                            title: "관련 법령 안내",
                            description: "해당 용어와 관련된 법령 조항 제공",
                        },
                    ],
                    tip: "궁금한 법률 용어를 검색하면 즉시 의미와 관련 법령을 확인할 수 있습니다.",
                };

            default:
                return null;
        }
    };

    const content: FeatureContent | null = getFeatureContent(selectedFeature);

    if (!content) {
        return (
            <div className="feature-detail-empty">
                <p>기능을 선택해주세요</p>
            </div>
        );
    }

    return (
        <div className="feature-detail-container">
            {/* 헤더 영역 */}
            <div className="feature-detail-header">
                <div className="feature-icon-container">{content.icon}</div>
                <h2 className="feature-title">{content.title}</h2>
            </div>

            {/* 설명 영역 */}
            <div className="feature-description">
                <p>{content.description}</p>
            </div>

            {/* 주요 기능 */}
            <div className="feature-highlights">
                {content.features && Array.isArray(content.features) ? 
                (
                    <ul className="risk-analysis-list">
                        {content.features.map((feature, index) => (
                            <li key={index} className="risk-analysis-item">
                                <div className="feature-icon-wrapper">{feature.icon}</div>
                                <div className="feature-content">
                                    <div className="feature-content-title">{feature.title}</div>
                                    <div className="feature-content-description">
                                        {feature.description}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="feature-list">
                        {content.features.map((feature, index) => (
                            <li key={index} className="feature-list-item">
                                <FaCheckCircle className="check-icon" />
                                <div className="feature-content">
                                    <div className="feature-content-title">{feature.title}</div>
                                    <div className="feature-content-description">{feature.description}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <br />

            {/* Tip 정보 영역 */}
            {content.tip && (
                <div className="feature-tip">
                    <div className="tip-icon">
                        <FaLightbulb size={16} />
                    </div>
                    <span className="tip-label"></span>
                    <span className="tip-text">{content.tip}</span>
                </div>
            )}  
            
            
        </div>
    );
};

export default PG600002;
