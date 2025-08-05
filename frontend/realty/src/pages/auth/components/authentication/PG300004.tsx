import React, { useState } from "react";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";

// Signup_EmailInputComponent : 이메일 인증 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
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
  // 이메일 유효성 검사용 에러 메시지 상태
  const [emailError, setEmailError] = useState("");

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
   * 인증 메일 전송 버튼 클릭 핸들러
   * 입력된 이메일의 유효성을 검사하고, 통과하면 다음 단계로 진행
   * 실패 시 오류 메시지를 표시
   */
  const handleSendEmail = () => {
    const cleanedEmail = email.replace(/\s+/g, "");
    setEmail(cleanedEmail); // 이메일 상태 업데이트

    // 이메일 입력 여부 확인
    if (!cleanedEmail) {
      showToast("이메일을 입력해주세요.", { type: "error" });
    } else if (!validateEmail(cleanedEmail)) {
      showToast("유효한 이메일 주소를 입력해주세요.", { type: "error" });
    } else {
      setEmailError("");
      // TODO: 백엔드 API를 통한 실제 인증 메일 전송 구현 예정
      onNext(cleanedEmail); // 이메일을 부모 컴포넌트에 전달
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
          />
        </div>

        {/* 이메일 유효성 검사 오류 메시지 표시 */}
        {emailError && <p className="authError">{emailError}</p>}

        {/* 인증 메일 전송 버튼 */}
        <button className="authButton" onClick={handleSendEmail}>
          인증 메일 전송
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
