
from fastapi import APIRouter
from services.glucoseChat_service import get_glucose_data, summarize_glucose, analyze_glucose

router = APIRouter()

@router.post("/glucoseChat")
def gloucosChat_endpoint(payload: dict):
    user_id = payload.get("user_id")
    data = get_glucose_data(user_id)
    summary = summarize_glucose(data)
    result = analyze_glucose(data, summary)
    print(f"{result}")
    return { "answer": result }