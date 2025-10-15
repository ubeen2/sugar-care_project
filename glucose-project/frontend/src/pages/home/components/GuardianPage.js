import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import "./css/GuardianPage.css";

export default function CareDashboard() {
    const data = [
        { time: "06:00", value: 90 },
        { time: "09:00", value: 115 },
        { time: "12:00", value: 140 },
        { time: "18:00", value: 185 },
        { time: "21:00", value: 180 },
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>🩺 보호자 대시보드</h2>
                <p>환자 건강 모니터링</p>
            </header>

            <div className="dashboard-body">
                {/* 왼쪽 환자 정보 */}
                <aside className="left-panel">
                    <div className="patient-card">
                        <div className="patient-avatar">김</div>
                        <div className="patient-info">
                            <p className="name">김영희 (67세)</p>
                            <div className="info-item">💧 혈압약: 사용</div>
                            <div className="info-item">🩸 진단명: 제2형 당뇨병</div>
                            <div className="info-item">🏥 담당의: 이건수 (내분비내과)</div>
                            <div className="info-item">📞 긴급연락처: 010-1234-5678</div>
                            <div className="info-item">📅 등록일: 2023.03.15</div>
                        </div>
                    </div>
                </aside>

                {/* 오른쪽 메인 */}
                <main className="main-panel">
                    {/* 경고 메시지 */}
                    <div className="alert-box">
                        <strong>⚠ 주의 · 병원 방문 필요</strong>
                        <p>현재 혈당 수치가 185mg/dL입니다. 즉시 병원에 내원하시기 바랍니다.</p>
                    </div>

                    {/* 혈당 그래프 */}
                    <div className="chart-card">
                        <h4>혈당 그래프</h4>
                        <LineChart width={550} height={220} data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[0, 200]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#0fa958" strokeWidth={2} />
                            <ReferenceLine y={180} label="주의선" stroke="#ff6666" strokeDasharray="4 4" />
                            <ReferenceLine y={100} label="최적 정상" stroke="#66cc66" strokeDasharray="4 4" />
                        </LineChart>
                    </div>

                    {/* 식단 + 운동 정보 */}
                    <div className="bottom-section">
                        <div className="meal-section">
                            <h4>🍚 오늘 먹은 식단</h4>

                            <div className="meal-box">
                                <h5>아침 <span>07:30</span></h5>
                                <p>현미밥, 된장찌개, 시금치나물, 계란프라이</p>
                                <p className="kcal">총 칼로리: 450kcal</p>
                            </div>

                            <div className="meal-box">
                                <h5>점심 <span>12:30</span></h5>
                                <p>잡곡밥, 불고기, 샐러드, 김치</p>
                                <p className="kcal">총 칼로리: 620kcal</p>
                            </div>

                            <div className="meal-box">
                                <h5>저녁 <span>18:30</span></h5>
                                <p>현미밥, 닭갈비, 상추쌈, 된장찌개</p>
                                <p className="kcal">총 칼로리: 780kcal</p>
                            </div>
                        </div>

                        <div className="exercise-section">
                            <h4>🏃 운동 정보</h4>

                            <div className="exercise-item">
                                <p>아침 산책 <span>06:30</span></p>
                                <p>30분 · 120kcal 소모</p>
                            </div>

                            <div className="exercise-item">
                                <p>스트레칭 <span>15:00</span></p>
                                <p>15분 · 45kcal 소모</p>
                            </div>

                            <p className="summary">총 운동 시간: 45분 / 총 소모 칼로리: 165kcal</p>
                        </div>
                    </div>

                    {/* 업데이트 시간 */}
                    <p className="update-time">마지막 업데이트: 2025.10.05 오후 3:34:10</p>
                </main>
            </div>
        </div>
    );
}
