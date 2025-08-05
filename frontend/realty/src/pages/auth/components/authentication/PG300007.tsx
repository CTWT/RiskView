import React, { useState } from "react";
import Toast from "../../../../components/ui/Toast"; // Toast 컴포넌트 임포트
import useToast from "../../../../hooks/useToast"; // useToast 훅 import
import "../../../../styles/common/common.css";

// Signup_AdditionalInfoPage: 추가 개인정보 입력 페이지

/*
 * 수업명 : 가비아 2회차
 * 이름 : 이주하
 * 작성자 : 이주하
 * 수정자 :
 * 작성일 : 25.07.30
 * 파일명 : PG300007.tsx
 */

/**
 * @file PG300007.tsx
 * @description 추가 개인정보 입력 페이지 (회원가입 최종 단계)
 * 사용자의 이름, 생년월일, 성별, 국적, 언어 정보를 수집하는 컴포넌트

 */

// Props 타입 정의
interface PG300007Props {
  onLogin: () => void; // 로그인 페이지로 이동하는 콜백 함수
}

// 사용자 추가 정보 타입 정의
interface UserAdditionalInfo {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  nationality: string;
  language: string;
}

/**
 * 추가 개인정보 입력 컴포넌트
 * 회원가입의 마지막 단계로 사용자의 상세 정보를 수집
 * 
 * @param props - 컴포넌트 props
 * @param props.onLogin - 회원가입 완료 후 로그인 페이지로 이동하는 콜백 함수
 * @returns JSX.Element - 추가 개인정보 입력 폼 UI
 */
