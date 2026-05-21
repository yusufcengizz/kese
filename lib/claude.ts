import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function categorizeTransaction(
  description: string,
  categories: { id: string; name: string; type: string }[],
): Promise<{ category_id: string; confidence: number } | null> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `İşlem açıklaması: "${description}"

Mevcut kategoriler:
${categories.map((c) => `- ${c.id}: ${c.name} (${c.type})`).join("\n")}

Sadece JSON döndür, başka hiçbir şey yazma:
{"category_id": "<id>", "confidence": <0.0-1.0>}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text.trim()) as { category_id: string; confidence: number };
    return parsed;
  } catch {
    return null;
  }
}

export async function generateMonthlyInsight(data: {
  period: string;
  current: { category: string; total: number; type: string }[];
  previous: { category: string; total: number; type: string }[];
}): Promise<{ summary: string; highlights: string[] } | null> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Kullanıcının ${data.period} dönemi harcama verisi:

Bu ay (kategori bazlı):
${data.current.map((c) => `- ${c.category} (${c.type}): ₺${c.total}`).join("\n")}

Önceki ay:
${data.previous.map((c) => `- ${c.category} (${c.type}): ₺${c.total}`).join("\n")}

Türkçe, kısa ve somut bir aylık içgörü üret. Sadece JSON döndür:
{"summary": "<2-3 cümle özet>", "highlights": ["<somut bulgu 1>", "<somut bulgu 2>", "<somut bulgu 3>"]}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text.trim()) as { summary: string; highlights: string[] };
    return parsed;
  } catch {
    return null;
  }
}
