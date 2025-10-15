import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // CSS 연결

export default function LoginPage({ state, setState }) {
    const [form, setForm] = useState({ userId: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:8080/user/login", form);

            alert("로그인 성공!");
            setState((s) => ({
                ...s,
                isLoggedIn: true,
                profile: res.data,
            }));
            console.log("현재 프로필:",res.data.value);
            navigate("/");
        } catch (err) {
            alert("로그인 실패: 아이디/비밀번호 확인하세요");
            console.error(err);
        }
    };

    return (
        <div className="card-login">
            <h2>로그인</h2>
            <input
                type="text"
                name="userId"
                placeholder="아이디"
                value={form.userId}
                onChange={handleChange}
            />
            <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={form.password}
                onChange={handleChange}
            />
            <button className="btn-login" onClick={handleLogin}>
                로그인
            </button>
            <button className="btn-outline" onClick={() => navigate("/signup")}>
                회원가입
            </button>
            <button className="btn-outline" onClick={() => navigate("/")}>
                홈으로
            </button>
        </div>
    );
}