const PG300007: React.FC<PG300007Props> = ({ onLogin }) => {
  // useToast 훅 사용
  const { toast, showToast, hideToast } = useToast(); // toast 상태도 가져오기

  // 사용자 추가 정보 상태 관리
  const [userInfo, setUserInfo] = useState<UserAdditionalInfo>({
    name: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
    nationality: '',
    language: ''
  });

  // 드롭다운 상태 관리
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // 유효성 검사 에러 상태
  const [errors, setErrors] = useState<Partial<UserAdditionalInfo>>({});

  // 언어 옵션 배열
  const languageOptions = [
    { value: 'korean', label: '한국어' },
    { value: 'english', label: 'English' },
    { value: 'chinese', label: '中文' },
    { value: 'japanese', label: '日本語' }
  ];

  /**
   * 연도 옵션 생성 함수
   * 현재 연도부터 100년 전까지의 연도 배열을 생성
   * @returns number[] - 연도 배열
   */
  const generateYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i);
    }
    return years;
  };

  /**
   * 월 옵션 생성 함수
   * 1월부터 12월까지의 배열을 생성
   * @returns number[] - 월 배열 (1-12)
   */
  const generateMonthOptions = (): number[] => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  /**
   * 일 옵션 생성 함수
   * 1일부터 31일까지의 배열을 생성
   * @returns number[] - 일 배열 (1-31)
   */
  const generateDayOptions = (): number[] => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  /**
   * 입력값 변경 핸들러
   * 사용자 정보 상태를 업데이트하고 해당 필드의 에러를 제거
   * @param field - 변경할 필드명
   * @param value - 새로운 값
   */
  const handleInputChange = (field: keyof UserAdditionalInfo, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 상태에서 해당 필드 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * 토글 버튼 클릭 핸들러
   * 성별, 국적 선택을 위한 토글 버튼 처리
   * @param field - 변경할 필드 ('gender' 또는 'nationality')
   * @param value - 선택된 값
   */
  const handleToggleClick = (field: 'gender' | 'nationality', value: string) => {
    handleInputChange(field, value);
  };

  /**
   * 언어 드롭다운 토글 함수
   * 언어 선택 드롭다운의 열림/닫힘 상태를 전환
   */
  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  /**
   * 언어 선택 핸들러
   * 사용자가 선택한 언어를 상태에 저장하고 드롭다운을 닫음
   * @param language - 선택된 언어
   */
  const handleLanguageSelect = (language: string) => {
    handleInputChange('language', language);
    setIsLanguageDropdownOpen(false);
  };

  /**
   * 폼 유효성 검사 함수
   * 첫 번째로 발견되는 빈 필드에 대한 토스트 메시지 표시
   * @returns boolean - 유효성 검사 통과 여부
   */
  const validateForm = (): boolean => {
    // 순서대로 검사하여 첫 번째 빈 필드에서 토스트 표시 후 종료
    if (!userInfo.name.trim()) {
      showToast("이름을 입력해주세요.", { type: "error", duration: 3000 });
      return false;
    }
    
    if (!userInfo.birthYear) {
      showToast("출생년도를 선택해주세요.", { type: "error", duration: 3000 });
      return false;
    }
    
    if (!userInfo.birthMonth) {
      showToast("출생월을 선택해주세요.", { type: "error", duration: 3000 });
      return false;
    }
    
    if (!userInfo.birthDay) {
      showToast("출생일을 선택해주세요.", { type: "error", duration: 3000 });
      return false;
    }
    
    if (!userInfo.gender) {
      showToast("성별을 선택해주세요.", { type: "error", duration: 3000 });
      return false;
    }
    
    if (!userInfo.nationality) {
      showToast("국적을 선택해주세요.", { type: "error", duration: 3000 });
      return false;
    }
    
    if (!userInfo.language) {
      showToast("언어를 선택해주세요.", { type: "error", duration: 3000 });
      return false;
    }

    // 모든 필드가 채워져 있으면 에러 상태 초기화
    setErrors({});
    return true;
  };

  /**
   * 회원가입 완료 처리 핸들러
   * 입력된 정보를 검증하고 백엔드로 전송한 후 로그인 페이지로 이동
   */
  const handleSubmit = async () => {
    // 폼 유효성 검사 (토스트 메시지는 validateForm 내부에서 처리)
    if (!validateForm()) {
      return;
    }

    try {
      // 입력된 정보 로깅 (개발용)
      console.log("회원가입 완료 - 추가 정보:", {
        name: userInfo.name,
        birthDate: `${userInfo.birthYear}-${userInfo.birthMonth.padStart(2, '0')}-${userInfo.birthDay.padStart(2, '0')}`,
        gender: userInfo.gender,
        nationality: userInfo.nationality,
        language: userInfo.language,
      });

      // TODO: 백엔드 API 호출하여 추가 정보 저장
      // const response = await fetch('/api/signup/complete', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: userInfo.name,
      //     birthYear: userInfo.birthYear,
      //     birthMonth: userInfo.birthMonth,
      //     birthDay: userInfo.birthDay,
      //     gender: userInfo.gender,
      //     nationality: userInfo.nationality,
      //     language: userInfo.language
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error('회원가입 처리 중 오류가 발생했습니다.');
      // }

      // 성공 토스트 메시지 표시
      showToast('회원가입이 완료되었습니다!', { 
        type: 'success', 
        duration: 2000 
      });

      // 로그인 페이지로 이동 (토스트 메시지 표시 후 약간의 지연)
      setTimeout(() => {
        if (typeof onLogin === "function") {
          onLogin();
        }
      }, 1000);

    } catch (error) {
      console.error('회원가입 완료 처리 오류:', error);
      
      // 에러 토스트 메시지 표시
      showToast('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.', { 
        type: 'error', 
        duration: 4000 
      });
    }
  };

  /**
   * 외부 클릭으로 드롭다운 닫기 핸들러
   * 드롭다운 외부를 클릭했을 때 드롭다운을 닫음
   * @param e - 마우스 클릭 이벤트
   */
  const handleOutsideClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      setIsLanguageDropdownOpen(false);
    }
  };

  return (
    <div className="user-info-container" onClick={handleOutsideClick}>
      {/* 로고 및 헤더 */}
      <div className="header-authContainer">
        <h1 className="authlogo">Risk-View</h1>
        <p className="authSubtitle">Team. Debugging Monster</p>
      </div>

      {/* 페이지 제목 */}
      <h2 className="page-authwelcome">사용자 정보 입력</h2>

      {/* 입력 폼 */}
      <form
        className="form-section"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* 이름 입력 */}
        <div className="input-group">
          <input
            type="text"
            className={`input-field ${errors.name ? "error" : ""}`}
            placeholder="이름"
            value={userInfo.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            autoComplete="name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* 생년월일 선택 */}
        <div className="date-row">
          <div className="date-select-group">
            <select
              className={`date-select ${errors.birthYear ? "error" : ""}`}
              value={userInfo.birthYear}
              onChange={(e) => handleInputChange("birthYear", e.target.value)}
            >
              <option value="">년</option>
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}년
                </option>
              ))}
            </select>
            {errors.birthYear && (
              <span className="error-message">{errors.birthYear}</span>
            )}
          </div>

          <div className="date-select-group">
            <select
              className={`date-select ${errors.birthMonth ? "error" : ""}`}
              value={userInfo.birthMonth}
              onChange={(e) => handleInputChange("birthMonth", e.target.value)}
            >
              <option value="">월</option>
              {generateMonthOptions().map((month) => (
                <option key={month} value={month}>
                  {month}월
                </option>
              ))}
            </select>
            {errors.birthMonth && (
              <span className="error-message">{errors.birthMonth}</span>
            )}
          </div>

          <div className="date-select-group">
            <select
              className={`date-select ${errors.birthDay ? "error" : ""}`}
              value={userInfo.birthDay}
              onChange={(e) => handleInputChange("birthDay", e.target.value)}
            >
              <option value="">일</option>
              {generateDayOptions().map((day) => (
                <option key={day} value={day}>
                  {day}일
                </option>
              ))}
            </select>
            {errors.birthDay && (
              <span className="error-message">{errors.birthDay}</span>
            )}
          </div>
        </div>

        {/* 성별/국적 토글 버튼 */}
        <div className="toggle-row">
          {/* 성별 선택 */}
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-button ${
                userInfo.gender === "남자" ? "selected" : ""
              }`}
              onClick={() => handleToggleClick("gender", "남자")}
            >
              남자
            </button>
            <button
              type="button"
              className={`toggle-button ${
                userInfo.gender === "여자" ? "selected" : ""
              }`}
              onClick={() => handleToggleClick("gender", "여자")}
            >
              여자
            </button>
          </div>

          {/* 국적 선택 */}
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-button ${
                userInfo.nationality === "내국인" ? "selected" : ""
              }`}
              onClick={() => handleToggleClick("nationality", "내국인")}
            >
              내국인
            </button>
            <button
              type="button"
              className={`toggle-button ${
                userInfo.nationality === "외국인" ? "selected" : ""
              }`}
              onClick={() => handleToggleClick("nationality", "외국인")}
            >
              외국인
            </button>
          </div>
        </div>

        {/* 언어 선택 드롭다운 */}
        <div className="input-group">
          <div className="dropdown-wrapper">
            <div
              className={`dropdown-toggle ${errors.language ? "error" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleLanguageDropdown();
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isLanguageDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="dropdown-text">
                {userInfo.language || "언어"}
              </span>
              <div
                className={`dropdown-arrow ${
                  isLanguageDropdownOpen ? "rotated" : ""
                }`}
              />
            </div>

            {isLanguageDropdownOpen && (
              <div className="dropdown-list" role="listbox">
                {languageOptions.map((option) => (
                  <div
                    key={option.value}
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageSelect(option.label);
                    }}
                    role="option"
                    tabIndex={0}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.language && (
            <span className="error-message">{errors.language}</span>
          )}

          {/* 확인 버튼 */}
          <button type="submit" className="authButton">
            확인
          </button>
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
    </div>
  );
};

export default PG300007;