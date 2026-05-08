"use client";

import { useState, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import TracePanel from "@/components/TracePanel";
import { ChatMessage, DiagramPhase, LocationContext, RetailerResult, ReasoningResult, buildTurn } from "@/lib/stubs";

const CYAN = "#00d4ff";
const MINT = "#00e68a";
const NAVY = "#060a13";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [diagramPhase, setDiagramPhase] = useState<DiagramPhase>("idle");
  const [currentSnoop, setCurrentSnoop] = useState<RetailerResult | null>(null);
  const [currentBrandB, setCurrentBrandB] = useState<RetailerResult | null>(null);
  const [currentBrandC, setCurrentBrandC] = useState<RetailerResult | null>(null);
  const [currentReasoning, setCurrentReasoning] = useState<ReasoningResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSend = useCallback(async (text: string) => {
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    const turn = buildTurn(text);

    // Querying — lines animate
    setDiagramPhase("querying");
    setCurrentSnoop(null);
    setCurrentBrandB(null);
    setCurrentBrandC(null);
    setCurrentReasoning(null);

    await delay(1500);
    // Responding — all nodes light up
    setDiagramPhase("responding");
    setCurrentSnoop(turn.snoop);
    setCurrentBrandB(turn.brandB);
    setCurrentBrandC(turn.brandC);

    await delay(1800);
    // Reasoning — Clinchr agent reasoning card appears
    setDiagramPhase("reasoning");
    setCurrentReasoning(turn.reasoning);

    await delay(2000);
    // Decided — winner chosen
    setDiagramPhase("decided");

    await delay(1500);
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "assistant", content: turn.assistantMessage }]);

    await delay(1000);
    setDiagramPhase("idle");
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: NAVY }}>
      {/* Branding bar */}
      <div
        className="absolute top-0 left-0 right-0 z-10 h-10 flex items-center px-6 justify-between border-b"
        style={{ background: "#080e1a", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: CYAN }}>Clinchr</span>
          <span className="text-sm" style={{ color: "#334155" }}>|</span>
          <span className="text-xs" style={{ color: "#8892a4" }}>Agentic Commerce Demo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: MINT, boxShadow: `0 0 6px ${MINT}` }} />
          <span className="text-[11px]" style={{ color: "#8892a4" }}>Snoop Boutique agent active</span>
        </div>
      </div>

      {/* Split screen */}
      <div className="flex w-full pt-10">
        {/* Left — chat */}
        <div className="w-1/2 flex flex-col overflow-hidden border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="px-4 pt-3 pb-1 border-b" style={{ background: "#080e1a", borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest font-mono" style={{ color: "#334155" }}>
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
          <div className="px-4 pt-3 pb-1 border-b" style={{ background: "#080e1a", borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest font-mono" style={{ color: "#334155" }}>
              Clinchr · Retailer Agent Network
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <TracePanel
              phase={diagramPhase}
              snoop={currentSnoop}
              brandB={currentBrandB}
              brandC={currentBrandC}
              reasoning={currentReasoning}
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
