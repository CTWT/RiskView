from math import radians, sin, cos, sqrt, atan2, pi

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.08
#  수정일 : 25.09.17
#  파일명 : calc_distance.py
#  설명  : 
#  - 특정 거리 반경 내의 최소/최대 경도/위도 범위 계산(직사각형 범위)
#  - 두 좌표 사이의 거리 계산
#  - 하버사인 공식 사용
# ============================================

def haversine_distance(lon1, lat1, lon2, lat2):
    # 지구 반지름 (단위: 미터)
    R = 6371000  
    
    # 위도/경도를 라디안 단위로 변환
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    delta_phi = radians(lat2 - lat1)
    delta_lambda = radians(lon2 - lon1)

    # 하버사인 공식
    a = sin(delta_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(delta_lambda / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # 거리 계산
    distance = R * c
    return distance  # 단위: meters

def get_boundary_coordinates(lon, lat, distance_m):
    """
    주어진 좌표로부터 특정 거리(m) 반경 내의 최소/최대 경도/위도 범위 계산
    ======================================
    @param lat: 기준점 위도
    @param lon: 기준점 경도
    @param distance_m: 반경 거리 (미터 단위)
    @return: (min_lon, max_lon, min_lat, max_lat) 튜플
    ======================================
    """
    R = 6371000  # 지구 반지름 (미터)

    delta_lat = (distance_m / R) * (180 / pi)
    min_lat = lat - delta_lat
    max_lat = lat + delta_lat

    delta_lon = (distance_m / (R * cos(radians(lat)))) * (180 / pi)
    min_lon = lon - delta_lon
    max_lon = lon + delta_lon

    # 최소/최대값이 뒤바뀌었을 가능성을 대비하여 정렬 처리
    min_lat, max_lat = min(min_lat, max_lat), max(min_lat, max_lat)
    min_lon, max_lon = min(min_lon, max_lon), max(min_lon, max_lon)

    return min_lon, max_lon, min_lat, max_lat # 최소 경도, 최대 경도, 최소 위도, 최대 위도