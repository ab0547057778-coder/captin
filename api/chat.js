export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    hasKey: !!process.env.OPENROUTER_API_KEY,
    keyPreview: process.env.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY.slice(0, 12)
      : null
  });
}
