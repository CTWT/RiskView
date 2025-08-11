import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../styles/common/common.css";
import axios from "axios";
import useToast from "../../../../hooks/useToast";
import Toast from "../../../../components/ui/Toast";
import PageContainer from "../../../../components/layout/PageContainer";

// Login Component : 로그인 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.07.23
 * 파일명 : PG300002.tsx
 */

interface PG300002Props {
  // 회원가입 시작 함수 호출용 콜백
  onSignUpStart: () => void;
  // 아이디 찾기 버튼 클릭 시 호출되는 함수
  onFindIdClick: () => void;
  // 비밀번호 찾기 버튼 클릭 시 호출되는 선택적 함수
  onFindPasswordClick?: () => void; // 비밀번호 찾기 콜백 추가
}

/**
 * 로그인 컴포넌트
 * 사용자로부터 아이디(이메일)와 비밀번호를 입력받아 로그인 요청을 수행하며,
 * 회원가입 및 아이디/비밀번호 찾기 페이지로의 이동 기능을 포함함.
 *
 * @param props - 컴포넌트 props
 * @param props.onSignUpStart - 회원가입 버튼 클릭 시 호출되는 함수
 * @param props.onFindIdClick - 아이디 찾기 버튼 클릭 시 호출되는 함수
 * @param props.onFindPasswordClick - 비밀번호 찾기 버튼 클릭 시 호출되는 함수 (선택적)
 * @returns JSX.Element - 로그인 폼 UI 및 관련 기능 포함 컴포넌트
 */
const PG300002: React.FC<PG300002Props> = ({
  onSignUpStart,
  onFindIdClick,
  onFindPasswordClick,
}) => {
  // 컴포넌트가 마운트될 때 한 번 실행되는 useEffect
  useEffect(() => {
    console.log("PG300002 mounted - 로그인 컴포넌트 렌더링됨");
  }, []);

  /**
   * 상태 관리 영역
   */
  // 사용자 입력 이메일 (아이디)
  const [email, setEmail] = useState<string>("");
  // 사용자 입력 비밀번호
  const [password, setPassword] = useState<string>("");
  // react-router-dom의 네비게이션 훅으로 페이지 이동 제어
  const navigate = useNavigate();

  // 커스텀 훅을 사용하여 토스트 메시지 상태 및 표시 함수 획득
  const { toast, showToast } = useToast();

  /**
   * 로그인 폼 제출 이벤트 핸들러
   * - 입력값 유효성 검사 수행
   * - axios를 통해 로그인 API 호출
   * - 성공 시 메인 페이지로 이동
   * - 실패 시 적절한 에러 메시지 토스트로 표시
   *
   * @param e React.FormEvent - 폼 제출 이벤트 객체
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이메일과 비밀번호가 모두 비어있으면 에러 메시지 출력 후 종료
    if (!email && !password) {
      showToast("아이디와 비밀번호를 모두 입력해주세요.", { type: "error" });
      return;
    }

    // 이메일이 비어있으면 에러 메시지 출력 후 종료
    if (!email) {
      showToast("아이디를 입력해주세요.", { type: "error" });
      return;
    }

    // 비밀번호가 비어있으면 에러 메시지 출력 후 종료
    if (!password) {
      showToast("비밀번호를 입력해주세요.", { type: "error" });
      return;
    }

    try {
      // 로그인 API 호출, 성공 시 토큰 반환 예상
      const res = await axios.post<{ token: string }>("/api/login", {
        email,
        password,
      });
      // HTTP 상태 코드 200이면 로그인 성공으로 간주하고 메인 페이지로 이동
      if (res.status === 200) {
        console.log("로그인 성공 - 메인 페이지로 이동");
        navigate("/"); // 메인 페이지 경로로 이동
      }
    } catch (err: unknown) {
      // axios 오류인지 확인 후 적절한 토스트 메시지 표시
      if (axios.isAxiosError(err)) {
        showToast("아이디 또는 비밀번호가 올바르지 않습니다.", {
          type: "error",
        });
      } else {
        // 네트워크 오류 등 예기치 못한 오류 처리
        showToast("예기치 않은 오류가 발생했습니다.", { type: "error" });
      }
    }
  };

  /**
   * 회원가입 버튼 클릭 핸들러
   * 부모 컴포넌트로부터 전달받은 onSignUpStart 콜백 호출
   */
  const handleSignUpClick = () => {
    console.log("회원가입 버튼 클릭됨");
    onSignUpStart();
  };

  /**
   * 비밀번호 찾기 버튼 클릭 핸들러
   * - onFindPasswordClick 콜백이 있으면 호출
   * - 없으면 기본 경로로 네비게이션 처리 (폴백)
   */
  const handleFindPasswordClick = () => {
    console.log("비밀번호 찾기 버튼 클릭됨");
    if (onFindPasswordClick) {
      onFindPasswordClick();
    } else {
      // 직접 네비게이션 
      navigate("/pg/PG300009");
    }
  };

  /**
   * JSX 반환부
   * - 로그인 폼 UI 구성
   * - 아이디, 비밀번호 입력 필드
   * - 아이디/비밀번호 찾기 링크
   * - 로그인 및 회원가입 버튼
   * - 토스트 메시지 컴포넌트 포함
   */
  return (
    <>
      <PageContainer showBreadcrumb={false} centerContent={true}>
        {/* 로그인 폼 UI 래퍼 */}
        <div className="authWrapper">
          <div className="authContainer">
            <h1 className="authTitle">로그인</h1>

            <form onSubmit={handleSubmit}>
              {/* 사용자 아이디(이메일) 입력 필드 */}
              <input
                className="authInput"
                type="text"
                placeholder="아이디"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* 비밀번호 입력 필드 */}
              <input
                className="authInput"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* 아이디 찾기, 비밀번호 찾기 링크 영역 */}
              <div className="authFindWrapper">
                <span
                  onClick={onFindIdClick}
                  className="authFindLink"
                  style={{ cursor: "pointer" }}
                >
                  아이디 찾기
                </span>
                /
                <span
                  onClick={handleFindPasswordClick}
                  className="authFindLink"
                  style={{ cursor: "pointer" }}
                >
                  비밀번호 찾기
                </span>
              </div>

              {/* 로그인 제출 버튼 */}
              <button type="submit" className="authButton">
                로그인
              </button>

              {/* 또는 Divider */}
              <div className="authDividerWrapper">
                <div className="authDivider">
                  <span className="authDividerText">또는</span>
                </div>
              </div>

              {/* 회원가입 유도 문구 및 버튼 */}
              <p className="authPrompt">
                아직 Risk-View 회원이 아니신가요?
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="authLink"
                >
                  회원가입
                </button>
              </p>
            </form>
            {/* 토스트 메시지 컴포넌트 렌더링 */}
            <Toast
              message={toast.message}
              type={toast.type}
              isVisible={toast.isVisible}
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default PG300002;
