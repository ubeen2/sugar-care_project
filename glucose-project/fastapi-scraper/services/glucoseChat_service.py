import json
import logging
import pymysql
import os
from dotenv import load_dotenv
from openai import OpenAI
from datetime import datetime, timedelta

log = logging.getLogger(__name__)

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key = api_key)

def mysql_connection():
    return pymysql.connect(
        host = "192.168.0.55",
        port = 3306,
        user = "root",
        password = "1234",
        database = "sugarCare",
        charset = "utf8mb4",
        cursorclass = pymysql.cursors.DictCursor
    )

def get_glucose_data(user_id = None):
    user_id = user_id or "kim123"
    start_time = datetime(2021, 8, 30, 11, 0, 0)
    end_time = datetime(2021, 8, 30, 12, 0, 0)

    sql = """
        SELECT user_id, measured_at, glucose_value
        FROM glucose_level
        WHERE user_id = %s
        AND measured_at BETWEEN %s AND %s
        ORDER BY measured_at
    """
    with mysql_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (user_id, start_time, end_time))
            return cur.fetchall()

def summarize_glucose(data):
    values = [row["glucose_value"] for row in data]
    if not values: return None

    return {
        "count": len(values),
        "min": min(values),
        "max": max(values),
        "avg": sum(values)/len(values),
        "start": data[0]["glucose_value"],
        "end": data[-1]["glucose_value"]
    }

def analyze_glucose(data, summary):
    if not data: return "DB에 해당 시간대의 혈당 데이터가 없습니다."

    input_text = f"""
        1. 사용자의 최근 1시간 혈당 데이터 요약:
        - 측정 개수: {summary['count']}
        - 평균 혈당: {summary['avg']:.1f}
        - 최소 혈당: {summary['min']}
        - 최대 혈당: {summary['max']}
        - 시작 혈당: {summary['start']}
        - 종료 혈당: {summary['end']}

        추세 및 건강 관리 조언을 한 문장으로 간단히 설명해 주세요.
    """

    resp = client.responses.create(
        model = "gpt-5",
        input = [
            { "role": "system", "content": "너는 당뇨 관리 전문가 챗봇이다. 데이터를 기반으로 알기 쉽게 한줄로 설명한다." },
            { "role": "user", "content": input_text }
        ]
    )
    return resp.output_text