const { isConfigured, loadMasterData, saveMasterData } = require("./lib/drive");

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

  if (!isConfigured()) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error:
        "Vianne Google Drive is not configured yet. Add GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_DRIVE_FOLDER_ID in Vercel.",
    });
  }

  try {
    if (req.method === "GET") {
      const data = await loadMasterData();
      return res.status(200).json({
        ok: true,
        configured: true,
        version: data.version || 0,
        updatedAt: data.updatedAt || null,
        events: data.events || [],
        users: data.users || null,
        currency: data.currency || null,
      });
    }

    if (req.method === "POST") {
      if (!checkWriteAuth(req)) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }
      const body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const result = await saveMasterData(body);
      return res.status(200).json({ ok: true, configured: true, ...result });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("api/data error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
};
