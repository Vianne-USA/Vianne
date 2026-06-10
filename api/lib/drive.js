const crypto = require("crypto");

const MASTER_NAME = "vianne-master.json";
const SCOPES = "https://www.googleapis.com/auth/drive";
const DRIVE_FLAGS = "supportsAllDrives=true&includeItemsFromAllDrives=true";

function withDriveFlags(path) {
  return path + (path.includes("?") ? "&" : "?") + DRIVE_FLAGS;
}

function driveErrorMessage(err) {
  const msg = String(err && err.message ? err.message : err);
  if (msg.includes("storage quota") || msg.includes("Service Accounts do not have")) {
    return (
      "Google Drive folder must be inside a Shared Drive (Google Workspace), not My Drive. " +
      "Create a Shared Drive, add the Vianne folder there, share it with the service account, " +
      "and update GOOGLE_DRIVE_FOLDER_ID in Vercel."
    );
  }
  return msg.slice(0, 400);
}

function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function rootFolderId() {
  return process.env.GOOGLE_DRIVE_FOLDER_ID || "";
}

function isConfigured() {
  return !!(credentials() && rootFolderId());
}

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let tokenCache = { token: null, exp: 0 };

async function accessToken() {
  const cred = credentials();
  if (!cred) throw new Error("Google service account not configured");

  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && tokenCache.exp > now + 60) return tokenCache.token;

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: cred.client_email,
      scope: SCOPES,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signInput = header + "." + claim;
  const sign = crypto
    .createSign("RSA-SHA256")
    .update(signInput)
    .sign(cred.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const jwt = signInput + "." + sign;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" +
      jwt,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Token failed");
  tokenCache = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

async function drive(path, opts = {}) {
  const token = await accessToken();
  const res = await fetch("https://www.googleapis.com/drive/v3" + withDriveFlags(path), {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: "Bearer " + token,
      ...(opts.body && typeof opts.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text.slice(0, 300));
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("json")) return res.json();
  return null;
}

async function driveUpload(url, body, contentType, method) {
  const token = await accessToken();
  const uploadUrl = url.includes("supportsAllDrives=")
    ? url
    : url + (url.includes("?") ? "&" : "?") + "supportsAllDrives=true";
  const res = await fetch(uploadUrl, {
    method: method || "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": contentType,
    },
    body,
  });
  if (!res.ok) throw new Error((await res.text()).slice(0, 300));
  return res.json();
}

function escQ(s) {
  return String(s).replace(/'/g, "\\'");
}

async function findFile(name, parentId) {
  let q =
    "name='" +
    escQ(name) +
    "' and trashed=false and '" +
    parentId +
    "' in parents";
  const r = await drive(
    "/files?q=" + encodeURIComponent(q) + "&fields=files(id,name,mimeType,modifiedTime)"
  );
  return (r.files && r.files[0]) || null;
}

async function findFolder(name, parentId) {
  let q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    escQ(name) +
    "' and trashed=false and '" +
    parentId +
    "' in parents";
  const r = await drive("/files?q=" + encodeURIComponent(q) + "&fields=files(id,name)");
  return (r.files && r.files[0]) || null;
}

async function createFolder(name, parentId) {
  const hit = await findFolder(name, parentId);
  if (hit) return hit;
  return drive("/files", {
    method: "POST",
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
}

async function downloadJson(fileId) {
  const token = await accessToken();
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      fileId +
      "?" +
      DRIVE_FLAGS +
      "&alt=media",
    { headers: { Authorization: "Bearer " + token } }
  );
  if (!res.ok) throw new Error((await res.text()).slice(0, 200));
  return res.json();
}

async function uploadJson(name, data, parentId, existingId) {
  const meta = existingId
    ? { name, mimeType: "application/json" }
    : { name, mimeType: "application/json", parents: [parentId] };
  const boundary = "vianne" + Date.now();
  const body =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(meta) +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: application/json\r\n\r\n" +
    JSON.stringify(data, null, 2) +
    "\r\n--" +
    boundary +
    "--";
  if (existingId) {
    const url =
      "https://www.googleapis.com/upload/drive/v3/files/" +
      existingId +
      "?uploadType=multipart";
    return driveUpload(url, body, "multipart/related; boundary=" + boundary, "PATCH");
  }
  return driveUpload(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    body,
    "multipart/related; boundary=" + boundary,
    "POST"
  );
}

async function renameFile(fileId, newName) {
  return drive("/files/" + fileId, {
    method: "PATCH",
    body: JSON.stringify({ name: newName }),
  });
}

async function loadMasterData() {
  if (!isConfigured()) return null;
  const root = rootFolderId();
  const master = await findFile(MASTER_NAME, root);
  if (!master) {
    return {
      version: 0,
      updatedAt: null,
      events: [],
      users: null,
      currency: null,
      masterFileId: null,
    };
  }
  const data = await downloadJson(master.id);
  return {
    ...data,
    masterFileId: master.id,
    version: data.version || 0,
  };
}

async function uploadBinary(name, buffer, parentId, mimeType) {
  const safeName = String(name || "inventory.xlsx").replace(/[\\/:*?"<>|]/g, "_");
  const existing = await findFile(safeName, parentId);
  const finalName = existing
    ? new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + "_" + safeName
    : safeName;
  const boundary = "viannebin" + Date.now();
  const meta = JSON.stringify({
    name: finalName,
    mimeType: mimeType || "application/octet-stream",
    parents: [parentId],
  });
  const prelude =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    meta +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: " +
    (mimeType || "application/octet-stream") +
    "\r\n\r\n";
  const epilogue = "\r\n--" + boundary + "--";
  const body = Buffer.concat([
    Buffer.from(prelude),
    Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
    Buffer.from(epilogue),
  ]);
  return driveUpload(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    body,
    "multipart/related; boundary=" + boundary,
    "POST"
  );
}

function mimeForFileName(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (n.endsWith(".xls")) return "application/vnd.ms-excel";
  if (n.endsWith(".csv")) return "text/csv";
  return "application/octet-stream";
}

async function uploadInventoryFilesToFolder(ev, folderId, files) {
  if (!files || !files.length) return ev;
  const uploaded = [];
  for (const f of files) {
    if (!f || !f.contentBase64) continue;
    try {
      const buf = Buffer.from(f.contentBase64, "base64");
      if (!buf.length) continue;
      const file = await uploadBinary(
        f.fileName || "inventory.xlsx",
        buf,
        folderId,
        f.mimeType || mimeForFileName(f.fileName)
      );
      uploaded.push({
        fileName: f.fileName,
        driveFileId: file.id,
        driveFileName: file.name,
      });
    } catch (e) {
      console.warn("Inventory file upload failed", f.fileName, e.message);
    }
  }
  if (!uploaded.length || !Array.isArray(ev.invHistory)) return ev;
  const used = new Set();
  const invHistory = ev.invHistory.map((h) => {
    if (h.driveFileId) return h;
    const hit = uploaded.find((u) => u.fileName === h.fileName && !used.has(u.driveFileId));
    if (!hit) return h;
    used.add(hit.driveFileId);
    return {
      ...h,
      driveFileId: hit.driveFileId,
      driveFileName: hit.driveFileName,
      driveSyncedAt: new Date().toISOString(),
    };
  });
  return { ...ev, invHistory };
}

async function syncEventFolder(ev, root, inventoryFiles) {
  const folderName = (ev.name || ev.id || "Event").trim();
  let folderId = ev.driveFolderId;
  if (folderId) {
    try {
      await drive("/files/" + folderId + "?fields=id,trashed");
    } catch (e) {
      folderId = null;
    }
  }
  if (!folderId) {
    const folder = await createFolder(folderName, root);
    folderId = folder.id;
  }
  const payload = {
    ...ev,
    driveFolderId: folderId,
    syncedAt: new Date().toISOString(),
  };
  const filesForEvent = (inventoryFiles || []).filter((f) => f.eventId === ev.id);
  const withFiles =
    filesForEvent.length > 0
      ? await uploadInventoryFilesToFolder(payload, folderId, filesForEvent)
      : payload;
  const existing = await findFile("event-data.json", folderId);
  const file = await uploadJson(
    "event-data.json",
    withFiles,
    folderId,
    existing && existing.id
  );
  return { ...withFiles, driveFolderId: folderId, driveFileId: file.id };
}

async function markEventDeleted(deleted) {
  if (!deleted || !deleted.driveFolderId) return;
  const deletedName = (deleted.name || "Event").trim() + " deleted";
  await renameFile(deleted.driveFolderId, deletedName);
  const existing = await findFile("event-data.json", deleted.driveFolderId);
  if (existing) {
    const snap = await downloadJson(existing.id);
    await uploadJson(
      "event-data.json",
      { ...snap, deletedAt: new Date().toISOString(), status: "deleted" },
      deleted.driveFolderId,
      existing.id
    );
  }
}

async function saveMasterData(payload) {
  if (!isConfigured()) throw new Error("Google Drive not configured on server");
  const root = rootFolderId();
  const deleted = Array.isArray(payload.deletedEvents) ? payload.deletedEvents : [];

  for (const d of deleted) {
    try {
      await markEventDeleted(d);
    } catch (e) {
      console.warn("Delete folder rename failed", d.name, e.message);
    }
  }

  const eventsIn = Array.isArray(payload.events) ? payload.events : [];
  const inventoryFiles = Array.isArray(payload.inventoryFiles) ? payload.inventoryFiles : [];
  const syncedEvents = [];
  for (const ev of eventsIn) {
    try {
      syncedEvents.push(await syncEventFolder(ev, root, inventoryFiles));
    } catch (e) {
      console.warn("Event sync failed", ev.name, e.message);
      syncedEvents.push(ev);
    }
  }

  const prev = await loadMasterData();
  const version = (prev && prev.version ? prev.version : 0) + 1;
  const master = {
    version,
    updatedAt: new Date().toISOString(),
    events: syncedEvents,
    users: payload.users || null,
    currency: payload.currency || null,
  };

  const masterHit = await findFile(MASTER_NAME, root);
  const file = await uploadJson(
    MASTER_NAME,
    master,
    root,
    (masterHit && masterHit.id) || (prev && prev.masterFileId)
  );

  return { version, updatedAt: master.updatedAt, masterFileId: file.id, events: syncedEvents };
}

module.exports = {
  isConfigured,
  loadMasterData,
  saveMasterData,
  driveErrorMessage,
};
