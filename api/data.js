const {
  isSyncConfigured,
  isBlobConfigured,
  isDriveConfigured,
  loadSyncData,
  saveSyncData,
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

  if (!isSyncConfigured()) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error:
        "Cloud sync not configured. In Vercel: create a Blob store (recommended) OR set GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_DRIVE_FOLDER_ID on a Shared Drive.",
    });
  }

  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      const data = await loadSyncData();
      return res.status(200).json({
        ok: true,
        configured: true,
        blob: isBlobConfigured(),
        drive: isDriveConfigured(),
        blobEnv: {
          storeId: !!process.env.BLOB_STORE_ID,
          rwToken: !!process.env.BLOB_READ_WRITE_TOKEN,
          oidc: !!process.env.VERCEL_OIDC_TOKEN,
        },
        blobRead: (data.events || []).length > 0 || (data.version || 0) > 0 ? "ok" : "empty",
        store: data.store || null,
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
      const result = await saveSyncData(body);
      return res.status(200).json({
        ok: true,
        configured: true,
        blob: isBlobConfigured(),
        drive: isDriveConfigured(),
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
