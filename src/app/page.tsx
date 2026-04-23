"use client";

import { useState, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import TracePanel from "@/components/TracePanel";
import { ChatMessage, DiagramPhase, RetailerResult, SCENARIOS } from "@/lib/stubs";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [diagramPhase, setDiagramPhase] = useState<DiagramPhase>("idle");
  const [currentSnoop, setCurrentSnoop] = useState<RetailerResult | null>(null);
  const [currentBrandB, setCurrentBrandB] = useState<RetailerResult | null>(null);
  const [currentBrandC, setCurrentBrandC] = useState<RetailerResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [turnIndex, setTurnIndex] = useState(0);

  const handleSend = useCallback(
    async (text: string) => {
      setInputValue("");
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setIsTyping(true);

      const turn = SCENARIOS[turnIndex % SCENARIOS.length];

      // Phase: querying — lines animate
      setDiagramPhase("querying");
      setCurrentSnoop(null);
      setCurrentBrandB(null);
      setCurrentBrandC(null);

      await delay(1500);
      // Phase: responding — all retailer nodes light up
      setDiagramPhase("responding");
      setCurrentSnoop(turn.snoop);
      setCurrentBrandB(turn.brandB);
      setCurrentBrandC(turn.brandC);

      await delay(1800);
      // Phase: decided — Snoop highlighted, others dimmed
      setDiagramPhase("decided");

      await delay(1500);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: turn.assistantMessage },
      ]);

      await delay(1000);
      // Back to idle but keep retailer data visible
      setDiagramPhase("idle");
      setTurnIndex(turnIndex + 1);
    },
    [turnIndex]
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Branding bar */}
      <div className="absolute top-0 left-0 right-0 z-10 h-10 bg-white border-b border-gray-200 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Clinchr</span>
          <span className="text-gray-300 text-sm">|</span>
          <span className="text-xs text-gray-400">Agentic Commerce Demo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-gray-400">Snoop Boutique agent active</span>
        </div>
      </div>

      {/* Split screen */}
      <div className="flex w-full pt-10">
        {/* Left — chat */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-1 bg-gray-50 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              User · Shopping Agent
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              onSend={handleSend}
              inputValue={inputValue}
              setInputValue={setInputValue}
              disabled={isTyping}
            />
          </div>
        </div>

        {/* Right — agent diagram */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-1 bg-gray-900 border-b border-gray-800">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest font-mono">
              Clinchr · Retailer Agent Network
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <TracePanel
              phase={diagramPhase}
              snoop={currentSnoop}
              brandB={currentBrandB}
              brandC={currentBrandC}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
