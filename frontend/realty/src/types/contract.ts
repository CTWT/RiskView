//src/types/contract.ts

/**
 * @file contract.ts
 * @description 계약서 분석 과정에서 사용되는 주요 데이터 전송 객체(DTO)들의 타입 정의 모음입니다.
 *              OCR 결과, 파일 메타데이터, 구조화된 계약 정보, 주소 정보 등을 포함합니다.
 */

/*
 * 생성자 : 문원주
 * 생성일 : 25.08.07
 * 파일명 : contract.ts
 * 수정자 :
 * 수정일 :
 * 설명 : DTO에서 받은 데이터들의 타입들의 정의 모음입니다. 미리 정의해놔서 재사용성을 높혔습니다.
 */

export interface DocumentsDTO {
    title: string | null;
    status: string | null;
    isDeleted: boolean | null;
}

export interface FileStorageMetadataDTO {
    originalName: string | null;
    storedPath: string | null;
    fileSizeKb: number | null;
    fileType: string | null;
    isEncrypted: boolean | null;
}

export interface StructuredContractDataDTO {
    leaseType: string | null;
    location: string | null;
    landType: string | null;
    landArea: number | null;
    buildingStructureUse: string | null;
    buildingArea: number | null;
    leasePart: string | null;
    leaseArea: number | null;
    deposit: number | null;
    downPayment: number | null;
    downPaymentSigned: boolean | null;
    middlePayment: number | null;
    middlePaymentDate: string | null;
    balance: number | null;
    balanceDate: string | null;
    rentAmount: number | null;
    rentType: string | null;
    rentDate: string | null;
    leasePeriodStart: string | null;
    leasePeriodEnd: string | null;
    commissionAmount: number | null;
    specialTerms: string | null;
    lessorName: string | null;
    lessorAddress: string | null;
    lessorPhone: string | null;
    lessorIdNumber: string | null;
    lessorAgentName: string | null;
    lessorAgentAddress: string | null;
    lessorAgentIdNumber: string | null;
    lesseeName: string | null;
    lesseeAddress: string | null;
    lesseePhone: string | null;
    lesseeIdNumber: string | null;
    lesseeAgentName: string | null;
    lesseeAgentAddress: string | null;
    lesseeAgentIdNumber: string | null;
    realtorOfficeAddress1: string | null;
    realtorOfficeName1: string | null;
    realtorSignature1: string | null;
    realtorLicensePhone1: string | null;
    realtorAgentSignature1: string | null;
    realtorOfficeAddress2: string | null;
    realtorOfficeName2: string | null;
    realtorSignature2: string | null;
    realtorLicensePhone2: string | null;
    realtorAgentSignature2: string | null;
}

export interface MapInfo {
    roadAddress: string | null;
    jibunAddress: string | null;
    englishAddress: string | null;
    y: string | null;
    x: string | null;
    distance: string | null;
    sido: string | null;
    sigugun: string | null;
    dongmyun: string | null;
    ri: string | null;
    roadName: string | null;
    buildingNumber: string | null;
    buildingName: string | null;
    landNumber: string | null;
    postalCode: string | null;
}
