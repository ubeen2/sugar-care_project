import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel
import pickle
import sqlite3
import pandas as pd
import pymysql

router = APIRouter()

# ============================
# ✅ 모델 로드
# ============================
with open("lgbm_final.pkl", "rb") as f:
    model = pickle.load(f)

# ============================
# ✅ 입력 스키마
# ============================
class InputData(BaseModel):
    features: list[float]  # 최근 12개 혈당값만 받음 (5분 간격)

# ============================
# ✅ 유틸: slope 계산
# ============================
def slope_of(arr):
    if len(arr) < 2:
        return 0.0
    x = np.arange(len(arr))
    b1, b0 = np.polyfit(x, arr, 1)
    return float(b1)

# ============================
# ✅ 예측 엔드포인트
# ============================
@router.post("/api/predict")
def predict(data: InputData):
    g = np.array(data.features, dtype=float)

    # 최소 12개 이상 필요
    if len(g) < 12:
        return {"error": "12개 혈당값이 필요합니다."}

    # -----------------------------
    # 1. 최근 12개 구간
    # -----------------------------
    seg = g[-12:]
    feats = list(seg)  # 길이 12

    # -----------------------------
    # 2. 윈도우 통계 (30, 60, 120분)
    # -----------------------------
    W30, W60, W120 = 6, 12, 24  # 5분 간격 기준
    for win_size in [W30, W60, W120]:
        if len(g) >= win_size:
            win = g[-win_size:]
        else:
            win = g  # 부족 시 전체 사용
        feats += [
            win.mean(),
            win.std(),
            win.min(),
            win.max(),
            slope_of(win),
        ]

    # -----------------------------
    # 3. 변화량 (Δ5, Δ30)
    # -----------------------------
    last_val = g[-1]

    # Δ5: 직전 5분 (1 step)
    if len(g) >= 2:
        delta5 = last_val - g[-2]
    else:
        delta5 = 0.0

    # Δ30: 30분 전 (6 step)
    if len(g) >= W30:
        delta30 = last_val - g[-W30]
    else:
        delta30 = 0.0

    feats += [delta5, delta30]

    # -----------------------------
    # 4. Feature shape 확인
    # -----------------------------
    print(f">>> 최종 feature 개수: {len(feats)}")  # ✅ 항상 29개

    X = np.array(feats).reshape(1, -1)

    # -----------------------------
    # 5. 모델 예측
    # -----------------------------
    y_pred = model.predict(X)

    return {"prediction": float(y_pred[0])}

@router.get("/api/realTimeData")
def get_glucose():
    conn = pymysql.connect(
        host="192.168.0.55",  # DB 서버 주소
        user="root",  # DB 사용자
        password="1234",  # 비밀번호
        database="sugarCare",  # DB 이름
        charset="utf8mb4"
    )
    df = pd.read_sql(
        "SELECT "
        "   measured_at,glucose_value "
        "   FROM glucose_level "
        "   where user_id='kim123' and measured_at >= '2021-08-30 11:00:00' and measured_at <= '2021-08-30 12:00:00' "
        "   ORDER BY measured_at LIMIT 12",
        conn
    )
    conn.close()
    print(df)  # ✅ 여기서 확인 가능
    return {"ok": True, "data": df.to_dict(orient="records")}