import requests
from urllib.parse import quote
from dotenv import load_dotenv
import os

# ============================================
#  수업명 : 가비아 2회차
#  작성자 : 박윤성
#  수정자 : 박윤성
#  작성일 : 25.09.09
#  수정일 : 25.09.09
#  파일명 : extract_sigungudong.py
#  설명  : 주소에서 시군구동을 추출하는 메서드
# ============================================

# .env 파일에서 환경 변수 로드
load_dotenv()
api_key = os.getenv('JUSO_API_KEY')

# 주소에서 시군구동을 추출하는 메서드
def extract_sigungudong(address, api_key=api_key):
    url = "https://www.juso.go.kr/addrlink/addrLinkApi.do"
    params = {
        'confmKey': api_key, # API 키
        'currentPage': 1, # 페이지
        'countPerPage': 1, # 페이지당 결과 수
        'keyword': address, # 주소
        'resultType': 'json' # 결과 타입
    }

    req = requests.Request('GET', url, params=params).prepare() # 요청 준비
    print(req.url) # 요청 URL 출력

    response = requests.Session().send(req) # 요청 보내기
    data = response.json() # JSON 응답

    if data['results']['common']['errorCode'] != '0': # 에러 체크
        print("Error:", data['results']['common']['errorMessage'])
        return None

    juso = data['results']['juso'][0] # 결과 추출
    result = {
        '시도': juso['siNm'],       # 예: 서울특별시
        '시군구': juso['sggNm'],     # 예: 강남구
        '읍면동': juso['emdNm'],     # 예: 삼성동
        '도로명주소': juso['roadAddr'],
        '지번주소': juso['jibunAddr'],
        '법정동코드': juso['admCd']          # 예: 1168010800
    }

    return result