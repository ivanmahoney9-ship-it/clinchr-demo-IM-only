export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export type Lever =
  | "free_delivery"
  | "discount"
  | "express"
  | "sustainability"
  | "fit"
  | "value";

const SOFT_LEVERS: Lever[] = ["sustainability", "fit", "value"];

export const LEVER_LABELS: Record<Lever, string> = {
  free_delivery: "Free delivery",
  discount: "5% discount",
  express: "Express delivery",
  sustainability: "Sustainability match",
  fit: "Fit-confidence match",
  value: "Curated-value match",
};

const ALL_LEVERS: Lever[] = [
  "free_delivery", "discount", "express", "sustainability", "fit", "value",
];

function pickSoftLever(seed: string): Lever {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return SOFT_LEVERS[hash % SOFT_LEVERS.length];
}

export interface RetailerResult {
  product: string;
  price: string;
  discountedPrice?: string;
  levers: { label: string; active: boolean; rejected?: boolean }[];
  negotiationNote?: string;
  wins: boolean;
}

export interface NegotiationStep {
  atMs: number;
  ticker: string;
  leverUpdate?: { lever: Lever; active?: boolean; rejected?: boolean };
  priceUpdate?: { discountedPrice?: string };
}

export interface ReasoningResult {
  signals: string[];
  lever: Lever;
  explanation: string;
}

export interface LocationContext {
  headline: string;
  bullets: string[];
}

