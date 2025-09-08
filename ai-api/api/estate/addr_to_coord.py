import requests
import json
import os, sys
import pandas as pd
from dotenv import load_dotenv
from urllib.parse import quote, urlencode
from datetime import datetime

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 :
#  작성일 : 25.09.08
#  수정일 : 
#  파일명 : addr_to_coord.py
#  설명  : 
#  - 주소를 좌표로 변환하는 API 호출
#  - 주변시설들과의 거리 계산 시 사용
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
base_url = os.getenv('VWORLD_API_BASE_URL')  # VWorld 디지털트윈국토의 기본 URL
api_key = os.getenv('VWORLD_API_KEY') # VWorld 디지털트윈국토의 API 키

# ============================================
# 주소 → 좌표 변환 함수
# ============================================
def address_to_coord(address: str, **kwargs) -> tuple[float, float] | None:
    defaults = {
        "service": "address",
        "request": "getCoord",
        "version": "2.0",
        "crs": "EPSG:4326",
        "address": address,
        "refine": "true",
        "simple": "false",
        "format": "json",
        "type": "ROAD",
        "key": api_key
    }

    params = {**defaults, **kwargs}

    try:
        url = f"{base_url}?{urlencode(params)}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        point = data['response']['result']['point']
        return float(point['x']), float(point['y'])
    except Exception as e:
        print(f"[주소→좌표 변환 실패] {e}")
        return None

# ============================================
# 좌표 → 주소 변환 함수
# ============================================
def coord_to_address(x: float, y: float, **kwargs) -> dict | None:
    defaults = {
        "service": "address",
        "version": "2.0",
        "request": "getAddress",
        "format": "json",
        "point": f"{x},{y}",
        "crs": "EPSG:4326",
        "type": "BOTH",  # 요청은 BOTH으로 해도 응답에는 parcel, road만 포함됨
        "zipcode": "true",
        "simple": "false",
        "key": api_key
    }

    params = {**defaults, **kwargs}

    try:
        url = f"{base_url}?{urlencode(params)}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # 응답에서 주소 추출
        result_list = data.get('response', {}).get('result', [])

        road_address = next((item['text'] for item in result_list if item.get('type') == 'road'), None)
        parcel_address = next((item['text'] for item in result_list if item.get('type') == 'parcel'), None)

        return {
            "road_address": road_address,
            "parcel_address": parcel_address
        }
    except Exception as e:
        print(f"[좌표→주소 변환 실패] {e}")
        return None

# 테스트 호출
x, y = address_to_coord("세종특별자치시 다솜2로 94")
if x and y:
    print(f"X좌표: {x}, Y좌표: {y}")

    # 좌표 → 주소 변환
    addr = coord_to_address(x, y)
    if addr:
        print(f"도로명 주소: {addr['road_address']}")
        print(f"지번 주소: {addr['parcel_address']}")