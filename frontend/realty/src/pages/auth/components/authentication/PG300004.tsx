import React, { useState } from "react";
import axios from "axios";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";

// Signup_EmailInputComponent : 이메일 인증 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 : 박윤성
 * 작성일 : 25.07.28
 * 파일명 : PG300004.tsx
 */

interface PG300004Props {
  onNext: (email: string) => void; // 이메일을 매개변수로 받도록 수정
}

/**
 * 이메일 인증 시작 컴포넌트
 * 사용자로부터 이메일 주소를 입력받고 유효성 검사를 수행한 후,
 * 인증 메일 전송 단계로 진행
 * 
 * @param props - 컴포넌트 props
 * @param props.onNext - 이메일 검증 완료 후 다음 단계로 진행하는 콜백 함수 (이메일 주소를 매개변수로 전달)
 * @returns JSX.Element - 이메일 입력 폼과 유효성 검사가 포함된 UI 컴포넌트
 */

const PG300004: React.FC<PG300004Props> = ({ onNext }) => {
  // useToast 훅 사용
  const { toast, showToast} = useToast(); // toast 상태도 가져오기

  // 사용자 입력 이메일 상태
  const [email, setEmail] = useState("");
  // 인증메일 전송 중인지에 대한 여부
  const [isLoading, setIsLoading] = useState(false);


  /**
   * 이메일 주소 유효성 검사 함수
   * 정규식을 사용하여 이메일 형식의 유효성을 확인
   *
   * @param email - 검사할 이메일 주소 문자열
   * @returns boolean - 유효한 이메일 형식이면 true, 아니면 false
   */
  const validateEmail = (email: string): boolean => {
    const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return regex.test(email);
  };

  /**
   * 이메일 중복 확인
   * 
   * @param email 이메일 주소
   * @returns Promise<boolean> - 중복 여부
   */
  const checkEmailDuplicate = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.get(
        `/api/user/check-email/${encodeURIComponent(email)}`,
        {
          withCredentials: true,
        }
      );
      return response.data.available; // true: 사용 가능, false: 중복
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "이메일 중복 확인 중 오류가 발생했습니다.");
      }
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  };

  /**
   * 인증 메일 전송 버튼 클릭 핸들러
   * 입력된 이메일의 유효성을 검사하고, 통과하면 다음 단계로 진행
   * 실패 시 오류 메시지를 표시
   */
  const handleSendEmail = async () => {
    // 공백과 스페이스 제거
    const cleanedEmail = email.replace(/\s+/g, "");
    // 이메일 상태 업데이트
    setEmail(cleanedEmail);
  
    // 이메일 입력 여부 확인
    if (!cleanedEmail) {
      showToast("이메일을 입력해주세요.", { type: "error" });
      return;
    }

    // 이메일 유효성 검사
    if (!validateEmail(cleanedEmail)) {
      showToast("유효한 이메일 주소를 입력해주세요.", { type: "error" });
      return;
    }

    // 인증메일 전송 상태 업데이트
    setIsLoading(true);

    try {
      // 이메일 중복 확인
      const isEmailAvailable = await checkEmailDuplicate(cleanedEmail);
      
      if (!isEmailAvailable) {
        showToast("이미 사용 중인 이메일 주소입니다. 다른 이메일을 입력해주세요.", { type: "error" });
        // 인증메일 전송 상태 업데이트
        setIsLoading(false);
        return;
      }

      // 백엔드에 이메일 인증코드 발송 요청
      const response = await axios.post(
        "/api/send-verification-email-code",
      {
        // JSON 형식으로 입력한 이메일 주소 전달
        email: cleanedEmail,
      },
      {
        // 쿠키 포함
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json', // JSON 데이터 형식으로 명시
        },
      });
      // 성공 응답이 왔다면
      if (response.status === 200) {
        // 응답 메시지에서 메시지 추출
        const { message } = response.data;
        // 성공 메시지 표시
        showToast(message || "인증 메일이 전송되었습니다!", { type: "success" });
        // 입력한 이메일 주소를 가지고 다음 단계로 이동
        onNext(cleanedEmail);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "처리 중 오류가 발생했습니다.";
        showToast(errorMessage, { type: "error" });
      } else {
        const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
        showToast(errorMessage, { type: "error" });
      }
    } finally {
      // 인증메일 전송 상태 업데이트
      setIsLoading(false);
    }
  };

  return (
    <div className="authWrapper">
      <div className="authContainer">
        {/* 서비스 로고 및 제목 */}
        <h1 className="authlogo">Risk-View</h1>
        <p className="authSubtitle">Team. Debugging Monster</p>

        {/* 안내 메시지 */}
        <p className="authwelcome">이메일 인증부터 시작해보세요</p>

        {/* 이메일 입력 필드 */}
        <div className="authFormRow">
          <input
            className="authInput"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading} // 인증메일 전송 중이면 입력 비활성화
          />
        </div>

        {/* 인증 메일 전송 버튼 */}
        <button 
          className={`authButton ${isLoading ? "loading" : ""}`}
          onClick={handleSendEmail}
          disabled={isLoading} // 인증메일 전송 중이면 버튼 비활성화
        >
          {isLoading ? "인증 메일 전송 중..." : "인증 메일 전송"}
        </button>
      </div>
      {/* 토스트 컴포넌트 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
    </div>
  );
};

export default PG300004;
