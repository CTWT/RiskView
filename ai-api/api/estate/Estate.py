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
#  파일명 : Estate.py
#  설명   : 실거래가 정보 호출 API
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
estate_url = os.getenv('ESTATE_API_URL')  # 실거래 API의 기본 URL

def build_url(base_url: str, end_index: str, rcpt_yr: str, cgg_nm: str, bldg_usg: str) -> str:
    """
    URL을 구성하는 함수
    ============================================
    @param base_url: API의 기본 URL (환경 변수 estate_url)
    @param end_index: 조회 종료 인덱스
    @param cgg_nm: 자치구명 (예: 영등포구)
    @param bldg_usg: 건물용도 (예: 아파트)
    @return: API 호출에 필요한 완전한 URL 문자열
    ============================================
    """
    params = [
        "1",               # START_INDEX (조회 시작 인덱스, 기본값 1)
        end_index,         # END_INDEX (조회 종료 인덱스)
        "2025",            # RCPT_YR (접수 연도)
        " ",               # CGG_CD (자치구 코드, 공백 처리)
        quote(cgg_nm),     # CGG_NM (자치구명, URL 인코딩)
        " ",               # STDG_CD (법정동 코드)
        " ",               # LOTNO_SE (지번 구분)
        " ",               # MNO (본번)
        " ",               # SNO (부번)
        " ",               # CTRT_DAY (계약일)
        " ",               # BLDG_NM (건물명)
        quote(bldg_usg)    # BLDG_USG (건물용도, URL 인코딩)
    ]
    return f"{base_url}/" + "/".join(params)


def runEstate(end_index: str, rcpt_yr: str, cgg_nm: str, bldg_usg: str):
    """
    실거래가 API 호출 함수
    ============================================
    @param end_index: 조회 종료 인덱스
    @param rcpt_yr: 접수 연도
    @param bldg_usg: 건물용도 (예: 아파트)
    @return: 필터링된 실거래 API 응답 JSON
    ============================================
    """
    url = build_url(estate_url, end_index, rcpt_yr, cgg_nm, bldg_usg)
    print(url)

    try:
        
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        tb_data = data.get("tbLnOpendataRentV", {})
        list_total_count = tb_data.get("list_total_count", 0)
        result = tb_data.get("RESULT", {})
        
        # API 오류 코드 확인
        if result.get("CODE") != "INFO-000":
            print(f"API 호출 실패: {result.get('MESSAGE')}")
            sys.exit(1)  # 프로그램 즉시 종료

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

        # 저장 시점 추가
        timestamp = datetime.now()
        saved_at = timestamp.strftime("%Y-%m-%d %H:%M:%S")

        filtered_data = {
            "saved_at": saved_at,                  # 저장 시점
            "list_total_count": list_total_count,  # 전체 데이터 개수
            "result": {
                "code": result.get("CODE"),        # 처리 코드
                "message": result.get("MESSAGE")   # 처리 메시지
            },
            "rows": filtered_rows
        }

        # JSON 파일 저장
        file_name = f"estate_result_{cgg_nm}_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        file_path = os.path.join(os.path.dirname(__file__), file_name)

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(filtered_data, f, ensure_ascii=False, indent=2)

        print(f"✅ 결과가 {file_name} 파일로 저장되었습니다.")
        return filtered_data

    except requests.exceptions.RequestException as e:
        print(f"❌ API 요청 실패: {e}")
        return None


if __name__ == "__main__":
    end_index = input("종료순서: ")
    cgg_nm = input("자치구명을 입력하세요 (예: 영등포구): ")
    bldg_usg = input("건물용도를 입력하세요 (예: 아파트): ")

    runEstate(end_index, cgg_nm, bldg_usg)