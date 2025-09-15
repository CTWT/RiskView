import requests
import json
from dotenv import load_dotenv
from urllib import parse
from urllib.parse import urlencode
import os

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.08
#  수정일 : 
#  파일명 : addr_to_sigungu_bjdong_code.py
#  설명  : 주소를 시군구코드와 법정동코드로 변환
# ============================================

# .env에서 기본 URL 로딩
load_dotenv()
bjdong_code_api_base_url = os.getenv('BJDONG_CODE_API_BASE_URL')

# 법정동코드 API 호출 메서드
# 공공데이터포탈 법정동코드 API
# https://www.data.go.kr/data/15134735/openapi.do#/
def build_bjdong_code_api_url(**kwargs) -> str:
    """
    법정동코드 API 호출 URL 생성 함수
    """
    base_url = kwargs.get('base_url', bjdong_code_api_base_url)
    type = kwargs.get('_type', "json")
    pageNo = kwargs.get('pageNo', "1")
    numOfRows = kwargs.get('numOfRows', "1")
    flag = kwargs.get('flag', "Y") # 신규 API
    locatadd_nm = kwargs.get('locatadd_nm', "서울특별시 종로구 청운동") # 지역주소명

    # 기본값 처리
    default_values = {
        "type": "json",
        "pageNo": "1",
        "flag": "Y",
        "locatadd_nm": "서울특별시 종로구 청운동",
    }

    """
    요청 파라미터 명세
    ============================================
    @param base_url: 기본 URL
    @param sigunguCd: 시군구코드
    @param bjdongCd: 법정동코드
    @param platGbCd: 대지구분코드
    @param bun: 번
    @param ji: 지
    @param startDate: 검색시작일(YYYYMMDD)
    @param endDate: 검색종료일(YYYYMMDD)
    @param _type: 리턴 타입(JSON/XML)
    @param numOfRows: 페이지당 조회 개수
    @param pageNo: 페이지 번호
    @return: API 호출에 필요한 완전한 URL 문자열
    ============================================
    """

    """
    응답 파라미터 명세
    ============================================
    totalCount: 전체 결과 수
    numOfRows: 한 페이지결과 수
    pageNo: 페이지 번호
    type: 수신 문서 형식
    resultCode: 결과코드
    resultMsg: 결과메시지
    region_cd: 지역코드
    sido_cd: 시도코드
    sgg_cd: 시군구코드
    umd_cd: 읍면동코드
    ri_cd: 리코드
    locatjumin_cd: 지역코드_주민
    locatjijuk_cd: 지역코드_지적
    locatadd_nm: 지역주소명
    locat_order: 서열
    locat_rm: 비고
    locathigh_cd: 상위코드
    locallow_nm: 최하위지역명
    adpt_de: 생성일
    ============================================
    """

    # 사용자 입력으로 덮어쓰기
    params = {**default_values, **kwargs}
    
    # 불필요한 빈 값 제거
    filtered_params = {k: v for k, v in params.items() if v and k != "base_url"}

    # URL 생성
    query_string = urlencode(filtered_params, encoding='utf-8')
    full_url = f"{base_url}&{query_string}"
    return full_url

# 테스트 호출
test_url = build_bjdong_code_api_url(
    locatadd_nm="서울특별시 종로구 세종로", # 예시: 청와대 주소
    pageNo="1",
    numOfRows="1"
)

print("최종 URL:")
print("\n", test_url)

response = requests.get(test_url)
response.raise_for_status()
data = response.json()

print(json.dumps(data, indent=4, ensure_ascii=False))