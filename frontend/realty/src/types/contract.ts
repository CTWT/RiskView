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
    roadAddress: string;
    jibunAddress: string;
    englishAddress: string;
    y: number;
    x: number;
    distance: number;
}
