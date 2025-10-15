# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from map import router as map_router
from market import router as market_router
from gloucos import router as gloucos_router
from routers import chatbot_router, glucoseChat_router,healthChat_router ## 추가 (MINGI) ###
import os
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(map_router)
app.include_router(market_router)
app.include_router(gloucos_router)
app.include_router(chatbot_router.router) ## 추가 (MINGI) ###
app.include_router(glucoseChat_router.router) ## 추가 (MINGI) ###
app.include_router(healthChat_router.router)
os.makedirs("./tts_cache", exist_ok=True)
# CORS 허용 (React랑 연결 위해)


if __name__ == "__main__":
    import uvicorn
    print("📡 등록된 라우트 목록:")
    for route in app.routes:
        print(route.path, route.methods)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)