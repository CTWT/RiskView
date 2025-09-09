from tkinter.constants import LAST
import requests
import os
import re
from dotenv import load_dotenv
import json
from typing import Optional, Dict, Any, List
from urllib import parse
from urllib.parse import urlencode
from xml_to_json import get_xml_api_and_convert_to_json
from pyproj import Transformer
from addr_to_coord import address_to_coord
import xmltodict
import xml.etree.ElementTree as ET
from io import BytesIO
from remove_address_details import clean_address

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.08
#  수정일 : 25.09.09
#  파일명 : local_infra.py
#  설명  : 주변시설의 위도/경도를 반환
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
data_seoul_api_base_url = os.getenv('DATA_SEOUL_API_BASE_URL')  # 서울열린데이터 공공 API의 기본 URL(API키 포함)
odp_park_api_base_url=os.getenv('ODP_PARK_API_BASE_URL') # 공공데이터포탈 전국도시공원정보표준데이터 API의 기본 URL(API키 포함)
school_api_base_url = os.getenv('SCHOOL_API_BASE_URL') # 생활안전정보 공공 API의 초중고 관련 정보 기본 URL(API키 포함)
odp_school_api_base_url = os.getenv('ODP_SCHOOL_API_BASE_URL') # 공공데이터포탈 전국초중등학교위치표준데이터 API의 기본 URL(API키 포함)
cvs_api_base_url = os.getenv('CVS_API_BASE_URL') # 생활안전정보 공공 API의 편의점 관련 정보 기본 URL(API키 포함)
hospital_api_base_url = os.getenv('HOSPITAL_API_BASE_URL') # 공공데이터포탈 국립중앙의료원_전국 병·의원 찾기 서비스 API의 기본 URL(API키 포함)

# ============================================
# 변환 메서드
# ============================================

# EPSG:5174 → EPSG:4326 변환 메서드
def convert_epsg5174_to_wgs84(x: float, y: float) -> tuple:
    transformer = Transformer.from_crs("EPSG:5174", "EPSG:4326", always_xy=True)
    lon, lat = transformer.transform(x, y)
    return lat, lon

# EPSG:3857 → EPSG:4326 변환 메서드
def convert_epsg3857_to_wgs84(x: float, y: float) -> tuple:
    transformer = Transformer.from_crs("EPSG:3857", "EPSG:4326", always_xy=True)
    lon, lat = transformer.transform(x, y)
    return lat, lon

# XML → JSON 변환 메서드
def get_xml_api_and_convert_to_json(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return xmltodict.parse(response.text)
    except Exception as e:
        print(f"[ERROR] XML API 파싱 실패: {e}")
        return None

# ============================================
# API 호출 메서드
# ============================================

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
        response = requests.get(url, timeout=None) # 타임아웃 제거
        response.raise_for_status()
        
        if response_type == "json":
            return response.json()
        elif response_type == "xml":
            data = get_xml_api_and_convert_to_json(url)
            if not isinstance(data, dict):
                print(f"[ERROR] XML 파싱 결과가 dict 아님 → type: {type(data)}")
                return None
            return data
        else:
            raise ValueError(f"지원하지 않는 응답 타입: {response_type}")

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] API 요청 실패: {url}")
        print(f"→ {e}")
    except Exception as e:
        print(f"[ERROR] API 응답 처리 실패: {e}")

# ============================================
# 역세권 API
# ============================================

# 역세권 관련 정보 API 호출 메서드
# 서울열린데이터 공공 API : 서울시 역사 마스터 정보
# 주요 반환 컬럼 : BLDN_NM(역사명), ROUTE(호선), LAT(위도), LOT(경도)
# https://data.seoul.go.kr/dataList/OA-21232/S/1/datasetView.do
def get_subway_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/subwayStationMaster/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    data = fetch_api_data(url, response_type="json")
    stations = data.get("subwayStationMaster", {}).get("row", [])
    station_list = []
    for station in stations:
        name = station.get('BLDN_NM')
        lat = station.get('LAT')
        lon = station.get('LOT')
        
        # 위도, 경도 숫자 변환
        try:
            lat = float(lat)
            lon = float(lon)
        except (TypeError, ValueError):
            lat, lon = None, None
        
        station_list.append({
            'name': name,
            'lat': lat,
            'lon': lon
        })
    
    return station_list

