"use client";

import { useEffect, useState } from "react";
import { DiagramPhase, LocationContext, RetailerResult, ReasoningResult } from "@/lib/stubs";

interface Props {
  phase: DiagramPhase;
  snoop: RetailerResult | null;
  brandB: RetailerResult | null;
  brandC: RetailerResult | null;
  reasoning: ReasoningResult | null;
  locationContext: LocationContext | null;
  tickerOverride: string | null;
}

const CYAN = "#00d4ff";
const MINT = "#00e68a";
const NAVY = "#060a13";

const SNOOP_AGENT_MESSAGES = [
  "tools/call get_product_offer",
  "tools/result priced_offer",
  "tools/call confirm_levers",
];

export default function TracePanel({ phase, snoop, brandB, brandC, reasoning, locationContext, tickerOverride }: Props) {
  const isQuerying   = phase === "querying";
  const isResponding = phase === "responding" || phase === "reasoning" || phase === "decided";
  const isNegotiating = phase === "responding";
  const isReasoning  = phase === "reasoning";
  const isDecided    = phase === "decided";

  const [tickerIndex, setTickerIndex] = useState(0);
  useEffect(() => {
    if (!isNegotiating || tickerOverride) return;
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % SNOOP_AGENT_MESSAGES.length);
    }, 1400);
    return () => clearInterval(id);
  }, [isNegotiating, tickerOverride]);

  const tickerText = tickerOverride ?? SNOOP_AGENT_MESSAGES[tickerIndex];

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

          {/* Connector area — Gemini → (Snoop Agent) → retailers, with bidirectional exchange */}
          <div className="relative w-full" style={{ height: 130 }}>
            <svg
              viewBox="0 0 360 130"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
            >
              {/* Gemini (180,0) → Snoop Agent (60,55) → Snoop Boutique (60,130) */}
              <line x1="180" y1="0"  x2="60"  y2="55"  stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1="60"  y1="80" x2="60"  y2="130" stroke={isNegotiating ? CYAN : "#1e293b"} strokeOpacity={isNegotiating ? 0.5 : 1} strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Gemini → Elm Hill (180,130) */}
              <line x1="180" y1="0"  x2="180" y2="130" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 3" />
              {/* Gemini → Florette (300,130) */}
              <line x1="180" y1="0"  x2="300" y2="130" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 3" />

              {isQuerying && (
                <>
                  <circle r="4" fill={CYAN} opacity="0.9">
                    <animateMotion dur="1.1s" repeatCount="indefinite" path="M180,0 L60,55 L60,130" />
                  </circle>
                  <circle r="4" fill={CYAN} opacity="0.9">
                    <animateMotion dur="1.1s" repeatCount="indefinite" begin="0.35s" path="M180,0 L180,130" />
                  </circle>
                  <circle r="4" fill={CYAN} opacity="0.9">
                    <animateMotion dur="1.1s" repeatCount="indefinite" begin="0.18s" path="M180,0 L300,130" />
                  </circle>
                </>
              )}

              {isNegotiating && (
                <>
                  {/* Request: Gemini → Snoop Agent */}
                  <circle r="3.5" fill={CYAN}>
                    <animateMotion dur="1.4s" repeatCount="indefinite" path="M180,0 L60,55" />
                  </circle>
                  {/* Response: Snoop Agent → Gemini */}
                  <circle r="3.5" fill={MINT}>
                    <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.7s" path="M60,55 L180,0" />
                  </circle>
                  {/* Delegation: Snoop Agent → Snoop Boutique */}
                  <circle r="3" fill={CYAN} opacity="0.7">
                    <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.35s" path="M60,80 L60,130" />
                  </circle>
                </>
              )}
            </svg>

            {/* Snoop Agent pill — positioned over the leftmost column, centred at x=60/360 ≈ 16.67% */}
            <div
              className="absolute flex justify-center"
              style={{ top: 40, left: "16.67%", transform: "translateX(-50%)" }}
            >
              <div
                className="px-2.5 py-1.5 rounded-lg border text-center transition-all duration-500"
                style={{
                  borderColor: isNegotiating ? CYAN : isResponding ? "rgba(0,212,255,0.4)" : "#1e293b",
                  background: isNegotiating
                    ? "rgba(0,212,255,0.1)"
                    : isResponding
                    ? "rgba(0,212,255,0.05)"
                    : "rgba(255,255,255,0.03)",
                  boxShadow: isNegotiating ? `0 0 14px rgba(0,212,255,0.3)` : "none",
                  minWidth: 96,
                }}
              >
                <p className="text-[9px] font-semibold text-white leading-tight">Snoop Agent</p>
                <p className="text-[8px] font-mono leading-tight" style={{ color: CYAN }}>Clinchr · MCP</p>
              </div>
            </div>

            {/* MCP message ticker — floats between Gemini and Snoop Agent during negotiation */}
            {isNegotiating && (
              <div
                className="absolute pointer-events-none"
                style={{ top: 10, left: "50%", transform: "translateX(-10%)" }}
              >
                <div
                  key={tickerText}
                  className="text-[9px] font-mono px-2 py-0.5 rounded border transition-opacity duration-300 whitespace-nowrap"
                  style={{
                    color: CYAN,
                    background: "rgba(0,212,255,0.08)",
                    borderColor: "rgba(0,212,255,0.3)",
                  }}
                >
                  {tickerText}
                </div>
              </div>
            )}
          </div>

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
              name="Atwin Store"
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
              name="The Mercantile"
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
              {locationContext && (
                <div
                  className="mt-2 pt-2 border-t"
                  style={{ borderColor: "rgba(0,212,255,0.15)" }}
                >
                  <p className="text-[10px] font-semibold mb-1" style={{ color: CYAN }}>
                    {locationContext.headline}
                  </p>
                  <ul className="space-y-0.5">
                    {locationContext.bullets.map((b) => (
                      <li
                        key={b}
                        className="text-[10px] leading-snug"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        • {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
              <p className="text-[10px]" style={{ color: CYAN }}>Snoop Agent negotiating with Gemini via MCP…</p>
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
              {result.levers.filter((l) => l.active || l.rejected).map((lever) => (
                <span
                  key={lever.label}
                  className="text-[8px] px-1.5 py-0.5 rounded-full border transition-all duration-300"
                  style={lever.rejected
                    ? { background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.35)", color: "#f87171", textDecoration: "line-through" }
                    : { background: "rgba(0,230,138,0.1)", borderColor: "rgba(0,230,138,0.35)", color: MINT }}
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
