import React, { useState, useEffect } from "react";
import { FiLogIn, FiMapPin, FiMonitor, FiSmartphone } from "react-icons/fi";
import "../../styles/common/Common.css";
import axios from "axios";

/*
* 수업명 : 가비아 2회차
* 이름 : 박윤성
* 작성자 : 박윤성
* 수정자 : 
* 작성일 : 25.09.22
* 수정일 : 
* 파일명 : PG700004.tsx
*/

interface LoginHistory {
    loginTime: string;
    ipAddress: string;
    userAgent: string;
}

{/* 기기 정보 */}
const getDeviceInfo = (userAgent: string): { type: 'PC' | 'Mobile' | 'Tablet' | 'Unknown', icon: React.ReactNode } => {
    const lowerUserAgent = userAgent.toLowerCase();

    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(lowerUserAgent)) {
        if (/ipad/i.test(lowerUserAgent)) {
            return { type: 'Tablet', icon: <FiMonitor /> };
        }
        return { type: 'Mobile', icon: <FiSmartphone /> };
    }

    return { type: 'PC', icon: <FiMonitor /> };
};

const PG700004: React.FC = () => {
    const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLoginHistory = async () => {
            try {
                const response = await axios.get<LoginHistory[]>("/api/user/login-history");
                setLoginHistory(response.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || "로그인 이력을 불러오는 데 실패했습니다.");
                } else {
                    setError("로그인 이력을 불러오는 중 알 수 없는 오류가 발생했습니다.");
                }
                console.error("Failed to fetch login history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoginHistory(); // 로그인 이력 가져오기
    }, []);

    if (isLoading) {
        return <div className="login-history-container"><div>로딩 중...</div></div>;
    }

    if (error) {
        return <div className="login-history-container"><div>{error}</div></div>;
    }

    return (
        <div className="login-history-container">
            <h2 className="page-authwelcome">로그인 이력</h2>
            <div className="timeline">
                {loginHistory.map((item, index) => {
                    const deviceInfo = getDeviceInfo(item.userAgent);
                    return (
                    <div key={index} className="timeline-item">
                        <div className="timeline-icon-wrapper">
                            <div className="timeline-icon">
                                <FiLogIn />
                            </div>
                            {index < loginHistory.length - 1 && <div className="timeline-connector"></div>}
                        </div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <span className="timeline-date">{item.loginTime}</span>
                            </div>
                            <div className="timeline-body">
                                <div className="timeline-info-item">
                                    <FiMapPin className="timeline-info-icon" />
                                    <span>IP: {item.ipAddress}</span>
                                </div>
                                <div className="timeline-info-item">
                                    {deviceInfo.icon}
                                    <span>기기: {deviceInfo.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        </div>
    );
};

export default PG700004;
