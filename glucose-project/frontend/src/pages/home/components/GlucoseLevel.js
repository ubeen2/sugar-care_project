import React, { useState, useEffect } from "react";

export default function GlucoseLevel({state,userId}) {
  const [glucoseText, setGlucoseText] = useState("데이터를 불러오는 중...");
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    if (!userId)
      return;

    const fetchGlucose = async () => {
      try {
        const res = await fetch("http://localhost:8000/glucoseChat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: state?.userId }),
        });

        const data = await res.json();
        if (data?.answer) {
          setGlucoseText(data.answer);
        } else {
          setGlucoseText("AI 분석 결과를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("혈당 데이터 불러오기 오류:", err);
        setGlucoseText("혈당 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchGlucose();
  }, []);

  if (!userId)
    return (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">혈당 분석</h5>
            <p className="text-muted small">로그인 후 혈당 데이터를 확인할 수 있습니다.</p>
          </div>
        </div>
    );
  return (
    <div className="card" style={{marginBottom:"10px"}}>
      <div className="card-body">
        <h5 className="card-title">혈당 분석</h5>
        <p className="card-text"> {loading ? "데이터를 불러오는 중..." : glucoseText}</p>
      </div>
    </div>
  );
}
