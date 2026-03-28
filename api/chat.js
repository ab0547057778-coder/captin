if (!reply) {
  console.error("INVALID OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));
  return res.status(500).json({
    error: JSON.stringify(data),
    details: data
  });
}
