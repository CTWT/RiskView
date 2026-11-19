import requests
import re
import json
import os, sys
import pandas as pd
from dotenv import load_dotenv
from urllib.parse import quote, urlencode
from datetime import datetime

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.08
#  수정일 : 25.09.26
#  파일명 : addr_to_coord.py
#  설명  : 
#  - 주소를 좌표로 변환하는 API 호출
#  - 주변시설들과의 거리 계산 시 사용
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
base_url = os.getenv('VWORLD_API_BASE_URL')  # VWorld 디지털트윈국토의 기본 URL
api_key = os.getenv('VWORLD_API_KEY') # VWorld 디지털트윈국토의 API 키
KAKAO_REST_API_KEY=os.getenv('KAKAO_REST_API_KEY') # 카카오 REST API 키

# ============================================
# 카카오 API를 이용한 주소 → 좌표 변환 함수
# ============================================

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")  # .env에 카카오 REST API 키 저장

def address_to_coord(address: str) -> tuple[float, float] | None:
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {
        "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
    }
    params = {
        "query": address
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        result = response.json()
        documents = result.get("documents")
        if not documents:
            print(f"[주소→좌표 변환 실패] '{address}'에 대한 결과가 없습니다.")
            return None
        # 첫 번째 결과 사용
        x = float(documents[0]["x"])  # 경도
        y = float(documents[0]["y"])  # 위도
        return x, y
    except Exception as e:
        print(f"[주소→좌표 변환 실패] {e}")
        return None

# 사용 예시
address = "서울특별시 중구 세종대로 110"
coords = address_to_coord(address)
if not coords:
    print({"error": "주소를 좌표로 변환할 수 없습니다."})
else:
    x, y = coords
    print(f"경도: {x}, 위도: {y}")

# # ============================================
# # VWorld API를 이용한 주소 → 좌표 변환 함수
# # ============================================
# def address_to_coord(address: str, **kwargs) -> tuple[float, float] | None:
#     # 괄호 및 내용 제거 후 좌우 공백 제거
#     def clean_address(addr: str) -> str:
#         return re.sub(r'\([^)]*\)', '', addr).strip()

#     # 주소 -> 좌표 변환 함수
#     def request_coords(addr_type: str) -> dict | None:
#         clean_addr = clean_address(address)
#         params = {
#             "service": "address",
#             "request": "getCoord",
#             "version": "2.0",
#             "crs": "EPSG:4326",
#             "address": clean_addr,
#             "refine": "true",
#             "simple": "false",
#             "format": "json",
#             "type": addr_type,
#             "key": api_key,
#             **kwargs
#         }

#         try:
#             url = f"{base_url}?{urlencode(params)}" # URL 구성
#             response = requests.get(url) # API 호출
#             response.raise_for_status() # HTTP 에러 체크
#             data = response.json() # JSON 응답
#             point = data['response']['result'].get('point') # 좌표 추출
#             if point:
#                 return float(point['x']), float(point['y']) # 좌표 반환
#         except Exception as e:
#             print(f"[{addr_type} 주소 변환 실패] {e}")
#         return None

#     # 1. 도로명 주소를 좌표로 변환 시도
#     coords = request_coords("ROAD")
#     if coords:
#         return coords

#     # 2. 지번 주소를 좌표로 변환 재시도
#     coords = request_coords("PARCEL")
#     if coords:
#         return coords

#     # 3. 모두 실패
#     print(f"[주소→좌표 변환 실패] '{address}' 는 도로명/지번 주소 모두 변환 실패")
#     return None

# # ============================================
# # 좌표 → 주소 변환 함수
# # ============================================
# def coord_to_address(x: float, y: float, **kwargs) -> dict | None:
#     defaults = {
#         "service": "address",
#         "version": "2.0",
#         "request": "getAddress",
#         "format": "json",
#         "point": f"{x},{y}",
#         "crs": "EPSG:4326",
#         "type": "BOTH",  # 요청은 BOTH으로 해도 응답에는 parcel, road만 포함됨
#         "zipcode": "true",
#         "simple": "false",
#         "key": api_key
#     }

#     params = {**defaults, **kwargs}

#     try:
#         url = f"{base_url}?{urlencode(params)}" # URL 구성
#         response = requests.get(url) # API 호출
#         response.raise_for_status() # HTTP 에러 체크
#         data = response.json() # JSON 응답

#         # 응답에서 주소 추출
#         result_list = data.get('response', {}).get('result', [])

#         road_address = next((item['text'] for item in result_list if item.get('type') == 'road'), None) # 도로명 주소 추출
#         parcel_address = next((item['text'] for item in result_list if item.get('type') == 'parcel'), None) # 지번 주소 추출

#         return {
#             "road_address": road_address,
#             "parcel_address": parcel_address
#         }
#     except Exception as e:
#         print(f"[좌표→주소 변환 실패] {e}")
#         return None