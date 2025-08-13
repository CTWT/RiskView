from dataclasses import dataclass


@dataclass
class MapInfo:
    #addresses
    address: str=""             #주소
    x : str = ""                #X 좌표(경도)            
    y : str = ""                #Y 좌표(위도)

    #addressElements
    sido : str = ""             #시/도
    sigugun : str = ""          #시/구/군
    dongmyun : str = ""         #동/면
    buildingName : str = ""     #건물 이름

    def __str__(self):
        return (
            f"도로명 주소: {self.roadAddress}\n"
            f"지번 주소: {self.jibunAddress}\n"
            f"위도: {self.y}\n"
            f"경도: {self.x}\n"
            f"시도: {self.sido}\n"
            f"시군구: {self.sigugun}\n"
            f"동/면: {self.dongmyun}\n"
            f"리: {self.ri}\n"
            f"건물명: {self.buildingName}\n"
        )
    