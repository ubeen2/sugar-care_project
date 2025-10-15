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

history = []

SYSTEM_INSTRUCTIONS = """
1. 기본 역할 정의
    - 사용자의 혈당 상태, 식단, 운동 습관을 바탕으로 맞춤형 피드백과 추천을 제공하는 챗봇입니다.
    - 언제나 친절하고 이해하기 쉬운 말투를 유지합니다. (전문 용어 최소화, 생활 밀착형 설명)
    - 항상 사용자의 가장 마지막 대화를 기준으로 어떤 도구를 호출할지 판단한다.
    - 마지막 input이 "먹었다/먹음/먹었어" 같은 과거형만 있으면 → 식단 기록(mySQL_meal_insert).
    - 마지막 input이 "분석/추천/비교" 요청이면 → 분석(myOracle_food_search).
    - 만약 두 가지 의도가 섞여 있더라도, 마지막 요청에 분석 관련 표현이 있으면 분석을 우선한다.

2. 주요 기능별 인스트럭션
    (1) 음식 & 칼로리 안내
    - 사용자가 음식을 입력하면:
    - 칼로리 / 영양소 / 당류를 간략하게 알려줍니다.
    - 해당 음식을 섭취했을때 적절한 운동을 알려줍니다. (저강도/고강도, 헬스/맨몸 운동)
    - 식재료에 대한 정보는 사용자가 요청하지 않았으면 답변에서 제외한다.
    - 영양성분 -> 식사 팁 -> 운동 순으로 답변한다.

    (2) 식단 추천
    - 아침, 점심, 저녁별로 저당·저칼로리 식단을 제안합니다.
    - 사용자의 연령대, 가족력, 생활 패턴(주간/야간 근무 등)에 맞게 조정합니다

    (3) 식단 기록
    - 사용자가 '먹었다', '먹음', '먹었어'와 같이 과거형 서술로 음식을 말하면 mySQL_meal_insert 도구를 사용한다.
    - 단, 사용자가 '분석해줘', '비교해줘', '추천해줘' 같은 분석/요약 의도를 함께 말하면 기록 대신 분석 도구를 사용한다.
    - user_id 가 제공되지 않으면 서버가 기본값 'test_user' 로 저장한다.
    - meal_date는 날짜가 언급되지 않았다면 오늘 날짜를 사용한다.
    - meal_time은 아침/점심/저녁/간식 중 가장 적절한 값으로 설정한다.

    (4) 식단 분석
    - 사용자가 일정 기간동안의 식단을 분석해달라고 요청하면 도구를 사용한다.

3. 대화 톤 & UX 가이드
    (1) 톤앤매너
    - 친절, 따뜻함, 건강 관리 코치 느낌

    (2) 응답 형식
    - 사용자에게 추가적인 질문을 요구하거나 제안하지 않는다.
    - 답변은 20줄로 제한하나, 줄바꿈은 제한에 포함하지 않는다.
"""

## MySQL에 접속하는 함수
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

## 챗봇이 어떤 tool을 호출했는지 정보를 추출하는 코드
def find_tool(resp):
    for out in getattr(resp, "output", []) or []:
        out_type = getattr(out, "type", None)

        ## output 레벨에 function_call이 있을 때
        if out_type == "function_call":
            tool_name = getattr(out, "name", None)
            tool_id = getattr(out, "id", None)
            tool_args = getattr(out, "arguments", {}) or {}

            if isinstance(tool_args, str):
                try:
                    tool_args = json.loads(tool_args)
                except Exception:
                    tool_args = {}

            log.info(f"[tool_detected@output] name = {tool_name}, id = {tool_id}, args = {tool_args}")

            return tool_id, tool_name, tool_args

        ## output 레벨에서 찾지 못했다면, output. content 안쪽을 추가로 탐색
        content_list = getattr(out, "content", None)
        if content_list:
            for content in content_list:
                content_type = getattr(content, "type", None)
                if content_type in ("tool_call", "function_call"):
                    tool_call = getattr(content, "tool_call", None) or getattr(content, "function_call", None)
                    if not tool_call:
                        continue
                    tool_name = getattr(content, "name", None)
                    tool_id = getattr(content, "id", None)
                    tool_args = getattr(content, "arguments", {}) or {}

                    if isinstance(tool_args, str):
                        try:
                            tool_args = json.loads(tool_args)
                        except Exception:
                            tool_args = {}

                    log.info(f"[tool_detected@output] name = {tool_name}, id = {tool_id}, args = {tool_args}")
                    return tool_id, tool_name, tool_args

    ## 아무것도 못 찾았을 때
    log.info("[tool_call/function_call] 없음")
    return None, None, None

def insert_meal_log(*, user_id, meal_date, meal_time, food_name):
    user_id = user_id or "test_user"
    meal_date = meal_date or datetime.today().strftime("%Y-%m-%d")
    meal_time = (meal_time or "간식").strip()
    food_name = food_name or "Unknown"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    sql = """
        INSERT INTO MEAL_LOG (user_id, meal_date, meal_time, food_name, created_at)
        VALUES (%s, %s, %s, %s, %s)
    """

    try:
        with mysql_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id, meal_date, meal_time, food_name, created_at))
            conn.commit()
    except Exception as e:
        print("DB 저장 중 오류:", e)


