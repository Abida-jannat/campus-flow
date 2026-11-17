import Groq from "groq-sdk";
import { requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {

    const { error } = await requireUser();
    if (error) return error;

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return json({ success: false, message: "Message is required" }, 400);
    if (message.length > 4000) return json({ success: false, message: "Message is too long" }, 400);

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are CampusConnect's academic assistant. Provide clear, structured, and helpful responses. ALWAYS use standard plain text with clear paragraph spacing and simple numbered/bulleted lists (e.g., 1., 2., - ). NEVER output Markdown tables with pipe symbols (|), HTML tags like <br>, or unformatted continuous blocks of text.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";
    return json({ success: true, reply });
  } catch (err) {
    console.error("Groq API Error:", err);
    return json({ success: false, message: "AI assistant failed to respond" }, 500);
  }
}
