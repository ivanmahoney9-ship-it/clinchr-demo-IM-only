"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/stubs";

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  disabled: boolean;
}

const CYAN = "#00d4ff";
const NAVY = "#060a13";

export default function ChatPanel({ messages, isTyping, onSend, inputValue, setInputValue, disabled }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !disabled) onSend(inputValue.trim());
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#0b1120" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0b1120" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${CYAN}, #0099cc)`, color: NAVY }}
          >
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Gemini Shopping</p>
            <p className="text-xs" style={{ color: "#8892a4" }}>AI Shopping Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2" style={{ color: "#8892a4" }}>
            <p className="text-2xl">🛍️</p>
            <p className="text-sm">What do you need?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5 shrink-0"
                style={{ background: `linear-gradient(135deg, ${CYAN}, #0099cc)`, color: NAVY }}
              >
                G
              </div>
            )}
            <div
              className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: `linear-gradient(135deg, ${CYAN}22, ${CYAN}11)`, color: "white", border: `1px solid ${CYAN}33`, borderBottomRightRadius: 4 }
                  : { background: "rgba(255,255,255,0.06)", color: "#e2e8f0", borderBottomLeftRadius: 4 }
              }
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${CYAN}">$1</strong>`)
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-end gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${CYAN}, #0099cc)`, color: NAVY }}
            >
              G
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ background: "#8892a4" }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: "#8892a4" }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#8892a4" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0b1120" }}>
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <textarea
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none"
            style={{ color: "white" }}
            placeholder={disabled ? "Waiting for response…" : "What do you need?"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled}
          />
          <button
            onClick={() => { if (inputValue.trim() && !disabled) onSend(inputValue.trim()); }}
            disabled={disabled || !inputValue.trim()}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0"
            style={{
              background: disabled || !inputValue.trim() ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${CYAN}, #0099cc)`,
              color: NAVY,
            }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs mt-1.5" style={{ color: "#334155" }}>Simulated — no real AI calls</p>
      </div>
    </div>
  );
}
