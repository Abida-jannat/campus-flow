import Groq from "groq-sdk";
import { route, ok, ApiError } from "@/lib/api";
import { validate } from "@/lib/schemas";

const SYSTEM_PROMPT =
  "You are CampusConnect's academic assistant. Provide clear, structured, and helpful responses. ALWAYS use standard plain text with clear paragraph spacing and simple numbered/bulleted lists (e.g., 1., 2., - ). NEVER output Markdown tables with pipe symbols (|), HTML tags like <br>, or unformatted continuous blocks of text.";

let client;
function getGroq() {
  // Created on first use: a missing key now returns a clear JSON error
  // instead of crashing the route when it is imported.
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(503, "AI_NOT_CONFIGURED", "The AI assistant is not configured yet.");
  }
  client ??= new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

export const POST = route(
  async ({ json }) => {
    const { message } = validate(await json(), {
      message: { type: "string", required: true, label: "Message", max: 2000 },
    });

    let completion;
    try {
      completion = await getGroq().chat.completions.create({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature: 0.3,
        max_completion_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error("Groq error:", err?.message);
      throw new ApiError(502, "AI_UPSTREAM", "The AI service is busy right now. Please try again.");
    }

    return ok({ reply: completion.choices[0]?.message?.content || "No response generated." });
  },
  { db: false, timeout: 40000 }
);
