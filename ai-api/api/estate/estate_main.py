import requests
import json
import re
from dotenv import load_dotenv
from urllib import parse
from urllib.parse import urlencode
import os, sys
from local_infra import get_subway_data, get_park_data, get_school_data, get_hospital_data, get_large_shopping_data, get_facilities_data, get_cultural_space_data
from calc_distance import haversine_distance
from addr_to_coord import address_to_coord
from extract_sigungudong import extract_sigungudong
from remove_address_details import clean_address
from building_ledger import get_building_info_from_ledger
import math
from datetime import datetime, date
from Estate import runEstate

# --- 상대 경로 임포트 오류 해결을 위한 경로 추가 ---
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
sys.path.append(project_root)

from api.ocr.data.LeaseContract import LeaseContract # LeaseContract 클래스 임포트
from z_score import calculate_contract_price, compute_z_scores, classify_z_score, calculate_user_z_score

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.09
#  수정일 : 25.09.12
#  파일명 : estate_main.py
#  설명  : 이상치 분석 메인 파일
# ============================================

def calculate_building_related_additional_points(building_info: dict) -> float:
    """
    건물 특성 점수 계산 메서드
    """
    points = 0.0

    # 1. 건물 연식 점수
    use_approval_date_str = building_info.get('use_approval_date')
    # use_approval_date_str가 비어있거나 공백인 경우를 확인
    if use_approval_date_str and use_approval_date_str.strip():
        try:
            approval_date = datetime.strptime(str(use_approval_date_str), '%Y%m%d').date()
            age = (datetime.today().date() - approval_date).days // 365
            print("건물 연식: ", age, "년")

            if age <= 5:
                points += 3
            elif 5 < age <= 15:
                points += 2
            elif 15 < age <= 30:
                points += 1
            else:  # age > 30
                points -= 2
        except Exception as e:
            print(f"날짜 파싱 오류: '{use_approval_date_str}' - {e}")
    else:
        print("건물 사용승인일 정보가 없어 연식 점수를 계산할 수 없습니다.")

    # 2. 층수 점수 (지상층 기준)
    floors = building_info.get('ground_floors', 0)
    if floors >= 10:
        points += 2
    elif 5 <= floors <= 9:
        points += 1
    # 1~4층은 점수 없음
    print("층수: ", floors, "층")

    # 3. 주차장 점수
    # 실내 주차 여부
    if building_info.get('indr_mech', 0) > 0 or building_info.get('indr_auto', 0) > 0:
        points += 1

    # 실외 주차 여부
    if building_info.get('oudr_mech', 0) > 0 or building_info.get('oudr_auto', 0) > 0:
        points += 0.5

    # 자주식 여부
    if building_info.get('indr_auto', 0) > 0 or building_info.get('oudr_auto', 0) > 0:
        points += 1

    # 기계식 여부
    if building_info.get('indr_mech', 0) > 0 or building_info.get('oudr_mech', 0) > 0:
        points += 0.5

    return points

