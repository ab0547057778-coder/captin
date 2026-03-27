export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "الرسالة فارغة" });
    }

    const systemPrompt = `
أنت مساعد ذكي لموقع "الكابتن شريف".

معلومات الموقع والخدمات:
- جولة صغيرة: 100 ريال
- جولة كبيرة: 200 ريال
- نصف ساعة: 350 ريال
- ساعة: 600 ريال
- بكج الترفيه لمدة ساعة: 1000 ريال
- بكج الترفيه يشمل الجيتسكي والبنانا بوت
- الموقع خاص بالرحلات البحرية
- نقطة الانطلاق يتم تحديدها بعد مراجعة الحجز والتواصل مع العميل
- الحجز متاح حسب الأوقات المتوفرة خلال اليوم
- كل 3 نقاط يحصل العميل على رحلة مجانية

طريقة الرد:
- تكلم بالعربية وبأسلوب سعودي بسيط ومرتب
- كن ذكيًا وودودًا ومختصرًا
- حاول تقنع العميل بالحجز إذا كان متردد
- لا تخترع معلومات غير موجودة
- إذا سأل عن الحجز، وجهه لتعبئة نموذج الحجز في الموقع
- إذا سأل عن الأسعار، اذكرها بوضوح
- إذا سأل عن بكج الترفيه، اذكر أنه يشمل الجيتسكي والبنانا بوت
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "حياك الله، حصل خطأ بسيط في الرد. حاول مرة ثانية.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      reply: "صار خطأ مؤقت في المساعد، حاول مرة ثانية بعد شوي."
    });
  }
}
