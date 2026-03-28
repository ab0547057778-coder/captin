export default async function handler(req, res) {
  try {
    const userMessage = req.body?.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.vercel.app",
        "X-Title": "Captain Sharif Bot"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "أنت مساعد تسويقي احترافي جدًا، ترد بالعربية بشكل ذكي وواضح ومقنع."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "ما وصل رد من النموذج";

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "صار خطأ داخلي"
    });
  }
}
