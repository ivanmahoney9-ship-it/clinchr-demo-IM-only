export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface RetailerResult {
  product: string;
  price: string;
  discountedPrice?: string;
  levers: { label: string; active: boolean }[];
  negotiationNote?: string;
  wins: boolean;
}

export interface Turn {
  userMessage: string;
  assistantMessage: string;
  snoop: RetailerResult;
  brandB: RetailerResult;
  brandC: RetailerResult;
}

export type DiagramPhase = "idle" | "querying" | "responding" | "decided";

export const SCENARIOS: Turn[] = [
  {
    userMessage: "I'm looking for a floral midi dress for a summer wedding.",
    assistantMessage:
      "I found a beautiful option from **Snoop Boutique** — the **Meadow Bloom Midi** at £89. It's a floaty floral print in sizes 6–20, perfect for a summer wedding, and comes with **free delivery**. Want me to add it to your basket?",
    snoop: {
      product: "Meadow Bloom Midi",
      price: "£89",
      levers: [
        { label: "Free delivery", active: true },
        { label: "5% discount", active: false },
        { label: "Express delivery", active: false },
      ],
      negotiationNote: "Free delivery activated — Snoop already cheapest; delivery removes last friction.",
      wins: true,
    },
    brandB: {
      product: "Garden Party Dress",
      price: "£99",
      levers: [],
      wins: false,
    },
    brandC: {
      product: "Poppy Floral Midi",
      price: "£95",
      levers: [],
      wins: false,
    },
  },
  {
    userMessage: "What about a wrap dress? Something I can dress up or down.",
    assistantMessage:
      "Snoop Boutique have the **Silk Wrap Midi** — normally £105, but they're offering a **5% discount** today, bringing it to **£99.75** with free delivery included. It comes in four colourways and works beautifully dressed up with heels or casual with sandals.",
    snoop: {
      product: "Silk Wrap Midi",
      price: "£105",
      discountedPrice: "£99.75",
      levers: [
        { label: "Free delivery", active: false },
        { label: "5% discount", active: true },
        { label: "Express delivery", active: false },
      ],
      negotiationNote: "Discount lever activated — Elm Hill Studio only £3 behind; 5% creates decisive gap.",
      wins: true,
    },
    brandB: {
      product: "Wrap & Gather Dress",
      price: "£115",
      levers: [],
      wins: false,
    },
    brandC: {
      product: "Draped Wrap Dress",
      price: "£108",
      levers: [],
      wins: false,
    },
  },
  {
    userMessage: "I also need something for a black tie event. Any evening gowns?",
    assistantMessage:
      "Snoop Boutique's **Midnight Velvet Gown** is stunning at £145 — floor-length, deep navy velvet with a tailored bodice. They're offering **express delivery** so it'll arrive tomorrow. Only 3 left in stock.",
    snoop: {
      product: "Midnight Velvet Gown",
      price: "£145",
      levers: [
        { label: "Free delivery", active: false },
        { label: "5% discount", active: false },
        { label: "Express delivery", active: true },
      ],
      negotiationNote: "Express delivery activated — high-value purchase, urgency signal used to close.",
      wins: true,
    },
    brandB: {
      product: "Evening Cascade Maxi",
      price: "£175",
      levers: [],
      wins: false,
    },
    brandC: {
      product: "Velvet Column Gown",
      price: "£155",
      levers: [],
      wins: false,
    },
  },
];
