import requests
import json
import re
from urllib import parse
from urllib.parse import urlencode
import os, sys
import math
from datetime import datetime, date

# --- 실행 환경에 따른 동적 임포트 처리 ---
# 스크립트가 패키지의 일부로 실행되지 않았을 경우 (즉, 단독 실행 시)
if __package__ is None or __package__ == '':
    # 프로젝트 루트 경로를 sys.path에 추가
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    # 절대 경로로 임포트
    from api.estate.components.addr_to_coord import address_to_coord
    from api.estate.components.extract_sigungudong import extract_sigungudong
    from api.estate.components.remove_address_details import clean_address
    from api.estate.components.building_ledger import get_building_info_from_ledger
    from api.estate.Estate import runEstate
    from api.estate.components.z_score import calculate_contract_price, compute_z_scores, classify_z_score, calculate_user_z_score, calculate_deviation_rate
    from api.estate.components.local_infra import get_park_data, get_hospital_data, get_places_nearby, get_facilities_data, get_subway_data, get_school_data
    from api.estate.components.calc_distance import haversine_distance
    from api.estate.components.calc_distance import get_boundary_coordinates
    from api.ocr.data.LeaseContract import LeaseContract
else:
    # Main.py 등 다른 모듈에서 임포트될 때 (상대 경로 임포트)
    from .components.addr_to_coord import address_to_coord
    from .components.extract_sigungudong import extract_sigungudong
    from .components.remove_address_details import clean_address
    from .components.building_ledger import get_building_info_from_ledger
    from .Estate import runEstate
    from .components.z_score import calculate_contract_price, compute_z_scores, classify_z_score, calculate_user_z_score, calculate_deviation_rate
    from .components.local_infra import get_park_data, get_hospital_data, get_places_nearby, get_facilities_data, get_subway_data, get_school_data
    from .components.calc_distance import haversine_distance
    from .components.calc_distance import get_boundary_coordinates
    from ..ocr.data.LeaseContract import LeaseContract

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.09
#  수정일 : 25.09.17
#  파일명 : estate_main.py
#  설명  : 이상치 분석 메인 파일
# ============================================

#건물용도 정규화
def normalize_building_usage(raw: str) -> str:
    usage = raw.split("/")[-1].strip()

    # 키워드 기반 매핑
    mapping = {
        # 주거용
        "아파트": "아파트",
        "주택": "단독다가구",
        "단독주택": "단독다가구",
        "다가구": "단독다가구",
        "연립": "연립다세대",
        "다세대": "연립다세대",
        "연립다세대": "연립다세대",
        "오피스텔": "오피스텔",
    }

    # 매핑 적용
    for key, value in mapping.items():
        if key in usage:
            return value

    # 매칭 실패 시 원본 반환 혹은 '기타'
    return "단독다가구"

