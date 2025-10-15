// src/App.jsx
import React from "react";
import "./App.css";
import useLocalState from "./hooks/useLocalState";
import useInjectCSS from "./hooks/useInjectCSS";
import TopNav from "./pages/home/components/TopNav";
import HomePage from "./pages/home/HomePage";
import MyPage from "./pages/home/MyPage";
import LoginPage from "./pages/home/LoginPage";
import SignupPage from "./pages/home/JoinPage";
import MapDetail from "./pages/home/components/mapDetail";
import MarketDetail from "./pages/home/components/MarketDetail";
import { Routes, Route, Link } from "react-router-dom";
import ExerciseDetail from "./pages/home/components/ExerciseDetail";
import GuardianPage from "./pages/home/components/GuardianPage";
import Footer from "./pages/home/components/Footer";
import UserDetail from "./pages/home/UserDetail"; // add (251010)

export default function App() {
    const [state, setState] = useLocalState();
    useInjectCSS({ dark: state.dark, big: state.big });

    return (
        <div  data-theme={state.dark ? "dark" : "light"}>
            {/* ✅ 공통 헤더 */}
            <TopNav state={state} setState={setState} />

            {/* ✅ 페이지 라우터 */}
            <Routes>
                <Route path="/" element={<HomePage state={state} setState={setState} />} />
                <Route path="/mypage" element={<MyPage state={state} setState={setState} />} />
                <Route path="/userDetail" element={<UserDetail state={state} setState={setState} />} /> {/* 추가 */}
                <Route path="/login" element={<LoginPage state={state} setState={setState} />} />
                <Route path="/signup" element={<SignupPage state={state} setState={setState} />} />
                <Route path="/map" element={<MapDetail state={state} setState={setState} />} />
                <Route path="/marketDetail" element={<MarketDetail state={state} setState={setState} />}></Route>
                <Route path="/exerciseDetail" element={<ExerciseDetail state={state} setState={setState} />}></Route>
                <Route path="/guardianPage" element={<GuardianPage state={state} setState={setState} />}></Route>
            </Routes>
            <Footer />
        </div>
    );
}
