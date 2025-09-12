import React from "react";
import "../../styles/common/Common.css";

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.09.12
* 파일명 : PG700002.tsx
*/

/*
* @param data - 위험도 구간별 정보 배열
*   - level: 위험 수준 (예: 낮음, 보통, 높음)
*   - percentage: 전체 대비 해당 위험 수준의 비율 (0~100)
*   - color: 해당 위험 수준을 표현하는 색상 코드 
*/

// 위험도 분포 도넛 차트 컴포넌트
const PG700002: React.FC<{
    data: Array<{ level: string; percentage: number; color: string }>;
}> = ({ data }) => {

  // 도넛 차트를 위한 계산
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulativePercentage = 0;

    const segments = data.map((item) => {
        const dashArray = (item.percentage / 100) * circumference;
        const dashOffset = (-cumulativePercentage * circumference) / 100;
        cumulativePercentage += item.percentage;

        return {
        ...item,
        dashArray,
        dashOffset,
        };
    });

    return (
        <div className="risk-donut-chart">
        {/* 도넛 차트 전체 영역 */}
        <div className="risk-chart-container">
            <svg className="risk-chart-svg" width={size} height={size}>
            {/* 배경 원 (회색 기본 원) */}
            <circle
                className="risk-chart-background"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
            />

            {/* 위험도 세그먼트 원형 차트 */}
            {segments.map((segment, index) => (
                <circle
                key={index}
                className={`risk-chart-segment risk-segment-${index}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.dashArray} ${circumference}`}
                strokeDashoffset={segment.dashOffset}
                />
            ))}
            </svg>

            {/* 도넛 차트 중앙 텍스트 */}
            <div className="risk-chart-center">
            <div className="risk-chart-percentage">100%</div>
            <div className="risk-chart-label">총 분석</div>
            </div>
        </div>

        {/* 위험도 범례 (색상별 구간 표시) */}
        <div className="risk-chart-legend">
            {data.map((item, index) => (
            <div key={index} className="risk-legend-item">
                <div className="risk-legend-indicator">
                <div
                    className="risk-legend-dot"
                    style={{ backgroundColor: item.color }}
                />
                <span className="risk-legend-label">{item.level}</span>
                </div>
                <span
                className="risk-legend-percentage"
                style={{ color: item.color }}
                >
                {item.percentage}%
                </span>
            </div>
            ))}
        </div>
        </div>
    );
};

export default PG700002;