def analyzeRisks(contract_data: LeaseContract) -> dict:
    """
    부동산 계약 정보와 주변 환경을 종합적으로 분석하여 위험도를 평가하는 메인 함수.
    @param contract_data: OCR을 통해 추출된 LeaseContract 객체
    @return: 분석 결과를 담은 딕셔너리
    """

    additional_points=0 # 시세 검증 플러스 요인 점수

    # ============================================
    # OCR 결과(LeaseContract) 가져오기(지금은 목업데이터로 처리)
    # ============================================
    temp_contract = LeaseContract(
        location="서울 동작구 노량진로 233",
        deposit=90000, # 보증금
        rentAmount=0, # 월세
        leasePeriodStart=date(2025, 8, 1), # 임대 시작일
        buildingStructureUse="아파트" # 건물 용도
    )
    contract_data = temp_contract # 함수 파라미터로 대체될 부분
    # LeaseContract 객체에서 정보 추출
    address = temp_contract.location
    user_contract_price = temp_contract.deposit + (temp_contract.rentAmount * 100) # 환산전세가 계산
    user_bldg_usg = temp_contract.buildingStructureUse

    print("입력한 주소: ", address)
    print(f"입력한 계약 정보: 계약금액 {user_contract_price}, 건물용도 {user_bldg_usg}")

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
    # 역 목록 가져오기
    # ============================================
    subway_station_count=0
    stations = get_subway_data(start_index="1", end_index="1000")
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

        if dist <= 400:  # 400m 이내(5분 거리)
            print(f"{name}역까지 거리: {dist:.2f}m")
            subway_station_count += 1
            additional_points += 5
        elif dist <= 800: # 800m 이내(10분 거리):
            print(f"{name}역까지 거리: {dist:.2f}m")
            subway_station_count += 1
            additional_points += 3
        elif dist <= 1200: # 1200m 이내(15분 거리):
            print(f"{name}역까지 거리: {dist:.2f}m")
            subway_station_count += 1
            additional_points += 1

    print(f"1.2km 이내 역 개수: {subway_station_count}개\n")

    # ============================================
    # 1km 이내 공원 목록 가져오기
    # ============================================
    park_count=0
    parks = get_park_data(start_index="1", end_index="1000")
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

        if dist <= 300: # 300m 이내
            print(f"{name}까지 거리: {dist:.2f}m")
            park_count += 1
            additional_points += 2
        elif dist <= 1000: # 1km 이내
            print(f"{name}까지 거리: {dist:.2f}m")
            park_count += 1
            additional_points += 1
    print(f"1km 이내 공원 개수: {park_count}개\n")

    # ============================================
    # 500m 이내 초중고 학교 목록 가져오기
    # ============================================
    school_count=0
    schools = get_school_data(pageNm=1, numOfRows=60000)
    for school in schools:
        lat = school['lat']
        lon = school['lon']
        name = school['name']

        # 위도, 경도 유효성 체크
        if lat is None or lon is None:
            print(f"{name}의 좌표 정보가 없습니다.")
            continue

        # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
        dist = haversine_distance(x, y, lat, lon)

        if dist <= 500:  # 500m 이내
            print(f"{name}까지 거리: {dist:.2f}m")
            school_count += 1
            additional_points += 2.5
    print(f"500m 이내 초중고 개수: {school_count}개\n")

    # ============================================
    # 1km 이내 병원 목록 가져오기
    # ============================================
    # 공백 기준으로 단어 분리
    words = address.split()
    # 첫 번째와 두 번째 단어를 변수에 저장
    sido = words[0]
    sigungu = words[1]
    hospital_count=0
    normal_hospital_count=0
    hospitals = get_hospital_data(Q0=sido, Q1=sigungu, numOfRows=60000) # 시군구별 필터링하여 API 호출
    for hospital in hospitals:
        lat = hospital['lat']
        lon = hospital['lon']
        name = hospital['name']

        # 위도, 경도 유효성 체크
        if lat is None or lon is None:
            print(f"{name}의 좌표 정보가 없습니다.")
            continue

        # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
        dist = haversine_distance(x, y, lat, lon)

        if dist <= 1000:  # 1km 이내
            if hospital['dutyDivNam'] == "종합병원" or hospital['dutyEmclsName'] == "지역응급의료센터":
                print(f"종합병원이나 지역응급의료센터 {name}까지 거리: {dist:.2f}m")
                additional_points += 1.5 # 종합병원이나 지역응급의료센터는 1.5점
                hospital_count += 1
            else:
                print(f"일반 병원 {name}까지 거리: {dist:.2f}m")
                normal_hospital_count += 1
                hospital_count += 1

    additional_points += math.floor(normal_hospital_count * 0.01 * 10) / 10 # 일반 병원의 경우 10개마다 0.1점씩 추가(소수점 둘째 자리 버림)
    print(f"1km 이내 병원 개수: {hospital_count}개\n")
    print(f"추가점수: {additional_points}")

    # ============================================
    # 3km 이내 대형 쇼핑시설 목록 가져오기 (2번에 나누어서)
    # ============================================
    shop_count=0
    shops = get_large_shopping_data(start_index=1, end_index=1000)
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
    shops2 = get_large_shopping_data(start_index=1001, end_index=1200)
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

        if dist <= 1000:  # 3km 이내
            print(f"{name}까지 거리: {dist:.2f}m")
            shop_count += 1
            additional_points += 2
    print(f"3km 이내 대형 쇼핑시설 개수: {shop_count}개\n")

    # ============================================
    # 1km 이내 문화시설 목록 가져오기
    # ============================================
    cultural_space_count=0
    cultural_spaces = get_cultural_space_data(sigungu)
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
            additional_points += 1
    print(f"1km 이내 문화시설 개수: {cultural_space_count}개\n")

    # ============================================
    # 1km 이내 공공체육시설 목록 가져오기
    # ============================================
    facility_count=0
    facilities = get_facilities_data(sigungu)
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
            additional_points += 1
    print(f"1km 이내 공공체육시설 개수: {facility_count}개\n")

    # ============================================
    # 건물 특성 요소
    # ============================================
        
    # 주소 정보를 사용하여 건물 특성 정보 가져오기
    building_ledger = get_building_info_from_ledger(
        sigunguCd=sigungu_code,
        bjdongCd=bjdong_code,
        bun=bun,
        ji=ji
    )
    if building_ledger:
        score = calculate_building_related_additional_points(building_ledger) # 건물 특성 점수 계산
        additional_points += score
    else:
        print("건축물대장 정보를 가져오지 못해 건물 특성 점수를 계산할 수 없습니다.")

    print("추가점수: ", additional_points)

    # ============================================
    # 실거래가 이상치 탐지
    # ============================================
    # 실거래가 API 호출
    """
    @params end_index(종료 인덱스): 1000
    @params cgg_nm(자치구명): sigungu
    @params bldg_usg(건물용도): user_bldg_usg
    """
    data = runEstate("1000", sigungu, user_bldg_usg) # 실거래가 데이터 가져옴(동일 자치구, 동일 건물용도)
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

    # 주변 실거래가 분석 결과 출력
    print(f"\n--- [{sigungu}] 실거래가 이상치 분석 결과 ---")
    for row in valid_rows:
        print(f"{row['stdg_nm']} | 계약가: {row['contract_price']} | Z: {row['z_score']} | {row['label']}")

    # 사용자 입력 계약금액의 Z-score 계산 및 결과 출력
    print("\n--- 입력 주소 분석 결과 ---")
    user_z_score = calculate_user_z_score(user_contract_price, prices)
    user_label = "계산 불가"
    if user_z_score is not None:
        user_label = classify_z_score(user_z_score)
        print(f"입력하신 계약금액({user_contract_price})의 Z-score는 {user_z_score:.2f}이며, '{user_label}' 수준입니다.")
    else:
        print("주변 실거래가 데이터가 부족하여 Z-score를 계산할 수 없습니다.")

    # --- 최종 결과 반환 ---
    analysis_result = {
        "address": address,
        "user_contract_price": user_contract_price,
        "additional_points": additional_points,
        "surrounding_transactions": valid_rows,
        "user_z_score_analysis": {
            "z_score": round(user_z_score, 2) if user_z_score is not None else None,
            "label": user_label
        }
    }
    return analysis_result