def analyze_meal(user_id = None, start_date = None, end_date = None):
    user_id = user_id or "test_user"

    if not end_date:
        end_date = datetime.today().strftime("%Y-%m-%d")
    if not start_date:
        start_date = (datetime.today().replace(hour=0, minute=0, second=0) - timedelta(days=7)).strftime("%Y-%m-%d")

    sql = """
        SELECT meal_date, meal_time, food_name
        FROM MEAL_LOG
        WHERE user_id = %s
        AND meal_date BETWEEN %s AND %s
        ORDER BY meal_date, meal_time
    """

    try:
        with mysql_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id, start_date, end_date))
                rows = cur.fetchall()
    except Exception as e:
        return {"answer": f"DB 조회 중 오류: {e}"}

    if not rows:
        return { "answer": f"{start_date} ~ {end_date} 기간에 저장된 식단 기록이 없습니다." }

    ## GPT가 데이터를 잘 분석할 있도록 변환
    meal_list = '\n'.join([f"{r['meal_date']} {r['meal_time']} - {r['food_name']}" for r in rows])

    analyze_meal_input = f"""
        당뇨 환자의 식단 분석을 해주세요.
        기간: {start_date} ~ {end_date}
        사용자 ID: {user_id}
        식단 기록:
        {meal_list}

        분석 요구사항:
        1. 혈당 관리 측면에서 좋은 점과 주의할 점을 나눠 설명
        2. 부족한 영양소와 보충 방법 (음식 or 영양제) 제안
        3. 하루 권장량 대비 문제점 요약
    """

    resp = client.responses.create(
        model = "gpt-5",
        instructions = "너는 혈당 관리 코치야. 사용자의 식단 기록을 분석해 따뜻하고 실용적인 피드백을 제공해.",
        input = analyze_meal_input
    )

    answer = (getattr(resp, "output_text", "") or "").strip()
    if not answer:
        log.warning("[WARN] 도구 미사용, output_text가 비어있음")
        return { "answer": "응답이 비었습니다." }

    history.append({
        "role": "assistant",
        "content": [{
            "type": "output_text",
            "text": answer
        }]
    })
    return { "answer": str(answer) }


def ask_chatbot(message: str) -> str:
    global history
    history.append({
        "role": "user",
        "content": [{
            "type": "input_text",
            "text": message
        }]
    })

    ## 챗봇에게 사용 가능한 툴들을 알려주는 코드
    resp = client.responses.create(
        model = "gpt-5",
        instructions = SYSTEM_INSTRUCTIONS,
        tools = [
            {
                "type": "function",
                "name": "mySQL_meal_insert",
                "description": "사용자가 먹은 음식 기록을 MEAL_LOG 테이블에 저장한다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": { "type": "string", "description": "사용자 아이디 (기본값은 test_user)" },
                        "meal_date": { "type": "string", "description": "먹은 날짜 (YYYY-MM-DD)" },
                        "meal_time": { "type": "string", "description": "식사 시간대 (아침/점심/저녁/간식)" },
                        "food_name": { "type": "string", "description": "음식 이름" }
                    },
                    "required": ["meal_date", "meal_time", "food_name"]
                }
            },
            {
                "type": "function",
                "name": "analyze_meal",
                "description": "사용자의 식단을 분석하여 코칭한다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_id": { "type": "string", "description": "사용자 ID (기본값은 test_user)" },
                        "start_date": { "type": "string", "description": "분석 시작 날짜 (YYYY-MM-DD)" },
                        "end_date": { "type": "string", "description": "분석 종료 날짜 (YYYY-MM-DD)" }
                    },
                    "required": [ "start_date", "end_date" ]
                }
            }
        ],
        input = history
    )

    ## 챗봇이 어떤 tool을 호출했는지 정보를 추출하는 코드
    tool_id, tool_name, args = find_tool(resp)
    if tool_name == "mySQL_meal_insert":
        try:
            insert_meal_log(
                user_id=args.get("user_id", "test_user"),
                meal_date=args.get("meal_date"),
                meal_time=args.get("meal_time"),
                food_name=args.get("food_name")
            )
            return {"answer": f"'{args.get("food_name")}' 식단 기록이 저장되었습니다."}
        except Exception as e:
            log.exception("DB 저장 실패")
            return {"answer": f"DB 저장 중 오류: {e}"}

    elif tool_name == "analyze_meal":
        try:
            return analyze_meal(
                user_id = args.get("user_id", "test_user"),
                start_date = args.get("start_date"),
                end_date = args.get("end_date")
            )
        except Exception as e:
            log.exception("DB 저장 실패")
            return {"answer": f"DB 저장 중 오류: {e}"}

    answer = (getattr(resp, "output_text", "") or "").strip()
    if not answer:
        log.warning("[WARN] 도구 미사용, output_text가 비어있음")
        return { "answer": "응답이 비었습니다." }

    history.append({
        "role": "assistant",
        "content": [{
            "type": "output_text",
            "text": answer
        }]
    })
    return { "answer": str(answer) }

def reset_chatbot():
    global history
    history = []
    return { "status": "history cleared" }