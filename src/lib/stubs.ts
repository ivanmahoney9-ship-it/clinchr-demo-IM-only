export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export type Lever = "free_delivery" | "discount" | "express";

export interface RetailerResult {
  product: string;
  price: string;
  discountedPrice?: string;
  levers: { label: string; active: boolean }[];
  negotiationNote?: string;
  wins: boolean;
}

export interface ReasoningResult {
  signals: string[];
  lever: Lever;
  explanation: string;
}

export interface Turn {
  userMessage: string;
  assistantMessage: string;
  snoop: RetailerResult;
  brandB: RetailerResult;
  brandC: RetailerResult;
  reasoning: ReasoningResult;
}

export type DiagramPhase = "idle" | "querying" | "responding" | "reasoning" | "decided";

// ─── Signal detection ────────────────────────────────────────────────────────

const URGENCY_SIGNALS = [
  "urgent", "urgently", "tomorrow", "tonight", "today", "asap", "quick",
  "fast", "need it fast", "last minute", "this week", "by friday", "by saturday",
  "by sunday", "rush", "hurry", "soon", "immediately",
];

const PRICE_SIGNALS = [
  "cheap", "cheapest", "budget", "affordable", "under £", "save", "saving",
  "discount", "deal", "sale", "offer", "price", "cost", "expensive", "bargain",
  "value", "spend", "less than", "not too much", "reasonable",
];

export function detectSignals(message: string): string[] {
  const lower = message.toLowerCase();
  const found: string[] = [];
  for (const s of [...URGENCY_SIGNALS, ...PRICE_SIGNALS]) {
    if (lower.includes(s) && !found.includes(s)) found.push(s);
  }
  return found;
}

export function detectLever(message: string): Lever {
  const lower = message.toLowerCase();
  if (URGENCY_SIGNALS.some((s) => lower.includes(s))) return "express";
  if (PRICE_SIGNALS.some((s) => lower.includes(s))) return "discount";
  return "free_delivery";
}

// ─── 20 scenario templates ───────────────────────────────────────────────────

interface ScenarioTemplate {
  keywords: string[];
  category: string;
  snoop: { product: string; price: number };
  brandB: { product: string; price: number };
  brandC: { product: string; price: number };
}

