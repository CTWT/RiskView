import requests
from data.MapInfo import MapInfo
from dotenv import load_dotenv
import sys
import os

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.30
#  파일명 : MapFunction.py

# 네이버 맵 API(geocoding) 을 처리해주는 파일

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #상위폴더 서치
load_dotenv()

# @Param ocr스캔하여 얻은 계약서의 소재지
# @return MapInfo 인스턴스에 담아서 리턴
def address_to_mapInfo(address: str) -> MapInfo:
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    key = os.getenv("KAKAO_REST_API_KEY")
    headers = {"Authorization": f"KakaoAK {key}"}
    params = {"query": address}

    try:
        res = requests.get(url, headers=headers, params=params, timeout=10)
        # 디버깅 출력
        print("Kakao Local status:", res.status_code)
        if res.status_code != 200:
            print("Kakao Local body:", res.text)
    except Exception as e:
        print("Kakao 요청 예외:", e)
        return None

    if res.status_code != 200:
        return None
    
    data = res.json()
    docs = data.get("documents", [])
    if not docs:
        return None

    mapInfo = MapInfo()
    addr = docs[0].get("road_address")
    if addr:
        mapInfo.buildingName = addr.get('building_name')
    else:
        addr = docs[0].get("address")
    
    if not addr:
        return None
    
    mapInfo.address = addr.get('address_name')
    mapInfo.x = addr.get('x')
    mapInfo.y = addr.get('y')
    mapInfo.sido = addr.get('region_1depth_name')
    mapInfo.sigugun = addr.get('region_2depth_name')
    mapInfo.dongmyun = addr.get('region_3depth_name')

    return mapInfo