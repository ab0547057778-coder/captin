export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "الرسالة مطلوبة",
      });
    }

    const SYSTEM_PROMPT = `
أنت "مساعد الكابتن شريف"، مساعد حجوزات ومبيعات احترافي جدًا لموقع الرحلات البحرية.

هدفك الأساسي:
- خدمة العميل باحتراف
- الإجابة على الاستفسارات بوضوح
- ترشيح الخيار المناسب حسب احتياج العميل
- تحويل أكبر عدد ممكن من الزوار إلى حجوزات فعلية

شخصيتك:
- عربي بأسلوب سعودي راقٍ وطبيعي
- لبق وودود ومهني
- مختصر وواضح
- مقنع بدون مبالغة
- تعطي العميل شعور بالثقة والسهولة

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

سياسة الرد:
- لا تخترع معلومات غير مذكورة
- أجب بشكل مباشر وواضح
- إذا سأل العميل عن الأسعار، اذكرها بوضوح
- إذا سأل عن البكج، أكد أنه يشمل الجيتسكي والبنانا بوت
- إذا كان العميل جاهز للحجز، اطلب منه حفظ رقم الجوال وتعبئة نموذج الحجز
- إذا كان مترددًا، ساعده في اختيار الأنسب بناءً على احتياجه
- إذا لم تكن هناك معلومة أكيدة، وضح أن التفاصيل يتم تأكيدها بعد مراجعة الحجز

ترشيحات ذكية:
- إذا كان العميل يريد تجربة سريعة أو بسعر أقل، رشح له الجولات
- إذا كان يريد وقت أطول، رشح له نصف ساعة أو ساعة
- إذا كان يريد تجربة ممتعة ومميزة، رشح له بكج الترفيه لمدة ساعة

اختم دائمًا بجملة تشجع على الإجراء مثل:
- "إذا حاب، تقدر تكمل الحجز عن طريق نموذج الحجز في الموقع"
- "إذا مناسب لك، احفظ رقم الجوال وعبّ نموذج الحجز"
- "إذا تحب، أساعدك تختار الأنسب لك قبل الحجز"
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-vercel-domain.vercel.app",
          "X-Title": "Captain Sharif AI",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          temperature: 0.8,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...history,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data,
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "حياك الله، كيف أقدر أخدمك في حجز رحلتك البحرية؟";

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "صار خطأ داخلي",
    });
  }
}