const SCENARIOS: ScenarioTemplate[] = [
  {
    keywords: ["wedding", "summer", "garden", "outdoor", "bride", "guest"],
    category: "summer wedding guest",
    snoop: { product: "Meadow Bloom Midi", price: 89 },
    brandB: { product: "Garden Party Dress", price: 99 },
    brandC: { product: "Poppy Floral Midi", price: 95 },
  },
  {
    keywords: ["winter", "christmas", "festive", "december", "cold"],
    category: "winter occasion",
    snoop: { product: "Velvet Plum Wrap", price: 105 },
    brandB: { product: "Winter Bloom Dress", price: 119 },
    brandC: { product: "Festive Midi", price: 112 },
  },
  {
    keywords: ["beach", "destination", "tropical", "abroad", "island", "holiday wedding"],
    category: "beach wedding guest",
    snoop: { product: "Coastal Ruffle Midi", price: 79 },
    brandB: { product: "Shoreline Dress", price: 89 },
    brandC: { product: "Sea Breeze Sundress", price: 85 },
  },
  {
    keywords: ["cocktail", "reception", "drinks", "smart casual", "elegant"],
    category: "cocktail party",
    snoop: { product: "Noir Crepe Mini", price: 95 },
    brandB: { product: "Evening Cocktail Dress", price: 109 },
    brandC: { product: "Tailored Shift Dress", price: 102 },
  },
  {
    keywords: ["birthday", "night out", "celebration", "going out", "party"],
    category: "birthday / night out",
    snoop: { product: "Sequin Wrap Mini", price: 85 },
    brandB: { product: "Party Mini Dress", price: 98 },
    brandC: { product: "Sparkle Slip Dress", price: 92 },
  },
  {
    keywords: ["new year", "nye", "countdown", "new years", "silvester"],
    category: "New Year's Eve",
    snoop: { product: "Midnight Gold Slip", price: 115 },
    brandB: { product: "NYE Sequin Dress", price: 129 },
    brandC: { product: "Glitter Column Dress", price: 122 },
  },
  {
    keywords: ["work", "office", "professional", "9 to 5", "corporate casual", "monday"],
    category: "office / work",
    snoop: { product: "Tailored Linen Midi", price: 75 },
    brandB: { product: "Smart Day Dress", price: 85 },
    brandC: { product: "Structured Shift", price: 79 },
  },
  {
    keywords: ["business", "client", "dinner", "meeting", "corporate", "boardroom"],
    category: "business dinner",
    snoop: { product: "Ponte Sheath Dress", price: 98 },
    brandB: { product: "Business Midi Dress", price: 112 },
    brandC: { product: "Classic Column Midi", price: 105 },
  },
  {
    keywords: ["date", "romantic", "restaurant", "evening", "dinner date"],
    category: "date night",
    snoop: { product: "Silk Bias-Cut Midi", price: 99 },
    brandB: { product: "Date Night Wrap", price: 115 },
    brandC: { product: "Evening Slip Dress", price: 108 },
  },
  {
    keywords: ["black tie", "gala", "ball", "formal", "awards", "ceremony"],
    category: "black tie / gala",
    snoop: { product: "Midnight Velvet Gown", price: 145 },
    brandB: { product: "Evening Cascade Maxi", price: 175 },
    brandC: { product: "Velvet Column Gown", price: 155 },
  },
  {
    keywords: ["brunch", "casual", "daytime", "lunch", "relaxed", "sunday"],
    category: "casual / brunch",
    snoop: { product: "Linen Tiered Midi", price: 65 },
    brandB: { product: "Casual Floral Dress", price: 75 },
    brandC: { product: "Relaxed Day Dress", price: 69 },
  },
  {
    keywords: ["holiday", "vacation", "resort", "summer holiday", "packing"],
    category: "holiday / vacation",
    snoop: { product: "Amalfi Sundress", price: 72 },
    brandB: { product: "Holiday Maxi Dress", price: 82 },
    brandC: { product: "Coastal Midi Dress", price: 78 },
  },
  {
    keywords: ["mum", "mom", "mother", "mothers day", "mother's day", "mam"],
    category: "Mother's Day gift",
    snoop: { product: "Silk Floral A-Line", price: 89 },
    brandB: { product: "Floral Wrap Dress", price: 99 },
    brandC: { product: "Classic Floral Midi", price: 94 },
  },
  {
    keywords: ["gift", "present", "friend", "surprise", "birthday gift", "for her"],
    category: "gift for a friend",
    snoop: { product: "Bow-Detail Midi", price: 79 },
    brandB: { product: "Gift-Worthy Wrap", price: 89 },
    brandC: { product: "Elegant Day Dress", price: 84 },
  },
  {
    keywords: ["autumn", "fall", "october", "november", "harvest", "rustic"],
    category: "autumn occasion",
    snoop: { product: "Burnt Sienna Midi", price: 92 },
    brandB: { product: "Autumn Floral Dress", price: 105 },
    brandC: { product: "Rust Wrap Dress", price: 98 },
  },
  {
    keywords: ["graduation", "ceremony", "academic", "university", "prom", "graduation ball"],
    category: "graduation",
    snoop: { product: "Ivory Satin Midi", price: 95 },
    brandB: { product: "Graduation Day Dress", price: 108 },
    brandC: { product: "Ceremony Midi", price: 102 },
  },
  {
    keywords: ["hen", "bachelorette", "bridesmaid", "bride tribe", "hen do", "hen party"],
    category: "hen party",
    snoop: { product: "Blush Ruched Mini", price: 78 },
    brandB: { product: "Hen Party Dress", price: 88 },
    brandC: { product: "Playful Mini Dress", price: 83 },
  },
  {
    keywords: ["interview", "job", "graduate job", "first job", "smart", "professional look"],
    category: "job interview",
    snoop: { product: "Structured Crepe Dress", price: 85 },
    brandB: { product: "Interview-Ready Midi", price: 98 },
    brandC: { product: "Clean-Line Sheath", price: 90 },
  },
  {
    keywords: ["charity", "fundraiser", "auction", "gala dinner", "black tie charity"],
    category: "charity / fundraiser",
    snoop: { product: "Duchess Satin Gown", price: 139 },
    brandB: { product: "Charity Gala Dress", price: 159 },
    brandC: { product: "Formal Floor-Length", price: 148 },
  },
  {
    keywords: ["festival", "outdoor", "boho", "bohemian", "glastonbury", "field", "garden party"],
    category: "festival / garden party",
    snoop: { product: "Wildflower Boho Midi", price: 69 },
    brandB: { product: "Festival Maxi Dress", price: 79 },
    brandC: { product: "Boho Tiered Dress", price: 74 },
  },
];