def calculate_building_related_additional_points(building_info: dict) -> tuple[float, float]:
    """
    건물 특성 점수 계산 메서드
    - 건물 연식 점수(5년 이내: 2점, 5~15년: 1점, 15~30년: 0점, 30년 이상: -1점)
    - 층수 점수(10층 이상: 1점, 5~9층: 0.5점)
    - 주차장 점수: 실내/실외 점수: 실내가 있으면 +1, 실내 없고 실외만 있으면 +0.5
    - 주차장 점수: 자주식/기계식 점수: 자주식이 있으면 +1, 자주식 없고 기계식만 있으면 +0.5
    @return: (획득 점수, 최대 가능 점수) 튜플
    """
    points = 0.0
    max_points = 0.0

    # 1. 건물 연식 점수
    use_approval_date_str = building_info.get('use_approval_date') if building_info else None
    if use_approval_date_str and str(use_approval_date_str).strip():
        max_points += 2 # 연식 점수 최대 2점
        try:
            approval_date = datetime.strptime(str(use_approval_date_str), '%Y%m%d').date()
            age = (datetime.today().date() - approval_date).days // 365
            print("건물 연식: ", age, "년")
            if age <= 5:
                points += 2
            elif 5 < age <= 15:
                points += 1
            elif 15 < age <= 30:
                points += 0
            else:
                points -= 1
        except Exception as e:
            print(f"날짜 파싱 오류: '{use_approval_date_str}' - {e}")
    else:
        print("❌ 건물 사용승인일 정보가 없어 연식 점수를 계산할 수 없습니다.")

    # 2. 층수 점수 (지상층 기준)
    floors = building_info.get('ground_floors') if building_info else None
    if floors is not None and floors > 0:
        max_points += 1 # 층수 점수 최대 1점
        if floors >= 10:
            points += 1
        elif 5 <= floors <= 9:
            points += 0.5
        print("층수: ", floors, "층")
    else:
        print("❌ 건물 층수 정보가 없어 층수 점수를 계산할 수 없습니다.")

    # 3. 주차장 점수
    indoor_mech = building_info.get('indr_mech', 0) # 실내 기계식 주차장 수
    indoor_auto = building_info.get('indr_auto', 0) # 실내 자주식 주차장 수
    outdoor_mech = building_info.get('oudr_mech', 0) # 실외 기계식 주차장 수
    outdoor_auto = building_info.get('oudr_auto', 0) # 실외 자주식 주차장 수

    print("실내 기계식 주차장 수: ", indoor_mech)
    print("실내 자주식 주차장 수: ", indoor_auto)
    print("실외 기계식 주차장 수: ", outdoor_mech)
    print("실외 자주식 주차장 수: ", outdoor_auto)

    has_indoor_parking = indoor_mech > 0 or indoor_auto > 0 # 실내 주차장 유무
    has_outdoor_parking = outdoor_mech > 0 or outdoor_auto > 0 # 실외 주차장 유무
    has_self_parking = indoor_auto > 0 or outdoor_auto > 0 # 자주식 주차장 유무
    has_mechanical_parking = indoor_mech > 0 or outdoor_mech > 0 # 기계식 주차장 유무

    # 실내/실외 점수: 실내가 있으면 +1, 실내 없고 실외만 있으면 +0.5
    if has_indoor_parking:
        max_points += 1 # 실내/실외 주차 점수 최대 1점
        points += 1
    elif has_outdoor_parking:
        max_points += 1 # 실내/실외 주차 점수 최대 1점
        points += 0.5
    else:
        print("❌ 실내/실외 주차장 정보가 없어 관련 점수를 계산할 수 없습니다.")

    # 자주식/기계식 점수: 자주식이 있으면 +1, 자주식 없고 기계식만 있으면 +0.5
    if has_self_parking:
        max_points += 1 # 자주식/기계식 주차 점수 최대 1점
        points += 1
    elif has_mechanical_parking:
        max_points += 1 # 자주식/기계식 주차 점수 최대 1점
        points += 0.5
    else:
        print("❌ 자주식/기계식 주차장 정보가 없어 관련 점수를 계산할 수 없습니다.")

    return points, max_points

def calculate_average_price(rows):
    """
    주변 실거래가의 평균을 계산하는 함수
    """
    if not rows:
        return 0
    
    prices = [row['contract_price'] for row in rows if 'contract_price' in row and row['contract_price'] is not None]
    
    if not prices:
        return 0
        
    return sum(prices) / len(prices)

# ============================================
# **** 주변 실거래가 평균 계산(메인 함수) ****
# ============================================

