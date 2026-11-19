import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dataclasses import dataclass

@dataclass
class MapInfo:
    #addresses
    address: str=""
    x : str = ""                #X 좌표(경도)            
    y : str = ""                #Y 좌표(위도)

    #addressElements
    sido : str = ""             #시/도
    sigugun : str = ""          #시/구/군
    dongmyun : str = ""         #동/면
    buildingName : str = ""     #건물 이름

    def __str__(self):
        return (
            f"주소: {self.address}\n"
            f"위도: {self.y}\n"
            f"경도: {self.x}\n"
            f"시도: {self.sido}\n"
            f"시군구: {self.sigugun}\n"
            f"동/면: {self.dongmyun}\n"
            f"건물명: {self.buildingName}\n"
        )


load_dotenv()

app = FastAPI()

# CORS 허용 (필요 시)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- address_to_coords 디버깅 보강 ---
def address_to_coords(address: str) -> MapInfo:
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

# ✅ 웹페이지 출력 (지도 포함)
@app.get("/", response_class=HTMLResponse)
def index():
    # ▶ 지도 중심 주소 설정
    address = "서울특별시강남구테헤란로7길22"
    mapInfo = address_to_coords(address)

    if not mapInfo:
        return HTMLResponse("<h1>좌표를 찾을 수 없습니다.</h1>")

    print(mapInfo)

    # ▶ 지도 HTML 페이지 반환
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Kakao Map</title>
        <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=3db0f491d8fba92c9afd96cb31bf7ec2"></script>
    </head>
    <body>
        <h3>📍 Kakao 지도 (반경 1km)</h3>
        <div id="map" style="width:100%;height:500px;"></div>

        <script>
            var mapContainer = document.getElementById('map'), 
                mapOption = {{
                    center: new kakao.maps.LatLng({mapInfo.y}, {mapInfo.x}),
                    level: 4
                }};
            
            var map = new kakao.maps.Map(mapContainer, mapOption); 

            var marker = new kakao.maps.Marker({{
                position: new kakao.maps.LatLng({mapInfo.y}, {mapInfo.x}) 
            }}); 
            marker.setMap(map);

            var circle = new kakao.maps.Circle({{
                center : new kakao.maps.LatLng({mapInfo.y}, {mapInfo.x}),  
                radius: 1000,
                strokeWeight: 2,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                fillColor: '#FF0000',
                fillOpacity: 0.2 
            }}); 
            circle.setMap(map);
        </script>
    </body>
    </html>
    """
    ß