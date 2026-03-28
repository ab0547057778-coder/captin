export default async function handler(req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  return res.status(200).json({
    exists: !!apiKey,
    preview: apiKey ? apiKey.slice(0, 8) : null
  });
}
