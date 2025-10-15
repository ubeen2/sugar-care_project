# # backend/services/google_voice_service.py
# import os
# import base64
# import requests
# from google.cloud import texttospeech
# from dotenv import load_dotenv
# from pydub import AudioSegment
# from pydub.utils import which
#
# load_dotenv()
#
# AudioSegment.converter = which("ffmpeg")
# AudioSegment.ffprobe = which("ffprobe")
#
# # === 🎙️ Clova STT ===
# def speech_to_text(file_path: str) -> str:
#     url = "https://clovaspeech-gw.ncloud.com/external/v1/recognize"
#     secret = os.getenv("NAVER_SPEECH_SECRET")
#
#     headers = {"X-CLOVASPEECH-API-KEY": "yfL9u6fOuZRkZKmgVT0N05vRtx09li6jDa21PILk"}
#     with open(file_path, "rb") as f:
#         files = {"media": f}
#         data = {"language": "ko-KR"}
#         response = requests.post(url, headers=headers, data=data, files=files)
#
#     res = response.json()
#     return res.get("text", "")
#
# # === 🔊 Google TTS (메모리로 반환, base64) ===
# def text_to_speech(text: str) -> str:
#     client = texttospeech.TextToSpeechClient()
#     synthesis_input = texttospeech.SynthesisInput(text=text)
#     voice = texttospeech.VoiceSelectionParams(language_code="ko-KR", name="ko-KR-Wavenet-A")
#     audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
#
#     response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
#     encoded_audio = base64.b64encode(response.audio_content).decode("utf-8")
#     return encoded_audio


import os
import base64
import requests
from google.cloud import texttospeech
from dotenv import load_dotenv
from pydub.utils import which
from pydub import AudioSegment

load_dotenv()

AudioSegment.converter = which("ffmpeg")
AudioSegment.ffprobe = which("ffprobe")

# === Clova STT ===
def speech_to_text(file_path: str) -> str:
    print("ffmpeg:", AudioSegment.converter)
    print("ffprobe:", AudioSegment.ffprobe)
    print("CLIENT_ID:", os.getenv("NAVER_CLIENT_ID"))
    print("CLIENT_SECRET:", os.getenv("NAVER_CLIENT_SECRET"))
    url = "https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": os.getenv("NAVER_CLIENT_ID"),
        "X-NCP-APIGW-API-KEY": os.getenv("NAVER_CLIENT_SECRET"),
        "Content-Type": "application/octet-stream"
    }
    with open(file_path, "rb") as f:
        audio_data = f.read()

    print(f"[DEBUG] 전송할 WAV 크기: {len(audio_data)} bytes")

    response = requests.post(url, headers=headers, data=audio_data)

    print("[DEBUG] Clova response:", response.text)
    try:
        res = response.json()
        return res.get("text", "")
    except Exception as e:
        print("[ERROR] 응답 파싱 실패:", e)
        return ""

# === Google TTS (Base64 반환) ===
def text_to_speech(text: str) -> str:
    client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(language_code="ko-KR", name="ko-KR-Wavenet-A")
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
    encoded_audio = base64.b64encode(response.audio_content).decode("utf-8")
    return encoded_audio
