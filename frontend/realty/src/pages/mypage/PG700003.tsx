import React, { useState, useEffect } from "react";
import useToast from "../../hooks/useToast";
import "../../styles/common/common.css";
import Toast from "../../components/ui/Toast";
import axios from "axios";
import * as UserAPI from "../../components/api";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 박윤성
 * 작성자 : 박윤성
 * 수정자 :
 * 작성일 : 25.09.20
 * 수정일 :
 * 파일명 : PG700003.tsx
 */

/**
 * @file PG700003.tsx
 * @description 프로필 수정 페이지 컴포넌트
 * @summary
 * 이 파일은 사용자 정보 수정, 비밀번호 변경, 회원 탈퇴 기능을 제공합니다.
 * - 사용자 정보(닉네임, 이메일, 선호 언어)를 수정할 수 있습니다.
 * - 현재 비밀번호를 확인한 후 새 비밀번호로 변경할 수 있습니다.
 * - 비밀번호 확인 후 회원 탈퇴를 진행할 수 있습니다.
 * - 이메일 변경 시 인증 절차를 포함합니다.
 * - 회원 탈퇴 시 확인을 위한 모달 창을 자체적으로 구현하여 사용합니다.
 * @author 박윤성
 * @version 1.0
 * @see
 */

// 사용자 프로필 데이터 구조 정의
interface UserProfile {
    userId: string;
    userNickname: string;
    email: string;
    name: string;
    preferredLanguage: string;
    createdAt: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

// 컴포넌트 props 타입 정의
interface PG700003Props {
    onBack: () => void;
}

// 회원 탈퇴 확인 모달 props 타입 정의
// 회원 탈퇴 확인 모달을 위한 Props
interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    showCancelButton?: boolean; // 취소 버튼 표시 여부 (선택적)
    confirmButtonClass?: string; // 확인 버튼의 추가 클래스
}
const PG700003: React.FC<PG700003Props> = ({ onBack }) => {
    const { toast, showToast } = useToast(); // 토스트 메시지 훅
    const [profile, setProfile] = useState<UserProfile | null>(null); // 사용자 프로필 상태
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [activeTab, setActiveTab] = useState<
        "info" | "password" | "deleteAccount"
    >("info"); // 현재 활성화된 탭 상태
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 회원 탈퇴 확인 모달 상태
    const [isDeleteCompleteModalOpen, setIsDeleteCompleteModalOpen] =
        useState(false); // 회원 탈퇴 완료 모달 상태
    const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] =
        useState(false); // 현재 비밀번호 인증 여부 상태

    // 이메일 인증 관련 상태
    const [originalCreatedAt, setOriginalCreatedAt] = useState<string>(""); // 원본 가입일 정보 (수정 API 전송용)
    const [hasSentEmailCode, setHasSentEmailCode] = useState(false); // 이메일 인증 코드 발송 여부
    const [verificationCode, setVerificationCode] = useState(""); // 입력된 이메일 인증 코드
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부
    const [isSendingEmail, setIsSendingEmail] = useState(false); // 이메일 발송 중 상태
    const [isVerifyingCode, setIsVerifyingCode] = useState(false); // 인증 코드 확인 중 상태
    // 이메일 입력 필드의 현재 값을 추적하기 위한 별도 상태
    const [currentEmail, setCurrentEmail] = useState("");

    // 컴포넌트 마운트 시 사용자 프로필 정보 가져오기
    useEffect(() => {
        let isMounted = true; // 클린업 함수에서 비동기 작업 중단용 플래그
        const fetchProfile = async () => {
            try {
                // API를 통해 사용자 정보 요청
                const response = await axios.get("/api/user/mypage");
                if (response.status !== 200) {
                    throw new Error("프로필 정보를 불러오는데 실패했습니다.");
                }
                const data = response.data;
                if (isMounted) {
                    setOriginalCreatedAt(data.createdAt); // 원본 createdAt 저장
                    // 날짜 형식 변환 후 프로필 상태 설정
                    setProfile({
                        ...data,
                        createdAt: new Date(
                            data.createdAt
                        ).toLocaleDateString(),
                    });
                    setCurrentEmail(data.email); // 초기 이메일 값 설정
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "알 수 없는 오류가 발생했습니다.";
                showToast(message, { type: "error" });
            } finally {
                if (isMounted) setIsLoading(false); // 로딩 상태 해제
            }
        };

        fetchProfile();

        // 컴포넌트 언마운트 시 비동기 작업 취소
        return () => {
            isMounted = false;
        };
    }, [showToast]); // showToast는 useToast 훅에서 반환되므로 일반적으로 안정적입니다.

    // 입력 필드 변경 핸들러
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
        // 이메일 주소가 변경되면 인증 상태 초기화
        if (name === "email") setCurrentEmail(value);
        if (name === "email") {
            // 이메일이 바뀌면 인증 상태 초기화
            setHasSentEmailCode(false);
            setIsEmailVerified(false);
            setVerificationCode("");
        }
    };

    // 폼 제출 핸들러 (정보 수정, 비밀번호 변경, 회원 탈퇴)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        // --- 회원 탈퇴 처리 ---
        if (activeTab === "deleteAccount") {
            if (!profile.currentPassword) {
                showToast("회원 탈퇴를 위해 비밀번호를 입력해주세요.", {
                    type: "error",
                });
                return;
            }
            // 비밀번호 확인 후 성공 시 탈퇴 확인 모달 표시
            const isSuccess = await handleVerifyCurrentPassword();
            if (isSuccess) {
                setIsDeleteModalOpen(true);
            }
            return; // 비밀번호 확인 후에는 다른 로직을 실행하지 않도록 여기서 종료합니다.
        }

        // --- 비밀번호 변경 관련 유효성 검사 ---
        if (activeTab === "password") {
            // 현재 비밀번호 인증 여부 확인
            if (profile.newPassword && !isCurrentPasswordVerified) {
                showToast("현재 비밀번호를 먼저 인증해주세요.", {
                    type: "error",
                });
                return;
            }

            if (!profile.newPassword) {
                showToast("새 비밀번호를 입력해주세요.", { type: "error" });
                return;
            }

            if (profile.newPassword) {
                // 새 비밀번호 최소 길이 검사
                if (profile.newPassword.length < 8) {
                    showToast("새 비밀번호는 8자 이상이어야 합니다.", {
                        type: "error",
                    });
                    return;
                }
                // 새 비밀번호와 확인 필드 일치 여부 검사
                if (profile.newPassword !== profile.confirmNewPassword) {
                    showToast("새 비밀번호가 일치하지 않습니다.", {
                        type: "error",
                    });
                    return;
                }
            }

            if (profile.newPassword != profile.confirmNewPassword) {
                showToast("비밀번호가 일치하지 않습니다.", { type: "error" });
                return;
            }
        }

        // --- 사용자 정보 수정 유효성 검사 ---
        if (activeTab === "info") {
            // 이메일이 비어있는 경우
            if (!profile.email || profile.email.trim() === "") {
                showToast("이메일을 입력해주세요.", { type: "error" });
                return;
            }
            // 이메일 형식이 유효하지 않은 경우
            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRegex.test(profile.email)) {
                showToast("유효한 이메일 형식을 입력해주세요.", {
                    type: "error",
                });
                return;
            }

            // 원본 이메일과 현재 이메일이 다른지 확인
            const originalProfileResponse = await axios.get("/api/user/mypage");
            const originalEmail = originalProfileResponse.data.email;

            if (profile.email !== originalEmail) {
                // 이메일이 변경되었지만 인증되지 않은 경우
                if (!isEmailVerified) {
                    showToast(
                        "이메일 변경을 완료하려면 이메일 인증을 진행해주세요.",
                        { type: "error" }
                    );
                    return;
                }
            }
        }

        // 비밀번호 변경 시, 현재 비밀번호 인증 여부 확인
        if (profile.newPassword && !isCurrentPasswordVerified) {
            showToast("현재 비밀번호를 먼저 인증해주세요.", { type: "error" });
            return;
        }

        // 서버로 프로필 업데이트 요청
        try {
            const response = await axios.put(
                "/api/user/mypage",
                {
                    ...profile,
                    createdAt: originalCreatedAt, // 서버로 보낼 때는 원본 값 사용
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            const result = response.data;

            if (response.status !== 200) {
                throw new Error(
                    result.message || "프로필 수정에 실패했습니다."
                );
            }

            showToast("프로필이 성공적으로 수정되었습니다.", {
                type: "success",
            });
            setTimeout(() => {
                // 1초 후 이전 페이지로 이동
                onBack();
            }, 1000); // 1초 후 뒤로가기
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "알 수 없는 오류가 발생했습니다.";
            showToast(message, { type: "error" });
        }
    };

    // 회원 탈퇴 처리 함수
    const handleDeleteConfirm = async () => {
        if (!profile?.currentPassword) return;

        try {
            const response = await axios.delete("/api/user/delete-account", {
                headers: { "Content-Type": "application/json" },
                data: { password: profile.currentPassword },
            });
            const result = response.data;
            if (response.status !== 200) {
                throw new Error(result.message || "회원 탈퇴에 실패했습니다.");
            }
            // 탈퇴 완료 모달 표시
            setIsDeleteCompleteModalOpen(true);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "알 수 없는 오류가 발생했습니다.";
            showToast(message, { type: "error" });
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    // 탈퇴 완료 후 처리 (로그아웃 및 메인 페이지로 리디렉션)
    const handleDeletionComplete = async () => {
        setIsDeleteCompleteModalOpen(false);
        await fetch("/api/user/logout", { method: "POST" }); // 로그아웃 요청
        window.location.href = "/"; // 메인 페이지로 이동
    };

    // 현재 비밀번호 확인 함수
    const handleVerifyCurrentPassword = async (): Promise<boolean> => {
        if (!profile?.currentPassword) {
            showToast("현재 비밀번호를 입력해주세요.", { type: "error" });
            return false;
        }

        try {
            // 서버에 비밀번호 확인 요청
            const response = await axios.post(
                "/api/user/verify-password",
                {
                    currentPassword: profile.currentPassword,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            const result = response.data;
            if (response.status !== 200) {
                showToast(result.message || "비밀번호 확인에 실패했습니다.", {
                    type: "error",
                });
                return false;
            }

            if (result.success) {
                setIsCurrentPasswordVerified(true); // 인증 성공 상태 업데이트
                showToast(result.message || "비밀번호 확인이 완료되었습니다.", {
                    type: "success",
                });
                return true;
            } else {
                showToast(result.message || "비밀번호가 일치하지 않습니다.", {
                    type: "error",
                });
                return false;
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "알 수 없는 오류가 발생했습니다.";
            showToast(message, { type: "error" });
            return false;
        }
    };

    // 이메일 인증 코드 발송 함수
    const handleSendEmailVerification = async () => {
        if (!currentEmail.trim()) {
            showToast("이메일을 입력해주세요.", { type: "error" });
            return;
        }
        // 간단한 이메일 형식 검증
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(currentEmail)) {
            showToast("유효한 이메일 주소를 입력해주세요.", { type: "error" });
            return;
        }
        setIsSendingEmail(true);
        try {
            // 통합 인증 프로세스 사용
            await UserAPI.sendVerificationEmail(
                currentEmail,
                "/api/send-verification-email-code"
            );
            setHasSentEmailCode(true);
            showToast("인증 메일이 전송되었습니다!", { type: "success" });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
            showToast(errorMessage, { type: "error" });
        } finally {
            setIsSendingEmail(false);
        }
    };

    // 이메일 인증 코드 확인 함수
    const handleVerifyEmailCode = async () => {
        if (!verificationCode) {
            showToast("인증번호를 입력해주세요.", { type: "error" });
            return;
        }
        setIsVerifyingCode(true);
        try {
            // 서버에 인증 코드 확인 요청
            const response = await axios.post(
                "/api/verify-email-code",
                {
                    email: profile?.email,
                    code: verificationCode,
                },
                {
                    withCredentials: true,
                }
            );
            if (response.status === 200) {
                const { message } = response.data as { message?: string };
                showToast(message || "이메일 인증 성공!", { type: "success" });
                setIsEmailVerified(true); // 이메일 인증 완료 상태 업데이트
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data ||
                    "이메일 인증 실패";
                showToast(String(errorMessage), { type: "error" });
            } else {
                showToast("알 수 없는 오류가 발생했습니다.", { type: "error" });
            }
        } finally {
            setIsVerifyingCode(false);
        }
    };

    // 회원 탈퇴 모달 UI 컴포넌트
    const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
        isOpen,
        onClose,
        onConfirm,
        title,
        children,
        showCancelButton = true,
        confirmButtonClass = "confirm",
    }) => {
        if (!isOpen) {
            return null;
        }

        return (
            <div className="pg700003-modal-overlay">
                <div className="pg700003-modal-content">
                    <h3 className="pg700003-modal-title">{title}</h3>
                    <div className="pg700003-modal-body">{children}</div>
                    <div className="pg700003-modal-actions">
                        {showCancelButton && (
                            <button
                                onClick={onClose}
                                className="pg700003-modal-button cancel"
                            >
                                취소
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`pg700003-modal-button ${confirmButtonClass}`}
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 데이터 로딩 중 표시
    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    // 프로필 데이터가 없을 경우 표시
    if (!profile) {
        return <div>프로필 정보를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="profile-edit-layout">
            {/* 사이드바 */}
            <div className="profile-sidebar">
                <div className="profile-avatar">
                    {" "}
                    {/* 프로필 아바타 */}
                    <span>{profile.name.charAt(0)}</span>
                </div>
                <nav className="profile-nav">
                    {" "}
                    {/* 네비게이션 메뉴 */}
                    <button
                        className={`profile-nav-item ${
                            activeTab === "info" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("info")}
                    >
                        사용자 정보
                    </button>
                    <button
                        className={`profile-nav-item ${
                            activeTab === "password" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("password")}
                    >
                        비밀번호 변경
                    </button>
                    <button
                        className={`profile-nav-item ${
                            activeTab === "deleteAccount" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("deleteAccount")}
                    >
                        회원탈퇴
                    </button>
                </nav>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="profile-edit-container">
                <form onSubmit={handleSubmit} className="form-section">
                    {activeTab === "info" && (
                        <>
                            {" "}
                            {/* 사용자 정보 수정 탭 */}
                            <h2 className="page-authwelcome">
                                사용자 정보 수정
                            </h2>
                            <div className="input-group">
                                <label htmlFor="userId">아이디</label>
                                <input
                                    type="text"
                                    id="userId"
                                    name="userId"
                                    value={profile.userId}
                                    readOnly
                                    className="input-field readonly"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="name">이름</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profile.name}
                                    readOnly
                                    onChange={handleChange}
                                    className="input-field readonly"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="userNickname">닉네임</label>
                                <input
                                    type="text"
                                    id="userNickname"
                                    name="userNickname"
                                    value={profile.userNickname}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">이메일</label>
                                <div className="input-with-button">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        className="input-field"
                                        readOnly={isEmailVerified}
                                        placeholder="이메일을 입력하세요"
                                    />
                                    <button
                                        type="button"
                                        className="input-inner-button"
                                        onClick={handleSendEmailVerification}
                                        disabled={
                                            isSendingEmail || isEmailVerified
                                        }
                                    >
                                        {isEmailVerified ? "확인됨" : "변경"}
                                    </button>
                                </div>
                            </div>
                            {hasSentEmailCode &&
                                !isEmailVerified && ( // 인증 코드 발송 후, 인증 전까지 표시
                                    <div className="input-group">
                                        <label htmlFor="emailCode">
                                            이메일 인증번호
                                        </label>
                                        <div className="input-with-button">
                                            <input
                                                type="text"
                                                id="emailCode"
                                                name="emailCode"
                                                value={verificationCode}
                                                onChange={(e) =>
                                                    setVerificationCode(
                                                        e.target.value
                                                    )
                                                }
                                                className="input-field"
                                                placeholder="인증번호 6자리를 입력하세요"
                                            />
                                            <button
                                                type="button"
                                                className="input-inner-button"
                                                onClick={handleVerifyEmailCode}
                                                disabled={
                                                    isVerifyingCode ||
                                                    !verificationCode
                                                }
                                            >
                                                확인
                                            </button>
                                        </div>
                                    </div>
                                )}
                            <div className="input-group">
                                <label htmlFor="preferredLanguage">
                                    선호 언어
                                </label>
                                <select
                                    id="preferredLanguage"
                                    name="preferredLanguage"
                                    value={profile.preferredLanguage}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="KO">한국어</option>
                                    <option value="EN">English</option>
                                    <option value="JP">日本語</option>
                                    <option value="CH">中文</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="createdAt">가입일</label>
                                <input
                                    type="text"
                                    id="createdAt"
                                    name="createdAt"
                                    value={profile.createdAt}
                                    readOnly
                                    className="input-field readonly"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === "password" && (
                        <>
                            {" "}
                            {/* 비밀번호 변경 탭 */}
                            <h2 className="page-authwelcome">비밀번호 변경</h2>
                            <div className="input-group">
                                <label htmlFor="currentPassword">
                                    현재 비밀번호 확인
                                </label>
                                <div className="input-with-button">
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        onChange={handleChange}
                                        className="input-field"
                                        autoComplete="current-password"
                                        placeholder="현재 비밀번호를 입력하세요"
                                        disabled={isCurrentPasswordVerified}
                                    />
                                    <button
                                        type="button"
                                        className="input-inner-button"
                                        onClick={handleVerifyCurrentPassword}
                                        disabled={isCurrentPasswordVerified}
                                    >
                                        {isCurrentPasswordVerified
                                            ? "확인됨"
                                            : "확인"}
                                    </button>
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="newPassword">새 비밀번호</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    onChange={handleChange}
                                    className="input-field"
                                    autoComplete="new-password"
                                    disabled={!isCurrentPasswordVerified}
                                    placeholder="새 비밀번호를 입력하세요"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirmNewPassword">
                                    새 비밀번호 확인
                                </label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    onChange={handleChange}
                                    className="input-field"
                                    autoComplete="new-password"
                                    disabled={!isCurrentPasswordVerified}
                                    placeholder="새 비밀번호를 다시 입력하세요"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === "deleteAccount" && (
                        <>
                            {" "}
                            {/* 회원 탈퇴 탭 */}
                            <h2 className="page-authwelcome">회원탈퇴</h2>
                            <div className="input-group">
                                <label htmlFor="password">비밀번호 확인</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="비밀번호를 입력하세요"
                                />
                            </div>
                        </>
                    )}

                    <div className="authButtonWrapper">
                        {" "}
                        {/* 제출 버튼 */}
                        <button type="submit" className="authButton submit">
                            {activeTab === "deleteAccount"
                                ? "탈퇴하기"
                                : "수정 완료"}
                        </button>
                    </div>
                </form>
            </div>

            {/* 토스트 메시지 컴포넌트 */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
            />
            {/* 회원 탈퇴 확인 모달 */}
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="회원 탈퇴 확인"
            >
                <p>정말로 회원 탈퇴를 하시겠습니까?</p>
                <p>이 작업은 되돌릴 수 없습니다.</p>
            </DeleteAccountModal>
            {/* 회원 탈퇴 완료 모달 */}
            <DeleteAccountModal
                isOpen={isDeleteCompleteModalOpen}
                onClose={handleDeletionComplete}
                onConfirm={handleDeletionComplete}
                title="회원 탈퇴 완료"
                showCancelButton={false} // 취소 버튼 숨김
                confirmButtonClass="confirm-ok" // 새로운 클래스 적용
            >
                <p>회원 탈퇴가 정상적으로 처리되었습니다.</p>
                <p>그동안 RiskView 서비스를 이용해주셔서 감사합니다.</p>
            </DeleteAccountModal>
        </div>
    );
};

export default PG700003;
