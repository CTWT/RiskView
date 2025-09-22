import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

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
            throw new Error(
                error.response?.data?.message || "API 요청중 오류 발생"
            );
        }
        throw new Error("알 수 없는 오류 발생");
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
export const sendVerificationEmail = async (email: string) => {
    const response = await apiRequest<{ message: string }>({
        url: "/api/send-verification-email-code",
        method: "POST",
        data: { email },
    });
    return response.data.message;
};

/**
 * 이메일 인증코드 일치 확인
 * @param email 입력받은 이메일
 * @param code 인증코드 일치를 위한 코드
 * @returns
 */
export const verifyEmailCode = async (email: string, code: string) => {
    const res = await apiRequest<{ code: string; message: string }>({
        url: "/api/verify-email-code",
        method: "POST",
        data: { email, code },
    });
    return res.data;
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
