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
        console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        const response = await axios({
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                ...(config.headers || {}),
            },
            ...config,
        });
        console.log(`✅ [API Response] ${config.method?.toUpperCase()} ${config.url}`, response.data);
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // 서버 응답이 있는 경우
            if (error.response) {
                console.error("API Error Response:", error.response.data);
                // 서버에서 보낸 오류 메시지가 있으면 그것을 사용하고, 없으면 기본 메시지 사용
                throw new Error(error.response.data.message || `서버 오류: ${error.response.status}`);
            } else if (error.request) {
                // 요청은 보냈으나 응답을 받지 못한 경우
                throw new Error("서버로부터 응답이 없습니다. 네트워크를 확인해주세요.");
            }
        }
        // 그 외의 오류 (요청 설정 오류 등)
        throw new Error("요청 처리 중 알 수 없는 오류가 발생했습니다.");
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
 * 통합 인증코드 요청 함수
 * - 회원가입용 이메일 인증
 * - 프로필 수정용 이메일 인증
 * - 비밀번호 재설정용 이메일 인증
 * @param email 인증할 이메일
 * @param endpoint API 엔드포인트
 * @param additionalData 추가 데이터 (비밀번호 재설정 시 userId 필요)
 * @returns code와 token 반환
 */
export const requestVerificationCode = async (
    email: string, 
    endpoint: string, 
    additionalData?: { userId?: string }
): Promise<{ code: string; token: string }> => {
    const response = await apiRequest<{ code: string; token: string }>({
        url: endpoint,
        method: "POST",
        data: { 
            email, 
            ...additionalData 
        },
    });
    
    if (!response.data.code) {
        throw new Error("서버로부터 인증 코드 또는 토큰을 받지 못했습니다.");
    }
    
    return response.data;
};

/**
 * 이메일 인증 코드 발송 요청 (회원가입용)
 * @param email 이메일 인증을 위한 이메일
 * @returns
 */
export const sendVerificationEmailCode = async (email: string) => {
    return requestVerificationCode(email, "/api/send-verification-email-code");
};

/**
 * 비밀번호 재설정 코드 발송 요청
 * @param userId 사용자 아이디
 * @param email 사용자 이메일
 * @returns
 */
export const requestPasswordResetCode = async (userId: string, email: string) => {
    return requestVerificationCode(email, "/api/user/send-password-reset-code", { userId });
};

/**
 * 이메일 인증 코드 발송 요청 (프로필 수정용)
 * @param email 새로운 이메일
 * @returns
 */
export const sendProfileEmailVerificationCode = async (email: string) => {
    return requestVerificationCode(email, "/api/send-verification-email-code");
};

/**
 * EmailJS를 통한 이메일 발송
 * @param toEmail 받는 사람 이메일
 * @param verificationCode 인증번호
 * @returns
 */
export const sendEmailWithEmailJS = async (
    toEmail: string,
    verificationCode: string
): Promise<void> => {
    console.log(`[sendEmailWithEmailJS] EmailJS로 이메일 발송 시작. To: ${toEmail}, Code: ${verificationCode}`);
    
    // .env 파일에서 EmailJS 관련 키들을 가져옵니다.
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    console.log(`[sendEmailWithEmailJS] EmailJS 환경 변수 - ServiceID: ${serviceID}, TemplateID: ${templateID ? 'Loaded' : 'Not Loaded'}, PublicKey: ${publicKey ? 'Loaded' : 'Not Loaded'}`);

    if (!templateID || !publicKey) {
        console.error("EmailJS 환경 변수가 설정되지 않았습니다.");
        throw new Error("이메일 서비스 설정이 올바르지 않습니다.");
    }

    // EmailJS 템플릿에서 사용하는 표준 변수명들 사용
    // 공식 문서와 예제에 따라 일반적인 변수명 사용
    const templateParams = {
        to_name: toEmail.split('@')[0],    // 받는 사람 이름
        to_email: toEmail,                 // 받는 사람 이메일
        from_name: 'RiskView',             // 보내는 사람/서비스 이름
        message: `안녕하세요!\n\n이메일 인증을 위한 인증번호를 발송드립니다.\n\n인증번호: ${verificationCode}\n\n감사합니다.`,
        verification_code: verificationCode, // 인증번호
    };

    console.log('[sendEmailWithEmailJS] EmailJS 템플릿 파라미터:', templateParams);

    try {
        // emailjs.send() 메서드 사용 (공식 권장 방법)
        const result = await emailjs.send(serviceID, templateID, templateParams, publicKey);
        console.log(`[sendEmailWithEmailJS] EmailJS를 통해 ${toEmail}로 이메일 발송 성공!`, result);
    } catch (error) {
        console.error('[sendEmailWithEmailJS] EmailJS 이메일 발송 실패:', error);
        
        // 더 구체적인 오류 메시지 제공
        if (error && typeof error === 'object' && 'text' in error) {
            const errorText = (error as any).text;
            if (errorText.includes('recipients address is empty')) {
                throw new Error('받는 사람 이메일 주소가 올바르지 않습니다. EmailJS 템플릿의 변수명을 확인해주세요.');
            } else if (errorText.includes('template')) {
                throw new Error('EmailJS 템플릿 설정을 확인해주세요.');
            } else if (errorText.includes('service')) {
                throw new Error('EmailJS 서비스 설정을 확인해주세요.');
            }
            throw new Error(`이메일 발송 실패: ${errorText}`);
        }
        
        throw new Error('EmailJS를 통한 이메일 발송에 실패했습니다.');
    }
};

/**
 * 통합 이메일 인증 프로세스
 * 1. 백엔드에서 인증코드와 토큰 생성
 * 2. EmailJS로 이메일 발송
 * @param email 인증할 이메일
 * @param endpoint API 엔드포인트
 * @param additionalData 추가 데이터
 * @returns token 반환 (쿠키는 백엔드에서 자동 설정)
 */
export const sendVerificationEmail = async (
    email: string, 
    endpoint: string, 
    additionalData?: { userId?: string }
): Promise<string> => {
    try {
        // 1. 백엔드에서 인증코드와 토큰 생성
        const { code, token } = await requestVerificationCode(email, endpoint, additionalData);
        
        // 2. EmailJS로 이메일 발송
        await sendEmailWithEmailJS(email, code);
        
        // 3. 토큰 반환 (필요시 쿠키 설정은 백엔드에서 이미 처리됨)
        return token;
    } catch (error) {
        console.error('[sendVerificationEmail] 통합 인증 프로세스 오류:', error);
        throw error;
    }
};

/**
 * 이메일 인증코드 일치 확인
 * @param email 입력받은 이메일
 * @param code 인증코드 일치를 위한 코드
 * @param token 인증 토큰 (선택사항)
 * @returns
 */
export const verifyEmailCode = async (email: string, code: string) => {
    console.log(`[verifyEmailCode] 이메일 코드 검증 요청. Email: ${email}, Code: ${code}`);
    try {
        const res = await apiRequest<{ code?: string; message?: string }>({
            url: "/api/verify-email-code",
            method: "POST",
            data: { email, code },
            withCredentials: true, // 쿠키 포함
        });
        console.log("[verifyEmailCode] 이메일 코드 검증 응답:", res.data);
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