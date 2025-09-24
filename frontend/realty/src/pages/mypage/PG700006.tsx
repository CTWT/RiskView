import React, { useState, useEffect } from "react";
import axios from "axios";
import PG100005 from "../analysis/PG100005";
import "../../styles/common/common.css";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.25
 * 파일명 : PG700006.tsx
 * 설명 : 내 분석 내역을 보여주는 페이지
 */

interface AnalysisHistoryItem {
    documentCode: string;
    location: string;
    contractDate: string;
    riskLevel: string;
}

const PG700006: React.FC = () => {
    const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
    const [selectedDocumentCode, setSelectedDocumentCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysisHistory = async () => {
            try {
                const response = await axios.get<AnalysisHistoryItem[]>("/api/analysis/history", { withCredentials: true });
                setAnalysisHistory(response.data);
                // 목록이 있으면 첫 번째 항목을 기본으로 선택
                if (response.data.length > 0) {
                    setSelectedDocumentCode(response.data[0].documentCode);
                }
            } catch (err) {
                setError("분석 내역을 불러오는 데 실패했습니다.");
                console.error("Failed to fetch analysis history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysisHistory();
    }, []);

    const getRiskColor = (risk: string) => {
        switch (risk?.toLowerCase()) {
            case "고위험": case "치명": case "high": case "critical":
                return "#ef4444"; // red
            case "중위험": case "경고": case "medium": case "warning":
                return "#f59e0b"; // yellow
            case "저위험": case "정상": case "low":
                return "#22c55e"; // green
            default:
                return "#9ca3af"; // gray
        }
    };

    if (isLoading) {
        return <div className="loading-spinner">분석 내역을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <>
            <div className="analysis-viewer-layout">
                {/* Left Sidebar Wrapper (for hover trigger) */}
                <div className="analysis-sidebar-wrapper">
                    {/* Left Sidebar: Analysis List */}
                    <div className="profile-sidebar" style={{ width: '280px', gap: '8px' }}>
                        <h3 className="chart-title" style={{ textAlign: 'center', marginBottom: '16px' }}>분석 목록</h3>
                        <div className="analysis-list-sidebar">
                            {analysisHistory.length > 0 ? (
                                analysisHistory.map((item) => (
                                    <div
                                        key={item.documentCode}
                                        className={`analysis-list-item-sidebar ${selectedDocumentCode === item.documentCode ? 'active' : ''}`}
                                        onClick={() => setSelectedDocumentCode(item.documentCode)}
                                    >
                                        <div className="analysis-item-location">{item.location}</div>
                                        <div className="analysis-item-meta">
                                            <span>{new Date(item.contractDate).toLocaleDateString()}</span>
                                            <span style={{ color: getRiskColor(item.riskLevel), fontWeight: 'bold' }}>
                                                {item.riskLevel}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-message">분석 내역이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="analysis-report-container">
                {selectedDocumentCode ? (
                    <PG100005 documentCode={selectedDocumentCode} />
                ) : (
                    <div className="empty-message" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        왼쪽에서 분석 항목을 선택해주세요.
                    </div>
                )}
            </div>
        </>
    );
};

export default PG700006;