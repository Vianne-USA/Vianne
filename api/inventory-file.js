const {
  isDriveConfigured,
  uploadInventoryFileForEvent,
  downloadInventoryFileForEvent,
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
      const fileId = req.query?.fileId;
      if (!eventId || !fileId) {
        return res.status(400).json({ ok: false, error: "eventId and fileId required" });
      }
      const buffer = await downloadInventoryFileForEvent(eventId, fileId);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Cache-Control", "private, max-age=300");
      return res.status(200).send(buffer);
    } catch (err) {
      console.error("api/inventory-file GET error:", err);
      return res.status(500).json({
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
    const file = {
      fileName: body.fileName,
      contentBase64: body.contentBase64,
      mimeType: body.mimeType,
    };
    if (!eventId || !file.contentBase64) {
      return res.status(400).json({ ok: false, error: "eventId and contentBase64 required" });
    }
    const result = await uploadInventoryFileForEvent(eventId, file);
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error("api/inventory-file error:", err);
    return res.status(500).json({
      ok: false,
      error: driveErrorMessage(err),
    });
  }
};
