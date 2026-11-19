import requests
import json
import time
from dotenv import load_dotenv
import os
import re

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.17
#  수정일 : 
#  파일명 : add_coord_to_sports_json.py
#  설명  : 주소 기반 위도/경도 변환 + 실패 시 키워드 검색으로 좌표 변환
# ============================================

load_dotenv()

# 🔑 카카오 REST API 키
KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY')

# 📌 주소 띄어쓰기 보정 함수
def fix_address_spacing(addr):
    # 도로명/번지 숫자와 문자 사이 띄어쓰기 자동 보정
    addr = re.sub(r'([가-힣]+)(\d)', r'\1 \2', addr)
    addr = re.sub(r'(\d)([가-힣]+)', r'\1 \2', addr)
    return addr.strip()

# 📌 주소 → 위도/경도 변환 함수
def get_coordinates(address, api_key):
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {api_key}"}
    params = {"query": address}

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            result = response.json()
            documents = result.get("documents")
            if documents:
                x = documents[0]["x"]  # 경도
                y = documents[0]["y"]  # 위도
                return float(y), float(x)
        return None, None
    except Exception as e:
        print(f"Error fetching coordinates for '{address}': {e}")
        return None, None

# 📌 키워드(시설명) → 위도/경도 변환 함수
def get_coordinates_by_keyword(keyword, api_key):
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {api_key}"}
    params = {"query": keyword}

    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            result = response.json()
            documents = result.get("documents")
            if documents:
                x = documents[0]["x"]  # 경도
                y = documents[0]["y"]  # 위도
                return float(y), float(x)
        return None, None
    except Exception as e:
        print(f"Error with keyword search '{keyword}': {e}")
        return None, None

# 📂 1. JSON 파일 불러오기
with open("서울시 공공체육시설 정보.json", "r", encoding="utf-8") as f:
    facility_data = json.load(f)

# 🔄 2. 각 시설에 위도/경도 추가 (주소 → 실패 시 키워드)
for i, facility in enumerate(facility_data.get("DATA", []), start=1):
    address = facility.get("ft_addr", "")
    name = facility.get("ft_title", "")

    lat, lng = None, None
    if address:
        # 1차 시도 - 원래 주소
        lat, lng = get_coordinates(address, KAKAO_REST_API_KEY)
        
        if lat is None or lng is None:
            # 2차 시도 - 띄어쓰기 보정 주소
            fixed_address = fix_address_spacing(address)
            if fixed_address != address:  # 보정이 실제로 됐으면 시도
                lat, lng = get_coordinates(fixed_address, KAKAO_REST_API_KEY)

        if lat is None or lng is None:
            # 3차 시도 - 키워드(시설명) 검색
            lat, lng = get_coordinates_by_keyword(name, KAKAO_REST_API_KEY)

    else:
        print(f"[{i}] 주소 없음 - {name}")

    facility["latitude"] = lat
    facility["longitude"] = lng

    print(f"[{i}] {name} → 위도: {lat}, 경도: {lng}")
    time.sleep(0.3)  # API 제한 대응

# 💾 3. 결과 저장
with open("서울시 공공체육시설 정보(위경도 포함).json", "w", encoding="utf-8") as f:
    json.dump(facility_data, f, ensure_ascii=False, indent=2)

print("✅ 모든 위도/경도 정보 추가 완료 및 저장됨: 서울시 공공체육시설 정보(위경도 포함).json")
