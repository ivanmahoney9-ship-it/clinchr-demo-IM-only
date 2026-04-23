"use client";

import { DiagramPhase, RetailerResult } from "@/lib/stubs";

interface Props {
  phase: DiagramPhase;
  snoop: RetailerResult | null;
  brandB: RetailerResult | null;
  brandC: RetailerResult | null;
}

export default function TracePanel({ phase, snoop, brandB, brandC }: Props) {
  const isQuerying = phase === "querying";
  const isResponding = phase === "responding" || phase === "decided";
  const isDecided = phase === "decided";

  return (
    <div className="flex flex-col h-full bg-gray-950 select-none">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-500 ${
              isQuerying ? "bg-blue-400 animate-pulse" : isResponding ? "bg-emerald-400" : "bg-gray-600"
            }`}
          />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest font-mono">
            Agent Interactions
          </span>
        </div>
        <span className="text-[10px] text-gray-700 font-mono">live simulation</span>
      </div>

      {/* Diagram */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="w-full max-w-md">

          {/* Shopping Agent node */}
          <div className="flex justify-center mb-1">
            <div
              className={`px-5 py-3 rounded-xl border text-center transition-all duration-500 ${
                isQuerying
                  ? "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/20"
                  : "border-gray-700 bg-gray-900"
              }`}
            >
              <div className="text-lg mb-0.5">🤖</div>
              <p className="text-xs font-semibold text-gray-200">Shopping Agent</p>
              <p className="text-[10px] text-gray-500">Gemini LLM</p>
            </div>
          </div>

          {/* SVG connecting lines — agent to 3 retailers */}
          <svg viewBox="0 0 360 56" className="w-full" style={{ height: 56 }}>
            {/* Static dashed lines */}
            <line x1="180" y1="0" x2="55"  y2="56" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="180" y1="0" x2="180" y2="56" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="180" y1="0" x2="305" y2="56" stroke="#374151" strokeWidth="1.5" strokeDasharray="4 3" />

            {/* Animated travel dots when querying */}
            {isQuerying && (
              <>
                <circle r="4" fill="#60a5fa">
                  <animateMotion dur="0.85s" repeatCount="indefinite" path="M180,0 L55,56" />
                </circle>
                <circle r="4" fill="#60a5fa">
                  <animateMotion dur="0.85s" repeatCount="indefinite" begin="0.28s" path="M180,0 L180,56" />
                </circle>
                <circle r="4" fill="#60a5fa">
                  <animateMotion dur="0.85s" repeatCount="indefinite" begin="0.14s" path="M180,0 L305,56" />
                </circle>
              </>
            )}
          </svg>

          {/* Three retailer nodes */}
          <div className="flex gap-2 mt-0">

            {/* Snoop Boutique */}
            <RetailerNode
              name="Snoop Boutique"
              sub="Norwich · Clinchr MCP"
              badge="MCP"
              badgeClass="bg-violet-900/60 text-violet-300 border-violet-700/50"
              result={snoop}
              isResponding={isResponding}
              isDecided={isDecided}
              isWinner={true}
              isQuerying={isQuerying}
            />

            {/* Elm Hill Studio */}
            <RetailerNode
              name="Elm Hill Studio"
              sub="Norwich · Static cat."
              badge="HTTP"
              badgeClass="bg-gray-800 text-gray-500 border-gray-700"
              result={brandC}
              isResponding={isResponding}
              isDecided={isDecided}
              isWinner={false}
              isQuerying={isQuerying}
            />

            {/* Florette London */}
            <RetailerNode
              name="Florette London"
              sub="London · Static cat."
              badge="HTTP"
              badgeClass="bg-gray-800 text-gray-500 border-gray-700"
              result={brandB}
              isResponding={isResponding}
              isDecided={isDecided}
              isWinner={false}
              isQuerying={isQuerying}
            />
          </div>

          {/* Status label */}
          <div className="mt-3 text-center">
            {phase === "idle" && (
              <p className="text-[10px] text-gray-700">Send a message to trigger agent interactions</p>
            )}
            {phase === "querying" && (
              <p className="text-[10px] text-blue-500 animate-pulse">Agent querying all retailers…</p>
            )}
            {phase === "responding" && (
              <p className="text-[10px] text-gray-500">Evaluating responses…</p>
            )}
            {phase === "decided" && (
              <p className="text-[10px] text-emerald-500">Snoop Boutique selected — best offer via Clinchr</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface NodeProps {
  name: string;
  sub: string;
  badge: string;
  badgeClass: string;
  result: RetailerResult | null;
  isResponding: boolean;
  isDecided: boolean;
  isWinner: boolean;
  isQuerying: boolean;
}

function RetailerNode({
  name, sub, badge, badgeClass,
  result, isResponding, isDecided, isWinner, isQuerying,
}: NodeProps) {
  const borderClass = isDecided
    ? isWinner
      ? "border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-500/20"
      : "border-gray-800 bg-gray-900/30 opacity-40"
    : isResponding
    ? "border-gray-600 bg-gray-900"
    : "border-gray-800 bg-gray-900/50";

  return (
    <div className={`flex-1 rounded-xl border p-2.5 transition-all duration-700 ${borderClass}`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-gray-100 leading-tight truncate">{name}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-tight mt-0.5">{sub}</p>
        </div>
        <span className={`text-[9px] border px-1 py-0.5 rounded font-mono shrink-0 ml-1 ${badgeClass}`}>
          {badge}
        </span>
      </div>

      {isResponding && result ? (
        <div className="space-y-1">
          <p className="text-[10px] text-gray-200 font-medium leading-tight">{result.product}</p>
          <div className="flex items-center gap-1">
            {result.discountedPrice ? (
              <>
                <span className="text-[9px] text-gray-500 line-through">{result.price}</span>
                <span className="text-[11px] font-bold text-emerald-400">{result.discountedPrice}</span>
              </>
            ) : (
              <span className={`text-[11px] font-bold ${isWinner ? "text-emerald-400" : "text-gray-300"}`}>
                {result.price}
              </span>
            )}
          </div>
          {isWinner && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {result.levers.filter((l) => l.active).map((lever) => (
                <span
                  key={lever.label}
                  className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                >
                  {lever.label}
                </span>
              ))}
            </div>
          )}
          {isDecided && isWinner && result.negotiationNote && (
            <p className="text-[8px] text-amber-400/80 leading-tight pt-0.5 italic">
              {result.negotiationNote}
            </p>
          )}
        </div>
      ) : (
        <div className="h-10 flex items-center justify-center">
          <span className="text-[9px] text-gray-700">
            {isQuerying ? "querying…" : "waiting"}
          </span>
        </div>
      )}

      {isDecided && isWinner && (
        <div className="mt-1.5 flex items-center gap-1 pt-1.5 border-t border-emerald-800/40">
          <span className="text-emerald-400 text-[10px]">✓</span>
          <span className="text-[9px] font-semibold text-emerald-300">Preferred by agent</span>
        </div>
      )}
    </div>
  );
}