# ============================================
# 공원/녹지 API
# ============================================

# 공원/녹지 관련 정보 API 호출 메서드
# 서울열린데이터 공공 API : 서울시 주요 공원현황
# 주요 반환 컬럼 : P_PARK(공원명), LONGITUDE(위도), LATITUDE(경도), 기타
# https://data.seoul.go.kr/dataList/OA-394/S/1/datasetView.do
def get_park_data(**kwargs) -> dict:
    url = f"{data_seoul_api_base_url}/json/SearchParkInfoService/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    data = fetch_api_data(url, response_type="json")
    parks = data.get("SearchParkInfoService", {}).get("row", [])
    park_list = []
    for park in parks:
        name = park.get('P_PARK')
        lat = park.get('LATITUDE')
        lon = park.get('LONGITUDE')

        # 위도, 경도 숫자 변환
        try:
            lat = float(lat)
            lon = float(lon)
        except (TypeError, ValueError):
            lat, lon = None, None

        park_list.append({
            'name': name,
            'lat': lat,
            'lon': lon
        })    
    return park_list

# # 공원/녹지 관련 정보 API 호출 메서드
# # 공공데이터포탈 : 전국도시공원정보표준데이터
# # https://www.data.go.kr/data/15012890/standard.do
# def get_odp_park_data(**kwargs) -> dict:
#     url = f"{odp_park_api_base_url}&pageNo={kwargs.get('pageNo', '1')}&numOfRows={kwargs.get('numOfRows', '150000')}&type={kwargs.get('type', 'json')}"
#     print(url)
#     data = fetch_api_data(url, response_type="json")
#     parks = data.get("SearchParkInfoService", {}).get("row", [])
#     park_list = []
#     for park in parks:
#         name = park.get('PARK_NM')
#         lat = park.get('LATITUDE')
#         lon = park.get('LONGITUDE')

#         # 위도, 경도 숫자 변환
#         try:
#             lat = float(lat)
#             lon = float(lon)
#         except (TypeError, ValueError):
#             lat, lon = None, None

#         park_list.append({
#             'name': name,
#             'lat': lat,
#             'lon': lon
#         })    
#     return park_list

# ============================================
# 학교 API
# ============================================

# 초중고 관련 정보 API 호출 메서드
# 생활안전정보 공공 API
def get_school_data(**kwargs) -> dict:
    url = f"{school_api_base_url}&numOfRows={kwargs.get('numOfRows', '150000')}&pageNo={kwargs.get('pageNo', '1')}&dataType={kwargs.get('dataType', 'JSON')}"
    print(url)
    data = fetch_api_data(url, response_type="json")
    schools = data.get("body", {}).get("items", {}).get("item", [])
    school_list = []
    for school in schools:
        name = school.get('FCLTYNM')
        lat = school.get('LATITUDE')
        lon = school.get('LONGITUDE')

        # 위도, 경도 숫자 변환
        try:
            lat = float(lat)
            lon = float(lon)
        except (TypeError, ValueError):
            lat, lon = None, None

        school_list.append({
            'name': name,
            'lat': lat,
            'lon': lon
        })
    return school_list

# # 초중고 관련 정보 API 호출 메서드
# # 공공데이터포탈 : 전국초중등학교위치표준데이터
# # https://www.data.go.kr/data/15021148/standard.do
# def get_odp_school_data(**kwargs) -> dict:
#     url = f"{odp_school_api_base_url}&pageNo={kwargs.get('pageNo', '1')}&numOfRows={kwargs.get('numOfRows', '150000')}&type={kwargs.get('type', 'json')}"
#     print(url)
#     data = fetch_api_data(url, response_type="json")
#     schools = data.get("body", {}).get("items", {}).get("item", [])
#     school_list = []
#     for school in schools:
#         name = school.get('schoolNm')
#         lat = school.get('latitude')
#         lon = school.get('longitude')

#         # 위도, 경도 숫자 변환
#         try:
#             lat = float(lat)
#             lon = float(lon)
#         except (TypeError, ValueError):
#             lat, lon = None, None

#         school_list.append({
#             'name': name,
#             'lat': lat,
#             'lon': lon
#         })
#     return school_list

# ============================================
# 병원 API
# ============================================

