import React from "react";
import "../../../../styles/common/common.css";
import userIcon from "../../../../assets/icons/user.png";
import agentIcon from "../../../../assets/icons/agent.png";

// Signup Component : 회원유형 선택 페이지

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.07.25
* 파일명 : PG300003.tsx
*/

interface PG300003Props {
  onNext: () => void;
}

/**
 * 회원유형 선택 컴포넌트
 * 사용자가 개인회원 또는 공인중개사 중 회원 유형을 선택할 수 있는 페이지
 * 현재는 개인회원 가입만 구현
 * 
 * @param props - 컴포넌트 props
 * @param props.onNext - 개인회원 가입 선택 시 다음 단계로 이동하는 콜백 함수
 * @returns JSX.Element - 회원 유형 선택 카드 UI를 포함한 컴포넌트
 */

const PG300003: React.FC<PG300003Props> = ({ onNext }) => {
  /**
   * 개인회원 가입 버튼 클릭 핸들러
   * 개인회원 선택 시 다음 단계인 이메일 인증 페이지(PG300004)로 이동
   */
  const handlePersonalClick = () => {
    console.log("가입하기 버튼 클릭됨");
    onNext(); // authStep 증가 (PG300004로 넘어감)
  };

  /**
   * 공인중개사 가입 버튼 클릭 핸들러 (추후 구현 예정)
   * TODO: 공인중개사 전용 가입 페이지로 연결 예정
   */
  // const handleAgentClick = () => {
  //   navigate("/PG300003/agent"); // 공인중개사 가입 페이지로 이동
  // }

  return (
    <div className="authContainer">
      {/* 서비스 로고 및 제목 */}
      <h1 className="authlogo">Risk-View</h1>
      <p className="authSubtitle">Team. Debugging Monster</p>
      {/* 환영 메시지 */}
      <p className="authwelcome">
        Risk-View에 오신 것을 환영합니다. <br />
        이제부터 안심 거래의 시작입니다.
      </p>

      {/* 회원유형 선택 카드 컨테이너 */}
      <div className="cardContainer">
        {/* 개인회원 카드 */}
        <div className="card">
          <p className="cardTitle">개인회원</p>
          <img src={userIcon} alt="개인회원 아이콘" width={100} />
          <button className="signupButton" onClick={handlePersonalClick}>
            가입하기
          </button>
        </div>

        {/* 공인중개사 선택 카드 (추후 구현 예정) */}
        <div className="card">
          <p className="cardTitle">공인중개사</p>
          <img src={agentIcon} alt="공인중개사 아이콘" width={100} />
          <button className="signupButton">가입하기</button>
        </div>
      </div>
    </div>
  );
};

export default PG300003;