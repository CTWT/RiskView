import React, { useState, useEffect } from "react";
import axios from "axios";
import PG100005 from "../analysis/PG100005";
import "../../styles/common/common.css";
import { FiDownload } from "react-icons/fi";

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
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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

    const handleDownload = async (e: React.MouseEvent, documentCode: string) => {
        e.stopPropagation(); // 부모 요소의 onClick 이벤트 전파 방지
        try {
            const response = await axios.get(`/download/contract`, {
                params: { documentCode },
                responseType: 'blob', // 바이너리 데이터로 응답 받기
                withCredentials: true,
            });

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'downloaded-file'; // 기본 파일명
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = decodeURIComponent(filenameMatch[1]);
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Failed to download file:", err);
            alert("파일을 다운로드하는 데 실패했습니다.");
        }
    };

    if (isLoading) {
        return <div className="loading-spinner">분석 내역을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="analysis-page-layout">
            <div className="analysis-report-container">
                <div className="analysis-report-content">
                    {/* 사이드바 */}
                    <div className="analysis-sidebar-wrapper">
                        <div className="profile-sidebar" style={{ width: '280px', gap: '8px' }}>
                            <div className="analysis-list-sidebar">
                                <div className="analysis-list-scroll-wrapper">
                                    {analysisHistory.length > 0 ? (
                                        analysisHistory.map((item) => (
                                            <div
                                                key={item.documentCode}
                                                className={`analysis-list-item-sidebar ${selectedDocumentCode === item.documentCode ? 'active' : ''}`}
                                                onClick={() => setSelectedDocumentCode(item.documentCode)}
                                                onMouseEnter={() => setHoveredItem(item.documentCode)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                            >
                                                <div className="analysis-item-location">{item.location}</div>
                                                <div className="analysis-item-meta">
                                                    <span>{new Date(item.contractDate).toLocaleDateString()}</span>
                                                    <span style={{ color: getRiskColor(item.riskLevel), fontWeight: 'bold' }}>
                                                        {item.riskLevel}
                                                    </span>
                                                </div>
                                                {hoveredItem === item.documentCode && (
                                                    <button
                                                        className="download-btn"
                                                        data-tooltip="원본 파일 다운로드"
                                                        onClick={(e) => handleDownload(e, item.documentCode)}
                                                    >
                                                        <FiDownload />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-message">분석 내역이 없습니다.</div>
                                    )}
                                </div> {/* analysis-list-scroll-wrapper */}
                            </div> {/* analysis-list-sidebar */}
                        </div> {/* profile-sidebar */}
                    </div> {/* analysis-sidebar-wrapper */}
                    {selectedDocumentCode ? (
                        <PG100005 documentCode={selectedDocumentCode} />
                    ) : (
                        <div
                            className="empty-message"
                            style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {analysisHistory.length > 0
                                ? '왼쪽에서 분석 항목을 선택해주세요.'
                                : '분석 내역이 없습니다.'}
                        </div>
                    )}
                </div> {/* analysis-report-content */}
            </div> {/* analysis-report-container */}
        </div> // analysis-page-layout
    );    
};

export default PG700006;