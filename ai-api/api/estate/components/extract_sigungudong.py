import requests
from urllib.parse import quote
from dotenv import load_dotenv
import sys
import re

if __package__ is None or __package__ == '':
    from remove_address_details import clean_address
else:
    from .remove_address_details import clean_address

import os

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.09
#  수정일 : 25.09.17
#  파일명 : extract_sigungudong.py
#  설명  : 주소에서 시군구동을 추출하는 메서드
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
JUSO_API_KEY = os.getenv('JUSO_API_KEY')
KAKAO_API_KEY = os.getenv('KAKAO_API_KEY')

# ============================================
# 카카오 API를 사용하여 주소에서 시군구동을 추출하는 메서드
# ============================================
def get_sigungudong_from_kakao(address):
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {
        "Authorization": f"KakaoAK {KAKAO_API_KEY}"
    }
    params = {
        "query": address
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        print(f"카카오 API 호출 실패: {response.status_code}")
        return None

    data = response.json()
    if not data['documents']:
        print(f"카카오 API 주소 검색 결과 없음: {address}")
        return None

    doc = data['documents'][0]
    address_info = doc.get('address') or doc.get('road_address')
    if not address_info:
        print("주소 정보가 없습니다.")
        return None

    return {
        "시도": address_info.get('region_1depth_name', ''),
        "시군구": address_info.get('region_2depth_name', ''),
        "법정동": address_info.get('region_3depth_name', '')
    }

# ============================================
# juso.go.kr API를 사용하여 주소에서 시군구동을 추출하는 메서드
# ============================================
def extract_sigungudong(address, api_key=JUSO_API_KEY):
    # API 호출 전, 번지 등 상세주소 제거
    cleaned_address = clean_address(address)
    print(f"정제된 주소: {cleaned_address}")

    url = "https://www.juso.go.kr/addrlink/addrLinkApi.do"
    params = {
        'confmKey': api_key, # API 키
        'currentPage': 1, # 페이지
        'countPerPage': 1, # 페이지당 결과 수
        'keyword': cleaned_address, # 정제된 주소
        'resultType': 'json' # 결과 타입
    }

    req = requests.Request('GET', url, params=params).prepare() # 요청 준비
    print("[DEBUG] 요청 URL:", req.url) # 요청 URL 출력

    response = requests.Session().send(req) # 요청 보내기
    data = response.json() # JSON 응답

    # API 에러 체크
    common = (data or {}).get('results', {}).get('common', {})
    if common.get('errorCode') != '0':
        print("[ERROR] API 오류:", common.get('errorMessage'))
        print("[INFO] juso.go.kr API 실패로 카카오 API fallback 시도")
        return get_sigungudong_from_kakao(address)

    if not (data or {}).get('results', {}).get('juso', []):
        print(f"주소 검색 결과 없음: {cleaned_address}")
        return None

    # juso 리스트가 비어있는 경우 안전 처리
    juso_list = data.get('results', {}).get('juso', [])
    if not juso_list:
        print(f"[WARN] 주소 검색 결과 없음: {cleaned_address}")
        print("[INFO] juso.go.kr 결과 없음으로 카카오 API fallback 시도")
        return get_sigungudong_from_kakao(address)

    juso = juso_list[0]

    # 상세주소(번, 지) 추출
    bun, ji = '', ''
    match = re.search(r'(\d+)(?:-(\d+))?$', address.strip())
    if match:
        bun = match.group(1)
        ji = match.group(2) or ''

    result = {
        '시도': juso.get('siNm', ''),
        '시군구': juso.get('sggNm', ''),
        '읍면동': juso.get('emdNm', ''),
        '도로명주소': juso.get('roadAddr', ''),
        '지번주소': juso.get('jibunAddr', ''),
        '법정동코드': juso.get('admCd', '')
    }

    return result