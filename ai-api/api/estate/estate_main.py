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
    from api.estate.components.z_score import calculate_contract_price, compute_z_scores, classify_z_score, calculate_user_z_score
    from api.estate.components.local_infra import get_subway_data, get_park_data, get_school_data, get_hospital_data, get_large_shopping_data, get_facilities_data, get_cultural_space_data
    from api.estate.components.calc_distance import haversine_distance
    from api.ocr.data.LeaseContract import LeaseContract
else:
    # Main.py 등 다른 모듈에서 임포트될 때 (상대 경로 임포트)
    from .components.addr_to_coord import address_to_coord
    from .components.extract_sigungudong import extract_sigungudong
    from .components.remove_address_details import clean_address
    from .components.building_ledger import get_building_info_from_ledger
    from .Estate import runEstate
    from .components.z_score import calculate_contract_price, compute_z_scores, classify_z_score, calculate_user_z_score
    from .components.local_infra import get_subway_data, get_park_data, get_school_data, get_hospital_data, get_large_shopping_data, get_facilities_data, get_cultural_space_data
    from .components.calc_distance import haversine_distance
    from api.ocr.data.LeaseContract import LeaseContract

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.09
#  수정일 : 25.09.15
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
    has_indoor_parking = building_info.get('indr_mech', 0) > 0 or building_info.get('indr_auto', 0) > 0
    has_outdoor_parking = building_info.get('oudr_mech', 0) > 0 or building_info.get('oudr_auto', 0) > 0
    has_self_parking = building_info.get('indr_auto', 0) > 0 or building_info.get('oudr_auto', 0) > 0
    has_mechanical_parking = building_info.get('indr_mech', 0) > 0 or building_info.get('oudr_mech', 0) > 0

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


