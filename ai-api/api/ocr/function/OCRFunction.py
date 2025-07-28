from tools.StringHelper import *
from data.LeaseContract import LeaseContract
from dotenv import load_dotenv
import requests
import uuid
import time
import base64
import json
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #상위폴더 서치

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : OCRFunction.py

# OCR을 구동시키고 데이터 정제하는 파일

dotenv_path = os.path.join(os.path.dirname(__file__), '..' , '.env')
load_dotenv(dotenv_path)
secret_key = os.getenv('secret_key')
api_url = os.getenv('api_url')


# @Param imagePath JPG파일에 대해 OCR 실행
def runOCR(imagePath: str) -> list[str]:
    with open(imagePath, 'rb') as f:
        imageData = base64.b64encode(f.read()).decode()

    payload = {
        'version': 'V1',
        'requestId': str(uuid.uuid4()),
        'timestamp': int(time.time() * 1000),
        'images': [{
            'name': 'ocr_page',
            'format': 'jpg',
            'data': imageData
        }]
    }

    headers = {
        'Content-Type': 'application/json',
        'X-OCR-SECRET': secret_key
    }

    response = requests.post(api_url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        result = response.json()
        ocrList = []
        print("\n📝 인식된 텍스트:")
        for field in result['images'][0]['fields']:
            ocrList.append(field['inferText'])
            print('-', field['inferText'])
    else:
        return "Error : " + response.status.code + "\n" + response.text

    return ocrList

# @Param ocrList OCR실행되서 얻은 문자열토큰들의 리스트
# 문자열 토큰리스트를 정제해서 계약서데이터로 만드는 함수
def ocrMapping(ocrList: list[str]) -> LeaseContract:
    leaseContract = LeaseContract()

    rentCheckStr = extract_between_tokens(ocrList, ['부동산임대차계약서'], ['전세'])

    if rentCheckStr in ['O', 'o', '0']:
        leaseContract.leaseType = 'JEONSE'
    else:
        leaseContract.leaseType = 'MONTHLY'

    leaseContract.location = extract_between_tokens(ocrList, ['소재지'], ['토', '지'])
    leaseContract.landType = extract_between_tokens(ocrList, ['토', '지', '지', '목'], ['면 적'])
    leaseContract.landArea = extract_between_tokens(ocrList, ['면 적'], ['m2'])
    leaseContract.buildingStructureUse = extract_between_tokens(ocrList, ['구조·용도'], ['면적'])
    leaseContract.buildingArea = extract_between_tokens(ocrList, ['면적'], ['m2'])

    leaseContract.leasePart = get_valid_string(
        extract_between_tokens(ocrList, ['임대할부분'], ['면 적']),
        extract_between_tokens(ocrList, ['임대할부분'], ['면적'])
    )
    leaseContract.leaseArea = get_valid_string(
        extract_between_tokens(ocrList, ['면 적'], ['m2']),
        extract_between_tokens(ocrList, ['면적'], ['m2'])
    )

    leaseContract.deposit = korean_to_number(strip_tokens_from_start(['금', ' '], get_valid_string(
        extract_between_tokens(ocrList, ['보증금', '금'], ['원정']),
        extract_between_tokens(ocrList, ['보증금'], ['원정'])
    )))

    leaseContract.downPayment = korean_to_number(strip_tokens_from_start(['금', ' '], get_valid_string(
        extract_between_tokens(ocrList, ['계약금', '금'], ['원정은']),
        extract_between_tokens(ocrList, ['계약금'], ['원정은 계약시에']),
        extract_between_tokens(ocrList, ['계약금'], ['원정은'])
    )))

    leaseContract.middlePayment = korean_to_number(strip_tokens_from_start(['금', ' '], get_valid_string(
        extract_between_tokens(ocrList, ['중도금'], ['원정은']),
        extract_between_tokens(ocrList, ['중도금', '금'], ['원정은'])
    )))

    leaseContract.middlePaymentDate = convert_string_to_date(
        extract_between_tokens(ocrList, ['원정은'], ['일에 지불하며'])
    )

    leaseContract.balance = korean_to_number(strip_tokens_from_start(['금', ' '], get_valid_string(
        extract_between_tokens(ocrList, ['잔', '금'], ['원정은']),
        extract_between_tokens(ocrList, ['잔', '금', '금'], ['원정은'])
    )))

    leaseContract.balanceDate = convert_string_to_date(
        extract_between_tokens(ocrList, ['원정은'], ['일에 지불한다.'])
    )

    leaseContract.rentAmount = korean_to_number(strip_tokens_from_start(['금', ' '], get_valid_string(
        extract_between_tokens(ocrList, ['차', '임'], ['원정은']),
        extract_between_tokens(ocrList, ['차', '임', '금'], ['원정은'])
    )))

    if extract_between_tokens(ocrList, ['원정은'], ['매월']).find("선불") != -1:
        leaseContract.rentType = "후불"
    else:
        leaseContract.rentType = "선불"

    leaseContract.rentDate = date.today().replace(day=int(extract_between_tokens(ocrList, ['매월'], ['일에'])))
    leaseContract.leasePeriodStart = convert_string_to_date(extract_between_tokens(ocrList, ['상태로'], ['임차인에게']))
    leaseContract.leasePeriodEnd = convert_string_to_date(extract_between_tokens(ocrList, ['인도일로부터'], ['한다.']))
    leaseContract.commissionAmount = int(extract_between_tokens(ocrList, ['거래가액의'], ['_%로']))
    leaseContract.specialTerms = extract_between_tokens(ocrList, ['특약사항'], ['본 계약을'])

    leaseContract.lessorAddress = extract_between_tokens(ocrList, ['주', '소'], ['임대인'])
    leaseContract.lessorIdNumber = extract_between_tokens(ocrList, ['주민등록번호'], ['전', '화'])
    leaseContract.lessorPhone = extract_between_tokens(ocrList, ['전', '화'], ['성명'])
    leaseContract.lessorName = extract_between_tokens(ocrList, ['성명'], ['인', '대리인'])
    leaseContract.lessorAgentAddress = extract_between_tokens(ocrList, ['주소'], ['주민등록번호'])
    leaseContract.lessorAgentIdNumber = extract_between_tokens(ocrList, ['주민등록번호'], ['성명'])
    leaseContract.lessorAgentName = extract_between_tokens(ocrList, ['성명'], ['주', '소'])

    leaseContract.lesseeAddress = extract_between_tokens(ocrList, ['주', '소'], ['임차인'])
    leaseContract.lesseeIdNumber = extract_between_tokens(ocrList, ['주민등록번호'], ['전', '화'])
    leaseContract.lesseePhone = extract_between_tokens(ocrList, ['전', '화'], ['성명'])
    leaseContract.lesseeName = extract_between_tokens(ocrList, ['성명'], ['인', '대리인'])
    leaseContract.lesseeAgentAddress = extract_between_tokens(ocrList, ['주소'], ['주민등록번호'])
    leaseContract.lesseeAgentIdNumber = extract_between_tokens(ocrList, ['주민등록번호'], ['성명'])
    leaseContract.lesseeAgentName = extract_between_tokens(ocrList, ['성명'], ['사무소소재지'])

    leaseContract.realtorOfficeAddress1 = extract_between_tokens(ocrList, ['사무소소재지'], ['사무소소재지'])
    leaseContract.realtorOfficeAddress2 = extract_between_tokens(ocrList, ['사무소소재지'], ['개업공인중개사'])
    leaseContract.realtorOfficeName1 = extract_between_tokens(ocrList, ['사무소명칭'], ['사무소명칭'])
    leaseContract.realtorOfficeName2 = extract_between_tokens(ocrList, ['사무소명칭'], ['대', '표'])
    leaseContract.realtorSignature1 = extract_between_tokens(ocrList, ['서명 및 날인'], ['인', '대', '표'])
    leaseContract.realtorSignature2 = extract_between_tokens(ocrList, ['서명및날인'], ['인', '등록번호'])
    leaseContract.realtorLicensePhone1 = extract_between_tokens(ocrList, ['등록번호'], ['전화'])
    leaseContract.realtorLicensePhone1 += ' / ' + extract_between_tokens(ocrList, ['전화'], ['등록번호'])
    leaseContract.realtorLicensePhone2 = extract_between_tokens(ocrList, ['등록번호'], ['전화'])
    leaseContract.realtorLicensePhone2 += ' / ' + extract_between_tokens(ocrList, ['전화'], ['소속공인중개사'])
    leaseContract.realtorAgentSignature1 = cut_before_space(extract_between_tokens(ocrList, ['서명및날인'], ['인', '소속공인중개사']))
    leaseContract.realtorAgentSignature2 = cut_before_space(get_valid_string(
        extract_between_tokens(ocrList, ['서명 및 날인'], ['인', 'K']),
        extract_between_tokens(ocrList, ['서명및날인'], ['K']),
        extract_between_tokens(ocrList, ['서명및날인'], ['인'])
    ))

    return leaseContract
