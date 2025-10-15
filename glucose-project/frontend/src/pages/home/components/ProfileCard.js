import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Activity, Utensils, Settings} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./utils/button";
import { SubscriptionModal } from "./SubscriptionModal";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProfileCard({ state, setState }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 프로필 정보
    const name = state.profile?.userName
        ? `${state.profile.userName}님`
        : "로그인이 필요합니다";
    const height = state.profile?.height ?? "--";
    const weight = state.profile?.weight ?? "--";
    const bmi =
        typeof height === "number" && typeof weight === "number"
            ? (weight / ((height / 100) ** 2)).toFixed(1)
            : "--";
    // const attendance = state.profile?.attendance ?? 0;

    // 식단 state
    const [mealType, setMealType] = useState("아침");
    const [menu, setMenu] = useState("");
    const [meals, setMeals] = useState([]);

    const addMeal = () => {
        if (!menu.trim()) return;
        setMeals([...meals, { meal: mealType, menu }]);
        setMenu("");
    };

    const today = new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    });

    // ✅ 오늘의 평균 혈당값
    const avgGlucose = 109;

    // ✅ 혈당에 따른 건강 타입 계산
    const healthStatus =
        avgGlucose < 100
            ? {
                label: "양호 ✅",
                color: "#dcfce7",
                gradient: "linear-gradient(135deg,#dcfce7,#86efac)",
                text: "혈당이 안정적이에요. 잘 유지하고 있어요!",
            }
            : avgGlucose < 130
                ? {
                    label: "주의 ⚠️",
                    color: "#fef3c7",
                    gradient: "linear-gradient(135deg,#fffbea,#fde68a)",
                    text: "혈당 변동이 약간 높아요. 수분 섭취와 스트레칭을 추천드려요!",
                }
                : {
                    label: "위험 🚨",
                    color: "#fee2e2",
                    gradient: "linear-gradient(135deg,#fee2e2,#fca5a5)",
                    text: "혈당이 높습니다. 당분 섭취를 주의하세요!",
                };

    // ✅ 도넛 (목표 달성률)
    const donutData = {
        labels: ["달성률", "남은 목표"],
        datasets: [
            {
                data: [72, 28],
                backgroundColor: ["#4CAF50", "#E0E0E0"],
                borderWidth: 1,
            },
        ],
    };
    const donutOptions = {
        cutout: "75%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };

    // ✅ 오늘의 식단 점수 (예시)
    const dietScore = 70;

    // ✅ 영양제 추천 더미 데이터
    const supplements = ["마그네핏 플러스", "아연업 밸런스", "비타바이오 컴플렉스"];

    return (
        <div className="card shadow-sm h-100 d-flex flex-column gap-2 p-2">
            <div className="card-body mt-3 shadow-sm flex-grow-1 overflow-auto">
                {/* 프로필 아이콘 */}
                {(state?.userId || state?.profile?.userId) ? (
                    // ✅ 로그인 했을 때 → 프로필 이미지
                    <div
                        className="rounded-circle mx-auto mb-3 shadow-sm"
                        style={{
                            height: 125,
                            width: 125,
                            backgroundImage: `url(${require("../../../assets/profile.png")})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            border: "2px solid #0f766e",
                        }}
                    ></div>
                ) : (
                    <div
                        className="rounded-circle mx-auto mb-3 shadow-sm"
                        style={{
                            height: 125,
                            width: 125,
                            background: "linear-gradient(135deg,#14b8a6,#0f766e)",
                        }}
                    ></div>
                )}
                {/* 이름 */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <h5 className="mb-0">{name}</h5>
                    {(state?.userId || state?.profile?.userId) && (
                    <Settings
                        size={18}
                        className="text-secondary cursor-pointer"
                        onClick={() => navigate("/userDetail")}
                        style={{ cursor: "pointer" }}
                    />)}
                </div>
                {/* BMI & 출석률 */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between px-3">
                        <span className="fw-semibold">BMI</span>
                        <span>{bmi}</span>
                    </div>
                    {/*<div className="d-flex justify-content-between px-3">*/}
                    {/*    <span className="fw-semibold">출석률</span>*/}
                    {/*    <span>{attendance}%</span>*/}
                    {/*</div>*/}
                    {/*<div className="progress mt-2" style={{ height: "6px" }}>*/}
                    {/*    <div*/}
                    {/*        className="progress-bar bg-success"*/}
                    {/*        role="progressbar"*/}
                    {/*        style={{ width: `${attendance}%` }}*/}
                    {/*        aria-valuenow={attendance}*/}
                    {/*        aria-valuemin="0"*/}
                    {/*        aria-valuemax="100"*/}
                    {/*    ></div>*/}
                    {/*</div>*/}
                </div>

                <div className="mt-4 text-muted small d-flex align-items-center justify-content-center gap-2">
                    <Activity size={16} className="text-success" />
                    <span>꾸준함이 건강을 만듭니다 💪</span>
                </div>

                {/* 버튼 영역 */}
                <div className="d-grid gap-2">
                    {state.isLoggedIn ? (
                        <>
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate("/mypage")}
                            >
                                내 프로필 보기
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() =>
                                    setState((s) => ({
                                        ...s,
                                        isLoggedIn: false,
                                        profile: {},
                                    }))
                                }
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-success"
                            onClick={() => navigate("/login")}
                        >
                            로그인
                        </button>
                    )}
                </div>
            </div>{/* 구독서비스 */}
            <div className="card mt-3 shadow-sm rounded-3 p-2 text-center">
                <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br to-indigo-100 rounded-lg py-1 px-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        건강 관리 서비스
                    </h3>
                    <p className="text-gray-500 mb-3" style={{ fontSize: "small" }}>
                        맞춤형 운동과 건강 관리를 시작하세요
                    </p>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="lg"
                        className="bg-black text-white hover:bg-gray-800 transition"
                    >
                        구독 플랜 보기
                    </Button>
                </div>

                <SubscriptionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>

            {/* 오늘의 식단 */}
            <div className="card mt-3 shadow-sm" style={{ borderRadius: "15px" }}>
                <div
                    className="card-header bg-white fw-bold d-flex align-items-center gap-2"
                    style={{ borderBottom: "1px solid #eee" }}
                >
                    <Utensils size={18} className="text-success" />
                    <span>오늘의 식단</span>
                </div>

                <div className="card-body p-3 d-flex flex-column">
                    <div className="text-center mb-3">
                        <span className="fw-semibold text-secondary">{today}</span>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-3">
                        <select
                            className="form-select"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                        >
                            <option>아침</option>
                            <option>점심</option>
                            <option>저녁</option>
                            <option>간식</option>
                        </select>

                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="메뉴 입력"
                                value={menu}
                                onChange={(e) => setMenu(e.target.value)}
                            />
                            <button className="btn btn-success px-3" onClick={addMeal}>
                                추가
                            </button>
                        </div>
                    </div>

                    {meals.length > 0 ? (
                        <ul className="list-group small shadow-sm rounded">
                            {meals.map((m, idx) => (
                                <li
                                    key={idx}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <span className="fw-semibold text-success">{m.meal}</span>
                                    <span className="text-dark">{m.menu}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted text-center mb-0 small">
                            아직 기록된 식단이 없습니다.
                        </p>
                    )}
                </div>

                {/* ✅ 도넛 차트 카드 */}
                {/*<div className="card shadow-sm">*/}
                {/*    <div className="card-body text-center">*/}
                {/*        <h6 className="fw-bold text-success mb-2">목표 달성률</h6>*/}
                {/*        <div style={{ width: "120px", margin: "0 auto" }}>*/}
                {/*            <Doughnut data={donutData} options={donutOptions} />*/}
                {/*        </div>*/}
                {/*        <p className="mt-2 mb-0 text-muted">72% 달성</p>*/}
                {/*    </div>*/}
                {/*</div>*/}


            {/* ✅ 오늘의 건강 리포트 */}
            <div className="card mt-3 shadow-sm rounded-3 p-3 text-center">
                <h5 className="fw-bold mb-3" style={{ color: "#16a34a" }}>
                    오늘의 건강 리포트
                </h5>

                {/* 평균 혈당 */}
                <div className="d-flex flex-column align-items-center mb-4">
                    <div style={{ width: "140px", height: "140px", position: "relative" }}>
                        <Doughnut
                            data={{
                                labels: ["혈당", "남은 수치"],
                                datasets: [
                                    {
                                        data: [avgGlucose, 200 - avgGlucose],
                                        backgroundColor: ["#16a34a", "#e5e7eb"],
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                cutout: "78%",
                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontWeight: 800,
                                color: "#111827",
                                fontSize: "28px",
                                lineHeight: "1.1em",
                            }}
                        >
                            {avgGlucose}
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>mg/dL</div>
                        </div>
                    </div>
                    <span className="fw-semibold mt-2" style={{ fontSize: "15px", color: "#374151" }}>
            오늘의 평균 혈당
          </span>
                </div>

                {/* 건강 상태 카드 */}
                <div
                    className="card border-0 shadow-sm mb-3 py-3 px-2"
                    style={{
                        background: healthStatus.gradient,
                        borderRadius: "12px",
                    }}
                >
                    <div className="d-flex flex-column align-items-center">
                        <div
                            className="badge mb-2"
                            style={{
                                backgroundColor: healthStatus.color,
                                fontSize: "14px",
                                fontWeight: 700,
                                padding: "8px 14px",
                                borderRadius: "50px",
                                color: "#111827",
                            }}
                        >
                            {healthStatus.label}
                        </div>
                        <p className="fw-semibold text-secondary small mb-1">
                            {healthStatus.text}
                        </p>
                    </div>
                </div>

                {/* 제로 간식 추천 */}
                <div
                    className="card border-0 shadow-sm px-3 py-3 mb-3"
                    style={{
                        background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
                        borderRadius: "12px",
                    }}
                >
                    <h6 className="fw-bold text-primary mb-2">오늘의 제로 간식 추천 🍬</h6>
                    <ul className="list-unstyled mb-0 small text-muted text-start">
                        <li>1️⃣ 곤약젤리</li>
                        <li>2️⃣ 곤약팝콘</li>
                        <li>3️⃣ 제로 콜라</li>
                        <li>4️⃣ 다크 초콜릿 100%</li>
                    </ul>
                </div>

                {/* ✅ 오늘의 식단 점수 */}
                <div
                    className="card border-0 shadow-sm mb-3 py-4"
                    style={{
                        background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
                        borderRadius: "14px",
                    }}
                >
                    <h5
                        className="fw-bold mb-1"
                        style={{ color: "#059669", fontSize: "22px" }}
                    >
                        오늘의 식단 점수
                    </h5>
                    <p
                        className="fw-bold mb-2"
                        style={{ color: "#065f46", fontSize: "40px" }}
                    >
                        {dietScore}점
                    </p>
                    <p className="text-muted small mb-0">
                        마그네슘과 아연이 부족합니다. 영양제를 추천합니다.
                    </p>
                </div>

                {/* ✅ 영양제 추천 카드 */}
                <div
                    className="card border-0 shadow-sm px-3 py-3"
                    style={{
                        background: "linear-gradient(135deg,#fff7ed,#ffedd5)",
                        borderRadius: "12px",
                    }}
                >
                    <h6 className="fw-bold text-amber-800 mb-2">
                        추천 영양제 💊
                    </h6>
                    <ul className="list-unstyled mb-0 small text-muted text-start">
                        {supplements.map((s, i) => (
                            <li key={i}>
                                {i + 1}. {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>


            </div>
        </div>
    );
}
