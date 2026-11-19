import requests
import json
import os, sys
from dotenv import load_dotenv
from urllib.parse import quote
from datetime import datetime

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 신인철
#  수정자 : 박윤성
#  작성일 : 25.08.04
#  수정일 : 25.09.19
#  파일명 : Estate.py
#  설명  : 실거래가 정보 호출 API
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
estate_url = os.getenv('ESTATE_API_URL')  # 실거래 API의 기본 URL
 
def build_url(base_url: str, start_index: str, end_index: str, cgg_cd: str, bldg_usg: str, ctrt_day: str = " ") -> str:
    """
    URL을 구성하는 함수
    ============================================
    @param base_url: API의 기본 URL (환경 변수 estate_url)
    @param start_index: 조회 시작 인덱스
    @param end_index: 조회 종료 인덱스
    @param cgg_cd: 자치구 코드
    @param bldg_usg: 건물용도 (예: 아파트)
    @param ctrt_day: 계약일 (YYYYMM)
    @return: API 호출에 필요한 완전한 URL 문자열
    ============================================
    """
    params = [
        start_index,       # START_INDEX (조회 시작 인덱스)
        end_index,         # END_INDEX (조회 종료 인덱스)
        " ",          # RCPT_YR (접수 연도, YYYYMM 형식으로 계약년월 조회)
        cgg_cd,            # CGG_CD (자치구 코드)
        " ",               # CGG_NM (자치구명, URL 인코딩)
        " ",           # STDG_CD (법정동 코드)
        " ",               # LOTNO_SE (지번 구분)
        " ",               # MNO (본번)
        " ",               # SNO (부번)
        ctrt_day,               # CTRT_DAY (계약일, YYYYMMDD)
        " ",               # BLDG_NM (건물명)
        quote(bldg_usg)    # BLDG_USG (건물용도, URL 인코딩)
    ]
    return f"{base_url}/" + "/".join(params)


def runEstate(start_index: str, end_index: str, cgg_cd: str, bldg_usg: str, ctrt_day: str = " "):
    """
    실거래가 API 호출 함수
    ============================================
    @param start_index: 조회 시작 인덱스
    @param end_index: 조회 종료 인덱스
    @param cgg_cd: 자치구 코드
    @param bldg_usg: 건물용도
    @param ctrt_day: 계약일 (YYYYMM)
    @return: 필터링된 실거래 API 응답 JSON
    ============================================
    """
    url = build_url(estate_url, start_index, end_index, cgg_cd, bldg_usg, ctrt_day)
    print(f"📣 API 요청 URL: \n{url}")

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        tb_data = data.get("tbLnOpendataRentV", {})
        list_total_count = tb_data.get("list_total_count", 0)
        result = tb_data.get("RESULT", {})
        
        # API 오류 코드 확인
        if result.get("CODE") != "INFO-000":
            print(f"API 호출 실패 (CGG_CD: {cgg_cd}): {result.get('MESSAGE')}")
            return None, 0 # 오류 발생 시 None 반환

        filtered_rows = []
        for row in tb_data.get("row", []):
            filtered_rows.append({
                "cgg_nm": row.get("CGG_NM"),
                "stdg_nm": row.get("STDG_NM"),
                "ctrt_day": row.get("CTRT_DAY"),
                "rent_se": row.get("RENT_SE"),
                "rent_area": row.get("RENT_AREA"),
                "grfe": row.get("GRFE"),
                "rtfe": row.get("RTFE"),
                "bldg_nm": row.get("BLDG_NM"),
                "bldg_usg": row.get("BLDG_USG"),
            })

        # 필터링된 row 리스트와 전체 카운트 반환
        return filtered_rows, list_total_count

    except requests.exceptions.RequestException as e:
        print(f"❌ API 요청 실패: {e}")
        return None, 0


if __name__ == "__main__":
    end_index = input("종료순서: ")
    cgg_nm = input("자치구명을 입력하세요 (예: 영등포구): ")
    bldg_usg = input("건물용도를 입력하세요 (예: 아파트): ")

    runEstate("1", end_index, cgg_nm, bldg_usg)