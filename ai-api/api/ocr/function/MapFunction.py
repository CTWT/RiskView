import requests
from data.MapInfo import MapInfo
from dotenv import load_dotenv
import sys
import os
import json

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.30
#  파일명 : MapFunction.py

# 네이버 맵 API(geocoding) 을 처리해주는 파일

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #상위폴더 서치
dotenv_path = os.path.join(os.path.dirname(__file__), '..' , '.env')
load_dotenv(dotenv_path)
naver_map_client_id = os.getenv('naver_map_client_id')
naver_map_client_secret = os.getenv('naver_map_client_secret')

# @Param ocr스캔하여 얻은 계약서의 소재지
# @return MapInfo 인스턴스에 담아서 리턴
def getMapInfo(address:str) -> MapInfo:
    
    #Rest
    url = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode'
    params = {'query': address}
    headers = {
        'X-NCP-APIGW-API-KEY-ID': naver_map_client_id,
        'X-NCP-APIGW-API-KEY': naver_map_client_secret,
        'Accept': 'application/json'
    }

    response = requests.get(url, params = params, headers=headers)
    data = response.json()

    print(json.dumps(data, indent=2, ensure_ascii=False))

    if not data.get('addresses'):
        return None
    
    # 데이터가 있으면 mapInfo에 담음
    if data.get('addresses'):

        #데이터 생성
        MapData = MapInfo()
        address = data['addresses'][0]
        MapData.roadAddress = address['roadAddress']
        MapData.jibunAddress = address['jibunAddress']
        MapData.englishAddress = address['englishAddress']
        MapData.x = address['x']
        MapData.y = address['y']
        MapData.distance = address['distance']
        
        for element in address['addressElements']:
            types = element['types']
            value = element['longName']

            if 'SIDO' in types:
                MapData.sido = value
            elif 'SIGUGUN' in types:
                MapData.sigugun = value
            elif 'DONGMYUN' in types:
                MapData.dongmyun = value
            elif 'RI' in types:
                MapData.ri = value
            elif 'ROAD_NAME' in types:
                MapData.roadName = value
            elif 'BUILDING_NUMBER' in types:
                MapData.buildingNumber = value
            elif 'BUILDING_NAME' in types:
                MapData.buildingName = value
            elif 'LAND_NUMBER' in types:
                MapData.landNumber = value
            elif 'POSTAL_CODE' in types:
                MapData.postalCode = value

    return MapData