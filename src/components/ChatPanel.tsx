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

export default function ChatPanel({
  messages,
  isTyping,
  onSend,
  inputValue,
  setInputValue,
  disabled,
}: Props) {
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Gemini Shopping</p>
            <p className="text-xs text-gray-400">AI Shopping Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
            <p className="text-2xl">🛍️</p>
            <p className="text-sm">What do you need?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold mr-2 mt-0.5 shrink-0">
                G
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              G
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <textarea
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none"
            placeholder={disabled ? "Waiting for response…" : "What do you need?"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={disabled}
          />
          <button
            onClick={() => { if (inputValue.trim() && !disabled) onSend(inputValue.trim()); }}
            disabled={disabled || !inputValue.trim()}
            className="w-7 h-7 rounded-full bg-blue-600 disabled:bg-gray-300 flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-1.5">Simulated — no real AI calls</p>
      </div>
    </div>
  );
}
