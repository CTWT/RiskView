import requests
from urllib.parse import quote
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('JUSO_API_KEY')

def extract_sigungudong(address, api_key=api_key):
    url = "https://www.juso.go.kr/addrlink/addrLinkApi.do"
    params = {
        'confmKey': api_key,
        'currentPage': 1,
        'countPerPage': 1,
        'keyword': address,
        'resultType': 'json'
    }

    req = requests.Request('GET', url, params=params).prepare()
    print("[DEBUG] 요청 URL:", req.url)

    response = requests.Session().send(req)
    data = response.json()

    # API 에러 체크
    common = data.get('results', {}).get('common', {})
    if common.get('errorCode') != '0':
        print("[ERROR] API 오류:", common.get('errorMessage'))
        return None

    # juso 리스트가 비어있는 경우 안전 처리
    juso_list = data.get('results', {}).get('juso', [])
    if not juso_list:
        print(f"[WARN] 주소 검색 결과 없음: {address}")
        return None

    juso = juso_list[0]
    result = {
        '시도': juso.get('siNm', ''),
        '시군구': juso.get('sggNm', ''),
        '읍면동': juso.get('emdNm', ''),
        '도로명주소': juso.get('roadAddr', ''),
        '지번주소': juso.get('jibunAddr', ''),
        '법정동코드': juso.get('admCd', '')
    }

    return result
