export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "الرسالة فارغة" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ reply: "OPENAI_API_KEY غير موجود في Vercel" });
    }

    const systemPrompt = `
أنت مساعد ذكي لموقع "الكابتن شريف".

معلومات الموقع:
- جولة صغيرة: 100 ريال
- جولة كبيرة: 200 ريال
- نصف ساعة: 350 ريال
- ساعة: 600 ريال
- بكج الترفيه لمدة ساعة: 1000 ريال
- بكج الترفيه يشمل الجيتسكي والبنانا بوت

تكلم بالعربية وبأسلوب سعودي بسيط وواضح.
لا تخترع معلومات غير موجودة.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${process.env.OPENAI_API_KEY}
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        reply: خطأ من OpenAI: ${data?.error?.message || "غير معروف"}
      });
    }

    const reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "ما قدرت أطلع الرد من OpenAI.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      reply: خطأ في السيرفر: ${error.message}
    });
  }
}
