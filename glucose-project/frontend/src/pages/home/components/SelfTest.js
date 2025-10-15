import React, { useState } from "react";
import axios from "axios";
import "./css/SelftTest.css";

export default function SelfTest({ state, setState,onClose }) {
    const profile = state?.profile || {};
    const userId = profile?.userId ?? "guest";
    const name = profile?.userName ?? "이름 없음";
    const age = profile?.age ?? "나이 없음";
    const gender = profile?.gender ?? "성별 없음";

    const height = parseFloat(profile?.userHeight || profile?.height) || 0;
    const weight = parseFloat(profile?.userWeight || profile?.weight) || 0;

    const bmi =
        height && weight
            ? (weight / ((height / 100) ** 2)).toFixed(1)
            : "--";

    // 폼 상태
    const [form, setForm] = useState({
        sugar: "안 먹음",
        exercise: "30분 이상",
        stress: "조금",
        sleep: "7시간 이상",
        alcohol: "아니오",
        fatigue: "조금",
        post_meal: "아니오",
        weight: "안정",
        dentist: "아니오",
        cavity: "없음",
    });

    const QUESTIONS = [
        { id: "exercise", label: "운동 여부", options: ["아니오", "10분 이상", "30분 이상"] },
        { id: "sugar", label: "오늘 단 음료/간식?", options: ["안 먹음", "조금", "자주"] },
        { id: "stress", label: "스트레스 정도", options: ["거의 없음", "조금", "많음"] },
        { id: "sleep", label: "어젯밤 수면시간", options: ["7시간 이상", "5–7시간", "5시간 미만"] },
        { id: "alcohol", label: "오늘 음주 여부", options: ["아니오", "소량", "많이"] },
        { id: "fatigue", label: "피로감", options: ["아니오", "조금", "많이"] },
        { id: "post_meal", label: "식후 졸림/갈증", options: ["아니오", "약간", "자주"] },
        { id: "weight", label: "최근 체중 변화", options: ["안정", "조금 증가", "많이 증가"] },
        { id: "dentist", label: "치과 진료(1년 내)", options: ["아니오", "예"] },
        { id: "cavity", label: "충치 여부", options: ["없음", "있음"] },
    ];

    const [exam, setExam] = useState({
        공복혈당: "",
        LDL: "",
        HDL: "",
        트리글리세라이드: "",
        총콜레스테롤: "",
        혈중요산: "",
        혈색소: "",
        혈소판: "",
    });

    const avgMetrics = {
        공복혈당: 95,
        LDL: 140,
        HDL: 55,
        트리글리세라이드: 120,
        총콜레스테롤: 190,
        혈중요산: 4.5,
        혈색소: 13.5,
        혈소판: 220,
    };

    const [showExam, setShowExam] = useState(false);
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleExamChange = (e) => {
        const { id, value } = e.target;
        setExam((prev) => ({ ...prev, [id]: value }));
    };

    // 리스크 계산
    const estimateRisk = (ans, ex) => {
        let score = 0;

        if (ans.sugar === "조금") score += 1;
        if (ans.sugar === "자주") score += 2;

        if (ans.exercise === "아니오") score += 2;
        else if (ans.exercise === "10분 이상") score += 1;

        if (ans.stress === "많음") score += 2;
        else if (ans.stress === "조금") score += 1;

        if (ans.sleep === "5시간 미만") score += 2;
        else if (ans.sleep === "5–7시간") score += 1;

        if (ans.alcohol === "소량") score += 1;
        else if (ans.alcohol === "많이") score += 3;

        if (ans.fatigue === "조금") score += 1;
        else if (ans.fatigue === "많이") score += 2;

        if (ans.post_meal === "약간") score += 1;
        else if (ans.post_meal === "자주") score += 2;

        if (ans.weight === "조금 증가") score += 1;
        else if (ans.weight === "많이 증가") score += 2;

        if (ans.dentist === "예") score += 1;
        if (ans.cavity === "있음") score += 1;

        const safe = {
            ...avgMetrics,
            ...Object.fromEntries(
                Object.entries(ex).map(([k, v]) => [k, v ? parseFloat(v) : avgMetrics[k]])
            ),
        };

        if (safe.공복혈당 >= 126) score += 2;
        else if (safe.공복혈당 >= 100) score += 1;

        if (safe.LDL >= 160) score += 2;
        else if (safe.LDL >= 130) score += 1;

        if (safe.HDL < 40) score += 1;

        if (safe.트리글리세라이드 >= 200) score += 2;
        else if (safe.트리글리세라이드 >= 150) score += 1;

        if (safe.총콜레스테롤 >= 200) score += 1;
        if (safe.혈중요산 >= 7.0) score += 1;
        if (safe.혈색소 < 12.0) score += 1;
        if (safe.혈소판 < 150) score += 1;

        if (bmi >= 25) score += 2;
        else if (bmi >= 23) score += 1;

        const risk = score <= 5 ? "양호" : score <= 9 ? "주의" : "위험";
        return { score, risk };
    };

    // ✅ 점수 계산
    const calc = () => {
        const res = estimateRisk(form, exam);
        setResult(res);
        setState((prev) => ({ ...prev, riskAlert: res.risk !== "양호" }));
    };

    const MAP = {
        "안 먹음": 0, "자주": 2,
        "아니오": 0, "소량": 1, "많이": 2,
        "거의 없음": 0, "조금": 1, "많음": 2,
        "7시간 이상": 0, "5–7시간": 1, "5시간 미만": 2,
        "안정": 0, "조금 증가": 1, "많이 증가": 2,
        "없음": 0, "있음": 1,
        "예": 1,
    };

    //저장 기능
    const handleSave = async () => {
        if (!result) return alert("먼저 점수를 계산해주세요!");

        const payload = {
            userId,
            sugar: MAP[form.sugar],
            exercise: MAP[form.exercise],
            stress: MAP[form.stress],
            sleepHours: form.sleep === "7시간 이상" ? 0 : form.sleep === "5–7시간" ? 1 : 2,
            isDrinking: MAP[form.alcohol],
            fatigueLevel: MAP[form.fatigue],
            postMeal: MAP[form.post_meal],
            weightChangeKg: MAP[form.weight],
            visitDentist: MAP[form.dentist],
            hasCaries: MAP[form.cavity],
            fbs: Number(exam["공복혈당"] || 0),
            ldlMg: Number(exam["LDL"] || 0),
            hdlMg: Number(exam["HDL"] || 0),
            totalCholMg: Number(exam["총콜레스테롤"] || 0),
            tgMg: Number(exam["트리글리세라이드"] || 0),
            uricAcidMgDl: Number(exam["혈중요산"] || 0),
            hgbGDl: Number(exam["혈색소"] || 0),
            plateletCount: Number(exam["혈소판"] || 0),
            height,
            weight,
            riskScore:result.score,
            riskLevel:result.risk
        };
        try {
            setSaving(true);
            await axios.post("http://localhost:8080/selfTest/save", payload);
            alert("✅ 자가테스트 데이터 저장 완료!");
            if (onClose) onClose(); // 모달 닫기
            window.location.reload(); // 페이지 새로고침
        } catch (err) {
            console.error(err);
            alert("❌ 저장 실패: 서버 오류");
        } finally {
            setSaving(false);
        }
    };

    const pillColor = (r) =>
        r === "양호" ? "mint" : r === "주의" ? "yellow" : "sky";

    const bmiNum = parseFloat(bmi);
    const bmiPercent = Math.min(100, Math.round((bmiNum / 30) * 100));
    const bmiTone = bmiNum < 23 ? "mint" : bmiNum < 25 ? "yellow" : "sky";

    return (
        <div id="self-test" className="soft-bg">
            <h2>🩺 오늘의 혈당 자가 점검</h2>

            {/* 기본 정보 */}
            <div className="info-card card-selfTest">
                <div className="info-body">
                    <div className="info-left">
                        <div className="info-title">기본정보</div>
                        <div className="info-grid tight-4">
                            <div className="chip">{age}</div>
                            <div className="chip">{gender}</div>
                            <div className="chip">키 {height}cm</div>
                            <div className="chip">체중 {weight}kg</div>
                        </div>
                    </div>
                    <div className="bmi-wrap">
                        <div
                            className={`bmi-ring ${bmiTone}`}
                            style={{ "--p": String(bmiPercent) }}
                        >
                            <div className="bmi-center">
                                <div className="bmi-value">{bmi}</div>
                                <small>BMI</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 설문 질문 */}
            <div className="card grid grid-2 grid-selfTest pastel-card">
                {QUESTIONS.map(({ id, label, options }) => (
                    <div key={id}>
                        <label>{label}</label>
                        <div className="segmented">
                            {options.map((opt) => {
                                const optId = `${id}-${opt.replace(/\s/g, "")}`;
                                return (
                                    <div className="check-pill" key={opt}>
                                        <input
                                            type="radio"
                                            id={optId}
                                            name={id}
                                            value={opt}
                                            checked={form[id] === opt}
                                            onChange={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    [id]: opt,
                                                }))
                                            }
                                        />
                                        <label htmlFor={optId}>{opt}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 추가 검사 입력 */}
            <button className="btn-selfTest sky-btn addTest" onClick={() => setShowExam(!showExam)}>
                {showExam ? "검진 항목 숨기기" : "검진 항목 추가 입력"}
            </button>

            {showExam && (
                <div className="card grid grid-2 grid-selfTest pastel-card">
                    {Object.keys(exam).map((key) => (
                        <div key={key}>
                            <label>{key}</label>
                            <input
                                id={key}
                                type="number"
                                step="0.1"
                                value={exam[key]}
                                onChange={handleExamChange}
                                placeholder={`평균 ${avgMetrics[key]}`}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="btns-selfTest">
                <button className="btn-selfTest primary sky-btn" onClick={calc}>
                    오늘 점수 보기
                </button>

                {result && (
                    <button
                        className="btn-selfTest mint-btn"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ marginLeft: "10px" }}
                    >
                        {saving ? "저장 중..." : "저장하기 💾"}
                    </button>
                )}
            </div>

            {/* 결과 표시 */}
            {result && (
                <div className="card card-selfTest pastel-card">
                    <p><strong>오늘의 혈당 리스크:</strong></p>
                    <span className={`pill ${pillColor(result.risk)}`}>{result.risk}</span>
                    <div className="meter" style={{ marginTop: 10 }}>
                        <span
                            style={{
                                width: `${(result.score / 15) * 100}%`,
                                background:
                                    result.risk === "양호"
                                        ? "#a7f3d0"
                                        : result.risk === "주의"
                                            ? "#fde68a"
                                            : "#93c5fd",
                            }}
                        />
                    </div>
                    <div style={{ marginTop: 8 }}>점수: {result.score} / 15</div>
                    <div className="foot">* 생활습관 및 건강 점검용입니다. 진단 목적이 아닙니다.</div>
                </div>
            )}
        </div>
    );
}