function findScenario(message: string): ScenarioTemplate {
  const lower = message.toLowerCase();
  let best = SCENARIOS[0];
  let bestScore = 0;
  for (const scenario of SCENARIOS) {
    const score = scenario.keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = scenario;
    }
  }
  return best;
}

function fmt(price: number): string {
  return `£${price.toFixed(2).replace(".00", "")}`;
}

// ─── Turn builder ─────────────────────────────────────────────────────────────

export function buildTurn(message: string): Turn {
  const scenario = findScenario(message);
  const lever = detectLever(message);
  const signals = detectSignals(message);

  const snoopPrice = scenario.snoop.price;
  const discountedPrice = lever === "discount" ? Math.round(snoopPrice * 0.95 * 100) / 100 : undefined;

  const leverLabels: Record<Lever, string> = {
    free_delivery: "Free delivery",
    discount: "5% discount",
    express: "Express delivery",
  };

  const levers = (["free_delivery", "discount", "express"] as Lever[]).map((l) => ({
    label: leverLabels[l],
    active: l === lever,
  }));

  const leverExplanations: Record<Lever, string> = {
    free_delivery: "No urgency or price signals — free delivery applied to reduce friction.",
    discount: `Price signal detected — 5% discount activated to widen gap over ${scenario.brandC.product} (${fmt(scenario.brandC.price)}).`,
    express: `Urgency signal detected — express delivery activated to meet timeline.`,
  };

  const reasoning: ReasoningResult = {
    signals,
    lever,
    explanation: leverExplanations[lever],
  };

  const snoopNote = leverLabels[lever];

  let assistantMessage: string;
  if (lever === "discount" && discountedPrice) {
    assistantMessage = `For ${scenario.category}, Snoop Boutique has the **${scenario.snoop.product}** — normally ${fmt(snoopPrice)}, with a **5% discount** bringing it to **${fmt(discountedPrice)}**. A great alternative is ${scenario.brandC.product} from Elm Hill Studio at ${fmt(scenario.brandC.price)}, but Snoop's offer is the strongest right now. Want to add it to your basket?`;
  } else if (lever === "express") {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} is available with **express delivery** — arriving tomorrow. Elm Hill Studio has the ${scenario.brandC.product} at ${fmt(scenario.brandC.price)}, but can't match the speed. Want to go with Snoop?`;
  } else {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} comes with **free delivery**. Elm Hill Studio has the ${scenario.brandC.product} at ${fmt(scenario.brandC.price)}, but Snoop wins on price and convenience. Shall I add it to your basket?`;
  }

  return {
    userMessage: message,
    assistantMessage,
    snoop: {
      product: scenario.snoop.product,
      price: fmt(snoopPrice),
      discountedPrice: discountedPrice ? fmt(discountedPrice) : undefined,
      levers,
      negotiationNote: `${snoopNote} activated. ${leverExplanations[lever]}`,
      wins: true,
    },
    brandB: {
      product: scenario.brandB.product,
      price: fmt(scenario.brandB.price),
      levers: [],
      wins: false,
    },
    brandC: {
      product: scenario.brandC.product,
      price: fmt(scenario.brandC.price),
      levers: [],
      wins: false,
    },
    reasoning,
  };
}
