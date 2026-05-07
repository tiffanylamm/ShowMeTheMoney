import { auth } from "@/lib/auth";
import { generateJSON } from "@/lib/ai/gemini";

const MAX_ITEMS = 500;

interface CategorizeItem {
  id: string;
  description: string;
  amount: number;
}

interface CategorizeRequest {
  items: CategorizeItem[];
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: CategorizeRequest = await request.json();
  const items = body.items?.slice(0, MAX_ITEMS) ?? [];

  if (items.length === 0) return Response.json({ categories: {} });

  try {
    const prompt = `You are a personal finance categorizer. Given a list of transactions, assign each one a one word category label. Use common categories like: Groceries, Dining, Transportation, Shopping, Entertainment, Subscriptions, Healthcare, Utilities, Income, Transfer, Fees, Travel, Insurance. If unsure, make your best guess.

Transactions:
${items.map((t) => `- id: ${t.id} | description: "${t.description}" | amount: ${t.amount}`).join("\n")}

Return a JSON object mapping each transaction id to its category string.`;

    const result = await generateJSON<{ [id: string]: string }>(prompt, {
      type: "object",
      additionalProperties: { type: "string" },
    });

    return Response.json({ categories: result });
  } catch {
    // Graceful fallback — import continues without categories
    return Response.json({ categories: {} });
  }
}
