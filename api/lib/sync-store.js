const {
  isConfigured: isDriveConfigured,
  loadMasterData,
  saveMasterData,
  driveErrorMessage,
} = require("./drive");
const { isBlobConfigured, loadFromBlob, saveToBlob } = require("./blob-store");

function isSyncConfigured() {
  return isBlobConfigured() || isDriveConfigured();
}

function pickNewer(a, b) {
  if (!a) return b || null;
  if (!b) return a || null;
  const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
  const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
  if (ta === tb) {
    const ac = (a.events || []).length;
    const bc = (b.events || []).length;
    return bc > ac ? b : a;
  }
  return tb > ta ? b : a;
}

async function loadSyncData() {
  const blob = await loadFromBlob();
  let drive = null;
  if (isDriveConfigured()) {
    try {
      drive = await loadMasterData();
      if (drive) drive.store = "drive";
    } catch (e) {
      console.warn("drive load", e.message);
    }
  }
  const picked = pickNewer(blob, drive);
  if (picked) return picked;
  return {
    version: 0,
    updatedAt: null,
    events: [],
    users: null,
    currency: null,
  };
}

async function saveSyncData(payload) {
  const errors = [];
  let blobResult = null;
  let driveResult = null;

  if (isBlobConfigured()) {
    try {
      blobResult = await saveToBlob(payload);
    } catch (e) {
      errors.push("Blob: " + e.message);
    }
  }

  if (isDriveConfigured()) {
    try {
      driveResult = await saveMasterData(payload);
      driveResult.store = "drive";
    } catch (e) {
      errors.push("Drive: " + driveErrorMessage(e));
    }
  }

  if (blobResult || driveResult) {
    return blobResult || driveResult;
  }

  if (!isBlobConfigured() && !isDriveConfigured()) {
    throw new Error(
      "Cloud storage not configured. Add BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob) or Google Drive Shared Drive env vars."
    );
  }

  throw new Error(
    errors.join(" · ") ||
      "Cloud save failed. Add Vercel Blob storage (recommended) or move Google Drive folder to a Shared Drive."
  );
}

module.exports = {
  isSyncConfigured,
  isBlobConfigured,
  isDriveConfigured,
  loadSyncData,
  saveSyncData,
  driveErrorMessage,
};
