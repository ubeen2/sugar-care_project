import React, {useEffect, useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ProfileCard from "./components/ProfileCard";
import TodayBlood from "./components/TodayBlood";
import {useNavigate} from "react-router-dom";
import Chatbot from "./components/Chatbot";
import MapDetail from "./components/mapDetail";
import "./HomePage.css";
import Market from "./components/Market";
import Youtube from "./components/ExerciseContents";
import Glucose from "./components/GlucoseLevel";
import {Modal, Button} from "react-bootstrap";
import SelfTest from "./components/SelfTest";
import HabitInsight from "./components/HabitInsight";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HomePage({state, setState}) {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [showTestAlert, setShowTestAlert] = useState(false);

    const userId = state?.profile?.userId;

    // ✅ 오늘 자가테스트 여부 감지
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const lastTest = localStorage.getItem("lastSelfTestDate");
        const skipToday = localStorage.getItem("skipTodayAlert");

        // ✅ 로그인된 사용자만 팝업 체크
        if (userId && lastTest !== today && skipToday !== "true") {
            setShowTestAlert(true);
        }
    }, [state?.userId]);

    // ✅ 테스트 시작
    const handleStartTest = () => {
        setShow(true);
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem("lastSelfTestDate", today);
        setShowTestAlert(false);
    };
    const handleSkipToday = () => {
        localStorage.setItem("skipTodayAlert", "true");
        setShowTestAlert(false);
    };

    return (<>
            <div className="container-fluid mt-3">
                <div className="row g-3 align-items-stretch">
                    {/* ===== 왼쪽 프로필 ===== */}
                    <div className="col-md-3 d-flex flex-column">
                        <div className="card flex-fill shadow-sm">
                            <div className="card-body p-2 h-100">
                                <ProfileCard state={state} setState={setState}/>
                            </div>
                        </div>
                    </div>

                    {/* ===== 오른쪽 메인 ===== */}
                    <div className="col-md-9 d-flex flex-column gap-3">

                        {/* ✅ 통합형: AI 혈당 분석 + 실시간 혈당 */}
                        <div
                            className="card shadow-sm"
                            style={{
                                borderRadius: "12px", overflow: "hidden", padding: "16px 20px", marginBottom:"10px"
                            }}
                        >
                                <Glucose state={state} userId={userId}/>


                            {/* 하단: 실시간 혈당 모니터링 */}
                            <div
                                className="p-0"
                                style={{
                                    borderRadius: "10px", border: "1px solid #e0e0e0", backgroundColor: "#ffffff",
                                }}
                            >
                                <TodayBlood state={state} userId={userId}/>
                            </div>
                        </div>

                        {/* 2️⃣ 자가테스트 + 일정 */}
                        <div className="d-flex gap-3">
                            {/* 자가테스트 */}
                            <div
                                className="card flex-fill text-center shadow-sm"
                                style={{borderRadius: "12px", flex: 1}}
                            >
                                <div className="card-body">
                                    <h5 className="card-title mb-3 text-success fw-bold">
                                        오늘의 자가테스트
                                    </h5>
                                    <button
                                        className={`btn w-100 ${showTestAlert ? "btn-danger blink-btn" : "btn-success"}`}
                                        onClick={handleStartTest}
                                    >
                                        자가테스트 시작
                                    </button>
                                </div>
                            </div>

                            {/* 일정 카드 */}
                            <div
                                className="card flex-fill shadow-sm"
                                style={{
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    flex: 2,
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e0e0e0",
                                }}
                            >
                                <div
                                    className="card-header d-flex justify-content-between align-items-center"
                                    style={{
                                        backgroundColor: "#f9fafb",
                                        padding: "10px 14px",
                                        borderBottom: "1px solid #e0e0e0",
                                    }}
                                >
                                    <h6
                                        className="fw-bold mb-0"
                                        style={{color: "#198754", fontSize: "15px"}}
                                    >
                                        오늘의 일정
                                    </h6>
                                    <button
                                        className="btn-schedule btn-sm"
                                        style={{
                                            backgroundColor: "#198754 ",
                                            color: "white",
                                            fontWeight: 600,
                                            borderRadius: "6px",
                                            padding: "4px 10px",
                                            fontSize: "13px",
                                        }}
                                    >
                                        + 일정 추가
                                    </button>
                                </div>

                                <div className="card-body px-3 py-3">
                                    <ul className="list-unstyled mb-0 small">
                                        <li
                                            className="mb-2 d-flex justify-content-between align-items-center"
                                            style={{
                                                borderBottom: "1px dashed #e9ecef", paddingBottom: "6px",
                                            }}
                                        >
                      <span>
                        🟢 <strong>아침 혈당 측정</strong>
                      </span>
                                            <span className="text-muted" style={{fontSize: "13px"}}>
                        08:00 AM <span className="badge bg-success">완료</span>
                      </span>
                                        </li>
                                        <li
                                            className="mb-2 d-flex justify-content-between align-items-center"
                                            style={{
                                                borderBottom: "1px dashed #e9ecef", paddingBottom: "6px",
                                            }}
                                        >
                      <span>
                        🟠 <strong>점심 후 혈당 측정</strong>
                      </span>
                                            <span className="text-muted" style={{fontSize: "13px"}}>
                        01:00 PM{" "}
                                                <span className="badge bg-warning text-dark">대기</span>
                      </span>
                                        </li>
                                        <li
                                            className="mb-2 d-flex justify-content-between align-items-center"
                                            style={{
                                                borderBottom: "1px dashed #e9ecef", paddingBottom: "6px",
                                            }}
                                        >
                      <span>
                        🔵 <strong>저녁 운동</strong>
                      </span>
                                            <span className="text-muted" style={{fontSize: "13px"}}>
                        06:00 PM <span className="badge bg-primary">예정</span>
                      </span>
                                        </li>
                                        <li className="d-flex justify-content-between align-items-center">
                      <span>
                        🟣 <strong>저녁 혈당 측정</strong>
                      </span>
                                            <span className="text-muted" style={{fontSize: "13px"}}>
                        09:00 PM <span className="badge bg-secondary">예정</span>
                      </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 자가테스트 Modal */}
                        <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
                            <Modal.Body style={{ position: "relative", paddingTop: "16px" }}>
                                <button
                                    onClick={() => setShow(false)}
                                    className="close-btn-selfTest"
                                    aria-label="닫기"
                                >
                                    ✕
                                </button>
                                <SelfTest state={state} setState={setState} onClose={() => setShow(false)} />
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShow(false)}>
                                    닫기
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* 3️⃣ 건강습관 인사이트 */}
                            <HabitInsight state={state}/>
                    </div>
                </div>

                {/* 지도 */}
                <div className="row g-3 mt-4">
                    <div className="col-12">
                        <div
                            className={`card shadow-sm mt-4 position-relative ${state.riskAlert ? "map-alert" : ""}`}
                            style={{
                                borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff",
                            }}
                        >
                            {state.riskAlert && (<div
                                    className="position-absolute top-0 start-50 translate-middle-x text-danger fw-bold bg-white px-3 py-2 rounded-bottom shadow-sm"
                                    style={{
                                        zIndex: 10, animation: "blink-text 1s infinite",
                                    }}
                                >
                                    ⚠ 가까운 병원에 내원하세요
                                </div>)}
                            <div className="card-body p-3">
                                <h5 className="card-title mb-3 text-success fw-bold">
                                    🏃‍♂️ 내 주변 건강시설
                                </h5>
                                <div
                                    style={{
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                        boxShadow: "inset 0 0 5px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <MapDetail/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 운동 추천 */}
                <div className="row g-3 mt-4">
                    <div className="col-12">
                        <div className="card exercise-card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title mb-3 text-success fw-bold">
                                        운동 추천
                                    </h5>
                                    <a
                                        href="/exerciseDetail"
                                        className="text-success fw-semibold small"
                                        style={{textDecoration: "none"}}
                                    >
                                        더 보기 &gt;
                                    </a>
                                </div>
                                <Youtube/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 쇼핑 추천 */}
                <div className="row g-3 mt-4">
                    <Market/>
                </div>
            </div>


            {/* 팝업 */}
            {(state?.userId || state?.profile?.userId) && showTestAlert && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <p className="mb-3">오늘 자가테스트를 아직 하지 않으셨네요 😊</p>
                        <div className="d-flex justify-content-center gap-3">
                            <Button variant="success" onClick={handleStartTest}>
                                지금 하기
                            </Button>
                            <Button variant="danger" onClick={handleSkipToday}>
                                오늘은<br/> 다시 보지 않기
                            </Button>
                        </div>
                    </div>
                </div>
            )}


        {/* 챗봇 */}
            <div className="chat-fab">
                <Chatbot/>
            </div>
        </>);
}
