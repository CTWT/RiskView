// src/contracts/contractFieldLabels.ts

import type { StructuredContractDataDTO } from "../types/contract";

type ContractFieldKey = keyof StructuredContractDataDTO;

const contractFieldLabels: Record<ContractFieldKey, string> = {
    // 건물 정보
    leaseType: "임대 유형",
    location: "소재지",
    landType: "토지-지목",
    landArea: "토지-면적(㎡)",
    buildingStructureUse: "건물-구조 및 용도",
    buildingArea: "건물-면적(㎡)",
    leasePart: "임대할 부분",
    leaseArea: "임대할 부분 면적(㎡)",

    // 금액 정보
    deposit: "보증금",
    downPayment: "계약금",
    downPaymentSigned: "계약금 서명 여부",
    middlePayment: "중도금",
    middlePaymentDate: "중도금 지급일",
    balance: "잔금",
    balanceDate: "잔금 지급일",
    rentAmount: "차임",
    rentType: "차임 지급 유형",
    rentDate: "차임 지급일자",
    leasePeriodStart: "임대 시작일",
    leasePeriodEnd: "임대 종료일",
    commissionAmount: "중개보수 금액",
    specialTerms: "특약사항",

    // 임대인
    lessorAddress: "임대인 주소",
    lessorIdNumber: "임대인 주민등록번호",
    lessorPhone: "임대인 전화번호",
    lessorName: "임대인 성명",
    lessorAgentAddress: "임대인 대리인 주소",
    lessorAgentIdNumber: "임대인 대리인 주민번호",
    lessorAgentName: "임대인 대리인 성명",

    // 임차인
    lesseeAddress: "임차인 주소",
    lesseeIdNumber: "임차인 주민등록번호",
    lesseePhone: "임차인 전화번호",
    lesseeName: "임차인 성명",
    lesseeAgentAddress: "임차인 대리인 주소",
    lesseeAgentIdNumber: "임차인 대리인 주민번호",
    lesseeAgentName: "임차인 대리인 성명",

    // 공인중개사
    realtorOfficeAddress1: "공인중개사 사무소 소재지(좌측)",
    realtorOfficeAddress2: "공인중개사 사무소 소재지(우측)",
    realtorOfficeName1: "공인중개사 사무소명칭(좌측)",
    realtorOfficeName2: "공인중개사 사무소명칭(우측)",
    realtorSignature1: "대표 서명 및 날인(좌측)",
    realtorSignature2: "대표 서명 및 날인(우측)",
    realtorLicensePhone1: "등록번호 및 전화번호(좌측)",
    realtorLicensePhone2: "등록번호 및 전화번호(우측)",
    realtorAgentSignature1: "소속공인중개사 서명(좌측)",
    realtorAgentSignature2: "소속공인중개사 서명(우측)",
};

export default contractFieldLabels;
