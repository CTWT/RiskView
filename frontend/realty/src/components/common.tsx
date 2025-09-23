/*
 * 수업명 : 가비아 2회차
 * 이름 : 신인철
 * 작성자 : 신인철
 * 수정자 :
 * 작성일 : 25.09.15
 * 파일명 : common.tsx
 */

export interface ValidationResult {
    valid: boolean; // 성공여부
    value?: string; // 성공 시 포멧 결과
    message?: string; // 실패 시 에러 메시지
}

/** validation */

/**
 * 아이디 정규식 검증
 * 조건: 5~12자리, 영문 소문자+숫자 조합
 * @param id 입력된 아이디 문자열
 * @returns boolean (정규식 일치 여부)
 */
export function validateId(id: string): ValidationResult {
    const regex = /^[a-z0-9]{5,12}$/;

    if (!regex.test(id.trim() || "")) {
        return {
            valid: false,
            message: "아이디는 5~12자의 영문 소문자 + 숫자만 가능합니다",
        };
    }
    return { valid: true, value: id };
}

/**
 * email 정규식 검증(RFC 5322)
 * 조건 : RFC 5322기준 특수문자 적용 기법을 이용한 정규식
 * @param email 입력된 이메일 문자열
 * @returns boolean (정규식 일치 여부)
 */
