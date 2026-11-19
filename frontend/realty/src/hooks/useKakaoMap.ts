import { useEffect, useState } from "react";

/**
 * Kakao 지도 API를 동적으로 로드하고 로딩 완료 여부를 반환하는 커스텀 훅
 * 
 * 사용 예시:
 * const isLoaded = useKakaoMap();
 * if (!isLoaded) return <div>로딩 중...</div>;
 * // 지도 컴포넌트 렌더링
 */
export const useKakaoMap = () => {
  const [isLoaded, setIsLoaded] = useState(false); // 지도 API 로드 완료 여부 상태
  const apiKey = import.meta.env.VITE_KAKAO_APP_KEY;

  useEffect(() => {
    // 이미 kakao 객체와 kakao.maps가 존재하는 경우 (중복 로딩 방지)
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    // 이미 Kakao Maps SDK 스크립트가 HTML에 추가되어 있다면,
    // 새로운 스크립트를 만들지 않고 이벤트 리스너만 등록
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      existingScript.addEventListener("error", () => console.error("KAKAO Map API 로딩 실패"));
      return;
    }

    // Kakao Maps API 스크립트를 동적으로 생성
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    // 스크립트 로드가 완료되면 kakao.maps.load()를 호출하여 SDK 초기화
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true); // 로딩 완료 상태 업데이트
      });
    };

    // 로드 실패 시 콘솔 에러 출력
    script.onerror = () => {
      console.error("KAKAO Map API 로딩 실패");
    };

    // head 태그에 스크립트 추가하여 로드 시작
    document.head.appendChild(script);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return isLoaded; // 지도 API 로드 여부 반환
};