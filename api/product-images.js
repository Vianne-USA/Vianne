const {
  isDriveConfigured,
  uploadProductImagesForEvent,
  downloadProductImageForEvent,
  driveErrorMessage,
} = require("./lib/sync-store");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function checkWriteAuth(req) {
  const secret = process.env.VIANNE_SYNC_SECRET;
  if (!secret) return true;
  return req.headers["x-vianne-key"] === secret;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!isDriveConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Google Drive sync not configured.",
    });
  }

  if (req.method === "GET") {
    try {
      const eventId = req.query?.eventId;
      const id = req.query?.id;
      if (!eventId || !id) {
        return res.status(400).json({ ok: false, error: "eventId and id required" });
      }
      const buffer = await downloadProductImageForEvent(eventId, id);
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.status(200).send(buffer);
    } catch (err) {
      console.error("api/product-images GET error:", err);
      return res.status(404).json({
        ok: false,
        error: driveErrorMessage(err),
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!checkWriteAuth(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const eventId = body.eventId;
    const images = Array.isArray(body.images) ? body.images : [];
    if (!eventId || !images.length) {
      return res.status(400).json({ ok: false, error: "eventId and images required" });
    }
    if (images.length > 12) {
      return res.status(400).json({ ok: false, error: "Max 12 images per request" });
    }
    const result = await uploadProductImagesForEvent(eventId, images);
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error("api/product-images POST error:", err);
    return res.status(500).json({
      ok: false,
      error: driveErrorMessage(err),
    });
  }
};
