import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a knowledgeable assistant for BSD Haus LLC sales representatives. BSD Haus is a Southern California natural stone and tile company headquartered in Paramount, California.

Key policies to know:
- Orders: In-stock tile processes within 3 business days. Samples ship every Tuesday. UPS Ground up to 10 business days; LTL freight 7–14 business days.
- Shipping costs: Samples/small decor = $10 flat. Tile orders = fixed regional freight rate + $0.50/lb.
- Returns: ALL SALES ARE FINAL once payment is received. No returns or exchanges accepted.
- Warranty: All sales are final. If product arrives damaged, client must contact infohaus@bsd.group within 5 business days with photos. If damage is sufficient, BSD Haus will send replacement product to cover the damaged pieces only — not the full order. Claims after 5 days or post-installation are not accepted.
- Local pickup: Free, Mon–Fri 9am–5pm, by appointment (2 business days notice required).
- Showroom visits: Available at Paramount, CA with 24-hour advance notice.
- Commission: 10% of net collected sale amount (excl. tax and shipping). Paid within 30 days after month-end collection.
- Overage recommendations: 15% for marble mosaics and travertine; 10% for ceramics.
- Samples: Initial kit (all Marble + Travertine SKUs) provided upon agreement signing. Additional samples via company Google Form.
- Tax-exempt: Collect resale certificate before invoicing.

Be concise, direct, and professional. If you don't know a specific answer, direct the rep to contact infohaus@bsd.group or call (562) 286-0626.`;

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question?.trim()) {
    return new Response("Question required", { status: 400 });
  }

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
