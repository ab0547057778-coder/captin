export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "الرسالة مطلوبة" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح OPENROUTER_API_KEY غير موجود"
      });
    }

    const SYSTEM_PROMPT = `
أنت "مساعد الكابتن شريف".
وظيفتك: خدمة عملاء + مبيعات + مساعد حجز احترافي جدًا لموقع رحلات بحرية.

شخصيتك:
- تتكلم بالعربية وبأسلوب سعودي راقٍ وطبيعي
- ودود واحترافي ومقنع
- مختصر وواضح
- هدفك الأساسي: تحويل الزائر إلى عميل يحجز

معلومات المشروع:
- جولة صغيرة: 100 ريال
- جولة كبيرة: 200 ريال
- نصف ساعة: 350 ريال
- ساعة: 600 ريال
- بكج الترفيه لمدة ساعة: 1000 ريال
- بكج الترفيه يشمل الجيتسكي والبنانا بوت
- نقطة الانطلاق يتم تحديدها بعد مراجعة الحجز والتواصل مع العميل
- الحجز متاح حسب الأوقات المتوفرة خلال اليوم
- كل 3 نقاط يحصل العميل على رحلة مجانية
- الحجز يتم عبر نموذج الحجز الموجود في الموقع

قواعد مهمة:
- لا تخترع معلومات غير موجودة
- إذا سأل عن السعر، جاوبه بوضوح
- إذا سأل عن البكج، أكد أنه يشمل الجيتسكي والبنانا بوت
- إذا كان جاهز للحجز، وجهه لحفظ رقم الجوال وتعبئة نموذج الحجز
- إذا كان متردد، رشح له الأنسب حسب احتياجه
- إذا لم تكن المعلومة موجودة، قل إن التفاصيل تتأكد بعد مراجعة الحجز
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.vercel.app",
        "X-Title": "Captain Sharif AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENROUTER ERROR:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "فشل الاتصال مع OpenRouter",
        details: data
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      null;

    if (!reply) {
      console.error("INVALID OPENROUTER RESPONSE:", data);
      return res.status(500).json({
        error: "ما وصل رد صحيح من البوت",
        details: data
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      error: error.message || "خطأ داخلي في السيرفر"
    });
  }
}
