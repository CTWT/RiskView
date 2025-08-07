// src/hooks/useNaverMap.ts

import { useEffect, useState } from "react";

/**
 * @file useNaverMap.ts
 * @description  네이버 지도 API를 비동기적으로 로드하고, 로드 완료 여부를 반환하는 커스텀 훅입니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.07
 * 파일명 : useNaverMap.ts
 * 수정자 :
 * 수정일 :
 * 설명 : 네이버 지도 API를 로드하고 완료 여부를 반환하는 커스텀 훅
 */

export const useNaverMap = () => {
    const apiKey = import.meta.env.VITE_NAVER_MAP_KEY;

    if (!apiKey) {
        throw new Error(
            "NAVER API Key가 .env에 없습니다. VITE_NAVER_MAP_KEY를 확인하세요."
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
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${apiKey}`;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error("Naver Map API 로딩 실패");

        document.head.appendChild(script);
    }, [apiKey]);

    return isLoaded;
};