def analyze_estate(contract_data: LeaseContract) -> dict:
    """
    부동산 계약 정보와 주변 환경을 종합적으로 분석하여 위험도를 평가하는 메인 함수.
    @param contract_data: OCR을 통해 추출된 LeaseContract 객체
    @return: 분석 결과를 담은 딕셔너리
    """

    additional_points=0 # 시세 검증 플러스 요인 점수
    max_additional_points = 0 # 최대 가능 점수

    # ============================================
    # OCR 결과(LeaseContract) 가져오기
    # ============================================
    # LeaseContract 객체에서 정보 추출
    address = contract_data.location
    userContractPrice = contract_data.deposit + (contract_data.rentAmount * 100) # 환산전세가 계산
    user_bldg_usg = normalize_building_usage(contract_data.buildingStructureUse)

    print("입력한 주소: ", address)
    print(f"입력한 계약 정보: 계약금액 {userContractPrice}, 건물용도: {user_bldg_usg}")

    result = extract_sigungudong(address) # 주소에서 시군구동을 추출
    if not result:
        return {"error": "주소 정보를 추출할 수 없습니다."}
    print("result: ", result)

    sido = result['시도']
    sigungu = result['시군구']
    eupmyeondong = result['읍면동']
    beopjeongdong_code = result['법정동코드']
    sigungu_code = beopjeongdong_code[:5]
    bjdong_code = beopjeongdong_code[5:]
    bun = result.get('mainBun', '') # extract_sigungudong 결과에 번/지 정보가 있다면 사용
    ji = result.get('subBun', '')

    # 확인용 출력
    print(f"시도: {sido}")                # 서울특별시
    print(f"시군구: {sigungu}")             # 동작구
    print(f"읍면동: {eupmyeondong}")        # 노량진동
    print(f"법정동코드: {beopjeongdong_code}")  # 1168010600

    # 주소를 좌표로 변환
    coords = address_to_coord(address)
    if not coords:
        return {"error": "주소를 좌표로 변환할 수 없습니다."}
    x, y = coords
    print(f"경도: {x}, 위도: {y}")

    # ============================================
    # 주변 시설 검색을 위한 경계 좌표 계산
    # ============================================
    boundary_400m = get_boundary_coordinates(x, y, 400) # lon, lat, distance_m
    boundary_500m = get_boundary_coordinates(x, y, 500) # lon, lat, distance_m
    boundary_800m = get_boundary_coordinates(x, y, 800) # lon, lat, distance_m
    boundary_1000m = get_boundary_coordinates(x, y, 1000) # lon, lat, distance_m
    boundary_1200m = get_boundary_coordinates(x, y, 1200) # lon, lat, distance_m

    # ============================================
    # 역세권 점수 계산 (카카오 API)
    # - 400m 이내: +3점
    # - 800m 이내: +2점
    # - 1200m 이내: +1점
    # ============================================
    min_dist_subway = float('inf')
    nearest_subway_name = ""
    subway_location_points = 0

    # 카카오 API로 1.2km 이내의 지하철역 모두 가져오기
    stations = get_subway_data(lon=x, lat=y, radius=1200) or []
    if stations:
        max_additional_points += 3  # 지하철역 점수 최대 3점
        print(f"☑️ 중간 최대 점수 (지하철역 추가): {max_additional_points}")
        
        for station in stations:
            dist = haversine_distance(x, y, station['lon'], station['lat'])
            print(f"{station.get('name')}까지 거리: {dist:.2f}m")
            if dist < min_dist_subway:
                min_dist_subway = dist
                nearest_subway_name = station.get('name')

        if nearest_subway_name:
            print(f"가장 가까운 지하철역 '{nearest_subway_name}'까지 거리: {min_dist_subway:.2f}m")

        if min_dist_subway <= 400:
            subway_location_points = 3
        elif min_dist_subway <= 800:
            subway_location_points = 2
        elif min_dist_subway <= 1200:
            subway_location_points = 1

        print(f"✅ 역세권 점수: {subway_location_points}\n")
        additional_points += subway_location_points
    else:
        print("❌ 1.2km 이내에 지하철역 정보가 없어 역세권 점수를 계산할 수 없습니다.\n")

    # ============================================
    # 학군 점수 계산 (카카오 API)
    # - 500m 이내 학교가 1개라도 있으면: +2.5점
    # ============================================
    school_location_points = 0
    # 카카오 API로 500m 이내 학교 정보 조회
    schools = get_school_data(lon=x, lat=y, radius=500) or []

    if schools:
        max_additional_points += 2.5  # 학교 점수 최대 2.5점
        print(f"☑️ 중간 최대 점수 (학교 추가): {max_additional_points}")

        min_dist_school = float('inf')
        nearest_school_name = ""

        for school in schools:
            dist = haversine_distance(x, y, school['lon'], school['lat'])
            print(f"{school.get('name')}까지 거리: {dist:.2f}m")
            if dist < min_dist_school:
                min_dist_school = dist
                nearest_school_name = school.get('name')

        if min_dist_school <= 500:
            print(f"가장 가까운 학교 '{nearest_school_name}'까지 거리: {min_dist_school:.2f}m")
            school_location_points = 2.5

        print(f"✅ 학군 점수: {school_location_points}\n")
        additional_points += school_location_points
    else:
        print("❌ 500m 이내에 학교 정보가 없어 학군 점수를 계산할 수 없습니다.\n")

    # ============================================
    # 1km 이내 공원 목록 가져오기
    # - 가장 가까운 공원 기준으로 점수 계산
    # - 300m 이내: +1
    # - 1km 이내: +0.5
    # ============================================
    park_count = 0
    min_park_dist = float('inf')  # 가장 가까운 공원의 거리 저장
    park_location_points = 0.0    # 공원 위치로 부터 얻는 점수

    # boundary 활용 가능하면 거리 범위로 미리 필터링
    # 예: boundary = (y - delta_lon, y + delta_lon, x - delta_lat, x + delta_lat)
    # optional, 없으면 전체 공원 대상
    parks = get_park_data(boundary=None) or []

    if parks:
        max_additional_points += 1  # 공원 점수 최대 1점 부여
        print(f"☑️ 중간 최대 점수 (공원 추가): {max_additional_points}")
        for park in parks:
            lat = park['lat']
            lon = park['lon']
            name = park['name']

            # 유효성 체크
            if lat is None or lon is None:
                print(f"{name}의 좌표 정보가 없습니다.")
                continue

            # 거리 계산
            dist = haversine_distance(x, y, lon, lat)  # 주의: 함수 시그니처 확인

            if dist <= 1000:  # 1km 이내인 경우만 카운트
                print(f"{name}까지 거리: {dist:.2f}m")
                park_count += 1
                if dist < min_park_dist:
                    min_park_dist = dist

        print(f"1km 이내 공원 개수: {park_count}개")

        # 가장 가까운 공원의 거리에 따라 점수
        if min_park_dist <= 300:
            park_location_points += 1.0
        elif min_park_dist <= 1000:
            park_location_points += 0.5

        print("✅ 공원 위치 점수: ", park_location_points, "\n")
        additional_points += park_location_points
    else:
        print("❌ 공원 정보를 가져오지 못해 점수를 계산할 수 없습니다.")

    # ============================================
    # 1km 이내 병원 목록 가져오기
    # - 최대점: +2.5
    # - 종합병원이나 지역응급의료센터는 +1.5
    # - 일반 병원의 경우 10개당 +0.2점
    # ============================================
    hospital_count=0
    normal_hospital_count=0
    hospital_location_points = 0
    hospitals = get_hospital_data(boundary=boundary_1000m) or [] # DB에서 범위 내 병원 정보 조회
    if hospitals:
        max_additional_points += 2.5 # 병원 점수 최대 2.5점
        print(f"☑️ 중간 최대 점수 (병원 추가): {max_additional_points}")
        has_general_hospital = False # 1.5점은 한 번만 추가되도록 플래그 설정
        for hospital in hospitals:
            lat = hospital['lat']
            lon = hospital['lon']
            name = hospital['name']

            # 위도, 경도 유효성 체크
            if lat is None or lon is None:
                # print(f"{name}의 좌표 정보가 없습니다.") # 로그가 너무 많아 주석 처리
                continue

            dist = haversine_distance(x, y, lon, lat) # (수정) haversine_distance(lat1, lon1, lat2, lon2) 순서에 맞게 인자 전달

            if dist <= 1000:  # 1km 이내
                # 종합병원이나 지역응급의료센터는 1.5점 (최초 1회만)
                if not has_general_hospital and (hospital['dutyDivNam'] == "종합병원" or hospital['dutyEmclsName'] == "지역응급의료센터"):
                    print(f"종합병원/지역응급의료센터 {name}까지 거리: {dist:.2f}m")
                    hospital_location_points += 1.5
                    has_general_hospital = True
                else: # 일반 병원
                    # print(f"일반 병원 {name}까지 거리: {dist:.2f}m") # 로그가 너무 많아 주석 처리
                    normal_hospital_count += 1
                hospital_count += 1

        # 일반 병원 점수 계산(10개당 0.2점)
        normal_hospital_points = min(normal_hospital_count / 10 * 0.2, 1) # 최대 1점
        hospital_location_points += normal_hospital_points
        
        print(f"1km 이내 병원 개수: {hospital_count}개 (종합병원급 포함)")
        print(f"✅ 병원 위치 점수: {hospital_location_points}\n")
        additional_points += hospital_location_points
    else:
        print("❌ 병원 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

    # ============================================
    # 1km 이내 공공체육시설 여부 확인
    # - 1km 이내 공공체육시설이 1개라도 있으면: +1점
    # ============================================
    facility_location_points = 0
    facilities = get_facilities_data(boundary=boundary_1000m) or []

    if facilities:
        max_additional_points += 1 # 공공체육시설 점수 최대 1점
        print(f"☑️ 중간 최대 점수 (공공체육시설 추가): {max_additional_points}")
        
        for facility in facilities:
            lat = facility['lat']
            lon = facility['lon']
            name = facility.get('name')

            # 위도, 경도 유효성 체크
            if lat is None or lon is None:
                print(f"{name}의 좌표 정보가 없습니다.")
                continue

            # 거리 계산 (lat1, lon1, lat2, lon2)
            dist = haversine_distance(y, x, lat, lon)

            if dist <= 1000:  # 1km 이내
                print(f"{name}까지 거리: {dist:.2f}m (1km 이내)")
                facility_location_points = 1
                break  # 하나라도 찾으면 점수 부여 후 종료

        if facility_location_points == 0:
            print("⚠️ 1km 이내 공공체육시설이 없습니다.")
        else:
            print(f"✅ 공공체육시설 위치 점수: {facility_location_points}\n")

        additional_points += facility_location_points
    else:
        print("❌ 공공체육시설 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")


    # ============================================
    # 카카오 API로 반경 1km 이내 장소 조회
    # - 대형마트: +2
    # - 문화시설: +1
    # - 카페/편의점: +1
    # ============================================
    def calculate_scores_by_category(center_lat, center_lon, current_max_points, sigungu=None):
        additional_points = 0
        max_additional_points = current_max_points

        # Kakao API로 반경 1km 이내 장소 조회
        try:
            places = get_places_nearby(center_lon, center_lat, radius=1000, categories=['large_shopping', 'cultural_facility', 'cafe', 'convenience_store'])
        except Exception as e:
            print(f"❌ 카카오 API 호출 중 오류 발생: {e}")
            places = []

        # 카테고리별 장소 필터링
        category_groups = {
            'subway': [],                 # SW8: 지하철역
            'school': [],                 # SC4: 학교
            'large_shopping': [],         # MT1: 대형마트
            'cultural_facility': [],      # CT1: 문화시설
            'cafe': [],                   # CE7: 카페
            'convenience_store': []       # CS2: 편의점
        }

        for place in places:
            cat = place['category']
            if cat in category_groups:
                category_groups[cat].append(place)

        # ===== 대형마트 =====
        shop_count = len(category_groups['large_shopping'])
        min_shop_dist = float('inf')
        shopping_location_points = 0

        if shop_count > 0:
            max_additional_points += 2
            print(f"☑️ 중간 최대 점수 (쇼핑시설 추가): {max_additional_points}")

            for shop in category_groups['large_shopping']:
                lat = shop['lat']
                lon = shop['lon']
                name = shop['name']

                dist = haversine_distance(center_lon, center_lat, lon, lat) # (lon1, lat1, lon2, lat2)
                if dist <= 1000:
                    print(f"{name}까지 거리: {dist:.2f}m")
                    if dist < min_shop_dist:
                        min_shop_dist = dist

            if min_shop_dist <= 1000:
                shopping_location_points = 2
            print(f"1km 이내 대형 쇼핑시설 개수: {shop_count}개")
            print(f"✅ 쇼핑시설 위치 점수: {shopping_location_points}\n")
            additional_points += shopping_location_points
        else:
            print("❌ 쇼핑시설 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

        # ===== 문화시설 =====
        cultural_count = len(category_groups['cultural_facility'])
        cultural_location_points = 0

        if cultural_count > 0:
            max_additional_points += 1
            print(f"☑️ 중간 최대 점수 (문화시설 추가): {max_additional_points}")

            # 10개당 0.2점, 최대 1점
            cultural_location_points = min((cultural_count // 10) * 0.2, 1)

            print(f"1km 이내 문화시설 개수: {cultural_count}개")
            print(f"✅ 문화시설 위치 점수: {cultural_location_points}\n")
            additional_points += cultural_location_points
        else:
            print("❌ 문화시설 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

        # ===== 카페/편의점 위치 점수 =====
        cafe_count = len(category_groups['cafe'])
        convenience_count = len(category_groups['convenience_store'])
        total_cafe_conv_count = cafe_count + convenience_count
        cafe_conv_location_points = 0

        if total_cafe_conv_count > 0:
            # 계산 점수: 10개당 0.1점
            calculated_points = (total_cafe_conv_count // 10) * 0.1
            # 최대 1점으로 제한
            cafe_conv_location_points = min(calculated_points, 1.0)

            # 최대 가능한 추가 점수 항목도 1점 고정
            max_additional_points += 1.0  
            print(f"☑️ 중간 최대 점수 (카페/편의점 추가): {max_additional_points}")

            print(f"1km 이내 카페 개수: {cafe_count}개")
            print(f"1km 이내 편의점 개수: {convenience_count}개")
            print(f"✅ 카페/편의점 위치 점수: {cafe_conv_location_points:.1f}\n")
            additional_points += cafe_conv_location_points
        else:
            print("❌ 카페/편의점 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

        print(f"최종 추가 점수: {additional_points} / 최대 점수: {max_additional_points}")
        return additional_points, max_additional_points

    # 카카오 API를 사용한 점수 계산
    kakao_points, new_max_points = calculate_scores_by_category(y, x, max_additional_points, sigungu=sigungu)
    additional_points += kakao_points
    max_additional_points = new_max_points

    # ============================================
    # 건물 특성 요소
    # - 최대 점수 : +4
    # - 건물 연식 점수(5년 이내: +2, 5~15년: +1, 15~30년: +0, 30년 이상: -1)
    # - 층수 점수(10층 이상: +1, 5~9층: +0.5)
    # - 주차장 점수(실내 주차: +1, 실외 주차: +0.5, 자주식: +1, 기계식: +0.5)
    # ============================================
    building_character_points = 0
    # 주소 정보를 사용하여 건물 특성 정보 가져오기
    building_ledger = get_building_info_from_ledger(
        sigunguCd=sigungu_code,
        bjdongCd=bjdong_code,
        bun=bun,
        ji=ji
    )
    if building_ledger:
        # 건물 특성 점수와 최대 가능 점수를 함께 받아옴
        building_points, max_building_points = calculate_building_related_additional_points(building_ledger)
        building_character_points = building_points
        max_additional_points += max_building_points # 동적으로 최대 점수 추가
        print(f"☑️ 중간 최대 점수 (건물 특성 추가): {max_additional_points}")
        print("✅ 건물 특성 점수: ", building_character_points, "\n")
    else:
        print("❌ 건축물대장 정보를 가져오지 못해 건물 특성 점수를 계산할 수 없습니다.\n")
    
    additional_points += building_character_points
    print(f"✅ 추가점수: {additional_points} / {max_additional_points}")

    # ============================================
    # 추가점수를 20점 만점으로 변환
    # ============================================
    scaled_points = 0
    if max_additional_points > 0:
        scaled_points = int((additional_points / max_additional_points) * 20)
    print(f"✅ 추가점수(20점 만점 기준): {scaled_points}\n")

    # 실거래가 API 호출
    """
    @params end_index(종료 인덱스): 1000
    @params rcpt_yr(접수 연도): 2025
    @params cgg_nm(자치구명): sigungu
    @params bldg_usg(건물용도): user_bldg_usg
    """
    # ============================================
    # 실거래가 이상치 탐지
    # ============================================
    data = runEstate("1000", "2025", sigungu, user_bldg_usg) # 실거래가 데이터 가져옴(동일 자치구, 동일 건물용도)
    if not data or not data.get("rows"):
        print("실거래가 데이터를 가져오지 못했습니다.")
        print(f"불러온 전체 실거래가 데이터: 0개")
        # exit() 대신 결과 반환
        return {"error": "실거래가 데이터를 가져오지 못했습니다."}
    rows = data["rows"]

    # 계약금액 계산
    for row in rows:
        row["contract_price"] = calculate_contract_price(row)

    # 유효한 계약금액만 필터링
    valid_rows = [r for r in rows if r["contract_price"] is not None]
    print(f"불러온 전체 실거래가 데이터: {len(valid_rows)}개")
    prices = [r["contract_price"] for r in valid_rows]

    # 주변 실거래가 데이터에 Z-score와 라벨 추가
    if prices:
        z_scores_list = compute_z_scores(prices)
        for i, row in enumerate(valid_rows):
            row["z_score"] = round(z_scores_list[i], 2)
            row["label"] = classify_z_score(z_scores_list[i])

    # 주변 실거래가 분석 결과 출력
    print(f"\n--- [{sigungu}] 실거래가 이상치 분석 결과 ---")
    # '이상치'인 거래만 필터링하여 출력
    risky_transactions = [row for row in valid_rows if row.get('label') in ['이상치']]
    for row in risky_transactions:
        print(f"🚨 {row['stdg_nm']} {row.get('bldg_nm', '')} ({row.get('bldg_usg', '')}) | 계약가: {row['contract_price']} | Z: {row['z_score']} | {row['label']}")

    # 사용자 입력 계약금액의 Z-score 계산 및 결과 출력
    print("\n--- 입력 주소 분석 결과 ---")

    #단위맞춤(만)
    userContractPrice /= 10000

    user_z_score = calculate_user_z_score(userContractPrice, prices)
    userLabel = "계산 불가"
    price_stability_score = 0 # 시세 안정성 점수 (80점 만점)

    if user_z_score is not None:
        userLabel = classify_z_score(user_z_score)
        print(f"입력하신 계약금액({userContractPrice})의 Z-score는 {user_z_score:.2f}이며, '{userLabel}' 수준입니다.")
        
        # Z-score를 80점 만점의 '시세 안정성 점수'로 변환 (비선형)
        # 0~0.5: 안전(70~80), 0.5~1.0: 양호(50~70), 1.0~1.5: 주의(30~50), 1.5~2.0: 경계(10~30), 2.0~: 위험(0~10)
        z = abs(user_z_score)
        if z < 0.5:
            # 0.5일 때 70점, 0일 때 80점
            price_stability_score = int(80 - 20 * z)
        elif z < 1.0:
            # 1.0일 때 50점, 0.5일 때 70점
            price_stability_score = int(70 - 40 * (z - 0.5))
        elif z < 1.5:
            # 1.5일 때 30점, 1.0일 때 50점
            price_stability_score = int(50 - 40 * (z - 1.0))
        elif z < 2.0:
            # 2.0일 때 10점, 1.5일 때 30점
            price_stability_score = int(30 - 40 * (z - 1.5))
        else: # 2.0 이상
            price_stability_score = 0
    else:
        print("❌ 주변 실거래가 데이터가 부족하여 Z-score를 계산할 수 없습니다.")

    # 평균 대비 편차율 계산
    deviationPercent = calculate_deviation_rate(userContractPrice, prices)
    if deviationPercent is not None:
        print(f"편차율: {deviationPercent:.2f}%")
    else:
        print("❌ 편차율을 계산할 수 없습니다.")

    # ============================================
    # 최종 위험도 점수 계산
    # ============================================
    # 1. 환경 및 건물 점수 (20점 만점)
    env_building_score = 0
    if max_additional_points > 0:
        env_building_score = int((additional_points / max_additional_points) * 20)

    # 2. 최종 위험도 점수 (100점 만점)
    totalRiskScore = env_building_score + price_stability_score

    print(f"\n--- 최종 위험도 점수 ---")
    print(f"✴️ 시세 안정성 점수: {price_stability_score}/80점")
    print(f"✴️ 환경 및 건물 점수: {env_building_score}/20점")
    print(f"✴️ 최종 위험도 점수: {totalRiskScore}/100점")

    # 최종 위험도 점수에 따른 등급 및 코멘트 생성
    risk_level = ""
    risk_comment = ""
    if totalRiskScore >= 80:
        risk_level = "정상"
        risk_comment = "분석 결과, 특별한 위험 신호가 발견되지 않았습니다. 계약을 안전하게 진행할 수 있습니다."
    elif totalRiskScore >= 70:
        risk_level = "주의"
        risk_comment = "한두 가지 경미한 위험 신호가 존재합니다. 계약서의 특약이나 등기부등본 등 관련 서류를 추가로 확인하는 것이 좋습니다."
    elif totalRiskScore >= 50:
        risk_level = "경고"
        risk_comment = "여러 항목에서 위험 신호가 동시에 발생했습니다. 현장을 직접 확인하거나 전문가의 상담을 받아보는 것을 권고합니다."
    elif totalRiskScore >= 25:
        risk_level = "고위험"
        risk_comment = "시세 대비 가격 편차가 크거나, 문서 또는 자산에 리스크가 존재합니다. 계약을 재검토할 필요가 있습니다."
    else: # 0~24
        risk_level = "치명"
        risk_comment = "계약에 치명적인 위험 요소가 발견되었습니다. 계약을 중단하고 전문가의 자문을 받는 것을 강력히 권장합니다."

    print(f"✴️ 위험 등급: {risk_level}")
    print(f"✴️ 분석 코멘트: {risk_comment}")

    # 평균 대비 편차율 계산
    deviationPercent = calculate_deviation_rate(userContractPrice, prices)
    if deviationPercent is not None:
        print(f"편차율: {deviationPercent:.2f}%")
    else:
        print("❌ 편차율을 계산할 수 없습니다.")

    isAnomaly = True
    if risk_level != "정상":
        isAnomaly = False

    print(f"z-score : {round(user_z_score, 2) if user_z_score is not None else None}")

    # --- 최종 결과 반환 ---
    analysis_result = {
        "address": address,
        "userContractPrice": userContractPrice,
        "totalRiskScore": totalRiskScore, # 최종 위험도 점수(100점 만점)
        "averagePrice": calculate_average_price(valid_rows), # 평균 시세(주변 실거래가 평균)
        "isAnomaly": isAnomaly, # 이상치 여부
        "deviationPercent" : deviationPercent,
        "riskAssessment": {
            "level": risk_level,
            "comment": risk_comment
        },
        "surroundingTransactions": valid_rows,
        "userZScoreAnalysis": {
            "zScore": round(user_z_score, 2) if user_z_score is not None else None,
            "label": userLabel
        }
    }

    return analysis_result

# ============================================
# 사용자 입력값에 대한 편차율 계산 함수
# ============================================
def calculate_deviation_rate(user_value, values):
    """
    평균 대비 편차율을 계산합니다.
    
    @param user_value: 사용자 입력 값
    @param values: 비교 대상 값 리스트
    @return: 편차율 (float, %) 또는 None
    """
    n = len(values)
    if n == 0:
        return None

    mean = sum(values) / n
    if mean == 0:
        return None

    deviationPercent = abs(user_value - mean) / mean * 100
    return deviationPercent

# 파일 단독 실행 시 테스트용 임시 계약 데이터로 분석 실행
if __name__ == '__main__':
    test_contract = LeaseContract(
        location="서울 서대문구 창천동 창천동 33-12",
        deposit=500000000, # 보증금(예시: 5억)
        rentAmount=0, # 월세
        leasePeriodStart=date(2025, 8, 1), # 임대 시작일
        buildingStructureUse="아파트" # 건물 용도
    )
    result = analyze_estate(test_contract)