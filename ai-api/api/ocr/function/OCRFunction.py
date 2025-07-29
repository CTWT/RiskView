from tools.StringHelper import *
from data.LeaseContract import LeaseContract
from dotenv import load_dotenv
from datetime import date
import requests
import uuid
import time
import base64
import json
import os
import sys
import re
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

def search_and_cut(prefix: str, suffix: str, text: str) -> tuple[str, str]:
    prefixIndex = text.find(prefix)
    if prefixIndex == -1:
        return text, None
    
    # suffix는 prefix 이후에서 찾아야 함
    suffixIndex = text.find(suffix, prefixIndex + len(prefix))
    if suffixIndex == -1:
        return text, None
    
    # prefix와 suffix가 바로 붙어있거나 사이에 내용이 없는 경우
    if suffixIndex == prefixIndex + len(prefix):
        return text[suffixIndex:], None
    
    extracted = text[prefixIndex + len(prefix):suffixIndex]
    if extracted == '':
        return text[suffixIndex:], None
    
    # suffix 이후 텍스트 반환
    return text[suffixIndex:], extracted

def ocrMapping(ocrList: list[str]) -> LeaseContract:
    leaseContract = LeaseContract()

    joined_list = (''.join(ocrList))

    text = re.sub(r"\s+", "", joined_list)

    # 임대 유형(전세:JEONSE, 월세:MONTHLY)
    text, leaseType_text = search_and_cut('부동산임대차계약서','전세', text)
    if leaseType_text in ['O', 'o', '0']:
        leaseContract.leaseType = 'JEONSE'
    else:
        leaseContract.leaseType = 'MONTHLY'

    # 소재지
    text,location = search_and_cut('소재지','토지지목', text)
    if location:
        leaseContract.location = location

    # 토지-지목
    text,landType = search_and_cut('토지지목','면적', text)
    if landType:
        leaseContract.landType = landType

    # 토지-면적(㎡)
    text,landArea = search_and_cut('면적', 'm2', text)
    if(landArea):
        leaseContract.landArea = string_to_number(landArea)

    # 건물-구조 및 용도
    text,buildingStructureUse = search_and_cut('건물구조·용도', '면적', text)
    if buildingStructureUse:
        leaseContract.buildingStructureUse = buildingStructureUse

    # 건물-면적(㎡)
    text, buildingArea = search_and_cut('면적','m2', text)
    if buildingArea:
        leaseContract.buildingArea = string_to_number(buildingArea)

    # 임대할 부분
    text,leasePart = search_and_cut('임대할부분','면적', text)
    if(leasePart):
        leaseContract.leasePart = leasePart

    # 임대할 부분 면적(㎡)
    text,leaseArea = search_and_cut('면적', 'm2', text)
    if(leaseArea):
        leaseContract.leaseArea = string_to_number(leaseArea)

    # 보증금
    text,deposit = search_and_cut('보증금금', '원정', text)
    if(deposit):
        leaseContract.deposit = korean_to_number(deposit)

    # 계약금
    text,downPayment = search_and_cut('계약금금', '원정', text)
    if(downPayment):
        leaseContract.downPayment = korean_to_number(downPayment)  

    # 계약금 서명 여부
    text,downPaymentSigned = search_and_cut('영수자(','인)',text)
    if(downPaymentSigned):
        leaseContract.downPaymentSigned = True

    # 중도금
    text,middlePayment = search_and_cut('중도금금','원정', text)
    if(middlePayment):
        leaseContract.middlePayment = korean_to_number(middlePayment)

    # 중도금 지급일
    text,middlePaymentDate = search_and_cut('원정은','에지불하며', text)
    if(middlePaymentDate):
        leaseContract.middlePaymentDate = convert_string_to_date(middlePaymentDate)

    # 잔금
    text,balance = search_and_cut('잔금금','원정', text)
    if(balance):
        leaseContract.balance = korean_to_number(balance)

    # 잔금 지급일
    text,balanceDate = search_and_cut('원정은','에지불한다', text)
    if(balanceDate):
        leaseContract.balanceDate = convert_string_to_date(balanceDate)

    # 차임
    text,rentAmount = search_and_cut('차임금','원정', text)
    if(rentAmount):
        leaseContract.rentAmount = korean_to_number(rentAmount)

    # 선불/후불
    text,rentType = search_and_cut('원정은','매월', text)
    if(rentType):
        if(rentType.find('선불') == -1):
            leaseContract.rentType = '선불'
        else :
            leaseContract.rentType = '후불'

    # 차임 지급일자
    text,rentDate = search_and_cut('매월','일에', text)
    if rentDate:
        day = string_to_number(rentDate)
        today = date.today()
        leaseContract.rentDate = date(today.year, today.month, day)

    # 임대 시작일
    text,leasePeriodStart = search_and_cut('수익할수있는상태로','까지', text)
    if(leasePeriodStart):
        leaseContract.leasePeriodStart = convert_string_to_date(leasePeriodStart)

    # 임대 종료일
    text,leasePeriodEnd = search_and_cut('인도일로부터','까지', text)
    if(leasePeriodEnd):
        leaseContract.leasePeriodEnd = convert_string_to_date(leasePeriodEnd)

    # 중개보수 금액
    text,commissionAmount = search_and_cut('거래가액의','%로한다', text)
    if(commissionAmount):
        leaseContract.commissionAmount = string_to_number(commissionAmount)

    # 특약사항
    text,specialTerms = search_and_cut('특약사항','본계약을증명', text)
    if(specialTerms):
        leaseContract.specialTerms = specialTerms

    text, temp = search_and_cut('본계약을증명','년월일', text)

    # 임대인 주소
    text,lessorAddress = search_and_cut('주소','임대인주민등록번호', text)
    if(lessorAddress):
        leaseContract.lessorAddress = lessorAddress

    # 임대인 주민등록번호
    text,lessorIdNumber = search_and_cut('임대인주민등록번호','전화', text)
    if(lessorIdNumber):
        leaseContract.lessorIdNumber = lessorIdNumber

    # 임대인 전화번호
    text,lessorPhone = search_and_cut('전화','성명', text)
    if(lessorPhone):
        leaseContract.lessorPhone = lessorPhone

    # 임대인 성명
    text,lessorName = search_and_cut('성명','인대리인', text)
    if(lessorName):
        leaseContract.lessorName = lessorName

    # 임대인 대리인 주소
    text,lessorAgentAddress = search_and_cut('대리인주소','주민등록번호', text)
    if(lessorAgentAddress):
        leaseContract.lessorAgentAddress = lessorAgentAddress

    # 임대인 대리인 주민번호
    text,lessorAgentIdNumber = search_and_cut('주민등록번호','성명', text)
    if(lessorAgentIdNumber):
        leaseContract.lessorAgentIdNumber = lessorAgentIdNumber

    # 임대인 대리인 성명
    text,lessorAgentName = search_and_cut('성명','주소', text)
    if(lessorAgentName):
        leaseContract.lessorAgentName = lessorAgentName

    # 임차인 주소
    text,lesseeAddress = search_and_cut('주소','임차인주민등록번호', text)
    if(lesseeAddress):
        leaseContract.lesseeAddress = lesseeAddress

    # 임차인 주민등록번호
    text,lesseeIdNumber = search_and_cut('임차인주민등록번호','전화', text)
    if(lesseeIdNumber):
        leaseContract.lesseeIdNumber = lesseeIdNumber

    # 임차인 전화번호
    text,lesseePhone = search_and_cut('전화','성명', text)
    if(lesseePhone):
        leaseContract.lesseePhone = lesseePhone

    # 임차인 성명
    text,lesseeName = search_and_cut('성명','인대리인주소', text)
    if(lesseeName):
        leaseContract.lesseeName = lesseeName

    # 임차인 대리인 주소
    text,lesseeAgentAddress = search_and_cut('대리인주소','주민등록번호', text)
    if(lesseeAgentAddress):
        leaseContract.lesseeAgentAddress = lesseeAgentAddress

    # 임차인 대리인 주민번호
    text,lesseeAgentIdNumber = search_and_cut('주민등록번호','성명', text)
    if(lesseeAgentIdNumber):
        leaseContract.lesseeAgentIdNumber = lesseeAgentIdNumber

    # 임차인 대리인 성명
    text,lesseeAgentName = search_and_cut('성명','사무소소재지', text)
    if(lesseeAgentName):
        leaseContract.lesseeAgentName = lesseeAgentName

    # 공인중개사 사무소 소재지(좌측)
    text,realtorOfficeAddress1 = search_and_cut('사무소소재지','사무소소재지', text)
    if(realtorOfficeAddress1):
        leaseContract.realtorOfficeAddress1 = realtorOfficeAddress1

    # 공인중개사 사무소 소재지(우측)
    text,realtorOfficeAddress2 = search_and_cut('사무소소재지','개업공인중개사', text)
    if(realtorOfficeAddress2):
        leaseContract.realtorOfficeAddress2 = realtorOfficeAddress2

    # 공인중개사 사무소명칭(좌측)
    text,realtorOfficeName1 = search_and_cut('사무소명칭','사무소명칭', text)
    if(realtorOfficeName1):
        leaseContract.realtorOfficeName1 = realtorOfficeName1

    # 공인중개사 사무소명칭(우측)
    text,realtorOfficeName2 = search_and_cut('사무소명칭','대표서명', text)
    if(realtorOfficeName2):
        leaseContract.realtorOfficeName2 = realtorOfficeName2

    # 대표 서명 및 날인(좌측)
    text,realtorSignature1 = search_and_cut('서명및날인','인대표', text)
    if(realtorSignature1):
        leaseContract.realtorSignature1 = realtorSignature1

    # 대표 서명 및 날인(우측)
    text,realtorSignature2 = search_and_cut('서명및날인','인등록번호', text)
    if(realtorSignature2):
        leaseContract.realtorSignature2 = realtorSignature2

    # 등록번호 및 전화번호(좌측)
    text,realtorLicense1 = search_and_cut('등록번호','전화', text)
    text,realtorPhone1 = search_and_cut('전화','등록번호', text)
    if(realtorLicense1 != None or realtorPhone1 != None):
        leaseContract.realtorLicensePhone1 = (realtorLicense1 if realtorLicense1 != None else '') + " / " \
                                            +(realtorPhone1 if realtorPhone1 != None else '')
        
    # 등록번호 및 전화번호(우측)
    text,realtorLicense2 = search_and_cut('등록번호','전화', text)
    text,realtorPhone2 = search_and_cut('전화','소속공인중개사', text)
    if(realtorLicense2 != None or realtorPhone2 != None):
        leaseContract.realtorLicensePhone2 = (realtorLicense2 if realtorLicense2 != None else '') + " / " \
                                            +(realtorPhone2 if realtorPhone2 != None else '')
        
    # 소속공인중개사 서명(좌측)
    text,realtorAgentSignature1 = search_and_cut('서명및날인','인소속공인중개사', text)
    if(realtorAgentSignature1):
        leaseContract.realtorAgentSignature1 = realtorAgentSignature1
    
    # 소속공인중개사 서명(우측)
    text,realtorAgentSignature2 = search_and_cut('서명및날인','인K', text)
    if(realtorAgentSignature2):
        leaseContract.realtorAgentSignature2 = realtorAgentSignature2

    return leaseContract
