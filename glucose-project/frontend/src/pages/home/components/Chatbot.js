import React, { useState, useEffect, useRef } from "react";
import "./css/ChatWidget.css";
import chatbotIcon from "../../../assets/chatbot.png";
import { v4 as uuidv4 } from "uuid";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const chatEndRef = useRef(null);
  const [audio, setAudio] = useState(null);

  const exampleQuestions = [
    "혈당에 좋은 음식은?",
    "운동 추천해줘",
    "식단 조절 팁 알려줘",
    "하루 권장 영양소는?",
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev === "...") return "";
        else return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { id: uuidv4(), role: "user", text };
    const updated = [...messages, userMsg];

    const loadingMsg = {
      id: "loading-msg",
      role: "bot",
      text: "AI 상담사가 답변을 생성 중입니다.",
    };

    setMessages([...updated, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      setMessages((prev) =>
          prev.map((msg) =>
              msg.id === "loading-msg"
                  ? { id: uuidv4(), role: "bot", text: data.answer }
                  : msg
          )
      );
    }
    catch {
      setMessages((prev) =>
          prev.map((msg) =>
              msg.id === "loading-msg"
                  ? { id: uuidv4(), role: "bot", text: "⚠️ 통신 오류가 발생했습니다." }
                  : msg
          )
      );
    }
    finally {
      setLoading(false);
      setLoadingDots("");
    }
  };

  const chatReset = async () => {
    await fetch("http://localhost:8000/reset_chat", { method: "POST" });
    setMessages([]);
    setInput("");
    setLoading(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      alert("브라우저가 음성 녹음을 지원하지 않습니다.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    const chunks = [];

    // 음성 인식 중 메시지 추가
    const recordingMsgId = uuidv4();
    setMessages((prev) => [
      ...prev,
      { id: recordingMsgId, role: "user", text: "(🎙️ 음성 인식 중...)" },
    ]);

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const file = new File([blob], "voice.webm");
      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);

      try {
        const res = await fetch("http://localhost:8000/chatbot/voice_chat", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        // 인식된 사용자 음성 텍스트로 교체
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === recordingMsgId
                    ? { ...msg, text: `🎙️ ${data.user_text || "(인식 실패)"}` }
                    : msg
            )
        );

        // 봇 답변 추가
        const botMessage = {
          id: uuidv4(),
          role: "bot",
          text: data.bot_answer || "답변 생성 실패",
        };
        setMessages((prev) => [...prev, botMessage]);

        // TTS 재생
        if (data.tts_audio) {
          const audio = new Audio(`data:audio/mp3;base64,${data.tts_audio}`);
          setAudio(audio);
          audio.play();
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: uuidv4(), role: "bot", text: "음성 전송 중 오류 발생" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // 녹음 시작
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 10000); // 10초 후 자동 종료
  };

  useEffect(() => {
    if (audio) {
      audio.play();
    }
  }, [audio]);

  return (
      <>
        {!isOpen && (
            <button className="chat-btn" onClick={() => setIsOpen(true)}>
              <img src={chatbotIcon} alt="챗봇" style={{ width: "130px", height: "130px" }} />
            </button>
        )}

        <div className={`chat-container ${isOpen ? "open" : ""}`}>
          <div className={`chat-panel ${isOpen ? "open" : ""}`}>
            <div className="chat-header">
              <h3>오당탕탕 상담원</h3>
              <button onClick={() => setIsOpen(false)}>✖</button>
            </div>

            <div className="chat-body">
              <div className="chat-box">
                {messages.map((m) => (
                    <div key={m.id} className={`message-row ${m.role === "user" ? "user-row" : "bot-row"}`}>
                      <div className={`message-bubble ${m.role}`}>
                        {m.id === "loading-msg"
                            ? `AI 상담사가 답변을 생성 중입니다${loadingDots}`
                            : m.text}
                      </div>
                    </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>
            </div>

            <div className="chat-input">
              <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
              />
              <button onClick={() => sendMessage()} disabled={loading}>
                보내기
              </button>
              <button onClick={chatReset}>초기화</button>
              <button onClick={startRecording}>🎙️</button>
            </div>
          </div>

          {isOpen && (
              <div className="chat-suggestions">
                <h4>자주하는 질문</h4>
                <ul className="faq-list">
                  {exampleQuestions.map((q, i) => (
                      <li key={i} onClick={() => sendMessage(q)}>
                        {q}
                      </li>
                  ))}
                </ul>
                <br />
                <h4>사용 가능한 기능</h4>
                <ul className="feature-list">
                  <li>
                    <strong>음식 영양소 분석</strong><br />
                    음식명과 영양소 분석을 요청하시면, 팁과 적절한 운동을 추천해드립니다.
                  </li>
                  <li>
                    <strong>식단 분석</strong><br />
                    기간과 식단 분석을 요청하시면, 그동안의 식단을 분석해 드립니다.
                  </li>
                  <li>
                    <strong>식단 등록</strong><br />
                    음식명을 알려주시면 식단이 등록됩니다.
                  </li>
                </ul>
              </div>
          )}
        </div>
      </>
  );
};

export default ChatWidget;