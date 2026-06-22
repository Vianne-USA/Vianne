const {
  isSyncConfigured,
  isDriveConfigured,
  loadSyncData,
  saveSyncData,
  getDriveStatus,
} = require("./lib/sync-store");
const { normalizeCurrencyRates } = require("./lib/currency-rates");

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

  if (!isSyncConfigured()) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error:
        "Google Drive sync not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_DRIVE_FOLDER_ID in Vercel (folder must be inside a Google Workspace Shared Drive).",
    });
  }

  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      const data = await loadSyncData();
      const payload = {
        ok: true,
        configured: true,
        syncApiVersion: 6,
        store: "drive",
        drive: isDriveConfigured(),
        driveRead:
          (data.events || []).length > 0 || (data.version || 0) > 0 ? "ok" : "empty",
        version: data.version || 0,
        updatedAt: data.updatedAt || null,
        events: data.events || [],
        users: data.users || null,
        currency: normalizeCurrencyRates(data.currency),
        deletedEventIds: data.deletedEventIds || [],
      };
      if (req.query && req.query.debug === "1") {
        payload.driveStatus = await getDriveStatus();
      }
      return res.status(200).json(payload);
    }

    if (req.method === "POST") {
      if (!checkWriteAuth(req)) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }
      const body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const result = await saveSyncData(body);
      return res.status(200).json({
        ok: true,
        configured: true,
        syncApiVersion: 6,
        store: "drive",
        drive: true,
        users: result.users || body.users || null,
        currency: result.currency || body.currency || null,
        ...result,
      });
    }

    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("api/data error:", err);
    return res.status(500).json({
      ok: false,
      error: String(err && err.message ? err.message : err).slice(0, 400),
    });
  }
};
