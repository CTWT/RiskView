from .function.PDFFunction import *
from .function.OCRFunction import *
from dotenv import load_dotenv

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
#  파일명 : FileGenerator.py

# 테스트케이스 생성기

from dataclasses import dataclass
from typing import Optional
from datetime import date

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 박윤성
#  작성일 : 25.07.21
#  수정일 : 25.09.19
#  파일명 : LeaseContract.py

# 정제된 OCR 데이터를 저장하고 POST요청보낼 계약서 클래스
@dataclass
class LeaseContract:
    leaseType: str = ""  # 임대 유형(전세:JEONSE, 월세:MONTHLY)
    location: str = ""  # 소재지
    landType: str = ""  # 토지-지목
    landArea: float = 0  # 토지-면적(㎡)
    buildingStructureUse: str = ""  # 건물-구조 및 용도
    buildingArea: float = 0  # 건물-면적(㎡)
    leasePart: str = ""  # 임대할 부분
    leaseArea: float = 0  # 임대할 부분 면적(㎡)
    deposit: int = 0  # 보증금
    downPayment: int = 0  # 계약금
    downPaymentSigned: bool = False  # 계약금 서명 여부
    middlePayment: int = 0  # 중도금
    middlePaymentDate: date = 0  # 중도금 지급일
    balance: int = 0  # 잔금
    balanceDate: date = 0  # 잔금 지급일
    rentAmount: int = 0  # 차임
    rentType: str = ""  # 선불/후불
    rentDate: date = 0  # 차임 지급일자
    leasePeriodStart: date = 0  # 임대 시작일
    leasePeriodEnd: date = 0  # 임대 종료일
    commissionAmount: int = 0  # 중개보수 금액
    specialTerms: str = ""  # 특약사항
    contractDate: date = 0  # 계약일

    # Lessor (임대인)
    lessorAddress: str = ""  # 임대인 주소
    lessorIdNumber: str = ""  # 임대인 주민등록번호
    lessorPhone: str = ""  # 임대인 전화번호
    lessorName: str = ""  # 임대인 성명
    lessorAgentAddress: Optional[str] = ""  # 임대인 대리인 주소
    lessorAgentIdNumber: Optional[str] = ""  # 임대인 대리인 주민번호
    lessorAgentName: Optional[str] = ""  # 임대인 대리인 성명

    # Lessee (임차인)
    lesseeAddress: str = ""  # 임차인 주소
    lesseeIdNumber: str = ""  # 임차인 주민등록번호
    lesseePhone: str = ""  # 임차인 전화번호
    lesseeName: str = ""  # 임차인 성명
    lesseeAgentAddress: Optional[str] = ""  # 임차인 대리인 주소
    lesseeAgentIdNumber: Optional[str] = ""  # 임차인 대리인 주민번호
    lesseeAgentName: Optional[str] = ""  # 임차인 대리인 성명

    # Realtor (공인중개사 정보)
    realtorOfficeAddress1: str = ""  # 공인중개사 사무소 소재지(좌측)
    realtorOfficeAddress2: str = ""  # 공인중개사 사무소 소재지(우측)
    realtorOfficeName1: str = ""  # 공인중개사 사무소명칭(좌측)
    realtorOfficeName2: str = ""  # 공인중개사 사무소명칭(우측)
    realtorSignature1: str = ""  # 대표 서명 및 날인(좌측)
    realtorSignature2: str = ""  # 대표 서명 및 날인(우측)
    realtorLicensePhone1: str = ""  # 등록번호 및 전화번호(좌측)
    realtorLicensePhone2: str = ""  # 등록번호 및 전화번호(우측)
    realtorAgentSignature1: str = ""  # 소속공인중개사 서명(좌측)
    realtorAgentSignature2: str = ""  # 소속공인중개사 서명(우측)



from datetime import date

