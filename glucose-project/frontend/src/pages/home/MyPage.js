import React, {useState, useEffect} from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
    Download, AlertTriangle, CheckCircle2, XCircle, Activity, Clock, Flame, Lightbulb,
    TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import axios from "axios";

export default function MyPage({state}) {
    const profile = state?.profile ?? {};

    const handleDownloadPDF = () => window.print();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <MonthlyReport
                    profile={profile}
                />
            </div>
        </div>
    );
}

// Utility function for className merging
const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Card Component
const Card = ({className, children, ...props}) => {
    return (
        <div
            className={cn(
                'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Button Component
const Button = ({className, variant = 'default', children, ...props}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50';

    const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
    };

    return (
        <button
            className={cn(
                baseClasses,
                'h-9 px-4 py-2',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

// Badge Component
const Badge = ({className, variant = 'default', children, ...props}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap gap-1';

    const variants = {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground'
    };

    return (
        <span
            className={cn(baseClasses, variants[variant], className)}
            {...props}
        >
      {children}
    </span>
    );
};

// ============= 리포트 요소 =============

// 한달 혈당 요약
const MonthlyReportHeader = ({profile, month, onDownloadPDF}) => {


    const [bloodSummary, setBloodSummary] = useState({
        weeklyAvgBloodSugar: 0,
        breakfastAvg: 0,
        lunchAvg: 0,
        dinnerAvg: 0,
    });

    useEffect(() => {
        if (!profile?.userId) return;
        axios
            .get("http://localhost:8080/bloodsugar/summary", {
                params: {userId: profile.userId, days: 30},
            })
            .then((res) => setBloodSummary(res.data))
            .catch((err) => console.error("혈당 요약 불러오기 실패:", err));
    }, [profile?.userId]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="h-8 flex items-center">
                    <span className="text-2xl font-bold text-blue-600">Well-Dang</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{month}</span>
                    <Button onClick={onDownloadPDF} variant="outline" className="gap-2 no-print">
                        <Download className="w-4 h-4"/>
                        PDF 다운로드
                    </Button>
                </div>
            </div>

            <div>
                <h1 className="text-xl font-semibold">월간 건강 리포트</h1>
                <p className="text-gray-600 mt-2">
                    {profile.userName ?? "이름 없음"}님의 이번 달 건강 데이터를 요약했습니다.
                </p>
            </div>

            <Card className="p-6">
                <h3 className="mb-4">기본 정보</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-muted-foreground text-sm">이름</div>
                        <div className="mt-1">{profile.userName}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">나이</div>
                        <div className="mt-1">{profile.age}세</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">키</div>
                        <div className="mt-1">{profile.height}cm</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">몸무게</div>
                        <div className="mt-1">{profile.weight}kg</div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h4 className="mb-4">혈당 데이터</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-muted-foreground text-sm">주간 평균 혈당</div>
                            <div className="mt-1">{bloodSummary.weeklyAvgBloodSugar} mg/dL</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm">아침 식후 평균</div>
                            <div className="mt-1">{bloodSummary.breakfastAvg} mg/dL</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm">점심 식후 평균</div>
                            <div className="mt-1">{bloodSummary.lunchAvg} mg/dL</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm">저녁 식후 평균</div>
                            <div className="mt-1">{bloodSummary.dinnerAvg} mg/dL</div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};


// 자가테스트
export function HealthTestResults({profile}) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ 데이터 불러오기
    useEffect(() => {
        if (!profile?.userId) return;

        axios
            .get("http://localhost:8080/bloodsugar/selfTest/summary", {
                params: {userId: profile.userId, days: 30},
            })
            .then((res) => {
                setSummary(res.data);
            })
            .catch((err) => {
                console.error("요약 데이터 불러오기 실패:", err);
            })
            .finally(() => setLoading(false));
    }, [profile?.userId]);

    if (loading) return <div>📊 데이터를 불러오는 중...</div>;
    if (!summary) return <div>❌ 요약 데이터가 없습니다.</div>;

    // ✅ 최신 검사 결과
    const results = summary.latestCheckup || {};
    const risk = summary.risk || {};
    const lifestyle = summary.lifestyle || {};

    // ✅ 헬스 상태 판정 로직
    const getStatusColor = (value, type) => {
        const ranges = {
            ldl: {good: 130, warning: 160},
            tg: {good: 150, warning: 200},
            ggt: {good: 50, warning: 70},
            hemoglobin: {good: 16, warning: 18},
        };
        const range = ranges[type];
        if (value <= range.good) return "good";
        if (value <= range.warning) return "warning";
        return "danger";
    };

    const getStatusText = (status) => {
        switch (status) {
            case "good":
                return "정상";
            case "warning":
                return "주의";
            case "danger":
                return "위험";
            default:
                return "";
        }
    };

    // ✅ 각 항목별 상태 계산
    const ldlStatus = getStatusColor(results.ldlMg, "ldl");
    const tgStatus = getStatusColor(results.tgMg, "tg");
    const ggtStatus = getStatusColor(results.uricAcidMgDl, "ggt"); // 감마지티피 데이터 없으면 요산 대체 예시
    const hemoglobinStatus = getStatusColor(results.hgbGDl, "hemoglobin");

    return (
        <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">🩺 자가 테스트 요약</h3>
                {risk.dangerCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3"/>
                        위험 등급 {risk.dangerCount}회
                    </Badge>
                )}
            </div>

            {/* ✅ 건강검진 수치 카드 */}
            <h4 className="font-semibold mb-2">📈 9월 건강검진 데이터</h4>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBox
                    label="LDL 콜레스테롤"
                    value={`${results.ldlMg ?? "--"} mg/dL`}
                    status={ldlStatus}
                    getStatusText={getStatusText}
                />
                <InfoBox
                    label="중성지방 (TG)"
                    value={`${results.tgMg ?? "--"} mg/dL`}
                    status={tgStatus}
                    getStatusText={getStatusText}
                />
                <InfoBox
                    label="요산 (Uric Acid)"
                    value={`${results.uricAcidMgDl ?? "--"} mg/dL`}
                    status={ggtStatus}
                    getStatusText={getStatusText}
                />
                <InfoBox
                    label="혈색소 (Hemoglobin)"
                    value={`${results.hgbGDl ?? "--"} g/dL`}
                    status={hemoglobinStatus}
                    getStatusText={getStatusText}
                />
            </div>

            {/* ✅ 리스크 통계 */}
            <div className="mt-6">
                <h4 className="font-semibold mb-2">📈 리스크 요약</h4>
                <p>평균 점수: <strong>{risk.avgScore?.toFixed(1) ?? "--"}</strong></p>
                <p>
                    양호: {risk.goodCount ?? 0}회 / 주의: {risk.warningCount ?? 0}회 / 위험:{" "}
                    {risk.dangerCount ?? 0}회
                </p>
            </div>

            {/* ✅ 생활습관 요약 */}
            <div className="mt-6">
                <h4 className="font-semibold mb-2">💪 생활습관 통계 (최근 30일)</h4>
                <LifestyleTable data={lifestyle}/>
            </div>
        </Card>
    );
}

// ✅ 개별 건강 항목 박스 컴포넌트
function InfoBox({label, value, status, getStatusText}) {
    const variant =
        status === "good" ? "secondary" : status === "warning" ? "outline" : "destructive";
    return (
        <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{label}</span>
                <Badge variant={variant}>{getStatusText(status)}</Badge>
            </div>
            <div className="mt-2">{value}</div>
        </div>
    );
}

// ✅ 생활습관 요약 테이블
function LifestyleTable({data}) {
    if (!data) return <div>데이터 없음</div>;

    const items = [
        {key: "exercise", label: "운동"},
        {key: "sugar", label: "단 음식 섭취"},
        {key: "stress", label: "스트레스"},
        {key: "sleep", label: "수면시간"},
        {key: "drink", label: "음주"},
        {key: "fatigue", label: "피로도"},
        {key: "postMeal", label: "식후 졸림"},
    ];

    return (
        <table className="table-auto w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="px-2 py-1 text-left">항목</th>
                <th>0단계</th>
                <th>1단계</th>
                <th>2단계</th>
            </tr>
            </thead>
            <tbody>
            {items.map(({key, label}) => (
                <tr key={key}>
                    <td className="px-2 py-1 font-medium">{label}</td>
                    <td>{data[`${key}None`] ?? 0}</td>
                    <td>{data[`${key}Some`] ?? 0}</td>
                    <td>{data[`${key}Often`] ?? 0}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

//월간혈당 추이 -아침점심저녁 주간평균
const BloodSugarChart = ({profile}) => {
    const [glucoseData, setGlucoseData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.userId) return;
        axios
            .get("http://localhost:8080/bloodsugar/weekly", {
                params: {userId: profile.userId, days: 30},
            })
            .then(res => {
                console.log("📊 주차별 혈당 데이터:", res.data);
                setGlucoseData(res.data);
            })
            .catch(err => console.error("주차별 혈당 데이터 불러오기 실패:", err))
            .finally(() => setLoading(false));
    }, [profile?.userId]);

    if (loading) return <p>📈 혈당 데이터 불러오는 중...</p>;
    if (!glucoseData || glucoseData.length === 0)
        return <p>❌ 표시할 혈당 데이터가 없습니다.</p>;

    return (
        <Card className="p-6">
            <h3 className="mb-4">월간 혈당 추이</h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={glucoseData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                        <XAxis
                            dataKey="week"
                            style={{fontSize: '12px', fill: '#717182'}}
                        />
                        <YAxis
                            style={{fontSize: '12px', fill: '#717182'}}
                            label={{
                                value: 'mg/dL',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#717182',
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend/>
                        <Line
                            type="monotone"
                            dataKey="breakfast"
                            stroke="#f59e0b"
                            name="아침 식후"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="lunch"
                            stroke="#3b82f6"
                            name="점심 식후"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="dinner"
                            stroke="#8b5cf6"
                            name="저녁 식후"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="average"
                            stroke="#10b981"
                            name="주간 평균"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


// Monthly Comparison Component
const MonthlyComparison = ({comparisons}) => {
    const getChange = (current, previous) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const getTrendIcon = (change, higherIsBetter = false) => {
        if (Math.abs(change) < 1) {
            return <Minus className="w-4 h-4 text-muted-foreground"/>;
        }

        const isPositive = change > 0;
        const isGood = higherIsBetter ? isPositive : !isPositive;

        if (isPositive) {
            return <TrendingUp className={`w-4 h-4 ${isGood ? 'text-green-600' : 'text-red-600'}`}/>;
        }
        return <TrendingDown className={`w-4 h-4 ${isGood ? 'text-green-600' : 'text-red-600'}`}/>;
    };

    return (
        <Card className="p-6">
            <h3 className="mb-4">지난 달 대비 변화</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisons.map((item, index) => {
                    const change = getChange(item.current, item.previous);
                    const changeAbs = Math.abs(change);

                    return (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-muted-foreground text-sm">{item.label}</span>
                                {getTrendIcon(change, item.higherIsBetter)}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span>{item.current}{item.unit}</span>
                                <span className="text-muted-foreground text-sm">
                  ({item.previous}{item.unit})
                </span>
                            </div>
                            {changeAbs >= 1 && (
                                <div className="mt-1 text-muted-foreground text-sm">
                                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

// Diet Summary Component
const DietSummary = ({healthyMeals, unhealthyMeals, avgBloodSugar}) => {
    const totalMeals = healthyMeals + unhealthyMeals;
    const healthyPercentage = totalMeals > 0 ? Math.round((healthyMeals / totalMeals) * 100) : 0;

    return (
        <Card className="p-6">
            <h3 className="mb-4">식단 요약</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600"/>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">건강한 식사</div>
                        <div className="mt-1">{healthyMeals}회</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-600"/>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">주의 필요한 식사</div>
                        <div className="mt-1">{unhealthyMeals}회</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <div className="w-5 h-5 flex items-center justify-center text-blue-600 font-bold">
                            %
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">건강 식사 비율</div>
                        <div className="mt-1">{healthyPercentage}%</div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">월평균 혈당</span>
                    <span>{avgBloodSugar} mg/dL</span>
                </div>
            </div>
        </Card>
    );
};

// Exercise Summary Component
const ExerciseSummary = ({totalDays, totalMinutes, avgCalories}) => {
    const avgMinutesPerDay = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;

    return (
        <Card className="p-6">
            <h3 className="mb-4">운동 요약</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-600"/>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">운동 일수</div>
                        <div className="mt-1">{totalDays}일</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600"/>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">총 운동 시간</div>
                        <div className="mt-1">{totalMinutes}분 (일평균 {avgMinutesPerDay}분)</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <Flame className="w-5 h-5 text-red-600"/>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-sm">평균 소모 칼로리</div>
                        <div className="mt-1">{avgCalories} kcal</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Monthly Comment Component
const MonthlyComment = ({profile}) => {
    const [advice, setAdvice] = useState("조언을 불러오는 중...");

    useEffect(() => {
        const fetchAdvice = async () => {
            try {
                const res = await fetch("http://localhost:8000/healthChat/monthlyAdvice", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({user_id: profile?.userId || "sumin"}),
                });
                const data = await res.json();
                setAdvice(data.advice || "조언을 불러올 수 없습니다.");
            } catch (err) {
                console.error("조언 요청 오류:", err);
                setAdvice("❌ 서버에서 조언을 불러올 수 없습니다.");
            }
        };

        fetchAdvice();
    }, [profile?.userId]);

    return (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                    <Lightbulb className="w-5 h-5 text-white"/>
                </div>
                <div className="flex-1">
                    <h3 className="mb-2">다음 달을 위한 조언</h3>
                    <p className="text-gray-600 mb-4">
                        {advice}
                    </p>
                    {/*{tips.length > 0 && (*/}
                    {/*    <div className="space-y-2">*/}
                    {/*        {tips.map((tip, index) => (*/}
                    {/*            <div key={index} className="flex items-start gap-2">*/}
                    {/*                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"/>*/}
                    {/*                <p className="text-gray-600">{advice}</p>*/}
                    {/*            </div>*/}
                    {/*        ))}*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>
        </Card>
    );
};

// ============= Main App Component =============

function MonthlyReport({profile}) {

    const testResults = {
        ldl: 145,
        tg: 168,
        ggt: 52,
        hemoglobin: 15.2
    };

    const dietData = {
        healthyMeals: 58,
        unhealthyMeals: 22,
        avgBloodSugar: 124
    };

    const exerciseData = {
        totalDays: 18,
        totalMinutes: 540,
        avgCalories: 285
    };

    // 월별 비교 데이터
    const comparisonData = [
        {label: "평균 혈당", current: 118, previous: 132, unit: " mg/dL", higherIsBetter: false},
        {label: "운동 일수", current: 18, previous: 15, unit: "일", higherIsBetter: true},
        {label: "건강한 식사", current: 58, previous: 45, unit: "회", higherIsBetter: true},
        {label: "LDL 콜레스테롤", current: 145, previous: 158, unit: " mg/dL", higherIsBetter: false},
        {label: "중성지방", current: 168, previous: 182, unit: " mg/dL", higherIsBetter: false},
        {label: "체중", current: 68, previous: 70, unit: "kg", higherIsBetter: false}
    ];

    const handleDownloadPDF = () => {
        window.print();
    };


    const [glucoseData, setGlucoseData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.userId) return;

        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:8080/bloodsugar/recent", {
                    params: {userId: profile.userId, days: 30},
                });
                const raw = res.data;

                // raw를 Recharts용 데이터로 변환
                const grouped = groupDataByWeek(raw);
                setGlucoseData(grouped);
            } catch (err) {
                console.error("혈당 데이터 불러오기 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profile?.userId]);

    if (loading) return <p className="text-center">데이터 불러오는 중...</p>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
                <MonthlyReportHeader
                    profile={profile}
                    month="2025년 9월"
                    onDownloadPDF={handleDownloadPDF}
                />


                <HealthTestResults
                    profile={profile}
                    results={testResults}
                    dangerCount={2}
                />

                <BloodSugarChart profile={profile}/>

                <MonthlyComparison comparisons={comparisonData}/>

                <DietSummary
                    healthyMeals={dietData.healthyMeals}
                    unhealthyMeals={dietData.unhealthyMeals}
                    avgBloodSugar={dietData.avgBloodSugar}
                />

                <ExerciseSummary
                    totalDays={exerciseData.totalDays}
                    totalMinutes={exerciseData.totalMinutes}
                    avgCalories={exerciseData.avgCalories}
                />

                <MonthlyComment
                    profile={profile}
                />
            </div>
        </div>
    );
}

function groupDataByWeek(records) {
    // records = [{timestamp:"2025-09-15T08:30", glucose:130}, ...]
    const grouped = {};

    records.forEach(r => {
        const date = new Date(r.timestamp);
        const weekNum = getWeekOfMonth(date);

        if (!grouped[weekNum]) {
            grouped[weekNum] = {week: `${weekNum}주차`, values: []};
        }
        grouped[weekNum].values.push(r.glucose);
    });

    // 평균값 계산
    return Object.values(grouped).map(g => ({
        week: g.week,
        average: Math.round(g.values.reduce((a, b) => a + b, 0) / g.values.length),
    }));
}

function getWeekOfMonth(date) {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = first.getDay();
    return Math.ceil((date.getDate() + dayOfWeek) / 7);
}

