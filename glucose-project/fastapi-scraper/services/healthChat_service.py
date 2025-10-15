# backend/services/healthChat_service.py
import os
import pymysql
import logging
from datetime import datetime, timedelta
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
log = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def mysql_connection():
    return pymysql.connect(
        host="192.168.0.55",
        user="root",
        password="1234",
        database="sugarCare",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

# ✅ 1. 한 달간 요약 데이터 불러오기
def get_monthly_health_summary(user_id):
    conn = mysql_connection()
    with conn:
        with conn.cursor() as cur:
            # 혈당 요약
            cur.execute("""
                        SELECT AVG(glucose_value) AS avg_glucose,
                               MIN(glucose_value) AS min_glucose,
                               MAX(glucose_value) AS max_glucose
                        FROM glucose_level
                        WHERE user_id = %s
                          AND measured_at >= '2021-09-01 00:00:00'
                          AND measured_at < '2021-10-01 00:00:00'
                        """, (user_id,))
            glucose = cur.fetchone() or {}

            # 자가테스트 리스크
            cur.execute("""
                        SELECT COUNT(*) AS total_tests,
                               AVG(risk_score) AS avg_risk,
                               SUM(CASE WHEN risk_level='위험' THEN 1 ELSE 0 END) AS danger_count,
                               SUM(CASE WHEN risk_level='주의' THEN 1 ELSE 0 END) AS warning_count
                        FROM health_info
                        WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        """, (user_id,))
            risk = cur.fetchone() or {}


    return {
        "glucose": glucose,
        "risk": risk
    }

# ✅ 2. GPT-5로 조언 생성
def generate_monthly_advice(summary):
    glucose = summary["glucose"]
    risk = summary["risk"]

    prompt = f"""
    사용자의 최근 30일 건강 리포트입니다:
    - 평균 혈당: {glucose.get('avg_glucose', 'N/A'):.1f} mg/dL
    - 최고 혈당: {glucose.get('max_glucose', 'N/A')} / 최저 혈당: {glucose.get('min_glucose', 'N/A')}
    - 자가테스트 평균 점수: {risk.get('avg_risk', 0):.1f}
      (위험 횟수: {risk.get('danger_count', 0)}회, 주의: {risk.get('warning_count', 0)}회)
    위 데이터를 분석하여 ‘다음 달을 위한 건강 관리 조언’을 한국어로 3문장 이내로 작성하세요.
    친근하고 동기부여가 되는 말투로 요약해주세요.
    """

    response = client.responses.create(
        model="gpt-5",
        input=[
            {
                "role": "system",
                "content": (
                    "너는 혈당 데이터를 기반으로 짧고 명확한 건강 조언을 주는 전문가야. "
                    "결과 요약은 2~3문장으로 작성하고, "
                    "문단은 보기 좋게 줄바꿈을 사용해서 구분해. "
                    "숫자나 수치는 그대로 유지하지만, 문장은 자연스럽고 따뜻하게 써. "
                    "예를 들어:\n"
                    "✅ 예시:\n"
                    "평균 혈당은 72mg/dL로 낮지만 변동폭이 커요. "
                    "식사·운동·수면 패턴을 일정하게 유지해 혈당이 급변하지 않게 해보세요.\n\n"
                    "고혈당이 반복되면 의료진과 약물 타이밍을 상의하고, "
                    "저혈당 예방을 위해 간식과 당분 보충을 준비하세요."
                )
            },
            {"role": "user", "content": prompt},
        ])
    return response.output_text.strip()
