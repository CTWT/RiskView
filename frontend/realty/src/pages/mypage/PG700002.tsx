import React from "react";
import { PieChart } from "react-minimal-pie-chart";
import "../../styles/common/common.css";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.09.12
 * 수정일 : 25.09.22
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
    // 중앙에 표시할 데이터 찾기
    // 1. '저위험' 또는 '정상' 데이터가 있으면 그것을 사용
    let centerData = data.find(
        (item) =>
            item.level.toLowerCase() === "저위험" ||
            item.level.toLowerCase() === "정상"
    );

    // 2. 없다면, 가장 높은 비율을 가진 데이터를 사용
    if (!centerData && data.length > 0) {
        centerData = [...data].sort((a, b) => b.percentage - a.percentage)[0];
    }

    // 3. 데이터가 아예 없는 경우를 대비한 기본값
    const centerPercentage = centerData ? centerData.percentage : 0;
    const centerLabel = centerData ? centerData.level : "분석 없음";

    // 라이브러리 형식에 맞게 데이터 변환
    const chartData = data.map((item) => ({
        title: item.level,
        value: item.percentage,
        color: item.color,
    }));

    return (
        <div className="risk-donut-chart">
            {/* 도넛 차트 전체 영역 */}
            <div className="risk-chart-container">
                <PieChart
                    data={chartData}
                    lineWidth={25} // 도넛 두께
                    startAngle={-90} // 시작 각도 (12시 방향)
                    background="#f3f4f6" // 배경 원 색상
                    animate
                    paddingAngle={19} // 세그먼트 사이 간격
                    rounded // 세그먼트 끝을 둥글게 처리
                />

                {/* 도넛 차트 중앙 텍스트 */}
                <div className="risk-chart-center">
                    <div className="risk-chart-percentage">
                        {centerPercentage}%
                    </div>
                    <div className="risk-chart-label">{centerLabel}</div>
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
                            <span className="risk-legend-label">
                                {item.level}
                            </span>
                        </div>
                        <span
                            className="risk-legend-percentage"
                            style={{ color: item.color }}
                        >
                            {Math.round(item.percentage)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PG700002;