# 이 파일을 직접 실행할 때 테스트용으로 analyzeRisks 함수를 호출함
if __name__ == '__main__':
    # 테스트용 임시 계약 데이터
    test_contract = LeaseContract(
        location="서울 동작구 노량진로 233",
        deposit=90000, # 보증금
        rentAmount=0, # 월세
        leasePeriodStart=date(2025, 8, 1), # 임대 시작일
        buildingStructureUse="아파트" # 건물 용도
    )
    result = analyzeRisks(test_contract)
    print("\n--- 최종 분석 결과 ---")
    print(json.dumps(result, indent=2, ensure_ascii=False))

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

# # 학교 목록 가져오기
# school_count=0
# schools = get_odp_school_data(pageNo=1, numOfRows=150000)
# for school in schools:
#     lat = school['lat']
#     lon = school['lon']
#     name = school['name']

#     # 위도, 경도 유효성 체크
#     if lat is None or lon is None:
#         print(f"{name}의 좌표 정보가 없습니다.")
#         continue

#     # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
#     dist = haversine_distance(x, y, lat, lon)

#     if dist <= 1000:  # 1km 이내
#         print(f"{name}까지 거리: {dist:.2f}m")
#         school_count += 1
# print(f"1km 이내 초중고 개수: {school_count}개\n")