def analyze_estate(contract_data: LeaseContract) -> dict:
    """
    부동산 계약 정보와 주변 환경을 종합적으로 분석하여 위험도를 평가하는 메인 함수.
    @param contract_data: OCR을 통해 추출된 LeaseContract 객체
    @return: 분석 결과를 담은 딕셔너리
    """

    additional_points=0 # 시세 검증 플러스 요인 점수
    max_additional_points = 0 # 최대 가능 점수

    # ============================================
    # OCR 결과(LeaseContract) 가져오기(지금은 목업데이터로 처리)
    # ============================================
    # LeaseContract 객체에서 정보 추출
    address = contract_data.location
    userContractPrice = contract_data.deposit + (contract_data.rentAmount * 100) # 환산전세가 계산
    user_bldg_usg = normalize_building_usage(contract_data.buildingStructureUse)

    print("입력한 주소: ", address)
    print(f"입력한 계약 정보: 계약금액 {userContractPrice}, 건물용도 {user_bldg_usg}")

    address = clean_address(address) # 주소에서 지나친 상세 정보 제거
    print("clean_address: ", address)
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
    print(sido)                # 서울특별시
    print(sigungu)             # 동작구
    print(eupmyeondong)        # 노량진동
    print(beopjeongdong_code)  # 1168010600

    # 주소를 좌표로 변환
    coords = address_to_coord(address)
    if not coords:
        return {"error": "주소를 좌표로 변환할 수 없습니다."}
    y, x = coords
    print(f"X좌표: {x}, Y좌표: {y}")

    # ============================================
    # 지하철역 목록 가져오기
    # - 가장 가까운 역 기준으로 점수 계산
    # - 400m 이내: +3
    # - 800m 이내: +2
    # - 1200m 이내: +1
    # ============================================
    subway_station_count=0
    min_dist = float('inf') # 가장 가까운 역의 거리를 저장할 변수
    subway_location_points = 0 # 지하철역 위치 점수
    stations = get_subway_data(start_index="1", end_index="1000")
    if stations:
        max_additional_points += 3 # 지하철역 점수 최대 3점
        print(f"☑️ 중간 최대 점수 (지하철역 추가): {max_additional_points}")
        for station in stations:
            lat = station['lat']
            lon = station['lon']
            name = station['name']

            # 위도, 경도 유효성 체크
            if lat is None or lon is None:
                print(f"역 {name}의 좌표 정보가 없습니다.")
                continue

            # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
            dist = haversine_distance(x, y, lat, lon)

            # 1.2km 이내의 모든 역을 출력하고, 가장 가까운 거리를 찾음
            if dist <= 1200:
                print(f"{name}역까지 거리: {dist:.2f}m")
                subway_station_count += 1
                if dist < min_dist:
                    min_dist = dist

        print(f"1.2km 이내 역 개수: {subway_station_count}개")

        # 가장 가까운 역의 거리를 기준으로 점수 부여
        if min_dist <= 400:  # 400m 이내(5분 거리)
            subway_location_points += 3
        elif min_dist <= 800: # 800m 이내(10분 거리)
            subway_location_points += 2
        elif min_dist <= 1200: # 1200m 이내(15분 거리)
            subway_location_points += 1

        print("✅ 역세권 점수: ", subway_location_points, "\n")
        additional_points += subway_location_points
    else:
        print("❌ 지하철역 정보를 가져오지 못해 점수를 계산할 수 없습니다.")

    # ============================================
    # 1km 이내 공원 목록 가져오기
    # - 가장 가까운 공원 기준으로 점수 계산
    # - 300m 이내: +1
    # - 1km 이내: +0.5
    # ============================================
    park_count=0
    min_park_dist = float('inf') # 가장 가까운 공원의 거리를 저장할 변수
    park_location_points = 0 # 공원 위치 점수
    parks = get_park_data(start_index="1", end_index="1000")
    if parks:
        max_additional_points += 1 # 공원 점수 최대 1점
        print(f"☑️ 중간 최대 점수 (공원 추가): {max_additional_points}")
        for park in parks:
            lat = park['lat']
            lon = park['lon']
            name = park['name']

            # 위도, 경도 유효성 체크
            if lat is None or lon is None:
                print(f"{name}의 좌표 정보가 없습니다.")
                continue

            # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
            dist = haversine_distance(x, y, lat, lon)

            if dist <= 1000: # 1km 이내
                print(f"{name}까지 거리: {dist:.2f}m")
                park_count += 1
                if dist < min_park_dist:
                    min_park_dist = dist

        print(f"1km 이내 공원 개수: {park_count}개")

        # 가장 가까운 공원의 거리를 기준으로 점수 부여
        if min_park_dist <= 300: # 300m 이내
            park_location_points += 1
        elif min_park_dist <= 1000: # 1km 이내
            park_location_points += 0.5

        print("✅ 공원 위치 점수: ", park_location_points, "\n")
        additional_points += park_location_points
    else:
        print("❌ 공원 정보를 가져오지 못해 점수를 계산할 수 없습니다.")

    # ============================================
    # 500m 이내 초중고 학교 목록 가져오기
    # - 500m 이내 학교가 있으면: +2
    # ============================================
    # school_count=0
    # min_school_dist = float('inf') # 가장 가까운 학교의 거리를 저장할 변수
    # school_location_points = 0 # 학교 위치 점수
    # schools = get_school_data(pageNm=1, numOfRows=60000)
    # if schools:
    #     max_additional_points += 2 # 학교 점수 최대 2점
    #     print(f"☑️ 중간 최대 점수 (학교 추가): {max_additional_points}")
    #     for school in schools:
    #         lat = school['lat']
    #         lon = school['lon']
    #         name = school['name']

    #         # 위도, 경도 유효성 체크
    #         if lat is None or lon is None:
    #             print(f"{name}의 좌표 정보가 없습니다.")
    #             continue

    #         # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
    #         dist = haversine_distance(x, y, lat, lon)

    #         if dist <= 500:  # 500m 이내
    #             print(f"{name}까지 거리: {dist:.2f}m")
    #             school_count += 1
    #             if dist < min_school_dist:
    #                 min_school_dist = dist
    #     print(f"500m 이내 초중고 개수: {school_count}개")

    #     if min_school_dist <= 500:
    #         school_location_points += 2
    #     print(f"✅ 학교 위치 점수: {school_location_points}\n")
    #     additional_points += school_location_points
    # else:
    #     print("❌ 학교 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

    # # ============================================
    # # 1km 이내 병원 목록 가져오기
    # # - 최대점: +2.5
    # # - 종합병원이나 지역응급의료센터는 +1.5
    # # - 일반 병원의 경우 10개마다 +0.2씩 추가(소수점 둘째 자리 버림)
    # # - 일반 병원 개수로 얻을 수 있는 최대점은 +1(병원 50개까지만)
    # # ============================================
    # # 공백 기준으로 단어 분리
    # words = address.split()
    # # 첫 번째와 두 번째 단어를 변수에 저장
    # sido = words[0]
    # sigungu = words[1]
    # hospital_count=0
    # normal_hospital_count=0
    # hospitals = get_hospital_data(Q0=sido, Q1=sigungu, numOfRows=60000) # 시군구별 필터링하여 API 호출
    # if hospitals:
    #     max_additional_points += 2.5 # 병원 점수 최대 2.5점
    #     print(f"☑️ 중간 최대 점수 (병원 추가): {max_additional_points}")
    #     for hospital in hospitals:
    #         lat = hospital['lat']
    #         lon = hospital['lon']
    #         name = hospital['name']

    #         # 위도, 경도 유효성 체크
    #         if lat is None or lon is None:
    #             print(f"{name}의 좌표 정보가 없습니다.")
    #             continue

    #         # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
    #         dist = haversine_distance(x, y, lat, lon)

    #         if dist <= 1000:  # 1km 이내
    #             if hospital['dutyDivNam'] == "종합병원" or hospital['dutyEmclsName'] == "지역응급의료센터":
    #                 print(f"종합병원이나 지역응급의료센터 {name}까지 거리: {dist:.2f}m")
    #                 additional_points += 1.5 # 종합병원이나 지역응급의료센터는 1.5점
    #                 hospital_count += 1
    #             else:
    #                 print(f"일반 병원 {name}까지 거리: {dist:.2f}m")
    #                 normal_hospital_count += 1
    #                 hospital_count += 1

    #     hospital_location_points = math.floor(normal_hospital_count * 0.02 * 10) / 10 # 일반 병원의 경우 10개마다 0.2점씩 추가(소수점 둘째 자리 버림)
    #     print(f"1km 이내 병원 개수: {hospital_count}개")
    #     print(f"✅ 병원 위치 점수: {hospital_location_points}\n")
    #     additional_points += hospital_location_points
    # else:
    #     print("❌ 병원 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

    # ============================================
    # 1km 이내 대형 쇼핑시설 목록 가져오기 (2번에 나누어서)
    # - 1km 이내 대형 쇼핑시설이 있으면: +2
    # ============================================
    shop_count=0
    min_shop_dist = float('inf') # 가장 가까운 쇼핑시설의 거리를 저장할 변수
    shopping_location_points = 0 # 쇼핑시설 위치 점수
    shops = get_large_shopping_data(start_index=1, end_index=1000)
    shops2 = get_large_shopping_data(start_index=1001, end_index=1200)
    if shops or shops2:
        max_additional_points += 2 # 쇼핑시설 점수 최대 2점
        print(f"☑️ 중간 최대 점수 (쇼핑시설 추가): {max_additional_points}")
        if shops:
            for shop in shops:
                lat = shop['lat']
                lon = shop['lon']
                name = shop['name']

                # 위도, 경도 유효성 체크
                if lat is None or lon is None:
                    print(f"{name}의 좌표 정보가 없습니다.")
                    continue

                # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
                dist = haversine_distance(x, y, lat, lon)

                if dist <= 1000:  # 1km 이내
                    print(f"{name}까지 거리: {dist:.2f}m")
                    shop_count += 1
                    if dist < min_shop_dist:
                        min_shop_dist = dist
        if shops2:
            for shop in shops2:
                lat = shop['lat']
                lon = shop['lon']
                name = shop['name']

                # 위도, 경도 유효성 체크
                if lat is None or lon is None:
                    print(f"{name}의 좌표 정보가 없습니다.")
                    continue

                # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
                dist = haversine_distance(x, y, lat, lon)

                if dist <= 1000:  # 1km 이내
                    print(f"{name}까지 거리: {dist:.2f}m")
                    shop_count += 1
                    if dist < min_shop_dist:
                        min_shop_dist = dist
        print(f"1km 이내 대형 쇼핑시설 개수: {shop_count}개")
        if min_shop_dist <= 1000:
            shopping_location_points += 2
        print(f"✅ 쇼핑시설 위치 점수: {shopping_location_points}\n")
        additional_points += shopping_location_points
    else:
        print("❌ 쇼핑시설 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

    # ============================================
    # 1km 이내 문화시설 목록 가져오기
    # - 가장 가까운 문화시설 기준으로 점수 계산(0.5점)
    # ============================================
    cultural_space_count=0
    min_cultural_dist = float('inf')
    cultural_location_points = 0
    cultural_spaces = get_cultural_space_data(sigungu)
    if cultural_spaces:
        max_additional_points += 0.5 # 문화시설 점수 최대 0.5점
        print(f"☑️ 중간 최대 점수 (문화시설 추가): {max_additional_points}")
        for cultural_space in cultural_spaces:
            lat = cultural_space['lat']
            lon = cultural_space['lon']
            name = cultural_space['name']

            # 위도, 경도 유효성 체크
            if lat is None or lon is None:
                print(f"역 {name}의 좌표 정보가 없습니다.")
                continue

            # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
            dist = haversine_distance(x, y, lat, lon)

            if dist <= 1000:  # 1km 이내
                print(f"{name}까지 거리: {dist:.2f}m")
                cultural_space_count += 1
                if dist < min_cultural_dist:
                    min_cultural_dist = dist
        print(f"1km 이내 문화시설 개수: {cultural_space_count}개")
        if min_cultural_dist <= 1000:
            cultural_location_points += 0.5
        print(f"✅ 문화시설 위치 점수: {cultural_location_points}\n")
        additional_points += cultural_location_points
    else:
        print("❌ 문화시설 정보를 가져오지 못해 점수를 계산할 수 없습니다.")

    # ============================================
    # 1km 이내 공공체육시설 목록 가져오기
    # - 1km 이내 공공체육시설이 있으면: +0.5
    # ============================================
    facility_count=0
    min_facility_dist = float('inf')
    facility_location_points = 0
    facilities = get_facilities_data(sigungu)
    if facilities:
        max_additional_points += 0.5 # 공공체육시설 점수 최대 0.5점
        print(f"☑️ 중간 최대 점수 (공공체육시설 추가): {max_additional_points}")
        for facility in facilities:
            lat = facility['lat']
            lon = facility['lon']
            name = facility['name']

            # 위도, 경도 유효성 체크
            if lat is None or lon is None:
                print(f"{name}의 좌표 정보가 없습니다.")
                continue

            # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
            dist = haversine_distance(x, y, lat, lon)

            if dist <= 1000:  # 1km 이내
                print(f"{name}까지 거리: {dist:.2f}m")
                facility_count += 1
                if dist < min_facility_dist:
                    min_facility_dist = dist
        print(f"1km 이내 공공체육시설 개수: {facility_count}개")
        if min_facility_dist <= 1000:
            facility_location_points += 0.5
        print(f"✅ 공공체육시설 위치 점수: {facility_location_points}\n")
        additional_points += facility_location_points
    else:
        print("❌ 공공체육시설 정보를 가져오지 못해 점수를 계산할 수 없습니다.\n")

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
        # exit() 대신 결과 반환
        return {"error": "실거래가 데이터를 가져오지 못했습니다."}
    rows = data["rows"]

    # 계약금액 계산
    for row in rows:
        row["contract_price"] = calculate_contract_price(row)

    # 유효한 계약금액만 필터링
    valid_rows = [r for r in rows if r["contract_price"] is not None]
    prices = [r["contract_price"] for r in valid_rows]

    # Z-score 계산
    z_scores = compute_z_scores(prices)

    # 분류 라벨링
    for i, row in enumerate(valid_rows):
        row["z_score"] = round(z_scores[i], 2)
        row["label"] = classify_z_score(z_scores[i])

    # # 주변 실거래가 분석 결과 출력
    # print(f"\n--- [{sigungu}] 실거래가 이상치 분석 결과 ---")
    # for row in valid_rows:
    #     print(f"{row['stdg_nm']} | 계약가: {row['contract_price']} | Z: {row['z_score']} | {row['label']}")

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
        risk_comment = "시세, 건물 조건 등 여러 항목에서 위험 신호가 동시에 발생했습니다. 현장을 직접 확인하거나 전문가의 상담을 받아보는 것을 권고합니다."
    elif totalRiskScore >= 25:
        risk_level = "고위험"
        risk_comment = "시세 대비 가격 편차가 크거나, 문서 또는 자산에 리스크가 존재합니다. 계약을 재검토할 필요가 있습니다."
    else: # 0~24
        risk_level = "치명"
        risk_comment = "전입 불가, 과도한 근저당 등 계약에 치명적인 위험 요소가 발견되었습니다. 계약을 중단하고 전문가의 자문을 받는 것을 강력히 권장합니다."

    print(f"✴️ 위험 등급: {risk_level}")
    print(f"✴️ 분석 코멘트: {risk_comment}")

    # --- 최종 결과 반환 ---
    analysis_result = {
        "address": address,
        "userContractPrice": userContractPrice,
        "totalRiskScore": totalRiskScore, # 최종 위험도 점수(100점 만점)
        "averagePrice": calculate_average_price(valid_rows), # 평균 시세(주변 실거래가 평균)
        "isAnomaly": False, # 이상치 여부
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

# 파일 단독 실행 시 테스트용 임시 계약 데이터로 분석 실행
if __name__ == '__main__':
    test_contract = LeaseContract(
        location="서울 동작구 노량진로 233",
        deposit=50000, # 보증금
        rentAmount=0, # 월세
        leasePeriodStart=date(2025, 8, 1), # 임대 시작일
        buildingStructureUse="아파트" # 건물 용도
    )
    result = analyze_estate(test_contract)

# ============================================
# 임시 제외 API
# ============================================

# # 편의점 목록 가져오기 : 일단 코드에서 제외
# cvs_count=0
# cvses = get_cvs_data()
# for cvs in cvses:
#     lat = cvs['lat']
#     lon = cvs['lon']
#     name = cvs['name']

#     # 위도, 경도 유효성 체크
#     if lat is None or lon is None:
#         print(f"{name}의 좌표 정보가 없습니다.")
#         continue

#     # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
#     dist = haversine_distance(x, y, lat, lon)

#     if dist <= 1000:  # 1km 이내
#         print(f"{name}까지 거리: {dist:.2f}m")
#         cvs_count += 1
# print(f"1km 이내 편의점 개수: {cvs_count}개\n")

# ============================================
# 후보 API
# ============================================

# # 공원 목록 가져오기
# park_count=0
# parks = get_odp_park_data(start_index=1, end_index=150000)
# for park in parks:
#     lat = park['lat']
#     lon = park['lon']
#     name = park['name']

#     # 위도, 경도 유효성 체크
#     if lat is None or lon is None:
#         print(f"{name}의 좌표 정보가 없습니다.")
#         continue

#     # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
#     dist = haversine_distance(x, y, lat, lon)

#     if dist <= 1000:  # 1km 이내
#         print(f"{name}까지 거리: {dist:.2f}m")
#         park_count += 1
# print(f"1km 이내 공원 개수: {park_count}개\n")