# backend/routers/healthChat_router.py
from fastapi import APIRouter
from services.healthChat_service import get_monthly_health_summary, generate_monthly_advice

router = APIRouter()

@router.post("/healthChat/monthlyAdvice")
def monthly_advice(payload: dict):
    user_id = payload.get("user_id")
    if not user_id:
        return {"error": "user_id is required"}

    summary = get_monthly_health_summary(user_id)
    advice = generate_monthly_advice(summary)
    print("🧠 GPT 조언 생성 완료:", advice)

    return {
        "summary": summary,
        "advice": advice
    }
