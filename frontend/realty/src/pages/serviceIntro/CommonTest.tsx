import React, { useState } from "react";
import "../../styles/common/common.css"; // 공통 스타일 임포트
import * as Common from "../../components/common";

/*
 * 수업명 : 가비아 2회차
 * 이름 : 신인철
 * 작성자 : 신인철
 * 수정자 :
 * 작성일 : 25.09.15
 * 파일명 : CommonTest.tsx
 */

const CommonTest: React.FC = () => {
    const [form, setForm] = useState({
        id: "",
        email: "",
        kor: "",
        kors: "",
        korhn: "",
        amount: "",
        dateStr: "",
    });

    const [results, setResults] = useState({
        id: "",
        email: "",
        kor: "",
        kors: "",
        korhn: "",
        amount: "",
        dateStr: "",
    });

    /** 공통 change handler */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /** 공통 blur handler */
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        switch (name) {
            case "id": {
                const idResult = Common.validateId(value);
                if (idResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: idResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: idResult.message || "",
                    }));
                }
                break;
            }
            case "email": {
                const emailResult = Common.validateEmail(value);
                if (emailResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: emailResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: emailResult.message || "",
                    }));
                }
                break;
            }
            case "kor": {
                const korResult = Common.validateKor(value);
                if (korResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: korResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: korResult.message || "",
                    }));
                }
                break;
            }
            case "kors": {
                const korsResult = Common.validateKorS(value);
                if (korsResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: korsResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: korsResult.message || "",
                    }));
                }
                break;
            }
            case "korhn": {
                const korhnResult = Common.validateKorHN(value);
                if (korhnResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: korhnResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: korhnResult.message || "",
                    }));
                }
                break;
            }
            case "amount": {
                const amountResult = Common.formatNumberCommas(value);
                if (amountResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: amountResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: amountResult.message || "",
                    }));
                }
                break;
            }
            case "dateStr": {
                const dateResult = Common.formatDate(value);
                if (dateResult.valid) {
                    setForm((prev) => ({
                        ...prev,
                        [name]: dateResult.value || "",
                    }));
                    setResults((prev) => ({ ...prev, [name]: "" }));
                } else {
                    setResults((prev) => ({
                        ...prev,
                        [name]: dateResult.message || "",
                    }));
                }
                break;
            }
            default:
                break;
        }
    };

    return (
        <div className="CommonTest">
            <h2>공통 함수 테스트</h2>

            <div>
                <label>
                    아이디 validation
                    <input
                        type="text"
                        name="id"
                        value={form.id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.id}
                </div>
            </div>

            <div>
                <label>
                    이메일 validation
                    <input
                        type="text"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.email}
                </div>
            </div>

            <div>
                <label>
                    한글만 입력 validation
                    <input
                        type="text"
                        name="kor"
                        value={form.kor}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.kor}
                </div>
            </div>

            <div>
                <label>
                    한글 + / 입력 validation
                    <input
                        type="text"
                        name="kors"
                        value={form.kors}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.kors}
                </div>
            </div>

            <div>
                <label>
                    한글 + 숫자 + - 입력 validation
                    <input
                        type="text"
                        name="korhn"
                        value={form.korhn}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.korhn}
                </div>
            </div>

            <div>
                <label>
                    숫자 콤마 추가
                    <input
                        type="text"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.amount}
                </div>
            </div>

            <div>
                <label>
                    날짜 포멧팅
                    <input
                        type="text"
                        name="dateStr"
                        value={form.dateStr}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </label>
                <div style={{ marginTop: "5px", color: "blue" }}>
                    {results.dateStr}
                </div>
            </div>
        </div>
    );
};

export default CommonTest;
