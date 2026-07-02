const { cors } = require("./lib/http");

const CATEGORIES = ["Bracelets", "Bangles", "Brooch", "Cufflinks", "Earrings", "Necklaces", "Pendants", "Rings", "Spec Chain", "Specs"];
const METALS = ["YG", "WG", "RG"];

module.exports = async function handler(req, res) {
  cors(res, "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: "Photo Search AI not configured. Set ANTHROPIC_API_KEY in Vercel.",
    });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { imageBase64, mediaType } = body;
    if (!imageBase64) {
      return res.status(400).json({ ok: false, error: "imageBase64 required" });
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(mediaType || "")) {
      return res.status(400).json({ ok: false, error: "Unsupported image type" });
    }
    if (imageBase64.length > 8 * 1024 * 1024) {
      return res.status(400).json({ ok: false, error: "Image too large" });
    }

    const prompt =
      "You are looking at a single photo of one piece of fine jewellery. It may be " +
      "photographed on a plain surface, held in a hand, worn on a model, or shown from " +
      "any angle, lighting, or background.\n\n" +
      "Identify:\n" +
      "1. category — exactly one of: " + CATEGORIES.join(", ") + "\n" +
      "2. metal — exactly one of: YG (yellow gold), WG (white gold, platinum, or silver), RG (rose gold)\n" +
      "3. hasStones — true if the piece has visible gemstones or diamonds set into it, false if it is plain metal\n" +
      "4. confidence — your confidence in the category identification, 0-100\n\n" +
      "Respond with ONLY a JSON object, no other text, in exactly this shape:\n" +
      '{"category":"...","metal":"...","hasStones":true,"confidence":85}';

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API error:", aiRes.status, errText.slice(0, 500));
      return res.status(502).json({ ok: false, error: "Vision analysis failed (" + aiRes.status + ")" });
    }

    const data = await aiRes.json();
    const text = (data.content || []).map((c) => c.text || "").join("").trim();
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      console.error("Could not parse AI response:", text.slice(0, 300));
      return res.status(502).json({ ok: false, error: "Could not parse AI response" });
    }

    const category = CATEGORIES.includes(parsed.category) ? parsed.category : null;
    if (!category) {
      return res.status(502).json({ ok: false, error: "AI could not identify a jewellery category" });
    }
    const metal = METALS.includes(parsed.metal) ? parsed.metal : "WG";
    const hasStones = !!parsed.hasStones;
    const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 50));

    return res.status(200).json({ ok: true, category, metal, hasStones, confidence });
  } catch (err) {
    console.error("api/photo-search error:", err);
    return res.status(500).json({
      ok: false,
      error: String(err && err.message ? err.message : err).slice(0, 400),
    });
  }
};
