const {
  isConfigured: isDriveConfigured,
  loadMasterData,
  saveMasterData,
  uploadInventoryFileForEvent,
  downloadInventoryFileForEvent,
  uploadReceiptToDrive,
  driveErrorMessage,
  getDriveStatus,
} = require("./drive");

function isSyncConfigured() {
  return isDriveConfigured();
}

function isBlobConfigured() {
  return false;
}

async function loadSyncData() {
  if (!isDriveConfigured()) {
    return {
      version: 0,
      updatedAt: null,
      events: [],
      users: null,
      currency: null,
      store: null,
    };
  }
  try {
    const drive = await loadMasterData();
    if (drive) {
      drive.store = "drive";
      return drive;
    }
  } catch (e) {
    console.warn("drive load", e.message);
  }
  return {
    version: 0,
    updatedAt: null,
    events: [],
    users: null,
    currency: null,
    store: "drive",
  };
}

async function saveSyncData(payload) {
  if (!isDriveConfigured()) {
    throw new Error(
      "Google Drive not configured. Set GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_DRIVE_FOLDER_ID in Vercel (folder must be inside a Shared Drive)."
    );
  }
  try {
    const driveResult = await saveMasterData(payload);
    driveResult.store = "drive";
    return driveResult;
  } catch (e) {
    throw new Error(driveErrorMessage(e));
  }
}

module.exports = {
  isSyncConfigured,
  isBlobConfigured,
  isDriveConfigured,
  loadSyncData,
  saveSyncData,
  uploadInventoryFileForEvent,
  downloadInventoryFileForEvent,
  uploadReceiptToDrive,
  driveErrorMessage,
  getDriveStatus,
};
