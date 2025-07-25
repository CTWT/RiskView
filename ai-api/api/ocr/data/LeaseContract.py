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
    leaseType: str = ""
    location: str = ""
    landType: str = ""
    landArea: float = 0
    buildingStructureUse: str = ""
    buildingArea: float = 0
    leasePart: str = ""
    leaseArea: float = 0
    deposit: int = 0
    downPayment: int = 0
    downPaymentSigned: bool = False
    middlePayment: int = 0
    middlePaymentDate: date = 0
    balance: int = 0
    balanceDate: date = 0
    rentAmount: int = 0
    rentType: str = ""
    rentDate: date = 0
    leasePeriodStart: date = 0
    leasePeriodEnd: date = 0
    commissionAmount: int = 0
    specialTerms: str = ""

    # Lessor (임대인)
    lessorAddress: str = ""
    lessorIdNumber: str = ""
    lessorPhone: str = ""
    lessorName: str = ""
    lessorAgentAddress: Optional[str] = ""
    lessorAgentIdNumber: Optional[str] = ""
    lessorAgentName: Optional[str] = ""

    # Lessee (임차인)
    lesseeAddress: str = ""
    lesseeIdNumber: str = ""
    lesseePhone: str = ""
    lesseeName: str = ""
    lesseeAgentAddress: Optional[str] = ""
    lesseeAgentIdNumber: Optional[str] = ""
    lesseeAgentName: Optional[str] = ""

    # Realtor (공인중개사 정보)
    realtorOfficeAddress1: str = ""
    realtorOfficeAddress2: str = ""
    realtorOfficeName1: str = ""
    realtorOfficeName2: str = ""
    realtorSignature1: str = ""
    realtorSignature2: str = ""
    realtorLicensePhone1: str = ""
    realtorLicensePhone2: str = ""
    realtorAgentSignature1: str = ""
    realtorAgentSignature2: str = ""