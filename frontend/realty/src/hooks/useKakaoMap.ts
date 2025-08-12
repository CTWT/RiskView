// src/hooks/useKakaoMap.ts

import { useEffect, useState } from "react";

/**
 * @file useKakaoMap.ts
 * @description  카카오 지도 API를 비동기적으로 로드하고, 로드 완료 여부를 반환하는 커스텀 훅입니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.07
 * 파일명 : useKakaoMap.ts
 * 수정자 :
 * 수정일 :
 * 설명 : 카카오 지도 API를 로드하고 완료 여부를 반환하는 커스텀 훅
 */

export const useKakaoMap = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=3db0f491d8fba92c9afd96cb31bf7ec2`;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error("KAKAO Map API 로딩 실패");

        document.head.appendChild(script);
    });

    return isLoaded;
};