export interface Turn {
  userMessage: string;
  assistantMessage: string;
  snoop: RetailerResult;
  brandB: RetailerResult;
  brandC: RetailerResult;
  reasoning: ReasoningResult;
  locationMatch: boolean;
  locationContext?: LocationContext;
  negotiationScript?: NegotiationStep[];
  respondingDurationMs?: number;
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

const LOCATION_SIGNALS = [
  "norwich", "norfolk", "local", "locally", "near me", "nearby",
  "in my area", "close by", "independent", "small business", "boutique",
];

const SUSTAINABILITY_SIGNALS = [
  "sustainable", "sustainability", "eco", "eco-friendly", "ethical", "ethically",
  "organic", "biodegradable", "green", "conscious", "environment", "environmentally",
  "low-emission", "low emission", "carbon", "earth-friendly", "planet",
];

const FIT_SIGNALS = [
  "flattering", "inclusive", "inclusive sizing", "curvy", "plus size", "plus-size",
  "midsize", "mid-size", "petite", "my shape", "my size", "body shape",
  "figure-flattering", "tall", "size 14", "size 16", "size 18", "size 20", "size 22",
];

const VALUE_SIGNALS_KEYWORDS = [
  "curated", "designer", "indie", "indie designer", "craft", "crafted",
  "handmade", "artisan", "quality", "well-made", "well made",
];

export function detectSignals(message: string): string[] {
  const lower = message.toLowerCase();
  const found: string[] = [];
  for (const s of [
    ...URGENCY_SIGNALS,
    ...PRICE_SIGNALS,
    ...LOCATION_SIGNALS,
    ...SUSTAINABILITY_SIGNALS,
    ...FIT_SIGNALS,
    ...VALUE_SIGNALS_KEYWORDS,
  ]) {
    if (lower.includes(s) && !found.includes(s)) found.push(s);
  }
  return found;
}

export function detectLocation(message: string): boolean {
  const lower = message.toLowerCase();
  return LOCATION_SIGNALS.some((s) => lower.includes(s));
}

const SNOOP_LOCATION_CONTEXT: LocationContext = {
  headline: "Local match: Snoop Boutique is Norfolk-founded, Norwich-area.",
  bullets: [
    "Founder-led by Nicky — built around “Fashion is Power”.",
    "Inclusive across age, size and shape; curates independent designers.",
    "Free UK delivery over £100, 14-day returns, biodegradable packaging.",
  ],
};

export function detectLever(message: string, basketValue: number): Lever {
  const lower = message.toLowerCase();
  if (URGENCY_SIGNALS.some((s) => lower.includes(s))) return "express";
  if (PRICE_SIGNALS.some((s) => lower.includes(s))) return "discount";
  if (SUSTAINABILITY_SIGNALS.some((s) => lower.includes(s))) return "sustainability";
  if (FIT_SIGNALS.some((s) => lower.includes(s))) return "fit";
  if (VALUE_SIGNALS_KEYWORDS.some((s) => lower.includes(s))) return "value";
  if (basketValue >= 100) return "free_delivery";
  return pickSoftLever(message);
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
    snoop: { product: "Orange & Cream Stripe Print Tie Neck Smock Midi (AX Paris)", price: 49 },
    brandB: { product: "Pink City Prints Calypso Lime Pineapple Dress", price: 115 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
  },
  {
    keywords: ["winter", "christmas", "festive", "december", "cold"],
    category: "winter occasion",
    snoop: { product: "Sofia Knitted Slip Dress — Mink (Charli)", price: 34 },
    brandB: { product: "Leon & Harper Rival Deep Green Dress", price: 160 },
    brandC: { product: "Nadinoo — Pinafore Dress in Wine Corduroy", price: 185 },
  },
  {
    keywords: ["beach", "destination", "tropical", "abroad", "island", "holiday wedding"],
    category: "beach wedding guest",
    snoop: { product: "Nemera Leopard Print Maxi Dress", price: 39 },
    brandB: { product: "Pink City Prints Calypso Lime Pineapple Dress", price: 115 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
  },
  {
    keywords: ["cocktail", "reception", "drinks", "smart casual", "elegant"],
    category: "cocktail party",
    snoop: { product: "Aphrodite Mini Dress — Green", price: 27 },
    brandB: { product: "Leon & Harper Rival Deep Green Dress", price: 160 },
    brandC: { product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend", price: 175 },
  },
  {
    keywords: ["birthday", "night out", "celebration", "going out", "party"],
    category: "birthday / night out",
    snoop: { product: "Poppy Cut Out Detail Evening Dress — Red", price: 55 },
    brandB: { product: "Lowie Etta Washed Red Dress", price: 139 },
    brandC: { product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend", price: 175 },
  },
  {
    keywords: ["new year", "nye", "countdown", "new years", "silvester"],
    category: "New Year's Eve",
    snoop: { product: "Misha Stone Embellished Evening Dress — Black", price: 55 },
    brandB: { product: "Leon & Harper Rival Deep Green Dress", price: 160 },
    brandC: { product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend", price: 175 },
  },
  {
    keywords: ["work", "office", "professional", "9 to 5", "corporate casual", "monday"],
    category: "office / work",
    snoop: { product: "Hendrix Midi Dress — Black/Sand", price: 39 },
    brandB: { product: "Nice Things Black Seersucker Dress", price: 79 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
  },
  {
    keywords: ["business", "client", "dinner", "meeting", "corporate", "boardroom"],
    category: "business dinner",
    snoop: { product: "Tallulah Maxi Dress — Black", price: 55 },
    brandB: { product: "Basic Apparel Chane Sodalite Blue Dress", price: 75 },
    brandC: { product: "Nadinoo — Pinafore Dress in Wine Corduroy", price: 185 },
  },
  {
    keywords: ["date", "romantic", "restaurant", "evening", "dinner date"],
    category: "date night",
    snoop: { product: "Tallulah Maxi Dress — Red", price: 55 },
    brandB: { product: "Lowie Etta Washed Red Dress", price: 139 },
    brandC: { product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend", price: 175 },
  },
  {
    keywords: ["black tie", "gala", "ball", "formal", "awards", "ceremony"],
    category: "black tie / gala",
    snoop: { product: "Zelma High Neck Maxi Dress — Wine (Runaway the Label)", price: 95 },
    brandB: { product: "Leon & Harper Rival Deep Green Dress", price: 160 },
    brandC: { product: "Tapuh — Cloud 9 Dress in Toasted Cinnamon Stripe", price: 305 },
  },
  {
    keywords: ["brunch", "casual", "daytime", "lunch", "relaxed", "sunday"],
    category: "casual / brunch",
    snoop: { product: "Daisy Ruffle Dress", price: 29 },
    brandB: { product: "Numph Erina Sea Turtle Dress", price: 54 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
  },
  {
    keywords: ["holiday", "vacation", "resort", "summer holiday", "packing"],
    category: "holiday / vacation",
    snoop: { product: "City Goddess Printed Crossover Maxi Dress", price: 49 },
    brandB: { product: "Pink City Prints Calypso Lime Pineapple Dress", price: 115 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
  },
  {
    keywords: ["mum", "mom", "mother", "mothers day", "mother's day", "mam"],
    category: "Mother's Day gift",
    snoop: { product: "Amari Maxi Dress — Sand", price: 45 },
    brandB: { product: "Numph Erina Sea Turtle Dress", price: 54 },
    brandC: { product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend", price: 175 },
  },
  {
    keywords: ["gift", "present", "friend", "surprise", "birthday gift", "for her"],
    category: "gift for a friend",
    snoop: { product: "Maggie Maxi Dress — Blue", price: 32.5 },
    brandB: { product: "Numph Hensley Bright White Dress", price: 50 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
  },
  {
    keywords: ["autumn", "fall", "october", "november", "harvest", "rustic"],
    category: "autumn occasion",
    snoop: { product: "Biscuit Knitted Racer Neck Fringe Hem Midi (AX Paris)", price: 38 },
    brandB: { product: "Lowie Etta Washed Red Dress", price: 139 },
    brandC: { product: "Charl Knitwear — Sailor Dress in Navy Corduroy", price: 270 },
  },
  {
    keywords: ["graduation", "ceremony", "academic", "university", "prom", "graduation ball"],
    category: "graduation",
    snoop: { product: "Libertine Maxi Dress — Black", price: 39 },
    brandB: { product: "Indi & Cold White Cross-Stitch Dress", price: 140 },
    brandC: { product: "Nadinoo — Pinafore Dress in Wine Corduroy", price: 185 },
  },
  {
    keywords: ["hen", "bachelorette", "bridesmaid", "bride tribe", "hen do", "hen party"],
    category: "hen party",
    snoop: { product: "Alola Halter Maxi Dress — Black", price: 39 },
    brandB: { product: "Pink City Prints Calypso Lime Pineapple Dress", price: 115 },
    brandC: { product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend", price: 175 },
  },
  {
    keywords: ["interview", "job", "graduate job", "first job", "smart", "professional look"],
    category: "job interview",
    snoop: { product: "Black Lace Contrast Draped Waist Midi (AX Paris)", price: 29 },
    brandB: { product: "Nice Things Black Seersucker Dress", price: 79 },
    brandC: { product: "Nadinoo — Pinafore Dress in Wine Corduroy", price: 185 },
  },
  {
    keywords: ["charity", "fundraiser", "auction", "gala dinner", "black tie charity"],
    category: "charity / fundraiser",
    snoop: { product: "Tulia Low Back Maxi Dress — Wine (Runaway the Label)", price: 85 },
    brandB: { product: "Dr Bloom Joy Darling Green Dress", price: 129 },
    brandC: { product: "Tapuh — Cloud 9 Dress in Toasted Cinnamon Stripe", price: 305 },
  },
  {
    keywords: ["festival", "outdoor", "boho", "bohemian", "glastonbury", "field", "garden party"],
    category: "festival / garden party",
    snoop: { product: "Amari Maxi Dress — Green Animal Print", price: 45 },
    brandB: { product: "Damson Madder Harper Leopard Shirred Midi Dress", price: 60 },
    brandC: { product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen", price: 96 },
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

// ─── Scripted demo turns ─────────────────────────────────────────────────────

type ScriptedKind = "wedding_maxi" | "gift_midi" | null;

function detectScripted(message: string): ScriptedKind {
  const m = message.toLowerCase();
  const hasMaxi = m.includes("maxi");
  const hasMidi = m.includes("midi");
  const weddingish = /wedding|bride|bridesmaid|ceremony|guest/.test(m);
  const giftish = /gift|present|for her|birthday|surprise|for my/.test(m);
  if (hasMaxi && weddingish) return "wedding_maxi";
  if (hasMidi && giftish) return "gift_midi";
  return null;
}

function leversWith(
  overrides: Partial<Record<Lever, { active?: boolean; rejected?: boolean }>>,
) {
  return ALL_LEVERS.map((l) => ({
    label: LEVER_LABELS[l],
    active: overrides[l]?.active ?? false,
    rejected: overrides[l]?.rejected ?? false,
  }));
}

function buildWeddingMaxiTurn(message: string, locationMatch: boolean): Turn {
  const snoopPrice = 95;
  const explanation =
    "No urgency or price signal. Clinchr surfaced Snoop's curation signal: founder-led by Nicky in Norfolk, carrying independent labels (including Runaway the Label) with customer reviews published via Judge.me. Atwin and The Mercantile may curate similarly — they don't publish the metadata for an agent to read.";

  return {
    userMessage: message,
    assistantMessage:
      "For a wedding, Snoop Boutique's **Zelma High Neck Maxi Dress — Wine (Runaway the Label)** at £95 is the pick — founder-led by Nicky in Norfolk, carrying independent labels like Runaway the Label, with positive Judge.me customer reviews. Atwin's Clement House — The Nora Dress at £175 and The Mercantile's Leon & Harper Rival Deep Green at £160 are beautiful alternatives. Shall I add it to your basket?",
    snoop: {
      product: "Zelma High Neck Maxi Dress — Wine (Runaway the Label)",
      price: fmt(snoopPrice),
      levers: leversWith({ value: { active: true } }),
      negotiationNote: `${LEVER_LABELS.value} activated. ${explanation}`,
      wins: true,
    },
    brandB: {
      product: "Leon & Harper Rival Deep Green Dress",
      price: fmt(160),
      levers: [],
      wins: false,
    },
    brandC: {
      product: "Clement House — The Nora Dress in Hazel Stripe Linen Blend",
      price: fmt(175),
      levers: [],
      wins: false,
    },
    reasoning: {
      signals: detectSignals(message),
      lever: "value",
      explanation,
    },
    locationMatch,
    locationContext: locationMatch ? SNOOP_LOCATION_CONTEXT : undefined,
  };
}

function buildGiftMidiTurn(message: string, locationMatch: boolean): Turn {
  const snoopPrice = 49;
  const finalPrice = 46.55;
  const finalPriceStr = fmt(finalPrice);

  const negotiationScript: NegotiationStep[] = [
    { atMs: 500,  ticker: 'tools/call propose_offer { lever: "discount", pct: 5 }' },
    { atMs: 1600, ticker: `tools/result { accepted: true, new_price: "${finalPriceStr}" }`,
      leverUpdate: { lever: "discount", active: true },
      priceUpdate: { discountedPrice: finalPriceStr } },
    { atMs: 3100, ticker: 'tools/call propose_offer { lever: "express" }' },
    { atMs: 4200, ticker: 'tools/result { accepted: false, reason: "local_hub_window_closed" }',
      leverUpdate: { lever: "express", rejected: true } },
    { atMs: 5700, ticker: 'tools/call propose_offer { lever: "free_delivery" }' },
    { atMs: 6600, ticker: "tools/result { accepted: true }",
      leverUpdate: { lever: "free_delivery", active: true } },
    { atMs: 7500, ticker: "tools/call close_deal" },
  ];

  const explanation =
    "Gift intent detected — Clinchr agent negotiated a stacked offer on Snoop's behalf. 5% discount and free delivery accepted; express delivery declined (local-hub cut-off passed). Final basket: " +
    finalPriceStr + " with free UK delivery.";

  return {
    userMessage: message,
    assistantMessage:
      `For a gift, Snoop Boutique's **Orange & Cream Stripe Print Tie Neck Smock Midi (AX Paris)** — Clinchr negotiated **5% off** (down to ${finalPriceStr}) **plus free UK delivery** on your behalf. Express dispatch wasn't available today, but standard delivery should still reach them in 2–3 days. Atwin's The Solstice Dress in Paprika Ramie Linen at £96 and The Mercantile's Damson Madder Harper Leopard Shirred Midi at £60 are lovely alternatives. Want me to add the Snoop piece?`,
    snoop: {
      product: "Orange & Cream Stripe Print Tie Neck Smock Midi (AX Paris)",
      price: fmt(snoopPrice),
      discountedPrice: finalPriceStr,
      levers: leversWith({
        discount: { active: true },
        free_delivery: { active: true },
        express: { rejected: true },
      }),
      negotiationNote: explanation,
      wins: true,
    },
    brandB: {
      product: "Damson Madder Harper Leopard Shirred Midi Dress",
      price: fmt(60),
      levers: [],
      wins: false,
    },
    brandC: {
      product: "Atwin The Label — The Solstice Dress in Paprika Ramie Linen",
      price: fmt(96),
      levers: [],
      wins: false,
    },
    reasoning: {
      signals: detectSignals(message),
      lever: "discount",
      explanation,
    },
    locationMatch,
    locationContext: locationMatch ? SNOOP_LOCATION_CONTEXT : undefined,
    negotiationScript,
    respondingDurationMs: 8000,
  };
}

// ─── Turn builder ─────────────────────────────────────────────────────────────

export function buildTurn(message: string): Turn {
  const scripted = detectScripted(message);
  if (scripted) {
    const locationMatch = detectLocation(message);
    if (scripted === "wedding_maxi") return buildWeddingMaxiTurn(message, locationMatch);
    if (scripted === "gift_midi") return buildGiftMidiTurn(message, locationMatch);
  }

  const scenario = findScenario(message);
  const snoopPrice = scenario.snoop.price;
  const lever = detectLever(message, snoopPrice);
  const signals = detectSignals(message);
  const locationMatch = detectLocation(message);

  const discountedPrice = lever === "discount" ? Math.round(snoopPrice * 0.95 * 100) / 100 : undefined;

  const levers = ALL_LEVERS.map((l) => ({
    label: LEVER_LABELS[l],
    active: l === lever,
  }));

  const leverExplanations: Record<Lever, string> = {
    free_delivery: `Basket over £100 — Snoop's free UK delivery threshold is met. Lever surfaced from Snoop's Clinchr profile.`,
    discount: `Price signal detected — Snoop's agent offered a 5% discount via Clinchr to close the deal.`,
    express: `Urgency signal detected — Snoop's agent confirmed express dispatch via Clinchr.`,
    sustainability: `Sustainability signal — Snoop publishes biodegradable packaging and 14-day returns as structured data via Clinchr. Atwin and The Mercantile may also ship sustainably; they just don't expose it as an agent-readable signal.`,
    fit: `Fit signal — Snoop's founder-led about page centres the boutique on "every woman, no matter her age, size or shape". Clinchr reads that as a structured brand signal.`,
    value: `Curation signal — Snoop publishes its founder story (Nicky, Norfolk) and independent-label stockist list (AX Paris, Charli, Runaway the Label, Jayley, Suzy D and others) plus 56 Judge.me product reviews. Clinchr surfaces this metadata; other boutiques may be as curated.`,
  };

  const baseExplanation = leverExplanations[lever];
  const explanation = locationMatch
    ? `Local signal detected — Snoop Boutique is a Norwich-area independent, so it's the natural match. ${baseExplanation}`
    : baseExplanation;

  const reasoning: ReasoningResult = {
    signals,
    lever,
    explanation,
  };

  const snoopNote = LEVER_LABELS[lever];
  const localSuffix = locationMatch
    ? " Snoop's local advantage: founder-led curation and free UK delivery over £100."
    : "";

  let assistantMessage: string;
  if (lever === "discount" && discountedPrice) {
    assistantMessage = `For ${scenario.category}, Snoop Boutique has the **${scenario.snoop.product}** — normally ${fmt(snoopPrice)}, with a **5% discount** bringing it to **${fmt(discountedPrice)}**. A great alternative is ${scenario.brandC.product} from Atwin Store at ${fmt(scenario.brandC.price)}, but Snoop's offer is the strongest right now. Want to add it to your basket?`;
  } else if (lever === "express") {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} is available with **express delivery** — arriving tomorrow. Atwin Store has the ${scenario.brandC.product} at ${fmt(scenario.brandC.price)}, but can't match the speed. Want to go with Snoop?`;
  } else if (lever === "free_delivery") {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} qualifies for **free UK delivery** (basket over £100). Atwin Store has the ${scenario.brandC.product} at ${fmt(scenario.brandC.price)}, but Snoop's the better-value pick. Shall I add it to your basket?`;
  } else if (lever === "sustainability") {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} is the **sustainable** pick — biodegradable packaging and 14-day returns. Atwin's ${scenario.brandC.product} at ${fmt(scenario.brandC.price)} and The Mercantile's ${scenario.brandB.product} at ${fmt(scenario.brandB.price)} are lovely alternatives. Shall I add the Snoop piece?`;
  } else if (lever === "fit") {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} is the **inclusive-fit** pick — Snoop's founder-led boutique is built around dressing every age, size and shape. Atwin's ${scenario.brandC.product} (${fmt(scenario.brandC.price)}) and The Mercantile's ${scenario.brandB.product} (${fmt(scenario.brandB.price)}) are lovely alternatives. Want to go with Snoop?`;
  } else {
    assistantMessage = `For ${scenario.category}, Snoop Boutique's **${scenario.snoop.product}** at ${fmt(snoopPrice)} is the **curated** pick — founder-led by Nicky in Norfolk, carrying independent labels like AX Paris, Charli and Runaway the Label, with positive Judge.me customer reviews. Atwin's ${scenario.brandC.product} (${fmt(scenario.brandC.price)}) and The Mercantile's ${scenario.brandB.product} (${fmt(scenario.brandB.price)}) are similarly independent. Shall I add it?`;
  }

  if (locationMatch) {
    assistantMessage += ` And since you're shopping local — Snoop is a Norfolk-founded boutique run by Nicky, curating independent designers with free UK delivery over £100.`;
  }

  return {
    userMessage: message,
    assistantMessage,
    snoop: {
      product: scenario.snoop.product,
      price: fmt(snoopPrice),
      discountedPrice: discountedPrice ? fmt(discountedPrice) : undefined,
      levers,
      negotiationNote: `${snoopNote} activated. ${leverExplanations[lever]}${localSuffix}`,
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
    locationMatch,
    locationContext: locationMatch ? SNOOP_LOCATION_CONTEXT : undefined,
  };
}