test_dataset = [
    LeaseContract(
        leaseType='JEONSE',
        location='서울특별시 종로구 종로 1',
        landType='대지',
        landArea=800.0,
        buildingStructureUse='철근콘크리트 / 업무시설',
        buildingArea=18000.0,
        leasePart='10층 전체',
        leaseArea=500.0,
        deposit=200000000,
        downPayment=20000000,
        downPaymentSigned=True,
        middlePayment=40000000,
        middlePaymentDate=date(2025, 6, 15),
        balance=140000000,
        balanceDate=date(2025, 6, 30),
        rentAmount=0,
        rentType="없음",
        rentDate=date(2025, 10, 20),
        leasePeriodStart=date(2025, 7, 1),
        leasePeriodEnd=date(2027, 6, 30),
        commissionAmount=10,
        specialTerms='임차인은 중도해지 불가, 원상복구 필수, 보증금 이자 무이자.',
        contractDate=date(2025, 6, 10),

        lessorAddress='서울특별시 강남구 대치동 944',
        lessorIdNumber='750101-1234567',
        lessorPhone='010-1111-2222',
        lessorName='홍길동',
        lessorAgentAddress='서울특별시 강남구 대치동 944',
        lessorAgentIdNumber='750101-1234567',
        lessorAgentName='홍길동 대리인',

        lesseeAddress='서울특별시 마포구 동교동 165',
        lesseeIdNumber='900202-2345678',
        lesseePhone='010-3333-4444',
        lesseeName='김철수',
        lesseeAgentAddress='서울특별시 마포구 동교동 165',
        lesseeAgentIdNumber='900202-2345678',
        lesseeAgentName='김철수 대리인',

        realtorOfficeAddress1='서울특별시 종로구 세종대로 149',
        realtorOfficeAddress2='서울특별시 종로구 세종대로 150',
        realtorOfficeName1='종로공인중개사사무소',
        realtorOfficeName2='종로공인중개사 분점',
        realtorSignature1='박지훈',
        realtorSignature2='최은영',
        realtorLicensePhone1='1234-서울-56789 / 02-123-4567',
        realtorLicensePhone2='1234-서울-98765 / 02-234-5678',
        realtorAgentSignature1='김소연',
        realtorAgentSignature2='이현우'
    ),
    LeaseContract(
        leaseType='MONTHLY',
        location='서울특별시 마포구 월드컵북로 400',
        landType='대지',
        landArea=950.0,
        buildingStructureUse='철근콘크리트 / 근린생활시설',
        buildingArea=12000.0,
        leasePart='5층 일부',
        leaseArea=200.0,
        deposit=100000000,
        downPayment=10000000,
        downPaymentSigned=True,
        middlePayment=20000000,
        middlePaymentDate=date(2025, 7, 20),
        balance=70000000,
        balanceDate=date(2025, 7, 31),
        rentAmount=3000000,
        rentType="선불",
        rentDate=date(2025, 8, 1),
        leasePeriodStart=date(2025, 8, 1),
        leasePeriodEnd=date(2026, 7, 31),
        commissionAmount=15,
        specialTerms='임대차 기간 중 시설물의 고장 또는 파손이 발생할 경우, 수리·교체 비용을 임대인과 임차인이 각각 50%씩 부담한다.',
        contractDate=date(2025, 7, 10),

        lessorAddress='서울특별시 용산구 이태원동 225',
        lessorIdNumber='760101-2234567',
        lessorPhone='010-5555-6666',
        lessorName='이영희',
        lessorAgentAddress='서울특별시 용산구 이태원동 225',
        lessorAgentIdNumber='760101-2234567',
        lessorAgentName='이영희 대리인',

        lesseeAddress='서울특별시 서초구 서초동 1321',
        lesseeIdNumber='910303-3456789',
        lesseePhone='010-7777-8888',
        lesseeName='박민수',
        lesseeAgentAddress='서울특별시 서초구 서초동 1321',
        lesseeAgentIdNumber='910303-3456789',
        lesseeAgentName='박민수 대리인',

        realtorOfficeAddress1='서울특별시 마포구 상암동 1595',
        realtorOfficeAddress2='서울특별시 마포구 상암동 1600',
        realtorOfficeName1='상암부동산',
        realtorOfficeName2='상암부동산 분점',
        realtorSignature1='최은영',
        realtorSignature2='박지훈',
        realtorLicensePhone1='1234-서울-56780 / 02-315-2222',
        realtorLicensePhone2='1234-서울-98760 / 02-315-3333',
        realtorAgentSignature1='정수빈',
        realtorAgentSignature2='한지훈'
    ),
    LeaseContract(
        leaseType='MONTHLY',
        location='서울특별시 송파구 올림픽로 300',
        landType='대지',
        landArea=1200.0,
        buildingStructureUse='철근콘크리트 / 판매시설',
        buildingArea=25000.0,
        leasePart='1층 전체',
        leaseArea=600.0,
        deposit=80000000,
        downPayment=5000000,
        downPaymentSigned=True,
        middlePayment=10000000,
        middlePaymentDate=date(2025, 7, 15),
        balance=35000000,
        balanceDate=date(2025, 7, 31),
        rentAmount=5000000,
        rentType="후불",
        rentDate=date(2025, 8, 30),
        leasePeriodStart=date(2025, 8, 1),
        leasePeriodEnd=date(2028, 7, 31),
        commissionAmount=5,
        specialTerms='임대차 기간 중 발생하는 모든 시설물(전기, 수도, 보일러, 가전제품 등)의 고장·수리·교체 비용은 임대인이 전액 부담한다.',
        contractDate=date(2025, 7, 5),

        lessorAddress='서울특별시 강동구 천호동 423',
        lessorIdNumber='720404-1234567',
        lessorPhone='010-9999-0000',
        lessorName='최상훈',
        lessorAgentAddress='서울특별시 강동구 천호동 423',
        lessorAgentIdNumber='720404-1234567',
        lessorAgentName='최상훈 대리인',

        lesseeAddress='서울특별시 영등포구 여의도동 14',
        lesseeIdNumber='940505-9876543',
        lesseePhone='010-1212-3434',
        lesseeName='정다은',
        lesseeAgentAddress='서울특별시 영등포구 여의도동 14',
        lesseeAgentIdNumber='940505-9876543',
        lesseeAgentName='정다은 대리인',

        realtorOfficeAddress1='서울특별시 송파구 방이동 88',
        realtorOfficeAddress2='서울특별시 송파구 방이동 89',
        realtorOfficeName1='올림픽공인중개사',
        realtorOfficeName2='올림픽공인중개사 분점',
        realtorSignature1='김소연',
        realtorSignature2='이현우',
        realtorLicensePhone1='1234-서울-56770 / 02-410-2222',
        realtorLicensePhone2='1234-서울-98770 / 02-410-3333',
        realtorAgentSignature1='이민정',
        realtorAgentSignature2='강재호'
    )
]

pdf_path = 'api/ocr/sources/Contract_form.pdf'

if isPDFValid(pdf_path):
    for contract in test_dataset:
        output_PDF_path = insertTexttoPDF(contract, pdf_path)
        output_image_path = output_PDF_path.replace('.pdf', '.jpg')
        convertPDFtoJPG(output_PDF_path, output_image_path)
else:
    print("PDF 파일이 존재하지 않습니다.")
