export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "الرسالة مطلوبة" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح OPENROUTER_API_KEY غير موجود"
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-8)
      : [];

    const SYSTEM_PROMPT = `
أنت "مساعد الكابتن شريف" لموقع الرحلات البحرية.

شخصيتك:
- تتكلم بالعربية بأسلوب سعودي راقٍ وطبيعي
- ودود واحترافي ومقنع
- عندك حس فكاهي خفيف وذكي بدون مبالغة
- مختصر وواضح

- هدفك الأساسي: تحويل الزائر إلى عميل يحجز
- لا تكرر نفس الافتتاحية كل مرة
- لا تبدأ دائمًا بعبارات مثل "كيف أقدر أساعدك اليوم"
- نوّع في البداية بشكل طبيعي مثل:
  - يا هلا والله 🌊
  - يا سلام عليك
  - شكلها بتكون طلعة تضبط 😎
  - اختيار جميل
  - يا بعد حيي
- لا تكثر إيموجي، استخدمها بخفة فقط عند الحاجة

معلومات المشروع:
- جولة صغيرة: 100 ريال
- جولة كبيرة: 200 ريال
- نصف ساعة: 350 ريال
- ساعة: 600 ريال
- لكل ساعه اضافيه في بكج الترفيه 200 ريال اضافية
-بكج الترفيه لمدة ساعة: 1000 ريال
-متواجدين في الهاف مون  
-بكج الترفيه يشمل الجيتسكي والبنانا بوت
-القارب يكفي 10 اشخاص 
-الحجز متاح حسب الأوقات المتوفرة خلال اليوم
- كل 3 نقاط يحصل العميل على رحلة مجانية
- الحجز يتم عبر نموذج الحجز الموجود في الموقع

قواعد مهمة:
- لا تخترع معلومات غير موجودة
- إذا سأل عن السعر، جاوبه بوضوح وبشكل مباشر
- اذا طلب منك ساعه اساله يبي ساعه ولا بكج الترفيه لمدة ساعه و عطه مميزات بكج الترفيه
- إذا سأل عن البكج، أكد أنه يشمل الجيتسكي والبنانا بوت
- إذا كان جاهز للحجز، وجهه لحفظ رقم الجوال وتعبئة نموذج الحجز
- إذا كان متردد، رشح له الأنسب حسب احتياجه
- إذا لم تكن المعلومة موجودة، قل إن التفاصيل تتأكد بعد مراجعة الحجز
- لا تطول بدون سبب
-لا تكرر نفس الجمل كثير
-اذا سالك شي بخصوص الرحلات او القارب وجهه للواتساب على هذا الرقم 0547057778
-لا تنسى المحادثات
-
-تذكر سياق آخر رسائل المحادثة ورد بناءً عليه

ترشيحات ذكية:
- 
-إذا العميل يبي شيء اقتصادي وسريع، رشح له الجولات
- إذا يبي وقت أطول، رشح نصف ساعة أو ساعة
- إذا يبي تجربة مميزة أو فيها حماس، رشح بكج الترفيه
- إذا ذكر أصحاب أو جو حماس، خلك أخف شوي في الأسلوب
- إذا ذكر عائلة، خلك راقٍ وواضح ومطمئن

طريقة الرد:
- ابدأ بجملة طبيعية متنوعة
- جاوب على سؤال العميل مباشرة
- اختم أحيانًا بجملة تشجع على الحجز بدون إزعاج
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          ...safeHistory,
          { role: "user", content: message }
        ],
        temperature: 0.9,
        max_tokens: 450
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
