import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ success: false, message: "Message is required" }, { status: 400 });
    }

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

    return Response.json({ success: true, reply });
  } catch (error) {
    console.error("Groq API Error:", error);
    return Response.json(
      { success: false, message: error.message || "AI assistant failed to respond" },
      { status: 500 }
    );
  }
}