# 국립중앙의료원_전국 병·의원 찾기 서비스 API 호출 메서드
# 공공데이터포털 API
# https://www.data.go.kr/data/15000736/openapi.do#tab_layer_detail_function
def get_hospital_data(**kwargs) -> list:
    url = f"{hospital_api_base_url}&numOfRows={kwargs.get('numOfRows', '150000')}&pageNo={kwargs.get('pageNo', '1')}&Q0={kwargs.get('Q0', '')}&Q1={kwargs.get('Q1', '')}"
    print(f"Request URL: {url}")

    # API 호출 - 타임아웃 없이 스트리밍 모드로 데이터 받기
    response = requests.get(url, stream=True, timeout=None)
    response.encoding = 'utf-8'
    response.raise_for_status()

    result = []

    # 메모리 스트림으로 변환 (임시 파일 없이 처리)
    xml_stream = BytesIO(response.content)

    # 순차 파싱 시작: item 태그 단위로 처리
    context = ET.iterparse(xml_stream, events=("end",))
    for event, elem in context:
        if elem.tag == "item":
            dutyDivNam = elem.findtext("dutyDivNam")
            dutyEmclsName = elem.findtext("dutyEmclsName")
            if dutyDivNam == "기타(구급차)":
                elem.clear()
                continue

            name = elem.findtext("dutyName") or "[이름 없음]"
            lat_text = elem.findtext("wgs84Lat")
            lon_text = elem.findtext("wgs84Lon")

            try:
                lat = float(lat_text) if lat_text else None
                lon = float(lon_text) if lon_text else None
            except ValueError:
                lat, lon = None, None

            result.append({
                'name': name,
                'dutyDivNam': dutyDivNam or "[분류 없음]",
                'dutyEmclsName': dutyEmclsName or "[분류 없음]",
                'lat': lat,
                'lon': lon
            })

            # 메모리 비우기
            elem.clear()

    return result

# ============================================
# 대형 쇼핑시설 API
# ============================================

# 대형 쇼핑시설 정보 API 호출 메서드
# 서울열린데이터 서울시 대규모점포 인허가 정보
# ‼️ 1-1000, 1001-2000 이렇게 두 번에 걸쳐서 호출해야 함
# https://data.seoul.go.kr/dataList/OA-16096/S/1/datasetView.do
def get_large_shopping_data(**kwargs) -> list:
    url = f"{data_seoul_api_base_url}/json/LOCALDATA_082501/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    
    data = fetch_api_data(url, response_type="json")
    shops = data.get("LOCALDATA_082501", {}).get("row", [])
    
    shop_list = []
    for shop in shops:
        # 필터링: 영업중 상태만
        if shop.get("TRDSTATEGBN") != "01" and shop.get("DTLSTATEGBN") != "1":
            continue

        # 필터링: 시장 제외
        if shop.get("UPTAENM") == "시장":
            continue

        # '시장' 글자 포함 시 제외
        if "시장" in shop.get("BPLCNM", ""):
            continue

        lat, lon = None, None
        x_raw = shop.get('X')
        y_raw = shop.get('Y')
        
        try:
            if x_raw and y_raw:
                x = float(x_raw)
                y = float(y_raw)
                lat, lon = convert_epsg5174_to_wgs84(x, y)  # EPSG:5174 → EPSG:4326 변환
            else:
                raise ValueError("Missing X/Y")  # 강제로 address fallback 진입
        except (TypeError, ValueError):
            # X, Y 좌표가 없으면 주소 기반으로 좌표 변환 시도
            raw_address = shop.get("RDNWHLADDR") or shop.get("SITEWHLADDR")
            address = clean_address(raw_address)
            if address:
                try:
                    # address_to_coord가 튜플(lat, lon) 반환한다고 가정
                    lat, lon = address_to_coord(address)
                except Exception as e:
                    print(f"좌표 변환 실패: {address} ({e})")
                    lat, lon = None, None
        
        shop_list.append({
            'name': shop.get('BPLCNM'),
            'lat': lat,
            'lon': lon
        })
        
    return shop_list

# ============================================
# 문화시설 API
# ============================================

