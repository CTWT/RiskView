import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import emailjs from "@emailjs/browser";

/**
 * 공통 axios 요청 함수
 * @param config AxiosRequestConfig - axios설정 객체
 * @returns AxiosResponse<any> - 응답 데이터
 */
export const apiRequest = async <T = unknown,>(
    config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
    try {
        const response = await axios({
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                ...(config.headers || {}),
            },
            ...config,
        });
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // 서버에서 보낸 오류 메시지가 있으면 그것을 사용하고, 없으면 기본 메시지 사용
            throw new Error(
                error.response?.data?.message || "서버와 통신 중 오류가 발생했습니다."
            );
        }
        throw new Error("알 수 없는 네트워크 오류가 발생했습니다.");
    }
};

/**
 * 이메일 중복 확인
 * @param email 서버에 넘길 email
 * @returns
 */
export const checkEmailDuplicate = async (email: string) => {
    const response = await apiRequest<{ available: boolean }>({
        url: `/api/user/check-email/${encodeURIComponent(email)}`,
        method: "GET",
    });
    return response.data.available;
};

/**
 * 이메일 인증 코드 발송 요청
 * @param email 이메일 인증을 위한 이메일
 * @returns
 */
export const requestVerificationCode = async (email: string) => {
    const response = await apiRequest<{ message: string; code: string; token: string }>({
        url: "/api/send-verification-email-code",
        method: "POST",
        data: { email },
    });
    return response.data; // { message, code, token }
};

/**
 * 비밀번호 재설정 코드 발송 요청
 * @param userId 사용자 아이디
 * @param email 사용자 이메일
 * @returns
 */
export const requestPasswordResetCode = async (userId: string, email: string) => {
    const response = await apiRequest<{ message: string; code: string; token: string }>({
        url: "/api/user/send-password-reset-code",
        method: "POST",
        data: { userId, email },
    });
    return response.data;
};
/**
 * EmailJS를 사용하여 인증 이메일 발송
 * @param to_email 수신자 이메일
 * @param verification_code 인증 코드
 */
export const sendEmailWithEmailJS = async (to_email: string, verification_code: string) => {
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
        throw new Error("EmailJS 환경 변수가 설정되지 않았습니다.");
    }

    const templateParams = {
        to_email: to_email,
        verification_code: verification_code,
    };

    try {
        await emailjs.send(serviceID, templateID, templateParams, publicKey);
        console.log("EmailJS: 이메일 발송 성공!");
    } catch (error) {
        console.error("EmailJS: 이메일 발송 실패...", error);
        throw new Error("EmailJS를 통한 이메일 발송에 실패했습니다.");
    }
};


/**
 * 이메일 인증코드 일치 확인
 * @param email 입력받은 이메일
 * @param code 인증코드 일치를 위한 코드
 * @returns
 */
export const verifyEmailCode = async (email: string, code: string) => {
    try {
        const res = await apiRequest<{ code?: string; message?: string }>({
            url: "/api/verify-email-code",
            method: "POST",
            data: { email, code },
        });
        console.log("✅ verifyEmailCode Response:", res.data);
        return res.data;
    } catch (err) {
        console.error("❌ verifyEmailCode Error:", err);
        throw err;
    }
};

/**
 * 아이디 중복 확인 처리
 * @param userId 입력받은 아이디
 * @returns
 */
export const checkUserIdDuplicate = async (userId: string) => {
    const response = await apiRequest<{ available: boolean; message: string }>({
        url: `/api/user/check-userid/${encodeURIComponent(userId)}`,
        method: "GET",
    });
    return response.data;
};

/**
 * 닉네임 중복 확인 처리
 * @param nickName 입력받은 닉네임
 * @returns
 */
export const checkNickNameDuplicate = async (nickName: string) => {
    const response = await apiRequest<{ available: boolean; message: string }>({
        url: `/api/user/check-nickname/${encodeURIComponent(nickName)}`,
        method: "GET",
    });
    return response.data;
};
