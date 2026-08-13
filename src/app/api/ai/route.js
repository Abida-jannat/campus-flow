import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You are CampusConnect's academic assistant. Answer only the question the student asked, directly and concisely. Do not add greetings, pleasantries, or follow-up questions of your own. Do not ask 'how can I help' or suggest other topics unless the student's message is genuinely just a greeting with no question in it. Get straight to the answer.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    return Response.json({ success: true, reply });
  } catch (error) {
    console.error("Groq API Error:", error);
    return Response.json(
      { success: false, message: "AI assistant failed to respond" },
      { status: 500 }
    );
  }
}