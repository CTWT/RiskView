import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Toast from "../../../../components/ui/Toast";
import useToast from "../../../../hooks/useToast";
import "../../../../styles/common/common.css";
import PageContainer from "../../../../components/layout/PageContainer";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.08.08
 * 파일명 : PG300008.tsx
 */

// 부모로부터 로그인 이동, 비밀번호 찾기 이동 콜백을 props로 받음
interface PG300008Props {
  onLogin: () => void;
  onFindPassword?: () => void; // 비밀번호 찾기로 이동하는 콜백 추가
}

/**
 * 아이디 찾기 컴포넌트
 * 사용자의 이름과 이메일을 입력받아 아이디를 찾는 페이지
 * 
 * @param props - 컴포넌트 props
 * @param props.onLogin - 로그인 페이지로 돌아가는 콜백 함수
 * @param props.onFindPassword - 비밀번호 찾기 페이지로 이동하는 콜백 함수
 * @returns JSX.Element - 아이디 찾기 폼 UI
 */
const PG300008: React.FC<PG300008Props> = ({ onLogin, onFindPassword }) => {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // 상태 관리
  // 이름 입력값 (한글만 허용)
  const [name, setName] = useState("");
  // 이메일 입력값
  const [email, setEmail] = useState("");
  // 찾은 아이디 결과 문자열 (성공/실패/오류 메시지)
  const [foundId, setFoundId] = useState("");
  // API 호출 진행 여부 (로딩 상태)
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 이름 유효성 검사 함수 (한글만 허용)
   * @param name - 검사할 이름 문자열
   * @returns boolean - 한글이면 true, 아니면 false
   */
  const validateName = (name: string): boolean => {
    const koreanRegex = /^[가-힣\s]+$/;
    return koreanRegex.test(name);
  };

  /**
   * 아이디 찾기 처리 함수
   * @description 입력된 이름과 이메일을 검증 후, 서버에 아이디 찾기 요청을 보냄
   * @returns Promise<void>
   */
  const handleFindId = async () => {
    // 입력값 검증
    if (!name.trim()) {
      showToast("이름을 입력해주세요.", { type: "error" });
      return;
    }

    // 한글 이름 검증
    if (!validateName(name.trim())) {
      showToast("이름은 한글로만 입력해주세요.", { type: "error" });
      return;
    }

    if (!email.trim()) {
      showToast("이메일을 입력해주세요.", { type: "error" });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      showToast("올바른 이메일 형식을 입력해주세요.", { type: "error" });
      return;
    }

    setIsLoading(true);
    setFoundId("");

    try {
      // TODO: 실제 API 호출로 교체 필요
      const response = await fetch("/api/forgot_id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setFoundId(data.userId);
        showToast("아이디를 찾았습니다!", { type: "success" });
      } else {
        setFoundId("일치하는 아이디가 없습니다.");
        showToast("입력하신 정보와 일치하는 계정이 없습니다.", {
          type: "error",
        });
      }
    } catch (error) {
      console.error("아이디 찾기 오류:", error);
      setFoundId("오류가 발생했습니다.");
      showToast("오류가 발생했습니다. 다시 시도해주세요.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 이름 입력 변경 핸들러
   * @param e React.ChangeEvent<HTMLInputElement>
   * @description 이름 입력값을 상태에 반영하고, 영문/숫자 입력 시 토스트 메시지를 띄움
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setName(inputValue);

    // 영문이나 숫자가 포함된 경우 토스트 표시 (실시간)
    const hasEnglishOrNumber = /[a-zA-Z0-9]/.test(inputValue);
    if (hasEnglishOrNumber && inputValue.length > 0) {
      showToast("이름은 한글로만 입력해주세요.", { type: "error" });
    }
  };

  /**
   * 비밀번호 찾기 버튼 클릭 핸들러
   * @description 비밀번호 찾기 콜백이 있으면 실행, 없으면 직접 페이지 이동
   */
  const handleFindPasswordClick = () => {
    if (onFindPassword) {
      onFindPassword();
    } else {
      // 폴백: 직접 네비게이션 (기존 코드와의 호환성)
      navigate("/pg/PG300009");
    }
  };

  /**
   * 폼 제출 핸들러
   * @param e React.FormEvent
   * @description 폼 제출 시 아이디 찾기 로직 실행, 기본 제출 동작 방지
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFindId();
  };

  return (
    <PageContainer showBreadcrumb={false} centerContent={true}>
      <div className="authWrapper">
        <div className="authContainer">
          {/* 로그인으로 돌아가기 버튼 */}
          <p onClick={onLogin} className="backToLogin">
            <FiChevronLeft />
            로그인으로 돌아가기
          </p>

          {/* 페이지 제목 */}
          <h1 className="authTitle">아이디 찾기</h1>

          {/* 설명 텍스트 */}
          <p className="authDescription">
            가입 시 입력한 정보로 이메일을 찾을 수 있습니다
          </p>

          {/* 입력 폼 */}
          <form onSubmit={handleSubmit}>
            {/* 이름 입력 */}
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={handleNameChange}
              className="authInput"
              disabled={isLoading}
            />

            {/* 이메일 입력 */}
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="authInput"
              disabled={isLoading}
            />

            {/* 아이디 찾기 버튼 */}
            <button type="submit" className="authButton" disabled={isLoading}>
              {isLoading ? "찾는 중..." : "아이디 찾기"}
            </button>

            {/* 찾은 아이디 결과 표시 */}
            {foundId && (
              <div
                className={`resultMessageContainer ${
                  foundId.includes("오류") || foundId.includes("없습니다")
                    ? "error"
                    : "success"
                }`}
              >
                <p
                  className={`resultMessageText ${
                    foundId.includes("오류") || foundId.includes("없습니다")
                      ? "error"
                      : "success"
                  }`}
                >
                  {foundId.includes("오류") || foundId.includes("없습니다")
                    ? foundId
                    : `찾은 아이디: ${foundId}`}
                </p>
              </div>
            )}

            {/* 비밀번호 찾기 링크 */}
            <div className="authLinkSection">
              <span className="authLinkText">비밀번호를 잊으셨나요? </span>
              <button
                type="button"
                onClick={handleFindPasswordClick}
                className="authLinkButton"
              >
                비밀번호 찾기
              </button>
            </div>
          </form>

          {/* 토스트 컴포넌트 */}
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

export default PG300008;