export function validateEmail(email: string): ValidationResult {
    const regex =
        /^(?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

    if (!regex.test(email.trim() || "")) {
        return { valid: false, message: "이메일 형식이 올바르지 않습니다." };
    }

    return {
        valid: true,
        value: email,
    };
}

/**
 * 한글 완성본 정규식(한글자 이상 한글만)
 * 조건 : 한글 한글자 이상 포함여부(자음 모음 별도 적용 안됨)
 * @param kor 입력된 한글 문자열
 * @returns boolean (정규식 일치 여부)
 */
export function validateKor(kor: string): ValidationResult {
    const regex = /^[가-힣]+$/;
    if (!regex.test(kor.trim() || "")) {
        return { valid: false, message: "한글만 입력가능합니다." };
    }
    return {
        valid: true,
        value: kor,
    };
}

/**
 * 한글 + / 전용 정규식
 * 조건 : 한글과 / 기호만 포함 허용
 * @param korS 입력된 한글 + / 기호 조합 문자열
 * @returns boolean (정규식 일치 여부)
 */
export function validateKorS(korS: string): ValidationResult {
    const regex = /^[가-힣/]+$/;
    if (!regex.test(korS.trim() || "")) {
        return { valid: false, message: "한글과 / 기호만 입력가능합니다." };
    }
    return {
        valid: true,
        value: korS,
    };
}

/**
 * 한글 + - + 숫자 전용 정규식
 * 조건 : 한글 + - + 숫자 의 조합 문자열 허용
 * @param korHN 입력된 한글 + - + 숫자 조합 문자열
 * @returns boolean (정규식 일치 여부)
 */
export function validateKorHN(korHN: string): ValidationResult {
    const regex = /^[가-힣0-9-]+$/;
    if (!regex.test(korHN.trim() || "")) {
        return {
            valid: false,
            message: "한글, 숫자, - 기호만 입력가능합니다.",
        };
    }
    return {
        valid: true,
        value: korHN,
    };
}

/**
 * 숫자만 입력받는 정규식
 * 조건 : 0~9까지의 숫자의 입력
 * @param num 입력된 0~9까지의 숫자 영역 문자열
 * @returns boolean (정규식 일치 여부)
 */
export function validateNum(num: string): ValidationResult {
    const regex = /^[0-9]/;
    if (!regex.test(num.trim() || "")) {
        return {
            valid: false,
            message: "숫자만 입력가능합니다.",
        };
    }

    return {
        valid: true,
        value: num,
    };
}

/**
 * 닉네임 생성 정규식
 * 조건 : 한글, 숫자, 영어 대소문자 포함 10자리 이하 문자열
 * @param nickname 한글, 숫자, 영어 대소문자 포함 10자리 이하 문자열
 * @returns
 */
export function validateNickName(nickname: string): ValidationResult {
    const regex = /^[가-힣a-zA-Z0-9]{1,10}$/;

    if (!regex.test(nickname.trim() || "")) {
        return {
            valid: false,
            message:
                "닉네임은 한글, 숫자, 영어 대소문자 조합 10자리 이하만 가능합니다.",
        };
    }
    return {
        valid: true,
        value: nickname,
    };
}

/**
 * 숫자와 . 만 입력받는 정규식
 * 조건 : 0~9 숫자와 .(dot) 기호만 허용
 * @param value 입력된 문자열
 * @returns
 */
export function validateNumDot(value: string): ValidationResult {
    const regex = /^[0-9.]+$/;

    if (!regex.test(value.trim() || "")) {
        return {
            valid: false,
            message: "숫자와 . 기호만 입력 가능합니다.",
        };
    }

    return {
        valid: true,
        value: value,
    };
}

/** format */

/**
 * 숫자 3자리마다 콤마 생성
 * @param amount 입력된 값의 숫자 값
 * @returns string(replace작업)
 */
export function formatNumberCommas(amount: string): ValidationResult {
    const regex = /^\d+$/;

    if (!regex.test(amount.trim() || "")) {
        return { valid: false, message: "숫자만 입력 가능합니다." };
    }

    return {
        valid: true,
        value: amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    };
}

/**
 * 날짜 검증 및 포맷 변경 (YYYY-MM-DD)
 * @param dateStr 입력된 날짜 형식
 * @returns string(replace작업)
 */
export function formatDate(dateStr: string): ValidationResult {
    const regex = /^(\d{4})([-/.]?)(\d{2})([-/.]?)(\d{2})$/;
    if (!regex.test(dateStr || "")) {
        return { valid: false, message: "올바른 날짜 형식이 아닙니다." };
    }

    const match = dateStr.match(regex);
    if (!match) return { valid: false, message: "날짜 변환 오류" };

    const year = match[1];
    const month = match[3];
    const day = match[5];

    const dateObj = new Date(`${year}-${month}-${day}`);
    if (
        dateObj.getFullYear().toString() !== year ||
        (dateObj.getMonth() + 1).toString().padStart(2, "0") !== month ||
        dateObj.getDate().toString().padStart(2, "0") !== day
    ) {
        return { valid: false, message: "존재하지 않는 날짜입니다." };
    }

    return { valid: true, value: `${year}-${month}-${day}` };
}

/**
 * 휴대폰 번호 전용 포멧팅(항상 하이픈 포함)
 * 조건 : 010 ~ 시작
 * @param phoneNum 입력받은 휴대폰 번호
 * @returns string(replace작업)
 */
export function formatPhoneNum(phoneNum: string): ValidationResult {
    // 숫자만 추출
    const onlyNums = phoneNum.replace(/[^0-9]/g, "");

    // 01X 시작만 허용
    const regex = /^01[016789]\d{3,4}\d{4}$/;

    // 자리수에 따라 포맷팅
    let formatted = "";
    if (onlyNums.length < 4) {
        formatted = onlyNums;
    } else if (onlyNums.length < 7) {
        formatted = onlyNums.replace(/(\d{3})(\d{1,3})/, "$1-$2");
    } else {
        formatted = onlyNums.replace(/(\d{3})(\d{3,4})(\d{1,4})/, "$1-$2-$3");
    }

    // 최종적으로 유효성 검사
    if (!regex.test(formatted.replace(/-/g, ""))) {
        return {
            valid: false,
            message: "휴대폰 번호는 010-1234-5678 형식이어야 합니다.",
            value: formatted,
        };
    }

    return { valid: true, value: formatted };
}

/**
 * 주민등록 번호 전용 포멧팅(항상 하이픈 포함)
 * @param rrn 입력받은 주민등록번호
 * @returns
 */
export function formatRRN(rrn: string): ValidationResult {
    // 숫자만 추출
    const onlyNums = rrn.replace(/[^0-9]/g, "");

    // 자리수에 따라 포맷팅
    let formatted = "";
    if (onlyNums.length <= 6) {
        formatted = onlyNums;
    } else {
        formatted = onlyNums.replace(/(\d{6})(\d{1,7})?/, (_, front, back) =>
            back ? `${front}-${back}` : front
        );
    }

    // 유효성 검사 (13자리)
    const regex = /^\d{6}-\d{7}$/;
    if (!regex.test(formatted)) {
        return {
            valid: false,
            message: "주민등록번호는 YYMMDD-XXXXXXX 형식이어야 합니다.",
            value: formatted,
        };
    }

    return { valid: true, value: formatted };
}
