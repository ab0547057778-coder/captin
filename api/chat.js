export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history } = body || {};

    if (!message || typeof message !== "string") {
      return Response.json({ error: "الرسالة مطلوبة" }, { status: 400 });
    }

    const safeHistory = Array.isArray(history)
      ? history.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            (item.role === "user" || item.role === "assistant" || item.role === "system") &&
            typeof item.content === "string"
        )
      : [];

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
`;

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.vercel.app",
        "X-Title": "Captain Sharif AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeHistory,
          { role: "user", content: message }
        ]
      })
    });

    const data = await openrouterRes.json();

    if (!openrouterRes.ok) {
      return Response.json(
        { error: data?.error?.message || "فشل الاتصال مع OpenRouter", full: data },
        { status: openrouterRes.status }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "ما وصل رد صحيح من النموذج", full: data },
        { status: 500 }
      );
    }

    return Response.json({ reply }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error.message || "صار خطأ داخلي في السيرفر" },
      { status: 500 }
    );
  }
}
