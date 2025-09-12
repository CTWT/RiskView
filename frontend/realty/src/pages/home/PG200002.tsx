import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import "../../styles/common/Common.css";

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.09.10
* 파일명 : PG200002.tsx
*/


interface AnalysisCard {
    id: number;
    title: string;
    content: string;
    riskLevel: string;
    riskCount: number;
    warningCount: number;
    warnings: string[];
    realEstateInfo: {
        salePrice: string;
        avgPrice: string;
        difference: string;
    };
    bgColor: string;
}

/**
 * 계약서 AI 분석 결과를 회전형 캐러셀 카드로 시각화 컴포넌트
 * 자동 회전 기능과 카드 클릭 시 해당 카드로 포커싱되는 기능 포함
 *
 * @returns 계약서 분석 정보를 담은 3D 캐러셀 카드 UI 렌더링
 */
const PG200002: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const [rotationAngle, setRotationAngle] = useState(0); // 실제 회전 각도 관리

  // 분석 카드 데이터
    const analysisCards: AnalysisCard[] = [
    {
        id: 1,
        title: "AI 분석 리포트",
        content: "계약서 위험도 분석 결과",
        riskLevel: "중위험",
        riskCount: 52,
        warningCount: 14,
        warnings: [
            "계약서 내 권리 관련 정보가 복잡하게 설정되어 있어 주의가 필요합니다",
            "AI가 사료 추출한 정보입니다. 실제 서류와 반드시 확인해주세요",
        ],
        realEstateInfo: {
        salePrice: "3.5억 원",
        avgPrice: "3.8억 원",
        difference: "▼ 3천만 원",
        },
        bgColor: "rgba(255, 255, 255, 0.25)",
    },
    {
        id: 2,
        title: "AI 분석 리포트",
        content: "계약서 위험도 분석 결과",
        riskLevel: "저위험",
        riskCount: 8,
        warningCount: 3,
        warnings: [
            "해당 지역의 평균 시세와 비교했을 때 현재 보증금은 적정 수준으로 판단됩니다. ",
            "이 지역은 지속적인 가격 상승 추세를 보이고 있어 향후 시세 변화에 유의해야 합니다.",
        ],
        realEstateInfo: {
        salePrice: "6.8억 원",
        avgPrice: "7.0억 원",
        difference: "▼ 2천만 원",
        },
        bgColor: "rgba(255, 255, 255, 0.25)",
    },
    {
        id: 3,
        title: "AI 분석 리포트",
        content: "계약서 위험도 분석 결과",
        riskLevel: "고위험",
        riskCount: 85,
        warningCount: 28,
        warnings: [
            "다수의 이해관계가 얽혀 있을 가능성이 있어, 세부 조항에 대한 확인이 필요합니다",
            "실제 권리관계는 관련 서류로 반드시 확인하세요.",
        ],
        realEstateInfo: {
        salePrice: "12.0억 원",
        avgPrice: "9.5억 원",
        difference: "▲ 2.5억 원",
        },
        bgColor: "rgba(255, 255, 255, 0.25)",
        },
    ];

    /**
    * 카드 인덱스를 받아 캐러셀의 회전 각도를 최단 거리로 갱신
    * @param newIndex 회전할 대상 카드의 인덱스 (0부터 시작)
    */
    const updateRotationAngle = (newIndex: number) => {
    const anglePerCard = 360 / analysisCards.length;
    const targetAngle = -newIndex * anglePerCard;

    // 현재 각도에서 목표 각도까지의 최단 거리 계산
    let diff = targetAngle - rotationAngle;

    // 360도를 넘어가는 경우 최단 경로로 조정
    if (diff > 180) {
        diff -= 360;
    } else if (diff < -180) {
        diff += 360;
    }

    setRotationAngle(rotationAngle + diff);
    setCurrentIndex(newIndex);
    };

  // 자동 회전
    useEffect(() => {
        if (!isAutoRotating) return;

        const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % analysisCards.length;
        updateRotationAngle(nextIndex);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoRotating, currentIndex, rotationAngle, analysisCards.length]);

    /**
    * 특정 카드 클릭 시 해당 인덱스로 회전하고, 자동 회전을 일시 중단
    * @param index 클릭된 카드의 인덱스
    */
    const handleCardClick = (index: number) => {
        updateRotationAngle(index);
        setIsAutoRotating(false);

        // 5초 후 자동 회전 재개
        setTimeout(() => {
        setIsAutoRotating(true);
        }, 5000);
    };

    return (
        <div className="carousel-container">
            <div className="carousel-wrapper">
            <div
                className="carousel-inner"
                style={{
                transform: `rotateY(${rotationAngle}deg)`,
                }}
            >
                {analysisCards.map((card, index) => (
                <div
                    key={card.id}
                    className={`carousel-card ${
                    index === currentIndex ? "active" : ""
                    }`}
                    style={{
                    transform: `rotateY(${
                        index * (360 / analysisCards.length)
                    }deg) translateZ(220px)`, // 조금 줄임
                    background: card.bgColor,
                    }}
                    onClick={() => handleCardClick(index)}
                >
                    <div className="card-content">
                    {/* 헤더 */}
                    <div className="report-header">
                        <h2 className="report-title">{card.title}</h2>
                        <p className="report-subtitle">{card.content}</p>
                        <div className="white-divider"></div>
                    </div>

                    {/* 위험도 스코어 */}
                    <div className="risk-score-section">
                        <div className="score-display">
                        <div className="score-number">{card.riskLevel}</div>
                        <div className="score-suffix">{card.riskCount}/100</div>
                        </div>
                        <div className="score-bar">
                        <div
                            className="score-fill"
                            style={{ width: `${card.riskCount}%` }}
                        ></div>
                        </div>
                    </div>

                    <br />
                    {/* 주요 발견사항 */}
                    <div className="findings-section">
                        <div className="findings-header">
                        <span className="warning-icon">
                            <FaExclamationTriangle />
                        </span>
                        <span className="findings-title">주요 발견사항</span>
                        </div>
                        <div className="findings-list">
                        {card.warnings.slice(0, 3).map((warning, idx) => (
                            <div key={idx} className="finding-item">
                            <span className="bullet">•</span>
                            <span className="finding-text">{warning}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                    <br />
                            
                    {/* 분석 상태 */}
                    <div className="analysis-status">
                        <div className="status-item">
                        <span className="status-icon">
                            <FaCheckCircle />
                        </span>
                        <span className="status-text">
                            계약금액 : {card.realEstateInfo.salePrice}
                        </span>
                        </div>
                        <div className="status-item">
                        <span className="status-icon">
                            <FaCheckCircle />
                        </span>
                        <span className="status-text">
                            평균금액 : {card.realEstateInfo.avgPrice}
                        </span>
                        </div>
                    </div>
                    <br />
                    
                    <div className="report-footer">
                        <div className="view-report-btn">
                        시세 대비 : {card.realEstateInfo.difference}
                        </div>
                    </div>
                    <div className="white-divider"></div>
                    <div className="ai-status-wrapper">
                        <div className="ai-status-badge">분석 완료</div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>

            {/* 인디케이터 */}
            <div className="carousel-indicators">
            {analysisCards.map((_, index) => (
                <button
                key={index}
                className={`indicator ${index === currentIndex ? "active" : ""}`}
                onClick={() => handleCardClick(index)}
                />
            ))}
            </div>
        </div>
    );
};

export default PG200002;
