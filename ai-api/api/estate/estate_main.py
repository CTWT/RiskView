import requests
import json
import re
from dotenv import load_dotenv
from urllib import parse
from urllib.parse import urlencode
import os
from local_infra import get_subway_data, get_park_data, get_school_data, get_hospital_data, get_large_shopping_data, get_facilities_data, get_cultural_space_data
from calc_distance import haversine_distance
from addr_to_coord import address_to_coord
from extract_sigungudong import extract_sigungudong
from remove_address_details import clean_address
from building_ledger import get_building_info_from_ledger
import math
from datetime import datetime

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.09
#  수정일 : 25.09.09
#  파일명 : estate_main.py
#  설명  : 이상치 분석 메인 파일
# ============================================

additional_points=0 # 시세 검증 플러스 요인 점수

# address = "서울 강남구 삼성로 154 강남구의회, 강남구민회관"
address = "서울 동작구 노량진로 233 한강빌딩102호"
print("입력한 주소: ", address)

# 주소에서 시군구동을 추출
result = extract_sigungudong(clean_address(address))

sido = result['시도']
sigungu = result['시군구']
eupmyeondong = result['읍면동']
beopjeongdong_code = result['법정동코드']

# 확인용 출력
print(sido)                # 서울특별시
print(sigungu)             # 강남구
print(eupmyeondong)        # 대치동
print(beopjeongdong_code)  # 1168010600

# 주소를 좌표로 변환
y, x = address_to_coord(address)
print(f"X좌표: {x}, Y좌표: {y}")

# ============================================
# 역 목록 가져오기
# ============================================
subway_station_count=0
stations = get_subway_data(start_index=1, end_index=1000)
for station in stations:
    lat = station['lat']
    lon = station['lon']
    name = station['name']

    # 위도, 경도 유효성 체크
    if lat is None or lon is None:
        print(f"역 {name}의 좌표 정보가 없습니다.")
        continue

    # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
parks = get_park_data(start_index=1, end_index=1000)
for park in parks:
    lat = park['lat']
    lon = park['lon']
    name = park['name']

    # 위도, 경도 유효성 체크
    if lat is None or lon is None:
        print(f"{name}의 좌표 정보가 없습니다.")
        continue

    # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
hospitals = get_hospital_data(Q0=sido, Q1=sigungu, numOfRows=60000)
for hospital in hospitals:
    lat = hospital['lat']
    lon = hospital['lon']
    name = hospital['name']

    # 위도, 경도 유효성 체크
    if lat is None or lon is None:
        print(f"{name}의 좌표 정보가 없습니다.")
        continue

    # 거리 계산 (address_to_coord의 x, y와 역의 위도, 경도 비교)
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
    dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

    if dist <= 1000:  # 1km 이내
        print(f"{name}까지 거리: {dist:.2f}m")
        facility_count += 1
        additional_points += 1
print(f"1km 이내 공공체육시설 개수: {facility_count}개\n")

# ============================================
# 건물 특성 요소
# ============================================

def calculate_additional_points(building_info: dict) -> float:
    points = 0.0

    # 1. 건물 연식 점수
    use_approval_date_str = building_info.get('use_approval_date')
    if use_approval_date_str:
        try:
            approval_date = datetime.strptime(use_approval_date_str, '%Y%m%d').date()
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
            print("날짜 파싱 오류:", e)

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

building_ledger = get_building_info_from_ledger()
score = calculate_additional_points(building_ledger)
additional_points += score

print("추가점수: ", additional_points)

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
#     dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
#     dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

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
#     dist = haversine_distance(x, y, lat, lon)  # haversine_distance 함수가 4개 인자 받도록 정의돼야 함

#     if dist <= 1000:  # 1km 이내
#         print(f"{name}까지 거리: {dist:.2f}m")
#         school_count += 1
# print(f"1km 이내 초중고 개수: {school_count}개\n")