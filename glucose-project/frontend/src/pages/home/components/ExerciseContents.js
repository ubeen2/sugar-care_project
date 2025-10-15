import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // 기본 css
import "./css/ExerciseContents.js.css";
import { Autoplay } from "swiper/modules";

const intensityLevels = ["저강도", "고강도"];
const exerciseTypes = ["헬스", "맨몸운동"]; // 공원 운동 제거

export default function ExerciseContents() {
    const [intensity, setIntensity] = useState("저강도");
    const [exercise, setExercise] = useState("헬스");
    const [videos, setVideos] = useState([]);

    const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY

    useEffect(() => {
        fetchVideos(intensity, exercise);
    }, [intensity, exercise]);

    const fetchVideos = async (intensity, exercise) => {
        try {
            const query = `${intensity} ${exercise} 운동`;

            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&order=viewCount&videoDuration=medium&q=${encodeURIComponent(
                    query
                )}&key=${API_KEY}`
            );
            const data = await response.json();

            // 숏츠 제거
            const filtered = (data.items || []).filter(
                (video) =>
                    !video.snippet.title.toLowerCase().includes("shorts") &&
                    !video.snippet.description?.toLowerCase().includes("shorts")
            );

            setVideos(filtered.slice(0, 3)); // 3개만 표시
        } catch (error) {
            console.error("YouTube API Error:", error);
        }
    };

    return (
        <div className="youtube-container">
            {/* 왼쪽 영상 */}
            <div className="video-section">
                {videos.map((video) => (
                    <div
                        key={video.id.videoId}
                        className="video-card"
                        onClick={() =>
                            window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, "_blank")
                        }
                    >
                        <img
                            src={video.snippet.thumbnails.high.url}
                            alt={video.snippet.title}
                            className="thumbnail"
                        />
                        <p className="title">{video.snippet.title}</p>
                    </div>
                ))}

            </div>

            {/* 오른쪽 카테고리 */}
            <div className="category-section">
                <div className="category-group">
                    <h4>강도 선택</h4>
                    {intensityLevels.map((level) => (
                        <button
                            key={level}
                            className={`category-btn ${intensity === level ? "active" : ""}`}
                            onClick={() => setIntensity(level)}
                        >
                            {level} 운동
                        </button>
                    ))}
                </div>
                <hr className="divider" />
                <div className="category-group">
                    <h4>운동 종류</h4>
                    {exerciseTypes.map((type) => (
                        <button
                            key={type}
                            className={`category-btn ${exercise === type ? "active" : ""}`}
                            onClick={() => setExercise(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
