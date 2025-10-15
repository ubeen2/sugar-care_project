import React, { useState } from 'react';
import  { useEffect } from 'react';
import './css/ExerciseDetail.css';


// 아이콘 SVG 컴포넌트들
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const FlameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
);

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

// 출석 체크 컴포넌트
function AttendanceCheck({ onCheckIn }) {
    const [checkedIn, setCheckedIn] = useState(false);
    const [streak] = useState(7);

    const handleCheckIn = () => {
        setCheckedIn(true);
        onCheckIn();
    };

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const attendance = [true, true, true, true, true, true, false];

    return (
        <div className="card attendance-card card-exercise">
            <div className="card-header">
                <div className="card-exercise-title">
                    <CalendarIcon />
                    <h3>오늘의 출석</h3>
                </div>
                <div className="streak">
                    <span>🔥 {streak}일 연속</span>
                </div>
            </div>

            <div className="week-days">
                {weekDays.map((day, index) => (
                    <div key={day} className="day-item">
                        <div className={`day-circle ${attendance[index] ? 'checked' : 'unchecked'}`}>
                            {attendance[index] ? <CheckIcon /> : day}
                        </div>
                        <span className="day-label">{day}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleCheckIn}
                disabled={checkedIn}
                className={`btn btn-primary ${checkedIn ? 'disabled' : ''}`}
            >
                {checkedIn ? '✅ 출석 완료!' : '출석 체크하기'}
            </button>
        </div>
    );
}

// 캐릭터 성장 컴포넌트
function CharacterGrowth({ level, experience, maxExperience }) {

    const progressPercent = (experience / maxExperience) * 100;

    const getCharacter = (level) => {
        if (level < 5) return '🌱';
        if (level < 10) return '🌿';
        if (level < 15) return '🌳';
        if (level < 20) return '💪';
        return '🏆';
    };

    const getCharacterName = (level) => {
        if (level < 5) return '초보 운동러';
        if (level < 10) return '성장하는 새싹';
        if (level < 15) return '튼튼한 운동가';
        if (level < 20) return '강철 파이터';
        return '전설의 챔피언';
    };

    return (
        <div className="card character-card card-exercise">
            <div className="card-exercise-title">
                <StarIcon />
                <h3>나의 성장</h3>
            </div>

            <div className="character-display">
                <div className="character-emoji">
                    {getCharacter(level)}
                </div>
                <h4>{getCharacterName(level)}</h4>
                <span className="badge-exercise">Level {level}</span>
            </div>

            <div className="progress-section">
                <div className="progress-info">
                    <span className="progress-label">경험치</span>
                    <span className="progress-value">
            {experience} / {maxExperience} XP
          </span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="progress-next">
                    <TrendingUpIcon />
                    <span>다음 레벨까지 {maxExperience - experience}XP</span>
                </div>
            </div>
        </div>
    );
}

// 통계 아이템 컴포넌트
function StatItem({ icon, label, value, colorClass }) {
    return (
        <div className="stat-item">
            <div className={`stat-icon ${colorClass}`}>
                {icon}
            </div>
            <div className="stat-content">
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );
}

// 오늘의 통계 컴포넌트
function TodayStats({ workoutCount, totalMinutes, caloriesBurned, goalProgress }) {
    return (
        <div className="card stats-card card-exercise">
            <h3>오늘의 운동 통계</h3>

            <div className="stats-grid">
                <StatItem
                    icon={<ActivityIcon />}
                    label="완료한 운동"
                    value={`${workoutCount}개`}
                    colorClass="bg-blue"
                />
                <StatItem
                    icon={<ClockIcon />}
                    label="운동 시간"
                    value={`${totalMinutes}분`}
                    colorClass="bg-purple"
                />
                <StatItem
                    icon={<FlameIcon />}
                    label="소모 칼로리"
                    value={`${caloriesBurned}kcal`}
                    colorClass="bg-orange"
                />
                <StatItem
                    icon={<TargetIcon />}
                    label="목표 달성률"
                    value={`${goalProgress}%`}
                    colorClass="bg-green"
                />
            </div>
        </div>
    );
}

// 운동 프로그램 컴포넌트
function WorkoutPrograms({ onStartWorkout }) {
    const programs = [
        {
            id: 1,
            title: '요가 스트레칭',
            description: '몸과 마음을 이완시키는 요가 루틴',
            duration: 30,
            calories: 150,
            difficulty: 'beginner',
            image: 'https://images.unsplash.com/photo-1705360315268-5e1ae3d43f61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwZXhlcmNpc2V8ZW58MXx8fHwxNzU5NDU3Njk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
            category: '요가',
        },
        {
            id: 2,
            title: '유산소 러닝',
            description: '심폐 지구력 향상을 위한 달리기',
            duration: 45,
            calories: 400,
            difficulty: 'intermediate',
            image: 'https://images.unsplash.com/photo-1669806954505-936e77929af6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY2FyZGlvfGVufDF8fHx8MTc1OTQyMzc0MXww&ixlib=rb-4.1.0&q=80&w=1080',
            category: '유산소',
        },
        {
            id: 3,
            title: '근력 강화 운동',
            description: '전신 근육을 단련하는 웨이트 트레이닝',
            duration: 60,
            calories: 350,
            difficulty: 'advanced',
            image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlbmd0aCUyMHRyYWluaW5nfGVufDF8fHx8MTc1OTM0ODIwNHww&ixlib=rb-4.1.0&q=80&w=1080',
            category: '근력',
        },
        {
            id: 4,
            title: '전신 스트레칭',
            description: '유연성 향상을 위한 스트레칭',
            duration: 20,
            calories: 100,
            difficulty: 'beginner',
            image: 'https://images.unsplash.com/photo-1701824429192-74ad7c2246f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJldGNoaW5nJTIwZml0bmVzc3xlbnwxfHx8fDE3NTk0NTc2OTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
            category: '스트레칭',
        },
    ];

    const getDifficultyClass = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'difficulty-beginner';
            case 'intermediate': return 'difficulty-intermediate';
            case 'advanced': return 'difficulty-advanced';
            default: return '';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return '초급';
            case 'intermediate': return '중급';
            case 'advanced': return '고급';
            default: return '';
        }
    };

    return (
        <div className="programs-section" >
            <h3>추천 운동 프로그램</h3>

            <div className="programs-grid">
                {programs.map((program) => (
                    <div key={program.id} className="program-card">
                        <div className="program-image">
                            <img src={program.image} alt={program.title} />
                            <span className={`difficulty-badge ${getDifficultyClass(program.difficulty)}`}>
                {getDifficultyText(program.difficulty)}
              </span>
                        </div>

                        <div className="program-content">
                            <div className="program-header">
                                <h4>{program.title}</h4>
                                <span className="category-badge">{program.category}</span>
                            </div>

                            <p className="program-description">{program.description}</p>

                            <div className="program-meta">
                                <div className="meta-item">
                                    <ClockIcon />
                                    <span>{program.duration}분</span>
                                </div>
                                <div className="meta-item">
                                    <FlameIcon />
                                    <span>{program.calories}kcal</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onStartWorkout(program)}
                                className="btn btn-primary"
                            >
                                <PlayIcon />
                                시작하기
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 토스트 알림 컴포넌트
function Toast({ message, show, onClose }) {
    React.useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="toast">
            {message}
        </div>
    );
}

// 메인 App 컴포넌트
function ExerciseDetail() {
    const [level, setLevel] = useState(8);
    const [experience, setExperience] = useState(350);
    const [maxExperience] = useState(500);
    const [workoutCount, setWorkoutCount] = useState(2);
    const [totalMinutes, setTotalMinutes] = useState(75);
    const [caloriesBurned, setCaloriesBurned] = useState(550);
    const [goalProgress, setGoalProgress] = useState(68);
    const [toast, setToast] = useState({ show: false, message: '' });
    useEffect(() => {
        setLevel(1);
        setExperience(0);
        setWorkoutCount(0);
        setTotalMinutes(0);
        setCaloriesBurned(0);
        setGoalProgress(0);
    }, []);

    const showToast = (message) => {
        setToast({ show: true, message });
    };

    const handleCheckIn = () => {
        const xpGain = 50;
        let newExperience = experience + xpGain;
        let newLevel = level;

        if (newExperience >= maxExperience) {
            newExperience = newExperience - maxExperience;
            newLevel = level + 1;
            setLevel(newLevel);
            showToast(`🎉 레벨 업! 이제 레벨 ${newLevel}입니다!`);
        } else {
            showToast(`출석 완료! +${xpGain}XP 획득`);
        }

        setExperience(newExperience);
    };

    const handleStartWorkout = (program) => {
        const xpGain = Math.floor(program.duration * 2);
        let newExperience = experience + xpGain;
        let newLevel = level;

        if (newExperience >= maxExperience) {
            newExperience = newExperience - maxExperience;
            newLevel = level + 1;
            setLevel(newLevel);
            showToast(`🎉 레벨 업! 이제 레벨 ${newLevel}입니다!`);
        } else {
            showToast(`${program.title} 시작! +${xpGain}XP 획득`);
        }

        setExperience(newExperience);
        setWorkoutCount(workoutCount + 1);
        setTotalMinutes(totalMinutes + program.duration);
        setCaloriesBurned(caloriesBurned + program.calories);

        const newProgress = Math.min(100, Math.floor((caloriesBurned + program.calories) / 10));
        setGoalProgress(newProgress);
    };

    return (
        <div className="app">
            <Toast
                message={toast.message}
                show={toast.show}
                onClose={() => setToast({ show: false, message: '' })}
            />


            {/* Main Content */}
            <main className="main">
                <div className="container-exercies">
                    <div className="page-header">
                        <h1>운동 정보</h1>
                        <p>매일 운동하고 레벨을 올려보세요! 꾸준함이 성장의 비결입니다. 💪</p>
                    </div>

                    {/* Top Section */}
                    <div className="top-section">
                        <AttendanceCheck onCheckIn={handleCheckIn} />
                        <CharacterGrowth
                            level={level}
                            experience={experience}
                            maxExperience={maxExperience}
                        />
                    </div>

                    {/* Today's Stats */}
                    <div className="stats-section">
                        <TodayStats
                            workoutCount={workoutCount}
                            totalMinutes={totalMinutes}
                            caloriesBurned={caloriesBurned}
                            goalProgress={goalProgress}
                        />
                    </div>

                    {/* Workout Programs */}
                    <WorkoutPrograms onStartWorkout={handleStartWorkout} />
                </div>
            </main>
        </div>
    );
}

export default ExerciseDetail;
