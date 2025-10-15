import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import axios from "axios";
import "./css/HabitInsight.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function HabitInsight({state}) {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);

  /** ====== 변환 유틸 ====== */
  const exerciseToScore = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val >= 30 ? 2 : val >= 10 ? 1 : 0;
    if (typeof val === "boolean") return val ? 2 : 0;
    const s = String(val).replace(/\s/g, "");
    if (/30분|30m|30min|예/.test(s)) return 2;
    if (/10분|10m|10min/.test(s)) return 1;
    if (/아니오|no|false/.test(s)) return 0;
    return 0;
  };
  const exerciseToLabel = (val) => {
    if (val == null) return "아니오";
    if (typeof val === "number")
      return val >= 30 ? "30분 이상" : val >= 10 ? "10분 이상" : "아니오";
    if (typeof val === "boolean") return val ? "30분 이상" : "아니오";
    const s = String(val);
    if (s.includes("30")) return "30분 이상";
    if (s.includes("10")) return "10분 이상";
    if (/(예|yes|true)/i.test(s)) return "30분 이상";
    return /(아니오|no|false)/i.test(s) ? "아니오" : s;
  };

  const sleepToNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    const s = String(val).replace(/\s/g, "");
    if (/7시간이상/.test(s)) return 7;
    if (/5[–-]?7시간/.test(s)) return 6;
    if (/5시간미만/.test(s)) return 4.5;
    const parsed = parseFloat(s);
    return Number.isFinite(parsed) ? parsed : 6;
  };
  const sleepToScore = (val) => {
    const h = sleepToNumber(val);
    return h >= 7 ? 2 : h >= 5 ? 1 : 0;
  };
  const sleepToLabel = (val) => {
    if (typeof val === "number") return `${val}시간`;
    return String(val);
  };

  const fatigueToScore = (val) => (val === "아니오" ? 2 : val === "조금" ? 1 : 0);
  const sugarToScore = (val) => (val === "안 먹음" ? 2 : val === "조금" ? 1 : 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const res = await axios.get("http://localhost:8080/selfTest/logs", {
            params: { userId: state?.profile?.userId ?? "guest" },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setLogs(data);
          calcSummary(data);
        } else {
          throw new Error("empty");
        }
      } catch (err) {
        console.log("⚠️ API 응답 실패 — 더미 데이터로 대체합니다.");
        // (더미 데이터는 그대로 유지)
      }
    };
    fetchData();
  }, []);


  /** 요약 */
  const calcSummary = (data) => {
    let exercise10Plus = 0;
    let totalSleep = 0;
    let fatigueScoreSum = 0;
    data.forEach((d) => {
      if (exerciseToScore(d.exercise) >= 1) exercise10Plus++;
      totalSleep += sleepToNumber(d.sleep);
      fatigueScoreSum += d.fatigue === "많이" ? 2 : d.fatigue === "조금" ? 1 : 0;
    });
    const avgSleep = (totalSleep / data.length).toFixed(1);
    const exerciseRate = ((exercise10Plus / data.length) * 100).toFixed(0);
    const fatigueAvg = (fatigueScoreSum / data.length).toFixed(1);
    setSummary({ avgSleep, exerciseRate, fatigueAvg });
  };

  if (!summary) return <div>데이터 로딩 중...</div>;

  /** 원시값(툴팁에 표시) & 점수(막대 높이) */
  const sleepRaw = logs.map((d) => sleepToLabel(d.sleep));
  const exerRaw  = logs.map((d) => exerciseToLabel(d.exercise));
  const fatiRaw  = logs.map((d) => d.fatigue ?? "");
  const sugarRaw = logs.map((d) => d.sugar ?? "");

  const barData = {
    labels: logs.map((d) => d.date),
    datasets: [
      {
        label: "운동",
        data: logs.map((d) => exerciseToScore(d.exercise)),
        backgroundColor: "#86efac",
        raw: exerRaw,
      },
      {
        label: "수면",
        data: logs.map((d) => sleepToScore(d.sleep)),
        backgroundColor: "#93c5fd",
        raw: sleepRaw,
      },
      {
        label: "피로",
        data: logs.map((d) => fatigueToScore(d.fatigue)),
        backgroundColor: "#fde68a",
        raw: fatiRaw,
      },
      {
        label: "단 음식",
        data: logs.map((d) => sugarToScore(d.sugar)),
        backgroundColor: "#fca5a5",
        raw: sugarRaw,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "최근 7일 생활습관 점수 (0=나쁨, 2=좋음)" },
      tooltip: {
        callbacks: {
          title: (items) => (items[0] ? `날짜: ${barData.labels[items[0].dataIndex]}` : ""),
          label: (ctx) => {
            const raw = ctx.dataset.raw?.[ctx.dataIndex];
            // 점수 대신 원래 값을 보여줌
            return ` ${ctx.dataset.label}: ${raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 2,
        ticks: { stepSize: 1, callback: (v) => `${v}점` },
        title: { display: true, text: "점수" },
      },
    },
  };

  const exerciseRateNum = Number(summary.exerciseRate);

  return (
    <div className="habit-section card-selfTest">
      <h3>🌿 건강습관 인사이트</h3>

      <div className="insight-bar">
        <h4>최근 7일 생활습관 점수</h4>
        <Bar data={barData} options={barOptions} />
      </div>

      <div className="insight-stats">
        <div className="stat-item">
          <div className="doughnut-mini">
            <Doughnut
              data={{
                labels: ["운동 실천(≥10분)", "미실천"],
                datasets: [
                  {
                    data: [exerciseRateNum, 100 - exerciseRateNum],
                    backgroundColor: ["#86efac", "#e5e7eb"],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                cutout: "70%",
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
              }}
            />
            <div className="doughnut-label">{exerciseRateNum}%</div>
          </div>
          <p>🏃‍♀️ 운동 실천율</p>
        </div>

        <div className="stat-item">
          <p>💤 평균 수면시간</p>
          <strong>{summary.avgSleep}시간</strong>
        </div>

        <div className="stat-item">
          <p>😌 평균 피로도</p>
          <strong>{summary.fatigueAvg}</strong>
        </div>
      </div>

      <div className="insight-comment">
        <p>지난주보다 운동 실천율이 20% 향상되었습니다!!</p>
        <p>수면시간은 평균 {summary.avgSleep}시간으로 다소 부족합니다</p>
      </div>
    </div>
  );
}
