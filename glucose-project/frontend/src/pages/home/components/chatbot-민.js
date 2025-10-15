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