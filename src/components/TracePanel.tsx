"use client";

import { DiagramPhase, RetailerResult, ReasoningResult } from "@/lib/stubs";

interface Props {
  phase: DiagramPhase;
  snoop: RetailerResult | null;
  brandB: RetailerResult | null;
  brandC: RetailerResult | null;
  reasoning: ReasoningResult | null;
}

const CYAN = "#00d4ff";
const MINT = "#00e68a";
const NAVY = "#060a13";

export default function TracePanel({ phase, snoop, brandB, brandC, reasoning }: Props) {
  const isQuerying   = phase === "querying";
  const isResponding = phase === "responding" || phase === "reasoning" || phase === "decided";
  const isReasoning  = phase === "reasoning";
  const isDecided    = phase === "decided";

  return (
    <div className="flex flex-col h-full select-none" style={{ background: NAVY }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{
              backgroundColor: isQuerying ? CYAN : isResponding ? MINT : "#334155",
              boxShadow: isQuerying ? `0 0 6px ${CYAN}` : isResponding ? `0 0 6px ${MINT}` : "none",
            }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest font-mono" style={{ color: "#8892a4" }}>
            Agent Interactions
          </span>
        </div>
        <span className="text-[10px] font-mono" style={{ color: "#334155" }}>live simulation</span>
      </div>

      {/* Diagram */}
      <div className="flex-1 flex items-center justify-center px-4 py-3 overflow-hidden">
        <div className="w-full max-w-md flex flex-col gap-0">

          {/* Shopping Agent node */}
          <div className="flex justify-center mb-1">
            <div
              className="px-5 py-3 rounded-xl border text-center transition-all duration-500"
              style={{
                borderColor: isQuerying ? CYAN : "#1e293b",
                background: isQuerying ? "rgba(0,212,255,0.07)" : "rgba(255,255,255,0.03)",
                boxShadow: isQuerying ? `0 0 20px rgba(0,212,255,0.15)` : "none",
              }}
            >
              <div className="text-lg mb-0.5">🤖</div>
              <p className="text-xs font-semibold text-white">Shopping Agent</p>
              <p className="text-[10px]" style={{ color: "#8892a4" }}>Gemini LLM</p>
            </div>
          </div>

          {/* SVG connecting lines */}
          <svg viewBox="0 0 360 52" className="w-full" style={{ height: 52 }}>
            <line x1="180" y1="0" x2="55"  y2="52" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="180" y1="0" x2="180" y2="52" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="180" y1="0" x2="305" y2="52" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 3" />
            {isQuerying && (
              <>
                <circle r="4" fill={CYAN} opacity="0.9">
                  <animateMotion dur="0.9s" repeatCount="indefinite" path="M180,0 L55,52" />
                </circle>
                <circle r="4" fill={CYAN} opacity="0.9">
                  <animateMotion dur="0.9s" repeatCount="indefinite" begin="0.3s" path="M180,0 L180,52" />
                </circle>
                <circle r="4" fill={CYAN} opacity="0.9">
                  <animateMotion dur="0.9s" repeatCount="indefinite" begin="0.15s" path="M180,0 L305,52" />
                </circle>
              </>
            )}
          </svg>

          {/* Retailer nodes */}
          <div className="flex gap-2">
            <RetailerNode
              name="Snoop Boutique"
              sub="Norwich · Clinchr"
              badge="MCP"
              badgeStyle={{ background: "rgba(0,212,255,0.1)", color: CYAN, borderColor: "rgba(0,212,255,0.3)" }}
              result={snoop}
              isResponding={isResponding}
              isDecided={isDecided}
              isWinner={true}
              isQuerying={isQuerying}
            />
            <RetailerNode
              name="Elm Hill Studio"
              sub="Norwich · Static"
              badge="HTTP"
              badgeStyle={{ background: "rgba(255,255,255,0.04)", color: "#8892a4", borderColor: "#1e293b" }}
              result={brandC}
              isResponding={isResponding}
              isDecided={isDecided}
              isWinner={false}
              isQuerying={isQuerying}
            />
            <RetailerNode
              name="Florette London"
              sub="London · Static"
              badge="HTTP"
              badgeStyle={{ background: "rgba(255,255,255,0.04)", color: "#8892a4", borderColor: "#1e293b" }}
              result={brandB}
              isResponding={isResponding}
              isDecided={isDecided}
              isWinner={false}
              isQuerying={isQuerying}
            />
          </div>

          {/* Reasoning card */}
          {(isReasoning || isDecided) && reasoning && (
            <div
              className="mt-3 rounded-xl border p-3 transition-all duration-500"
              style={{
                borderColor: "rgba(0,212,255,0.25)",
                background: "rgba(0,212,255,0.05)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: CYAN }} className="text-sm">⚡</span>
                <span className="text-[11px] font-bold" style={{ color: CYAN }}>Clinchr Agent Reasoning</span>
              </div>
              {reasoning.signals.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-[9px]" style={{ color: "#8892a4" }}>Signals:</span>
                  {reasoning.signals.map((s) => (
                    <span
                      key={s}
                      className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: "rgba(0,212,255,0.12)", color: CYAN }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                → {reasoning.explanation}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="mt-3 text-center">
            {phase === "idle" && (
              <p className="text-[10px]" style={{ color: "#334155" }}>Send a message to trigger agent interactions</p>
            )}
            {phase === "querying" && (
              <p className="text-[10px] animate-pulse" style={{ color: CYAN }}>Agent querying all retailers…</p>
            )}
            {phase === "responding" && (
              <p className="text-[10px]" style={{ color: "#8892a4" }}>Evaluating responses…</p>
            )}
            {phase === "reasoning" && (
              <p className="text-[10px]" style={{ color: CYAN }}>Clinchr agent selecting lever…</p>
            )}
            {phase === "decided" && (
              <p className="text-[10px]" style={{ color: MINT }}>Snoop Boutique selected — best offer via Clinchr</p>
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
  badgeStyle: React.CSSProperties;
  result: RetailerResult | null;
  isResponding: boolean;
  isDecided: boolean;
  isWinner: boolean;
  isQuerying: boolean;
}

function RetailerNode({ name, sub, badge, badgeStyle, result, isResponding, isDecided, isWinner, isQuerying }: NodeProps) {
  let borderColor = "#1e293b";
  let bg = "rgba(255,255,255,0.02)";
  let opacity = 1;
  let boxShadow = "none";

  if (isDecided && isWinner) {
    borderColor = MINT;
    bg = "rgba(0,230,138,0.06)";
    boxShadow = `0 0 20px rgba(0,230,138,0.12)`;
  } else if (isDecided && !isWinner) {
    opacity = 0.35;
  } else if (isResponding) {
    borderColor = "#334155";
    bg = "rgba(255,255,255,0.04)";
  }

  return (
    <div
      className="flex-1 rounded-xl border p-2.5 transition-all duration-700"
      style={{ borderColor, background: bg, opacity, boxShadow }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white leading-tight truncate">{name}</p>
          <p className="text-[9px] uppercase tracking-wider leading-tight mt-0.5" style={{ color: "#8892a4" }}>{sub}</p>
        </div>
        <span className="text-[9px] border px-1 py-0.5 rounded font-mono shrink-0 ml-1" style={badgeStyle}>
          {badge}
        </span>
      </div>

      {isResponding && result ? (
        <div className="space-y-1">
          <p className="text-[10px] font-medium leading-tight text-white">{result.product}</p>
          <div className="flex items-center gap-1">
            {result.discountedPrice ? (
              <>
                <span className="text-[9px] line-through" style={{ color: "#8892a4" }}>{result.price}</span>
                <span className="text-[11px] font-bold" style={{ color: MINT }}>{result.discountedPrice}</span>
              </>
            ) : (
              <span className="text-[11px] font-bold" style={{ color: isWinner ? MINT : "#94a3b8" }}>
                {result.price}
              </span>
            )}
          </div>
          {isWinner && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {result.levers.filter((l) => l.active).map((lever) => (
                <span
                  key={lever.label}
                  className="text-[8px] px-1.5 py-0.5 rounded-full border"
                  style={{ background: "rgba(0,230,138,0.1)", borderColor: "rgba(0,230,138,0.35)", color: MINT }}
                >
                  {lever.label}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-10 flex items-center justify-center">
          <span className="text-[9px]" style={{ color: "#334155" }}>
            {isQuerying ? "querying…" : "waiting"}
          </span>
        </div>
      )}

      {isDecided && isWinner && (
        <div className="mt-1.5 flex items-center gap-1 pt-1.5 border-t" style={{ borderColor: "rgba(0,230,138,0.2)" }}>
          <span style={{ color: MINT }} className="text-[11px]">✓</span>
          <span className="text-[9px] font-semibold" style={{ color: MINT }}>Preferred by agent</span>
        </div>
      )}
    </div>
  );
}
