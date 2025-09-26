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
#  수정일 : 25.09.26
#  파일명 : extract_sigungudong.py
#  설명  : 주소에서 시군구동을 추출하는 메서드
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
JUSO_API_KEY = os.getenv('JUSO_API_KEY')
KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY')

# ============================================
# 카카오 API를 사용하여 주소에서 시군구동을 추출하는 메서드
# ============================================
def get_sigungudong_from_kakao(address, api_key=KAKAO_REST_API_KEY):
    print("[INFO] 카카오 주소 검색 시작")
    print(f"[DEBUG] 원본 주소: {address}")
    
    if not api_key:
        print("[ERROR] 카카오 API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.")
        # raise ValueError("카카오 API 키가 없습니다.") # 또는 오류를 발생시켜 즉시 중단
        return None

    headers = {
        'Authorization': f'KakaoAK {api_key}'
    }
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    params = {'query': address, 'size': 1}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        print(f"[INFO] 카카오 API 응답 상태 코드: {response.status_code}")
        data = response.json()
        print(f"[DEBUG] API 응답 데이터 예시: {str(data)[:300]}")
    except Exception as e:
        print(f"[ERROR] 카카오 API 요청 실패: {e}")
        return None
    
    documents = data.get('documents', [])
    if not documents:
        print(f"[WARN] 주소 검색 결과 없음: {address}")
        return None
    
    doc = documents[0]
    address_info = doc.get('address') or doc.get('road_address')
    if not address_info:
        print("주소 정보가 없습니다.")
        return None
    
    sido = address_info.get('region_1depth_name', '')
    sigungu = address_info.get('region_2depth_name', '')
    eupmyeondong = address_info.get('region_3depth_name', '')
    beopjeongdong_code = address_info.get('b_code', '')
    main_bun = address_info.get('main_address_no', '')
    sub_bun = address_info.get('sub_address_no', '')
    
    result = {
        '시도': sido,
        '시군구': sigungu,
        '읍면동': eupmyeondong,
        '법정동코드': beopjeongdong_code,
        'mainBun': main_bun,
        'subBun': sub_bun
    }
    
    print(f"[INFO] 최종 추출 결과: {result}")
    return result

# # ============================================
# # juso.go.kr API를 사용하여 주소에서 시군구동을 추출하는 메서드
# # ============================================
# def extract_sigungudong(address, api_key=JUSO_API_KEY):
#     print("[INFO] 주소 추출 시작")
#     print(f"[DEBUG] 원본 주소: {address}")
    
#     # API 호출 전, 번지 등 상세주소 제거
#     cleaned_address = clean_address(address)
#     print(f"[DEBUG] 정제된 주소: {cleaned_address}")

#     url = "https://www.juso.go.kr/addrlink/addrLinkApi.do"
#     params = {
#         'confmKey': api_key, # API 키
#         'currentPage': 1, # 페이지
#         'countPerPage': 1, # 페이지당 결과 수
#         'keyword': cleaned_address, # 정제된 주소
#         'resultType': 'json' # 결과 타입
#     }
    
#     req = requests.Request('GET', url, params=params).prepare() # 요청 준비
#     print("[DEBUG] 요청 URL:", req.url) # 요청 URL 출력

#     try:
#         response = requests.Session().send(req) # 요청 보내기
#         print(f"[INFO] API 응답 상태 코드: {response.status_code}")
#         data = response.json() # JSON 응답
#         print(f"[DEBUG] API 응답 데이터 예시: {str(data)[:300]}")  # 응답 데이터 앞 300자만 출력
#     except Exception as e:
#         print(f"[ERROR] API 요청 실패: {e}")
#         print("[INFO] juso.go.kr API 실패로 카카오 API fallback 시도")
#         return get_sigungudong_from_kakao(address)

#     # API 에러 체크
#     common = (data or {}).get('results', {}).get('common', {})
#     if common.get('errorCode') != '0':
#         print("[ERROR] API 오류:", common.get('errorMessage'))
#         print("[INFO] juso.go.kr API 실패로 카카오 API fallback 시도")
#         return get_sigungudong_from_kakao(address)

#     juso_list = data.get('results', {}).get('juso', [])
#     if not juso_list:
#         print(f"[WARN] 주소 검색 결과 없음: {cleaned_address}")
#         print("[INFO] juso.go.kr 결과 없음으로 카카오 API fallback 시도")
#         return get_sigungudong_from_kakao(address)

#     juso = juso_list[0]
#     print(f"[INFO] 첫 번째 검색 결과: {juso}")

#     # 상세주소(번, 지) 추출
#     bun, ji = '', ''
#     match = re.search(r'(\d+)(?:-(\d+))?$', address.strip())
#     if match:
#         bun = match.group(1)
#         ji = match.group(2) or ''
#         print(f"[DEBUG] 상세주소 번지 추출: 번={bun}, 지={ji}")

#     result = {
#         '시도': juso.get('siNm', ''),
#         '시군구': juso.get('sggNm', ''),
#         '읍면동': juso.get('emdNm', ''),
#         '도로명주소': juso.get('roadAddr', ''),
#         '지번주소': juso.get('jibunAddr', ''),
#         '법정동코드': juso.get('admCd', '')
#     }
#     print(f"[INFO] 최종 추출 결과: {result}")

#     return result