export async function POST(req) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "الرسالة مطلوبة" },
        { status: 400 }
      );
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

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "مفتاح OPENROUTER_API_KEY غير موجود في Environment Variables" },
        { status: 500 }
      );
    }

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

    const data = await openrouterRes.json();

    if (!openrouterRes.ok) {
      return Response.json(
        {
          error: data?.error?.message || "فشل الاتصال مع OpenRouter",
          details: data
        },
        { status: openrouterRes.status }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        {
          error: "ما وصل رد من النموذج",
          details: data
        },
        { status: 500 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    return Response.json(
      {
        error: error?.message || "خطأ داخلي في السيرفر"
      },
      { status: 500 }
    );
  }
}