# 서울시 문화시설 정보 API 호출 메서드
# 서울열린데이터 서울시 문화시설 정보
# https://data.seoul.go.kr/dataList/OA-15487/S/1/datasetView.do
def get_cultural_space_data(target_gu_name: str, **kwargs) -> list:
    url = f"{data_seoul_api_base_url}/json/culturalSpaceInfo/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    data = fetch_api_data(url, response_type="json")
    spaces = data.get("culturalSpaceInfo", {}).get("row", [])

    space_list = []

    def clean_coord(coord):
        if coord is None:
            return None
        coord_str = str(coord)
        if '~' in coord_str:
            coord_str = coord_str.split('~')[0].strip()
        try:
            return float(coord_str)
        except ValueError:
            return None
    
    for space in spaces:
        name = space.get('FAC_NAME')
        lat = clean_coord(space.get('X_COORD'))
        lon = clean_coord(space.get('Y_COORD'))
        gu_name = space.get('GNGU') # 구 이름(예: '강남구')

        if name is None or lat is None or lon is None:
            print(f"[경고] 필수 정보 누락: name={name}, lat={lat}, lon={lon}")
            continue

        # 필터링: 해당 자치구인지 확인
        if target_gu_name not in gu_name:
            continue

        space_list.append({
            'name': name,
            'lat': lat,
            'lon': lon
        })

    return space_list

# ============================================
# 체육시설 API
# ============================================

# 서울시 공공 체육시설 정보 API 호출 메서드
# 서울열린데이터 서울시 공공 체육시설 정보
# https://data.seoul.go.kr/dataList/OA-21779/S/1/datasetView.do
def get_facilities_data(target_gu_name: str, **kwargs) -> list:
    url = f"{data_seoul_api_base_url}/json/facilities/{kwargs.get('start_index', '1')}/{kwargs.get('end_index', '1000')}"
    print(url)
    data = fetch_api_data(url, response_type="json")
    facilities = data.get("facilities", {}).get("row", [])

    facility_list = []
    for facility in facilities:
        title = facility.get('FT_TITLE', '[제목 없음]')
        address = f"{facility.get('FT_ADDR', '')} {facility.get('FT_ADDR_DETAIL', '')}".strip()
        gu_name = facility.get('AR_CD_NAME', '')

        if not title or not address:
            print(f"[경고] 필수 정보 누락: title={title}, address={address}")
            continue

        # 필터링: 해당 자치구인지 확인
        if target_gu_name not in gu_name:
            continue

        try:
            coords = address_to_coord(address)
            if coords is not None:
                lat, lon = coords
                print(f"{title} → 위도: {lat}, 경도: {lon}")
            else:
                print(f"[좌표 변환 실패] {title} (주소: {address})")
                lat, lon = None, None
        except Exception as e:
            print(f"[에러 발생] {title} (주소: {address}) → {e}")
            lat, lon = None, None

        facility_list.append({
            'title': title,
            'address': address,
            'lat': lat,
            'lon': lon
        })

    return facility_list

# ============================================
# 편의점 API
# ============================================

# # 편의점 관련 정보 API 호출 메서드
# # 생활안전정보 공공 API
# def get_cvs_data(**kwargs) -> list:
#     url = f"{cvs_api_base_url}&numOfRows={kwargs.get('numOfRows', '150000')}&pageNo={kwargs.get('pageNo', '1')}&dataType={kwargs.get('dataType', 'JSON')}"
#     print(url)

#     # 스트리밍으로 API 호출
#     response = requests.get(url, stream=True)
#     response.encoding = 'utf-8'
#     response.raise_for_status()

#     data = response.json()
#     items = data.get("body", {}).get("items", {}).get("item", [])

#     # item이 dict면 리스트로 변환
#     if isinstance(items, dict):
#         items = [items]

#     cvs_list = []
#     for cv_info in items:
#         name = cv_info.get('FCLTY_NM')
#         try:
#             x = float(cv_info.get('X'))
#             y = float(cv_info.get('Y'))
#             lat, lon = convert_epsg3857_to_wgs84(x, y)  # EPSG:3857 → EPSG:4326 변환
#         except (TypeError, ValueError, Exception) as e:
#             print(f"[좌표 변환 실패] {name} → {e}")
#             lat, lon = None, None

#         cvs_list.append({
#             'name': name,
#             'lat': lat,
#             'lon': lon
#         })

#     return cvs_list

