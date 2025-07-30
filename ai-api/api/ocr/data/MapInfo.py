from dataclasses import dataclass


@dataclass
class MapInfo:
    #addresses
    roadAddress: str = ""       #도로명 주소
    jibunAddress: str = ""      #지번 주소
    englishAddress: str = ""    #영어 주소
    x : str = ""                #X 좌표(경도)            
    y : str = ""                #Y 좌표(위도)
    distance : str = ""         #중심 좌표로부터의 거리(m)

    #addressElements
    sido : str = ""             #시/도
    sigugun : str = ""          #시/구/군
    dongmyun : str = ""         #동/면
    ri : str = ""               #리
    roadName : str = ""         #도로명
    buildingNumber : str = ""   #건물 번호
    buildingName : str = ""     #건물 이름
    LandNumber : str = ""       #번지
    postalCode : str = ""       #우편번호

    def __str__(self):
        return (
            f"도로명 주소: {self.roadAddress}\n"
            f"지번 주소: {self.jibunAddress}\n"
            f"영문 주소: {self.englishAddress}\n"
            f"위도: {self.y}\n"
            f"경도: {self.x}\n"
            f"거리: {self.distance}\n"
            f"시도: {self.sido}\n"
            f"시군구: {self.sigugun}\n"
            f"동/면: {self.dongmyun}\n"
            f"리: {self.ri}\n"
            f"도로명: {self.roadName}\n"
            f"건물번호: {self.buildingNumber}\n"
            f"건물명: {self.buildingName}\n"
            f"산번호: {self.landNumber}\n"
            f"우편번호: {self.postalCode}"
        )
    