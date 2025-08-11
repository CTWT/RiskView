import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiCheck } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast";
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import PageContainer from "../../../../components/layout/PageContainer";

// 비밀번호 찾기 - 인증번호 입력 페이지 컴포넌트


/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.08.08
 * 파일명 : PG300010.tsx
 */

/**
 * PG300010 Props 인터페이스
 * @interface PG300010Props
 * @param {string} userId - 사용자 아이디
 * @param {string} email - 인증번호가 전송된 이메일 주소
 * @param {function} onLogin - 로그인 페이지로 이동하는 콜백 함수
 * @param {function} onPasswordReset - 인증 성공 후 비밀번호 재설정 페이지로 이동하는 콜백 함수
 */

interface PG300010Props {
  userId: string;
  email: string;
  onLogin: () => void;
  onPasswordReset: (userId: string) => void;
}

/**
 * 인증번호 입력 컴포넌트 (PG300010)
 * 이메일로 전송된 인증번호를 입력받아 검증하는 페이지
 * - 인증번호 입력 및 검증
 * - 3분 타이머 관리
 * - 인증번호 재전송 기능
 * - 인증 성공 시 PG300011(비밀번호 재설정)로 이동
 *
 * @param {PG300010Props} props - 컴포넌트 props
 * @returns {JSX.Element} - 인증번호 입력 폼 UI 컴포넌트
 */
const PG300010: React.FC<PG300010Props> = ({
  userId,
  email,
  onLogin,
  onPasswordReset,
}) => {

  // 커스텀 훅 초기화
  const { toast, showToast } = useToast();


  // 상태 관리
  /** 사용자 입력 인증번호 상태 */
  const [verificationCode, setVerificationCode] = useState<string>("");

  /** 로딩 상태 관리 */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** 인증번호 유효 시간 (3분 = 180초) */
  const [timeLeft, setTimeLeft] = useState<number>(180);

  /** 타이머 만료 여부 */
  const isExpired = timeLeft <= 0;

  // 임시 목업 데이터 (백엔드 연동 전 테스트용)
  /** 임시 인증번호 - 실제로는 백엔드에서 생성 및 전송 */
  const mockVerificationCode = "123456";


  // 타이머 관리 Effect
  /**
   * 인증번호 타이머 관리
   * 1초마다 남은 시간을 감소시킴
   */
  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isExpired]);


  // 이벤트 핸들러 함수들
  /**
   * 인증번호 확인 처리 함수 (목업 모드)
   * 입력받은 인증번호를 목업 데이터와 비교하여 검증
   */
  const handleVerifyCode = async () => {
    // 입력값 검증
    if (!verificationCode.trim()) {
      showToast("인증번호를 입력해주세요.", { type: "error" });
      return;
    }

    setIsLoading(true);

    // 목업 데이터 검증 (네트워크 요청 없음)
    setTimeout(() => {
      try {
        // 목업 인증번호와 비교
        if (verificationCode.trim() === mockVerificationCode) {
          // 성공: 인증번호 확인 완료, PG300011로 이동
          showToast("인증이 완료되었습니다.", { type: "success" });

          // 비밀번호 재설정 페이지로 이동
          setTimeout(() => {
            onPasswordReset(userId);
          }, 1000);
        } else {
          // 실패: 인증번호 불일치
          showToast("인증번호가 일치하지 않습니다.", { type: "error" });
        }
      } catch (error) {
        console.error("목업 인증번호 확인 오류:", error);
        showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1초 로딩 시뮬레이션
  };

  /**
   * 인증번호 재전송 핸들러
   */
  const handleResendCode = () => {
    setVerificationCode("");
    setTimeLeft(180);
    showToast("인증번호가 다시 전송되었습니다.", { type: "success" });
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode();
  };


  // JSX 렌더링
  return (
    <PageContainer showBreadcrumb={false} centerContent={true}>
      <div className="authWrapper">
        <div className="authContainer">

          {/* 로그인으로 돌아가기 버튼 */}
          <p onClick={onLogin} className="backToLogin">
            <FiChevronLeft />
            로그인으로 돌아가기
          </p>

          {/* 단계 표시 아이콘 */}
          <div className="progressContainer">
            {/* 완료 아이콘 */}
            <div className="progressCompleted"><FiCheck /></div>

            {/* 연결선 */}
            <div className="progressConnector"></div>

            {/* 완료 전 아이콘 */}
            <div className="progressBefore">2</div>
          </div>

          {/* 페이지 제목 */}
          <h1 className="authTitle">비밀번호 찾기</h1>

          {/* 설명 텍스트 */}
          <p className="authDescription">{email}으로 메일이 전송되었습니다.</p>

          {/* 임시 데모 안내 */}
          <div
            style={{
              backgroundColor: "#e3f2fd",
              border: "1px solid #90caf9",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: "0", fontWeight: "bold", color: "#1565c0" }}>
              🧪 테스트 인증번호: <strong>123456</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 인증번호 입력 필드와 타이머 */}
            <div className="authInputWrapper">
              <input
                className="authCodeInput"
                type="text"
                placeholder="인증번호"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isExpired || isLoading}
              />

              {/* 남은 시간 표시 */}
              {!isExpired && (
                <span className="authTimerInside">
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </span>
              )}
            </div>

            {/* 조건부 버튼 렌더링 */}
            {isExpired ? (
              <button
                type="button"
                className="authResendButton"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                {isLoading
                  ? "전송 중..."
                  : "인증번호를 받지 못하셨나요? 재발송"}
              </button>
            ) : (
              <button
                type="submit"
                className="authButton"
                disabled={isExpired || isLoading}
              >
                {isLoading ? "확인 중..." : "확인"}
              </button>
            )}
          </form>

          {/* 토스트 메시지 컴포넌트 */}

          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default PG300010;
