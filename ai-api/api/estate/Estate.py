import requests
import json
import os
from dotenv import load_dotenv
from urllib.parse import quote

# 환경 변수 로드
load_dotenv()
estate_url = os.getenv('estate_url')

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 신인철
#  수정자 :
#  작성일 : 25.08.04
#  파일명 : Estate.py
#  설명   : 실거래가 정보 호출 API
# ============================================

def build_url(base_url: str, start_index : str, end_index : str, cgg_nm: str, ctrt_day: str, bldg_usg: str) -> str:
    """
    URL을 구성하는 함수

    @param base_url: API의 기본 URL
    @param cgg_nm: 자치구명
    @param ctrt_day: 계약일
    @param bldg_usg: 건물용도
    @return 구성된 URL 문자열
    """
    params = [
        start_index,       # START_INDEX(필수)
        end_index,         # END_INDEX(필수)
        " ",               # RCPT_YR
        " ",               # CGG_CD
        quote(cgg_nm),    # CGG_NM
        " ",               # STDG_CD
        " ",               # LOTNO_SE
        " ",               # MNO
        " ",               # SNO
        ctrt_day,         # CTRT_DAY
        " ",               # BLDG_NM
        quote(bldg_usg)   # BLDG_USG
    ]
    print("실제 정보" + f"{base_url}/" + "/".join(params))
    return f"{base_url}/" + "/".join(params)


def runEstate(start_index : str, end_index : str, cgg_nm: str, ctrt_day: str, bldg_usg: str):
    """
    실거래가 API 호출 함수

    @param cgg_nm: 자치구명
    @param ctrt_day: 계약일 (YYYYMMDD)
    @param bldg_usg: 건물용도
    @return: API 응답(JSON)
    """
    url = build_url(estate_url, start_index, end_index,cgg_nm, ctrt_day, bldg_usg)
    print("📌 요청 URL:", url)

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        print("✅ 응답 데이터:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return data

    except requests.exceptions.RequestException as e:
        print(f"❌ API 요청 실패: {e}")
        return None


if __name__ == "__main__":
    # main 실행부 - 사용자 입력값을 받아 API 실행
    start_index = input("시작순서")
    end_index = input("종료순서")
    cgg_nm = input("자치구명을 입력하세요 (예: 영등포구): ")
    ctrt_day = input("계약일을 입력하세요 (YYYYMMDD): ")
    bldg_usg = input("건물용도를 입력하세요 (예: 아파트): ")

    runEstate(start_index, end_index, cgg_nm, ctrt_day, bldg_usg)