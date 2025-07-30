import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import "../../../../styles/common/common.css";

// Signup_InfoInputPage: 비밀번호 및 닉네임 설정 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.07.29
 * 파일명 : PG300006.tsx
 */

interface PG300006Props {
  onNext: () => void;
  userEmail: string; // 부모 컴포넌트에서 전달받은 이메일
  onLogin: () => void; // 로그인으로 돌아가는 함수
}

/**
 * 회원정보 입력 컴포넌트 (비밀번호 및 닉네임 설정)
 * 사용자의 비밀번호와 닉네임을 입력받아 유효성 검사 수행,
 * 닉네임 중복 확인 후 모든 검증이 완료되면 다음 단계로 진행.
 * 
 * @param props - 컴포넌트 props
 * @param props.onNext - 회원정보 입력 완료 후 다음 단계(추가정보 입력)로 진행하는 콜백 함수
 * @param props.userEmail - 이메일 인증 단계에서 검증된 사용자 이메일 주소 (읽기 전용으로 표시)
 * @param props.onLogin - 로그인 페이지로 돌아가는 콜백 함수
 * @returns JSX.Element - 이메일(읽기전용), 비밀번호, 닉네임 입력 폼이 포함된 UI 컴포넌트
 */
const PG300006: React.FC<PG300006Props> = ({ onNext, userEmail, onLogin }) => {
  // 비밀번호 관련 상태
  const [password, setPassword] = useState(""); // 사용자가 입력한 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 입력값
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 입력란 표시/숨김 상태
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인란 표시/숨김 상태
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 유효성 검사 오류 메시지
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // 비밀번호 확인 오류 메시지

  // 닉네임 관련 상태
  const [nickname, setNickname] = useState(""); // 사용자가 입력한 닉네임
  const [nicknameError, setNicknameError] = useState(""); // 닉네임 유효성 검사 오류 메시지
  const [nicknameSuccessMessage, setNicknameSuccessMessage] = useState(""); // 닉네임 사용 가능 메시지 (현재 미사용)

  /**
   * 비밀번호 보기/숨기기 토글 핸들러
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * 닉네임 중복 확인 함수
   * 입력된 닉네임의 중복 여부를 확인
   * 현재는 테스트용 로직이며, 추후 백엔드 API와 연동 예정
   *
   * @param nicknameToCheck - 중복 여부를 확인할 닉네임 문자열
   */
  const handleNicknameCheck = async (nicknameToCheck: string) => {
    // 닉네임 입력 여부 확인
    if (!nicknameToCheck.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      setNicknameSuccessMessage("");
      return;
    }

    try {
      // 실제 API가 구현되면 아래 코드 사용
      // const response = await axios.get(`/api/check-nickname?nickname=${nicknameToCheck}`);
      // if (response.data.isAvailable) {

      // 임시 테스트 로직 - "debugging"은 중복으로 처리
      if (nicknameToCheck === "debugging") {
        setNicknameError("이미 사용 중인 닉네임입니다.");
        setNicknameSuccessMessage("");
      } else {
        setNicknameError(""); // 사용 가능한 닉네임
        setNicknameSuccessMessage("");
      }
    } catch (error) {
      setNicknameError("닉네임 확인 중 오류가 발생했습니다.");
      setNicknameSuccessMessage("");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (nickname.trim()) {
        handleNicknameCheck(nickname);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [nickname]);

  /**
   * 폼 제출 처리 핸들러
   * @param e 폼 이벤트 객체
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    // 비밀번호 유효성 검사 (6자 이상)
    if (password.length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.");
      valid = false;
    } else {
      setPasswordError("");
    }

    // 비밀번호 확인이 일치하는지 검사
    if (confirmPassword !== password) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    // 닉네임이 입력되었는지 검사
    if (!nickname.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      valid = false;
    } else if (nicknameError) {
      // 닉네임 중복 에러가 있으면 폼 제출 불가
      valid = false;
    } else {
      setNicknameError("");
    }

    if (valid) {
      // 모든 조건 통과 시 다음 페이지로 이동
      console.log("폼 제출 완료:", { email: userEmail, password, nickname });
      onNext();
    }
  };

  /**
   * 사용자 비밀번호 및 닉네임 입력 폼
   * - 이메일은 인증 후 읽기 전용 필드로 설정됨
   * - 입력 검증 후 다음 단계(PG300007)로 이동
   */
  return (
    <div className="authWrapper">
      <div className="authContainer">
        {/* 서비스 로고 및 제목 */}
        <h1 className="authlogo">Risk-View</h1>
        <p className="authSubtitle">Team. Debugging Monster</p>
        <p className="authwelcome">사용자 정보 입력</p>

        {/* 회원정보 입력 폼 */}
        <form className="authForm" onSubmit={handleSubmit}>
          {/* 이메일 필드 (읽기 전용) */}
          <div className="authFormRow">
            <input
              type="email"
              value={userEmail}
              readOnly
              className="authInput"
              style={{ backgroundColor: "#d9d9d9", color: "#828282" }}
            />
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="authPasswordInputWrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="authInput"
            />
            <span
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {passwordError && <p className="authError">{passwordError}</p>}

          {/* 비밀번호 확인 입력 필드 */}
          <div className="authPasswordInputWrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              className="authInput"
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {confirmPasswordError && (
            <p className="authError">{confirmPasswordError}</p>
          )}

          {/* 닉네임 입력 필드 */}
          <div className="authPasswordInputWrapper">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
              className="authInput"
            />

            {/**
             * 닉네임 중복 여부를 시각적으로 표시하는 아이콘
             * - 중복 확인 완료 && 사용 가능: 초록색 (success 클래스)
             * - 중복 확인 완료 && 사용 불가: 빨간색 (error 클래스)
             */}
            <span
              className={`nickname-check-icon ${
                nickname && !nicknameError
                  ? "success"
                  : nicknameError
                  ? "error"
                  : ""
              }`}
            >
              <FiCheckCircle />
            </span>
          </div>
          {/* 닉네임 또는 비밀번호 확인 오류 메시지 */}
          {(nicknameError ||
            (confirmPassword && password && confirmPassword !== password)) && (
            <p className="authError">
              {nicknameError ? nicknameError : "비밀번호가 일치하지 않습니다."}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="authButton"
            disabled={
              !!nicknameError ||
              !nickname.trim() ||
              password.length < 6 ||
              confirmPassword !== password
            }
          >
            다음
          </button>

          {/* 구분선 */}
          <div className="authDividerWrapper">
            <div className="authDivider">
              <span className="authDividerText">또는</span>
            </div>
          </div>

          {/* 로그인 페이지로 이동 */}
          <p className="authPrompt">
            이미 계정이 있으신가요?
            <button type="button" onClick={onLogin} className="authLink">
              로그인
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PG300006;
