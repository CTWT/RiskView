import requests
import os
from dotenv import load_dotenv
import json
from typing import Optional, Dict, Any, List
from urllib import parse
from urllib.parse import urlencode
from xml_to_json import get_xml_api_and_convert_to_json
from pyproj import Transformer
from addr_to_coord import address_to_coord

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.08
#  수정일 : 
#  파일명 : local_infra.py
#  설명  : 주변시설 파악
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
data_seoul_api_base_url = os.getenv('DATA_SEOUL_API_BASE_URL')  # 서울열린데이터 공공 API의 기본 URL(API키 포함)
school_api_base_url = os.getenv('SCHOOL_API_BASE_URL') # 생활안전정보 공공 API의 초중고 관련 정보 기본 URL(API키 포함)
cvs_api_base_url = os.getenv('CVS_API_BASE_URL') # 생활안전정보 공공 API의 편의점 관련 정보 기본 URL(API키 포함)
hospital_api_base_url = os.getenv('HOSPITAL_API_BASE_URL') # 공공데이터포탈 국립중앙의료원_전국 병·의원 찾기 서비스 API의 기본 URL(API키 포함)

def fetch_api_data(url: str, response_type: str = "json") -> dict:
    """
    공통 API 호출 함수
    ======================================
    @param url: 호출할 API URL
    @param response_type: 'json' 또는 'xml'
    @return: 응답 데이터를 JSON(dict) 형태로 반환
    ======================================
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        if response_type == "json":
            return response.json()
        elif response_type == "xml":
            return get_xml_api_and_convert_to_json(url)
        else:
            raise ValueError(f"지원하지 않는 응답 타입: {response_type}")

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] API 요청 실패: {url}")
        print(f"→ {e}")
    except Exception as e:
        print(f"[ERROR] API 응답 처리 실패: {e}")

# 역세권 관련 정보 API 호출 메서드
# 서울열린데이터 공공 API : 서울시 역사 마스터 정보
# 주요 반환 컬럼 : BLDN_NM(역사명), ROUTE(호선), LAT(위도), LOT(경도)
# https://data.seoul.go.kr/dataList/OA-21232/S/1/datasetView.do
def get_subway_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/subwayStationMaster/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    return fetch_api_data(url, response_type="json")

# 공원/녹지 관련 정보 API 호출 메서드
# 서울열린데이터 공공 API : 서울시 주요 공원현황
# 주요 반환 컬럼 : P_PARK(공원명), LONGITUDE(위도), LATITUDE(경도), 기타
# https://data.seoul.go.kr/dataList/OA-394/S/1/datasetView.do
def get_park_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/SearchParkInfoService/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    return fetch_api_data(url, response_type="json")

# 초중고 관련 정보 API 호출 메서드
# 생활안전정보 공공 API
# JSON 미지원
def get_school_data(**kwargs) -> dict:
    url = f"{school_api_base_url}&{urlencode(kwargs)}"
    print(url)
    return fetch_api_data(url, response_type="xml")

# 국립중앙의료원_전국 병·의원 찾기 서비스 API 호출 메서드
# 공공데이터포털 API
# https://www.data.go.kr/data/15000736/openapi.do#tab_layer_detail_function
def get_hospital_data(**kwargs) -> dict:
    url = f"{hospital_api_base_url}&{urlencode(kwargs)}"
    print(url)
    return fetch_api_data(url, response_type="xml")

# 대형 쇼핑시설 정보 API 호출 메서드
# 서울열린데이터 서울시 대규모점포 인허가 정보
# ‼️ 1-1000, 1001-2000 이렇게 두 번에 걸쳐서 호출해야 함
# https://data.seoul.go.kr/dataList/OA-16096/S/1/datasetView.do
def get_large_shopping_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/LOCALDATA_082501/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    return fetch_api_data(url, response_type="json")

# 서울시 공공 체육시설 정보 API 호출 메서드
# 서울열린데이터 서울시 공공 체육시설 정보
# https://data.seoul.go.kr/dataList/OA-15487/S/1/datasetView.do
def get_facilities_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/facilities/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    return fetch_api_data(url, response_type="json")

# 편의점 관련 정보 API 호출 메서드
# 생활안전정보 공공 API
# JSON 미지원
def get_cvs_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/cvs/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    return fetch_api_data(url, response_type="json")

# EPSG:5174 → EPSG:4326 변환 메서드
def convert_epsg5174_to_wgs84(x: float, y: float) -> tuple:
    transformer = Transformer.from_crs("EPSG:5174", "EPSG:4326", always_xy=True)
    lon, lat = transformer.transform(x, y)
    return lat, lon

def print_location_info():
    # 역세권
    print("\n📍 [역세권]")
    subway = get_subway_data(end_index="1000")
    station = subway.get("subwayStationMaster", {}).get("row", [])[0]
    print(f"{station.get('BLDN_NM')} → 위도: {station.get('LAT')}, 경도: {station.get('LOT')}")

    # 공원
    print("\n🌳 [공원]")
    park = get_park_data(end_index="1000")
    park_info = park.get("SearchParkInfoService", {}).get("row", [])[0]
    print(f"{park_info.get('P_PARK')} → 위도: {park_info.get('LATITUDE')}, 경도: {park_info.get('LONGITUDE')}")

    # 초중고
    print("\n🏫 [초중고]")
    school = get_school_data(numOfRows="1")
    item = school.get("body", {}).get("items", {}).get("item", {})
    # item이 list인 경우 첫 번째만 가져오고, dict면 그대로 사용
    school_info = item[0] if isinstance(item, list) else item
    print(f"{school_info.get('FCLTYNM')} → 위도: {school_info.get('LATITUDE')}, 경도: {school_info.get('LONGITUDE')}")

    # 🏥 병원 정보
    print("\n🏥 [병원]")
    hospital = get_hospital_data(Q1="종로구", numOfRows="10")
    items = hospital.get("body", {}).get("items", {}).get("item", [])
    # 리스트가 아닌 경우 리스트로 변환
    if not isinstance(items, list):
        items = [items]
    # "기타(구급차)" 제외
    filtered_items = [item for item in items if item.get("dutyDivNam") != "기타(구급차)"]
    # 첫 번째 남은 병원 출력
    if filtered_items:
        hospital_info = filtered_items[0]
        print(f"{hospital_info.get('dutyName')}, {hospital_info.get('dutyDivNam')} → 위도: {hospital_info.get('wgs84Lat')}, 경도: {hospital_info.get('wgs84Lon')}")
    else:
        print("적절한 병원 정보가 없습니다.")

    # 쇼핑시설
    print("\n🛍️ [대형 쇼핑시설]")
    shopping = get_large_shopping_data(start_index="1", end_index="1000")
    shop = shopping.get("LOCALDATA_082501", {}).get("row", [])[0]
    # 좌표 변환
    x = float(shop.get('X'))
    y = float(shop.get('Y'))
    lat, lon = convert_epsg5174_to_wgs84(x, y) # EPSG:5174 → EPSG:4326(위경도) 변환
    print(f"{shop.get('BPLCNM')} → 위도: {lat}, 경도: {lon}")

    # 공공체육시설
    print("\n🏊 [공공체육시설]")
    facility = get_facilities_data(start_index="1", end_index="1000")
    fac = facility.get("facilities", {}).get("row", [])[0]
    address = f"{fac.get('FT_ADDR', '')} {fac.get('FT_ADDR_DETAIL', '')}".strip()
    x, y = address_to_coord(address) # 주소->좌표 변환
    print(f"{fac.get('FT_TITLE')} → 위도: {x}, 경도: {y}")

    # 편의점
    print("\n🏪 [편의점]")
    cv = get_cvs_data(start_index="1", end_index="1000")
    item = cv.get("body", {}).get("items", {}).get("item", {})
    cv_info = item[0] if isinstance(item, list) else item
    print(f"{cv_info.get('FCLTYNM')} → 위도: {cv_info.get('LATITUDE')}, 경도: {cv_info.get('LONGITUDE')}")


print_location_info()

"""
# 예시: 각 API 호출 후 결과 출력 (1개씩만)
print("===== 역세권 정보 =====")
print(json.dumps(get_subway_data(end_index="1"), indent=4, ensure_ascii=False))

print("===== 공원 정보 =====")
print(json.dumps(get_park_data(end_index="1"), indent=4, ensure_ascii=False))

print("===== 초중고 정보 =====")
print(json.dumps(get_school_data(numOfRows="1"), indent=4, ensure_ascii=False))

print("===== 병원 정보 =====")
print(json.dumps(get_hospital_data(Q1="종로구", numOfRows="1"), indent=4, ensure_ascii=False))

print("===== 대형 쇼핑시설 정보 =====")
print(json.dumps(get_large_shopping_data(start_index="1", end_index="1"), indent=4, ensure_ascii=False))

print("===== 공공체육시설 정보 =====")
print(json.dumps(get_facilities_data(start_index="1", end_index="1"), indent=4, ensure_ascii=False))
print(json.dumps(get_facilities_data(start_index="1001", end_index="1001"), indent=4, ensure_ascii=False))

print("===== 편의점 정보 =====")
print(json.dumps(get_cvs_data(start_index="1", end_index="1"), indent=4, ensure_ascii=False))
"""