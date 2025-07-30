import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

// Signup_AdditionalInfoPage: 추가 개인정보 입력 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.07.30
 * 파일명 : PG300007.tsx
 */

interface PG300007Props {
  onLogin: () => void;
}

/**
 * 추가 개인정보 입력 컴포넌트 (회원가입 최종 단계)
 * 사용자의 이름, 생년월일, 성별, 국적, 선호 언어 등의 추가 정보를 입력받음
 * 모든 정보 입력 완료 후 회원가입을 완료하고 로그인 페이지로 이동
 * 
 * @param props - 컴포넌트 props
 * @param props.onLogin - 회원가입 완료 후 로그인 페이지로 이동하는 콜백 함수
 * @returns JSX.Element - 추가 개인정보 입력 폼이 포함된 UI 컴포넌트
 */
const PG300007: React.FC<PG300007Props> = ({ onLogin }) => {
  // 개인정보 상태 관리
  const [userName, setUserName] = useState(""); // 사용자 실명
  const [birthYear, setBirthYear] = useState(""); // 출생년도
  const [birthMonth, setBirthMonth] = useState(""); // 출생월
  const [birthDay, setBirthDay] = useState(""); // 출생일
  const [gender, setGender] = useState(""); // 성별 (남자/여자)
  const [nationality, setNationality] = useState(""); // 국적 (내국인/외국인)
  const [language, setLanguage] = useState(""); // 선호 언어
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false); // 언어 드롭다운 열림/닫힘 상태

  // 선택 가능한 언어 목록
  const languages = ["영어", "중국어", "일본어"];

  /**
   * 언어 드롭다운 토글 핸들러
   * 언어 선택 드롭다운의 열림/닫힘 상태를 전환
   */
  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  /**
   * 언어 선택 핸들러
   * 사용자가 선택한 언어를 상태에 저장하고 드롭다운을 닫음
   *
   * @param lang - 선택된 언어 문자열
   */
  const selectLanguage = (lang: string) => {
    setLanguage(lang);
    setLanguageDropdownOpen(false); // 선택 후 드롭다운 닫기
  };

  /**
   * 회원가입 완료 처리 핸들러
   * 모든 추가 정보 입력을 완료하고 회원가입을 마무리
   *
   * TODO: 실제 회원가입 API 호출 및 데이터 저장 로직 구현 필요
   * TODO: 입력값 유효성 검사 추가 필요
   */
  const handleSubmit = () => {
    // 입력된 모든 정보 로깅 (개발용)
    console.log("회원가입 완료 - 추가 정보:", {
      userName,
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      gender,
      nationality,
      language,
    });

    // TODO: 백엔드 API 호출하여 회원가입 완료 처리
    // const signupData = {
    //   userName,
    //   birthYear,
    //   birthMonth,
    //   birthDay,
    //   gender,
    //   nationality,
    //   language
    // };
    // await axios.post('/api/signup/complete', signupData);

    // 회원가입 완료 후 로그인 페이지로 이동
    if (typeof onLogin === "function") {
      onLogin();
    }
  };

  /**
   * 출생년도 옵션 생성 함수
   * 현재 연도부터 100년 전까지의 년도 배열을 생성합니다.
   */
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [...Array(100)].map((_, i) => {
      const year = currentYear - i;
      return (
        <option key={year} value={year}>
          {year}
        </option>
      );
    });
  };

  return (
    <div className="authWrapper">
      <div className="authContainer">
        {/* 서비스 로고 및 제목 */}
        <h1 className="authlogo">Risk-View</h1>
        <p className="authSubtitle">Team. Debugging Monster</p>
        <p className="authwelcome">추가 정보를 입력해주세요</p>

        {/* 추가 정보 입력 폼 */}
        <div className="authForm">
          {/* 이름 입력 필드 */}
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름"
            className="authInput"
            required
          />

          {/* 생년월일 선택 */}
          <div className="birth-select-row">
            {/* 출생년도 선택 */}
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="birthSelect"
              required
            >
              <option value="">년</option>
              {generateYearOptions()}
            </select>

            {/* 출생월 선택 */}
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="birthSelect"
              required
            >
              <option value="">월</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}월
                </option>
              ))}
            </select>

            {/* 출생일 선택 */}
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="birthSelect"
              required
            >
              <option value="">일</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}일
                </option>
              ))}
            </select>
          </div>

          {/* 성별 선택 토글 버튼 */}
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-button ${gender === "남자" ? "selected" : ""}`}
              onClick={() => setGender("남자")}
            >
              남자
            </button>
            <button
              type="button"
              className={`toggle-button ${gender === "여자" ? "selected" : ""}`}
              onClick={() => setGender("여자")}
            >
              여자
            </button>
          </div>

          {/* 국적 선택 토글 버튼 */}
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-button ${
                nationality === "내국인" ? "selected" : ""
              }`}
              onClick={() => setNationality("내국인")}
            >
              내국인
            </button>
            <button
              type="button"
              className={`toggle-button ${
                nationality === "외국인" ? "selected" : ""
              }`}
              onClick={() => setNationality("외국인")}
            >
              외국인
            </button>
          </div>

          {/* 선호 언어 드롭다운 선택 */}
          <div className="dropdown-wrapper">
            <div
              className="dropdown-toggle"
              onClick={toggleLanguageDropdown}
              role="button"
              tabIndex={0}
              aria-expanded={languageDropdownOpen}
              aria-haspopup="listbox"
            >
              {language || "언어 선택"}
              <FiChevronDown
                className={`arrow-icon ${
                  languageDropdownOpen ? "rotated" : ""
                }`}
              />
            </div>

            {/* 드롭다운 메뉴 */}
            {languageDropdownOpen && (
              <div className="dropdown-list" role="listbox">
                {languages.map((lang) => (
                  <div
                    key={lang}
                    className="dropdown-item"
                    onClick={() => selectLanguage(lang)}
                    role="option"
                    tabIndex={0}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 회원가입 완료 버튼 */}
          <button type="button" className="authButton" onClick={handleSubmit}>
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default PG300007;