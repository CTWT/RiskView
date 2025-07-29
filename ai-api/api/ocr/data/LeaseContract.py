from dataclasses import dataclass
from typing import Optional
from datetime import date

#  수업명 : 가비아 2회차
#  이름 : 김관호
#  작성자 : 김관호
#  수정자 : 
#  작성일 : 25.07.21
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
