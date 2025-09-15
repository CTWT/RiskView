import re

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 
#  작성일 : 25.09.09
#  수정일 : 
#  파일명 : remove_address_details.py
#  설명  : 주소에서 상세주소(건물명, 호수, 층 등)를 제거한 주소 반환
# ============================================

def clean_address(address):
    """
    도로명/지번 주소에서 상세주소(건물명, 호수, 층 등)를 제거한 주소 반환
    """
    address = address.strip()

    # 도로명 주소 패턴: '...로|길|대로 숫자'
    road_match = re.search(r'^([\w\s\-·가-힣]+?(로|길|대로)\s?\d+(-\d+)?)(?=\s|$)', address)
    if road_match:
        return road_match.group(1).strip()

    # 지번 주소 패턴: '읍|면|동 숫자' 또는 '읍|면|동 숫자-숫자'
    jibun_match = re.search(r'^([\w\s\-·가-힣]+?(읍|면|동)\s?\d+(-\d+)?)(?=\s|$)', address)
    if jibun_match:
        return jibun_match.group(1).strip()

    # fallback: 시/군/구 + 2~3단어까지만
    return ' '.join(address.split()[:3])