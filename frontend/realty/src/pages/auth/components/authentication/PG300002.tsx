import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../../styles/common/common.css";
import userIcon from "../../../../assets/icons/user.png";
import agentIcon from "../../../../assets/icons/agent.png";

// Signup Component

/*
* 수업명 : 가비아 2회차
* 이름 : 이주하
* 작성자 : 이주하
* 수정자 : 
* 작성일 : 25.07.25
* 파일명 : PG300002.tsx
*/

/**
 * 
 * @returns JSX.Element 회원 유형 선택 UI를 반환
 */

const PG300002 : React.FC = () => {

  const navigate = useNavigate();

  // 개인회원 가입 버튼 클릭 시 호출되는 함수
  // 개인회원 가입 페이지(PG300003)로 이동
  const handlePersonalClick = () => {
    navigate("PG300002/PG300003");
  }

  // 공인중개사 가입 버튼 클릭 시 호출 되는 함수
  // 추후 공인중고새 가입 페이지로 연결 예정
  // const handleAgentClick = () => {
  //   navigate("PG300002/agent");
  // }

  return (
    <div className="authCotainer">
      <h1 className="authlogo">Risk-View</h1>
      <p className="authSubtitle">Team. Debugging Monster</p>
      <p className="authwelcome">Risk-View에 오신 것을 환영합니다. <br />
        이제부터 안심 거래의 시작입니다.</p>

        <div className="cardContainer">
          {/* 개인회원 카드 */}
          <div className="card">
            <p className="cardTitle">개인회원</p>
            <img src={userIcon} alt="개인회원 아이콘" width={100} />
            <button className="signupButton" onClick={handlePersonalClick}>가입하기</button>
          </div>

          {/* 공인중개사 카드 */}
          <div className="card">
            <p className="cardTitle">공인중개사</p>
            <img src={agentIcon} alt="공인중개사 아이콘" width={100} />
            <button className="signupButton">가입하기</button>
          </div>


        </div>
    </div>
  );
};

export default PG300002;