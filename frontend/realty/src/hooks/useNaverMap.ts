// src/hooks/useNaverMap.ts

import { useEffect, useState } from "react";

export const useNaverMap = () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;

    // ✅ API 키가 없으면 앱이 실행되지 않도록 강제 에러 발생
    if (!clientId) {
        throw new Error(
            "NAVER API Key가 .env에 없습니다. VITE_NAVER_CLIENT_ID를 확인하세요."
        );
    }

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const existingScript = document.getElementById("naver-map-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => setIsLoaded(true));
            return;
        }

        const script = document.createElement("script");
        script.id = "naver-map-script";
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error("Naver Map API 로딩 실패");

        document.head.appendChild(script);
    }, [clientId]);

    return isLoaded;
};
