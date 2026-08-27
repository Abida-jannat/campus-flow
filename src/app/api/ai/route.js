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
      model: "llama-3.3-70b-versatile", // Currently active Groq model
      temperature: 0.3,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are CampusConnect's academic assistant. Answer directly and concisely in 1 or 2 sentences max. Do not use greetings or extra details.",
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