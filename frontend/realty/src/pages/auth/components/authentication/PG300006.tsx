import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast";
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
  // useToast 훅 사용
  const { toast, showToast } = useToast(); // toast 상태도 가져오기
  // 비밀번호 관련 상태
  const [password, setPassword] = useState(""); // 사용자가 입력한 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 입력값
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 입력란 표시/숨김 상태
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인란 표시/숨김 상태

  // 아이디 관련 상태
  const [username, setUsername] = useState(""); // 사용자가 입력한 아이디
  const [usernameError, setUsernameError] = useState(""); // 아이디 유효성 검사 오류 메시지
  const [usernameSuccessMessage, setUsernameSuccessMessage] = useState(""); // 아이디 사용 가능 메시지

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
   * 아이디 중복 확인 함수
   * 입력된 아이디의 중복 여부를 확인
   * 현재는 테스트용 로직이며, 추후 백엔드 API와 연동 예정
   *
   * @param usernameToCheck - 중복 여부를 확인할 아이디 문자열
   */
  const handleUsernameCheck = async (usernameToCheck: string) => {
    if (!usernameToCheck.trim()) {
      showToast("아이디를 입력해주세요.", { type: "error" });
      setUsernameSuccessMessage("");
      return;
    }

    try {
      if (usernameToCheck === "debugging") {
        showToast("이미 사용 중인 아이디입니다.", { type: "error" });
        setUsernameError("이미 사용 중인 아이디입니다.");
        setUsernameSuccessMessage("");
      } else {
        setUsernameError("");
        showToast("사용 가능한 아이디입니다.", { type: "success" });
        setUsernameSuccessMessage("");
      }
    } catch (error) {
      setUsernameError("아이디 확인 중 오류가 발생했습니다.");
      setUsernameSuccessMessage("");
    }
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
      showToast("닉네임을 입력해주세요.", { type: "error" });
      setNicknameSuccessMessage("");
      return;
    }

    try {
      // 실제 API가 구현되면 아래 코드 사용
      // const response = await axios.get(`/api/check-nickname?nickname=${nicknameToCheck}`);
      // if (response.data.isAvailable) {

      // 임시 테스트 로직 - "debugging"은 중복으로 처리
      if (nicknameToCheck === "debugging") {
        showToast("이미 사용 중인 닉네임입니다.", { type: "error" });
        setNicknameError("이미 사용 중인 닉네임입니다.");
        setNicknameSuccessMessage("");
      } else {
        setNicknameError(""); // 사용 가능한 닉네임
        showToast("사용 가능한 닉네임입니다.", { type: "success" });
        setNicknameSuccessMessage("");
      }
    } catch (error) {
      setNicknameError("닉네임 확인 중 오류가 발생했습니다.");
      setNicknameSuccessMessage("");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (username.trim()) {
        handleUsernameCheck(username);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (nickname.trim()) {
        handleNicknameCheck(nickname);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [nickname]);

  /**
   * 비밀번호와 비밀번호 확인이 일치하지 않을 경우 또는 일치할 경우 토스트 메시지를 표시 (디바운스 적용)
   * 사용자가 비밀번호 확인 입력 중 실수하거나 정확하게 입력했을 때 즉시 피드백을 줌
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (confirmPassword && password) {
        if (confirmPassword !== password) {
          showToast("비밀번호가 일치하지 않습니다.", { type: "error" });
        } else {
          showToast("비밀번호가 일치합니다.", { type: "success" });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [confirmPassword, password]);

  /**
   * 비밀번호 유효성 검사 함수
   * @returns boolean - 유효하면 true, 아니면 false
   */
  const isPasswordValid = (): boolean => {
    if (password.length < 6) {
      showToast("비밀번호는 최소 6자 이상이어야 합니다.", { type: "error" });
      return false;
    }
    if (confirmPassword !== password) {
      showToast("비밀번호가 일치하지 않습니다.", { type: "error" });
      return false;
    }
    return true;
  };

  /**
   * 닉네임 유효성 검사 함수
   * @returns boolean - 유효하면 true, 아니면 false
   */
  const isNicknameValid = (): boolean => {
    if (!nickname.trim()) {
      showToast("닉네임을 입력해주세요.", { type: "error" });
      return false;
    }
    if (nicknameError) {
      return false;
    }
    return true;
  };

  /**
   * 아이디 유효성 검사 함수
   * @returns boolean - 유효하면 true, 아니면 false
   */
  const isUsernameValid = (): boolean => {
    if (!username.trim()) {
      showToast("아이디를 입력해주세요.", { type: "error" });
      return false;
    }
    if (usernameError) {
      return false;
    }
    return true;
  };

  /**
   * 폼 제출 처리 핸들러
   * @param e 폼 이벤트 객체
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validPassword = isPasswordValid();
    const validNickname = isNicknameValid();
    const validUsername = isUsernameValid();

    if (validPassword && validNickname && validUsername) {
      // 모든 조건 통과 시 다음 페이지로 이동
      console.log("폼 제출 완료:", { email: userEmail, password, nickname, username });
      onNext();
    }
  };

  const nicknameStatus = nickname
    ? nicknameError
      ? "error"
      : "success"
    : "";

  const usernameStatus = username
    ? usernameError
      ? "error"
      : "success"
    : "";

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
              style={{
                backgroundColor: "#d9d9d9",
                color: "#828282",
                userSelect: "none",
              }}
              onMouseDown={(e) => e.preventDefault()} // 드래그 차단
            />
          </div>

          {/* 아이디 입력 필드 */}
          <div className="authFormRow">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              className="authInput"
            />
            {/**
             * 아이디 중복 여부를 시각적으로 표시하는 아이콘
             * - 중복 확인 완료 && 사용 가능: 초록색 (success 클래스)
             * - 중복 확인 완료 && 사용 불가: 빨간색 (error 클래스)
             */}
            <span className={`input-check-icon ${usernameStatus}`}>
              <FiCheckCircle />
            </span>
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
            <span className={`input-check-icon ${nicknameStatus}`}>
              <FiCheckCircle />
            </span>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="authButton"
            disabled={
              !!nicknameError ||
              !nickname.trim() ||
              !!usernameError ||
              !username.trim() ||
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
      {/* 토스트 컴포넌트 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
    </div>
  );
};

export default PG300006;
