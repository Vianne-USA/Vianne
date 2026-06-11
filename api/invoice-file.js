const {
  isDriveConfigured,
  uploadReceiptToDrive,
  driveErrorMessage,
} = require("./lib/sync-store");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!checkWriteAuth(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const eventName = body.eventName;
    const receiptId = body.receiptId;
    const html = body.html;
    if (!eventName || !receiptId || !html) {
      return res.status(400).json({
        ok: false,
        error: "eventName, receiptId, and html required",
      });
    }
    const result = await uploadReceiptToDrive({ eventName, receiptId, html });
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error("api/invoice-file error:", err);
    return res.status(500).json({
      ok: false,
      error: driveErrorMessage(err),
    });
  }
};
