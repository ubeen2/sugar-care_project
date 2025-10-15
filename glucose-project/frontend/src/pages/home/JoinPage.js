    // src/pages/SignupPage.jsx
import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./JoinPage.css"; // CSS 연결

export default function SignupPage({state, setState}) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); //모달
    const [isAgreed, setIsAgreed] = useState(false); //개인정보 동의 여부 상태
    // 입력값 상태
    const [form, setForm] = useState({
        userId: "",
        password: "",
        userName: "",
        userType: "N", // 기본값: 질병 없음
        guardianUserId: "",
        hasGuardian: "N",
    });

    // 보호자 검색 결과
    const [guardianResults, setGuardianResults] = useState([]);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    // 보호자 검색 함수
    const handleGuardianSearch = async () => {
        try {
            const res = await axios.get("http://localhost:8080/user/search", {
                params: {keyword: form.guardianUserId},
            });
            setGuardianResults(res.data);
        } catch (err) {
            console.error("보호자 검색 실패:", err);
            alert("보호자 검색 실패 ");
        }
    };

    // 회원가입 버튼 클릭 시
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAgreed) {
            alert("개인정보처리방침에 동의해야 회원가입이 가능합니다.");
            return;
        }

        try {
            const res = await axios.post("http://localhost:8080/user/join", form);
            console.log("서버 응답:", res.data);
            alert("회원가입 완료! 🎉 로그인 진행하세요");
            setState((s) => ({...s, page: "홈"}));
        } catch (err) {
            console.error("회원가입 실패:", err);
            alert("회원가입 실패 😢");
        }
    };

    const personalCheck = async () => {

    }

    return (
        <div className="card-join">
            <h2>회원가입</h2>
            <p>정보를 입력하고 회원가입을 진행하세요.</p>

            <form onSubmit={handleSubmit} style={{display: "grid", gap: 12}}>
                <input
                    type="text"
                    name="userId"
                    placeholder="아이디"
                    value={form.userId}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="비밀번호"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="userName"
                    placeholder="이름"
                    value={form.userName}
                    onChange={handleChange}
                    required
                />

                <div className="radio-group">
                    <span>보호자 유무</span>
                    <label>
                        <input
                            type="radio"
                            name="hasGuardian"
                            value="Y"
                            checked={form.hasGuardian === "Y"}
                            onChange={handleChange}
                        />
                        있음
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="hasGuardian"
                            value="N"
                            checked={form.hasGuardian === "N"}
                            onChange={handleChange}
                        />
                        없음
                    </label>
                </div>

                {/* 보호자 있음일 때만 검색 UI 표시 */}
                {form.hasGuardian === "Y" && (
                    <div>
                        <input
                            type="text"
                            placeholder="보호자 아이디 검색"
                            value={form.guardianUserId}
                            onChange={handleChange}
                            name="guardianUserId"
                        />
                        <button type="button" className="btn-outline-join" onClick={handleGuardianSearch}>
                            검색
                        </button>

                        {guardianResults.length > 0 && (
                            <ul
                                style={{
                                    border: "1px solid #ccc",
                                    marginTop: "8px",
                                    padding: "4px",
                                }}
                            >
                                {guardianResults.map((g) => (
                                    <li
                                        key={g.userId}
                                        style={{cursor: "pointer"}}
                                        onClick={() =>
                                            setForm((prev) => ({...prev, guardianUserId: g.userId}))
                                        }
                                    >
                                        {g.userId} ({g.userName})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div className="radio-group">
                    <span>혈당관련 질병 보유 여부</span>
                    <label>
                        <input
                            type="radio"
                            name="userType"
                            value="Y"
                            checked={form.userType === "Y"}
                            onChange={handleChange}
                        />
                        Y
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="userType"
                            value="N"
                            checked={form.userType === "N"}
                            onChange={handleChange}
                        />
                        N
                    </label>
                </div>
                <div><input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}/><a
                    style={{fontSize: "15px", color: "blue", cursor: "pointer"}}
                    onClick={() => setIsModalOpen(true)}> [개인정보처리방침서비스]</a>{" "}에 동의하십니까?
                </div>
                <button type="submit" className="btn-primary-join" disabled={!isAgreed}  style={{
                    opacity: isAgreed ? 1 : 0.5,
                    cursor: isAgreed ? "pointer" : "not-allowed",
                }}>
                    회원가입
                </button>
            </form>
            {isModalOpen && <PersonalCheckModal onClose={() => setIsModalOpen(false)}/>}
        </div>
    );
}

export function PersonalCheckModal({onClose}) {
    return (
        <div className="modal-overlay-personal">
            <div className="modal-content-personal">
                <h3>개인정보처리방침 안내</h3>
                <div className="modal-body-personal">
                    <p>
                        본 서비스는 회원님의 개인정보를 보호하기 위해 「개인정보 보호법」을 준수하며,
                        서비스 제공을 위한 최소한의 정보만을 수집합니다.
                    </p>
                    <ul>
                        <li>① 수집 항목: 아이디, 이름, 비밀번호, 보호자 여부 등</li>
                        <li>② 이용 목적: 회원 관리, 혈당 관리 서비스 제공</li>
                        <li>③ 보유 기간: 회원 탈퇴 시 즉시 파기</li>
                        <li>④ 회원은 언제든지 개인정보 열람·정정·삭제를 요청할 수 있습니다.</li>
                    </ul>
                    <p>자세한 내용은 추후 공지되는 개인정보처리방침 전문을 참고하시기 바랍니다.</p>
                </div>
                <button className="btn-primary-join" onClick={onClose}>확인</button>
            </div>
        </div>
    );
}