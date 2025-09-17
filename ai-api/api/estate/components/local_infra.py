from tkinter.constants import LAST
import requests
import os
import time
import re
from dotenv import load_dotenv
import json
from typing import Optional, Dict, Any, List
from urllib import parse
from urllib.parse import urlencode
from pyproj import Transformer
from .addr_to_coord import address_to_coord
from api.dbConnector import get_db_connection
import xmltodict
import xml.etree.ElementTree as ET
from io import BytesIO
from .remove_address_details import clean_address

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.08
#  수정일 : 25.09.17
#  파일명 : local_infra.py
#  설명  : 주변시설의 위도/경도 반환
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
data_seoul_api_base_url = os.getenv('DATA_SEOUL_API_BASE_URL')  # 서울열린데이터 공공 API의 기본 URL(API키 포함)
odp_park_api_base_url=os.getenv('ODP_PARK_API_BASE_URL') # 공공데이터포탈 전국도시공원정보표준데이터 API의 기본 URL(API키 포함)
school_api_base_url = os.getenv('SCHOOL_API_BASE_URL') # 생활안전정보 공공 API의 초중고 관련 정보 기본 URL(API키 포함)
odp_school_api_base_url = os.getenv('ODP_SCHOOL_API_BASE_URL') # 공공데이터포탈 전국초중등학교위치표준데이터 API의 기본 URL(API키 포함)
cvs_api_base_url = os.getenv('CVS_API_BASE_URL') # 생활안전정보 공공 API의 편의점 관련 정보 기본 URL(API키 포함)
hospital_api_base_url = os.getenv('HOSPITAL_API_BASE_URL') # 공공데이터포탈 국립중앙의료원_전국 병·의원 찾기 서비스 API의 기본 URL(API키 포함)
KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY') # 카카오 REST API 키

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

