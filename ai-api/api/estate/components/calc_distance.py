from math import radians, sin, cos, sqrt, atan2

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.08
#  수정일 : 
#  파일명 : calc_distance.py
#  설명  : 
#  - 두 좌표 사이의 거리를 계산하는 함수
#  - 하버사인 공식 사용
# ============================================

def haversine_distance(lat1, lon1, lat2, lon2):
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