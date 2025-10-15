from fastapi import APIRouter
from fastapi import UploadFile, File
from fastapi import APIRouter, UploadFile, File
from services.chatbot_service import ask_chatbot
from services.google_voice_service import speech_to_text, text_to_speech
from pydub import AudioSegment
import os

router = APIRouter(prefix="/chatbot")
@router.post("/chat")
def chat_endpoint(payload: dict):
    message = payload.get("message", "").strip()
    answer = ask_chatbot(message)

    # 만약 질문이 비어있다면 해당 메시지를 출력
    if message == "":
        return { "answer": "질문이 비어 있습니다." }

    print(f"[사용자 질문] {message}")
    print(f"[챗봇 응답] {answer}")

    return answer

@router.post("/reset_chat")
def reset_endpoint():
    return reset_chatbot()

# 🎙️ 음성 입력 → STT → 챗봇 응답 → TTS 파일 생성
# @router.post("/voice_chat")
# async def voice_chat(file: UploadFile = File(...)):
#     temp_path = f"./temp_{file.filename}"
#     with open(temp_path, "wb") as f:
#         f.write(await file.read())
#
#     user_text = speech_to_text(temp_path)
#     os.remove(temp_path)
#
#     print("🗣️ Google STT 결과:", user_text)
#
#
#     answer = ask_chatbot(user_text)["answer"]
#
#     tts_file = text_to_speech(answer)
#
#     return {
#         "user_text": user_text,
#         "bot_answer": answer,
#         "tts_file": tts_file
#     }

# @router.post("/voice_chat")
# async def voice_chat(file: UploadFile = File(...)):
#     temp_path = f"./temp_{file.filename}"
#
#     # 1️⃣ 파일 저장
#     with open(temp_path, "wb") as f:
#         f.write(await file.read())
#     print(f"[DEBUG] 파일 저장됨: {temp_path}, 크기: {len(content)} bytes")
#
#     #webM->Wav 변환
#     wav_path = temp_path.replace(".webm", ".wav")
#     audio = AudioSegment.from_file(temp_path)
#     audio = audio.set_channels(1).set_frame_rate(16000)
#     audio.export(wav_path, format="wav")
#
#     # 2️⃣ STT 호출
#     user_text = speech_to_text(wav_path)
#     print(f"[DEBUG] Clova STT 전체 응답: {user_text}")
#
#     # 파일 삭제
#     os.remove(temp_path)
#
#     # 3️⃣ 챗봇 처리
#     answer = ask_chatbot(user_text)["answer"]
#
#     # 4️⃣ TTS(base64)
#     tts_audio = text_to_speech(answer)
#
#     os.remove(wav_path)
#
#     return {
#         "user_text": user_text,
#         "bot_answer": answer,
#         "tts_audio": tts_audio
#     }
#
# # 🎧 생성된 mp3 파일 반환용
# from fastapi.responses import FileResponse
#
# @router.get("/tts/{filename}")
# async def get_tts(filename: str):
#     file_path = os.path.join("./tts_cache", filename)
#     return FileResponse(file_path, media_type="audio/mpeg")



@router.post("/voice_chat")
async def voice_chat(file: UploadFile = File(...)):
    temp_path = f"./temp_{file.filename}"

    # 1️⃣ 업로드 파일 저장
    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)
    print(f"[DEBUG] 파일 저장됨: {temp_path}, 크기: {len(content)} bytes")

    # 2️⃣ WebM → WAV 변환 (모노, 16kHz)
    wav_path = temp_path.replace(".webm", ".wav")
    audio = AudioSegment.from_file(temp_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    audio.export(wav_path, format="wav", codec="pcm_s16le")

    # 3️⃣ Clova STT 호출
    try:
        user_text = speech_to_text(wav_path)
    except Exception as e:
        user_text = ""
        print(f"[ERROR] STT 실패: {e}")

    print(f"[DEBUG] Clova STT 결과: {user_text}")

    # 임시 파일 삭제
    os.remove(temp_path)
    os.remove(wav_path)

    # 4️⃣ 챗봇 처리
    answer = ask_chatbot(user_text)["answer"]

    # 5️⃣ Google TTS → Base64
    tts_audio = text_to_speech(answer)

    return {
        "user_text": user_text,
        "bot_answer": answer,
        "tts_audio": tts_audio
    }