def fetch_api_data(url: str, response_type: str = "json") -> Optional[Dict[str, Any]]:
    """
    공통 API 호출 함수
    ======================================
    @param url: 호출할 API URL
    @param response_type: 'json' 또는 'xml'
    @return: 응답 데이터를 JSON(dict) 형태로 반환
    ======================================
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        if response_type == "json":
            return response.json()
        elif response_type == "xml":
            return get_xml_api_and_convert_to_json(url)
        else:
            raise ValueError(f"지원하지 않는 응답 타입: {response_type}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] API 요청 실패: {url}\n→ {e}")
    except Exception as e:
        print(f"[ERROR] API 응답 처리 실패: {e}")
    return None

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
    if not data:
        return []
    parks = (data or {}).get("SearchParkInfoService", {}).get("row", []) # 안전한 get 호출
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

# ============================================
# 학교 API
# ============================================

def get_school_data(lon: float, lat: float, radius: int = 500) -> list:
    """
    카카오 API를 이용해 특정 좌표 주변의 학교 정보를 가져옵니다.
    @param lon: 중심점 경도
    @param lat: 중심점 위도
    @param radius: 검색 반경 (미터)
    @return: 학교 정보 리스트
    """
    return get_places_nearby(lon, lat, radius, categories=['school'])

# ============================================
# 지하철역 API
# ============================================

def get_subway_data(lon: float, lat: float, radius: int = 1200) -> list:
    """
    카카오 API를 이용해 특정 좌표 주변의 지하철역 정보를 가져옵니다.
    """
    return get_places_nearby(lon, lat, radius, categories=['subway'])

# ============================================
# 병원 API
# ============================================

# 병원 관련 정보 API 호출 메서드
# 서울열린데이터 공공 API : 서울시 병의원 위치 정보
# https://data.seoul.go.kr/dataList/OA-20337/A/1/datasetView.do
def get_hospital_data(boundary: Optional[tuple] = None) -> list:
    """
    병원 관련 정보 DB 조회 메서드
    """
    conn = get_db_connection()
    if not conn:
        print("❌ 데이터베이스 연결 실패")
        return []

    # 기본 쿼리
    sql = """
        SELECT dutyname, dutydivnam, dutyemclsname,
               ST_Y(location) AS lat, ST_X(location) AS lon
        FROM hospital_info
        WHERE dutydivnam != '기타(구급차)'
    """
    
    params = []
    if boundary:
        min_lon, max_lon, min_lat, max_lat = boundary # 최소 경도, 최대 경도, 최소 위도, 최대 위도
        # MBRContains 대신 범위 기반 필터링 사용
        sql += """ 
            AND ST_X(location) BETWEEN %s AND %s
            AND ST_Y(location) BETWEEN %s AND %s 
        """
        params.extend([min_lon, max_lon, min_lat, max_lat])

    hospital_list = []
    try:
        with conn.cursor() as cursor:
            print(f"실행할 SQL: {sql}")
            print(f"파라미터: {params}")
            
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)
                
            hospitals = cursor.fetchall()
            print(f"조회된 병원 수: {len(hospitals)}")

            for hospital in hospitals:
                hospital_data = {
                    'name': hospital.get('dutyname'),
                    'dutyDivNam': hospital.get('dutydivnam'),
                    'dutyEmclsName': hospital.get('dutyemclsname'),
                    'lat': hospital.get('lat'),
                    'lon': hospital.get('lon')
                }
                hospital_list.append(hospital_data)
                
    except Exception as e:
        print(f"병원 정보 조회 중 오류 발생: {e}")
        print(f"SQL: {sql}")
        print(f"Parameters: {params}")
    finally:
        conn.close()

    return hospital_list

# ============================================
# 체육시설 API
# ============================================

# 서울시 공공 체육시설 정보 API 호출 메서드
# 서울열린데이터 서울시 공공 체육시설 정보
# https://data.seoul.go.kr/dataList/OA-21779/S/1/datasetView.do
def get_facilities_data(boundary: Optional[tuple] = None) -> list:
    """
    DB의 sports_facility_info 테이블에서 체육시설 정보를 조회합니다.
    boundary 튜플 (min_lon, max_lon, min_lat, max_lat)이 주어지면 해당 범위 내 시설만 조회합니다.

    @param boundary: (min_lon, max_lon, min_lat, max_lat)
    @return: 체육시설 정보 리스트
    """
    conn = get_db_connection()
    if not conn:
        print("❌ 데이터베이스 연결 실패")
        return []

    sql = """
        SELECT ft_title AS name, ft_addr AS address,
               ST_Y(location) AS lat, ST_X(location) AS lon
        FROM sports_facility_info
    """
    params = []
    if boundary:
        min_lon, max_lon, min_lat, max_lat = boundary
        sql += """
            WHERE ST_X(location) BETWEEN %s AND %s
              AND ST_Y(location) BETWEEN %s AND %s
        """
        params.extend([min_lon, max_lon, min_lat, max_lat])

    facility_list = []
    try:
        with conn.cursor() as cursor:
            print(f"실행할 SQL: {sql}")
            print(f"파라미터: {params}")
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)
            facilities = cursor.fetchall()
            print(f"조회된 체육시설 수: {len(facilities)}")

            for facility in facilities:
                facility_list.append({
                    'name': facility.get('name'),
                    'address': facility.get('address'),
                    'lat': facility.get('lat'),
                    'lon': facility.get('lon')
                })
    except Exception as e:
        print(f"체육시설 정보 조회 중 오류 발생: {e}")
    finally:
        if conn:
            conn.close()

    return facility_list


# ============================================
# 카카오 API(지하철역, 학교, 대형마트, 문화시설, 카페, 편의점)
# ============================================

HEADERS = {
    "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
}

# 카테고리 코드 예시 (필요에 따라 카테고리 조정 가능)
CATEGORY_CODES = {
    'subway': ['SW8'],                 # SW8: 지하철역 (이전 subway_station -> subway)
    'school': ['SC4'],                 # SC4: 초등학교
    'large_shopping': ['MT1'],         # MT1: 대형마트
    'cultural_facility': ['CT1'],      # CT1: 문화시설
    'cafe': ['CE7'],                   # CE7: 카페
    'convenience_store': ['CS2']       # CS2: 편의점
}

def search_places_by_category(lon, lat, radius=1000, category_group_code=None, page=1, size=15):
    """
    Kakao 카테고리 검색 API 호출
    @param lon: 경도 (longitude)
    @param lat: 위도 (latitude)  
    """
    url = "https://dapi.kakao.com/v2/local/search/category.json"
    params = {
        "category_group_code": category_group_code,
        "x": lon,  # 카카오 API에서 x는 경도
        "y": lat,  # 카카오 API에서 y는 위도
        "radius": radius,
        "page": page,
        "size": size
    }
    
    # 디버깅을 위한 로그 추가
    print(f"카카오 API 호출: lon={lon}, lat={lat}, category={category_group_code}")
    
    response = requests.get(url, headers=HEADERS, params=params)
    
    # 오류 상세 정보 출력
    if response.status_code != 200:
        print(f"카카오 API 오류: {response.status_code}")
        print(f"응답 내용: {response.text}")
        
    response.raise_for_status()
    return response.json()

def get_places_nearby(lon: float, lat: float, radius: int = 1000, categories: Optional[List[str]] = None) -> list:
    """
    각 카테고리별로 장소를 조회하고 합침
    @param lon: 경도 (longitude)
    @param lat: 위도 (latitude)
    @param radius: 검색 반경 (미터)
    @param categories: 조회할 카테고리 이름 리스트. None이면 모든 카테고리 조회.
    """
    results = []
    
    target_categories = CATEGORY_CODES.items()
    if categories:
        target_categories = {cat: CATEGORY_CODES[cat] for cat in categories if cat in CATEGORY_CODES}.items()

    for category_name, codes in target_categories:
        for code in codes:
            page = 1
            while True:
                try:
                    # 올바른 순서로 좌표 전달: lon, lat
                    data = search_places_by_category(lon, lat, radius, category_group_code=code, page=page)
                    documents = (data or {}).get('documents', []) # 안전한 get 호출
                    
                    if not documents:
                        break
                    
                    for doc in documents:
                        results.append({
                            'category': category_name,
                            'name': doc.get('place_name'),
                            'address': doc.get('address_name'),
                            'lat': float(doc.get('y')),  # 카카오 API 응답에서 y는 위도
                            'lon': float(doc.get('x'))   # 카카오 API 응답에서 x는 경도
                        })

                    # 최대 45개씩 페이지로 제한 (Kakao API 제한)
                    if page >= (data or {}).get('meta', {}).get('pageable_count', 0) // 15 + 1:
                        break
                    page += 1
                    
                except requests.exceptions.HTTPError as e:
                    print(f"카테고리 {category_name}({code}) 조회 실패: {e}")
                    break
                except Exception as e:
                    print(f"카테고리 {category_name}({code}) 처리 중 오류: {e}")
                    break

    return results