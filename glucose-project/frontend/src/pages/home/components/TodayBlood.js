import React, { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ReferenceDot,ReferenceLine
} from "recharts";

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        const actual = payload.find((p) => p.dataKey === "actual")?.value;
        const predicted = payload.find((p) => p.dataKey === "predicted")?.value;
        return (
            <div className="bg-white p-2 border rounded shadow text-sm">
                <p>{`시간: ${label}`}</p>
                {actual && <p className="text-green-600">{`실제 혈당: ${actual} mg/dL`}</p>}
                {predicted && <p className="text-blue-600">{`AI 예측: ${predicted} mg/dL`}</p>}
            </div>
        );
    }
    return null;
}

export default function TodayBlood({ userId }) {
    const [mode, setMode] = useState("real"); // real = 실시간, ai = 예측
    const [allData, setAllData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [index, setIndex] = useState(0);
    const [aiProgress, setAiProgress] = useState([]);

    // DB에서 데이터 가져오기
    useEffect(() => {
        if(!userId) return;
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/realTimeData");
                const json = await res.json();
                if (json.ok) {
                    const formatted = json.data.map((d) => ({
                        time: new Date(d.measured_at).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }),
                        actual: d.glucose_value,
                    }));
                    setAllData(formatted); // 시간 순서 맞추기
                }
            } catch (err) {
                console.error("데이터 가져오기 실패", err);
            }
        };
        fetchData();
    }, [userId]);

    // 실시간 그래프: 5초마다 데이터 하나씩 추가
    useEffect(() => {
        if (mode !== "real" || allData.length === 0) return;

        const interval = setInterval(() => {
            setChartData((prev) => {
                const nextIndex = prev.length;
                if (nextIndex < allData.length) {
                    const nextPoint = allData[nextIndex];
                    if (!prev.some((d) => d.time === nextPoint.time)) {
                        return [...prev, nextPoint];
                    }
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [mode, allData]);

    // const activeData = mode === "real" ? chartData : aiData;

    useEffect(() => {
        if (mode !== "ai" || allData.length === 0) return;

        // 최근 12개만 사용
        const recent12 = allData.slice(-12);
        //const dummy=[120, 123, 125, 126, 128, 130, 129, 131, 133, 135, 136, 137];
        const features = recent12.map((d) => d.actual);
        //const features =dummy;

        const fetchPrediction = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ features: features }),
                });
                const json = await res.json();

                if (json.prediction !== undefined) {
                    const lastActual = recent12[recent12.length - 1];
                    const [hour, minute] = lastActual.time.split(":").map(Number);
                    const baseMinutes = hour * 60 + minute + 5;

                    const nextTimes = Array.from({ length: 4 }, (_, i) => {
                        const totalMinutes = baseMinutes + i * 5;
                        const newH = Math.floor(totalMinutes / 60) % 24;
                        const newM = totalMinutes % 60;
                        return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
                    });

                    // 연결점
                    const bridgePoint = {
                        time: lastActual.time,
                        predicted: lastActual.actual,
                        actual: lastActual.actual,
                    };

                    // 예측 구간
                    const predictedPoints = nextTimes.map((time, i) => ({
                        time,
                        predicted: json.prediction - i * 3,
                        actual: null,
                    }));

                    // ✅ 한 번에 고정된 데이터로 세팅
                    setAiProgress([bridgePoint, ...predictedPoints]);}
            } catch (err) {
                console.error("AI 예측 요청 실패:", err);
            }
        };


        fetchPrediction();
    }, [mode, allData]); //추가-민영

    useEffect(() => {
        console.log("🧠 allData (실시간 데이터):", allData);
    }, [allData]);

    // const activeData =
    //     mode === "real"
    //         ? chartData
    //         : (() => {
    //             if (allData.length === 0 || aiProgress.length === 0) return [];
    //
    //             const lastActual = allData[allData.length - 1]; // 10:55 시점
    //             const bridge = {
    //                 time: lastActual.time, // 10:55
    //                 predicted: lastActual.actual, // 실제값 복사해서 predicted 라인에 연결
    //                 actual: lastActual.actual,
    //             };
    //
    //             // ✅ allData + bridge + aiProgress 합치기
    //             return [...allData, bridge, ...aiProgress];
    //         })(); //추가 -민영
    const activeData =
        mode === "real"
            ? chartData
            : (() => {
                if (allData.length === 0 || aiProgress.length === 0) return [];

                const lastActual = allData[allData.length - 1];
                const bridge = {
                    time: lastActual.time,
                    predicted: lastActual.actual,
                    actual: lastActual.actual,
                };

                // ✅ 중복된 time 제거
                const filteredAll = allData.filter(
                    (d) => d.time !== bridge.time
                );

                return [...filteredAll, bridge, ...aiProgress];
            })();

    return (

            <div className="card-body">
                {/* 제목 + 버튼 */}
                <div className="d-flex justify-content-between">
                    <h5 className="fw-bold text-success m-0">💧혈당 모니터링</h5>
                    <div className="btn-group"  style={{width:"20%"}}>
                        <button
                            className={`btn btn-sm ${mode === "real" ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => setMode("real")}
                        >
                            실시간
                        </button>
                        <button
                            className={`btn btn-sm ${mode === "ai" ? "btn-success" : "btn-outline-success"}`}
                            onClick={() => setMode("ai")}

                        >
                            AI 예측
                        </button>
                    </div>
                </div>

                {/* 그래프 */}
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activeData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="time"
                            type="category"     // ✅ 명시적으로 카테고리 타입 지정
                            allowDuplicatedCategory={false} // ✅ 중복된 X값 무시 (bridge 문제 방지)
                            interval={0}
                        />
                        <YAxis domain={[60, 160]} label={{ value: "mg/dL", angle: -90, position: "insideLeft" }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />

                        {/* 실제 혈당 (초록 실선) */}
                        <Line
                            type="monotone"
                            dataKey="actual"
                            name="실제 혈당"
                            stroke="#16a34a"
                            strokeWidth={3}
                            dot={{ fill: "#16a34a", r: 4 }}
                        />

                        {/* AI 예측 (파란 점선) */}
                        {mode === "ai" && (
                            <>
                                {/* AI 예측 라인 */}
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    name="AI 예측"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ fill: "#3b82f6", r: 3 }}
                                />

                                {/* 기준선 (예측 시작점) */}
                                <ReferenceLine
                                    x={allData[allData.length - 1]?.time} // 10:55
                                    stroke="red"
                                    strokeWidth={2}
                                    strokeDasharray="3 3"
                                    label={{
                                        value: "예측 시작",
                                        position: "insideTop",
                                        fill: "red",
                                        fontWeight: "bold",
                                    }}
                                />
                                {/* 식사 시간 빨간 점 */}
                                {aiProgress.filter((d) => d.mealTime).map((d, i) => (
                                    <ReferenceDot key={i} x={d.time} y={d.actual} r={6} fill="red" stroke="red" />
                                ))}
                            </>
                        )}

                    </LineChart>
                </ResponsiveContainer>
            </div>

    );
}
