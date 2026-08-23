function eventTime(ev) {
  const t = (ev && (ev.syncedAt || ev.updatedAt || ev.localUpdatedAt)) || "";
  return t ? Date.parse(t) || 0 : 0;
}

function mergeEventPair(local, cloud) {
  if (!local) return cloud;
  if (!cloud) return local;
  const localInv = (local.inv || []).length;
  const cloudInv = (cloud.inv || []).length;
  const localT = eventTime(local);
  const cloudT = eventTime(cloud);
  const pickLocal = localT > cloudT || (localT === cloudT && localInv >= cloudInv);
  const meta = pickLocal ? { ...cloud, ...local } : { ...local, ...cloud };
  const invHistKey = (h) => (h && h.id) || ((h && h.fileName) || "") + "|" + ((h && h.date) || "");
  const invHistory = [
    ...new Map(
      [...(local.invHistory || []), ...(cloud.invHistory || [])].map((h) => [invHistKey(h), h])
    ).values(),
  ];
  let inv;
  if (cloudInv === 0 && localInv > 0) inv = local.inv || [];
  else if (localInv === 0 && cloudInv > 0) inv = cloud.inv || [];
  else inv = pickLocal ? local.inv || [] : cloud.inv || [];
  return {
    ...meta,
    inv,
    invHistory,
    sales: pickLocal ? local.sales || [] : cloud.sales || [],
    leads: pickLocal ? local.leads || [] : cloud.leads || [],
    audits: pickLocal ? local.audits || [] : cloud.audits || [],
    memos: pickLocal ? local.memos || [] : cloud.memos || [],
    driveFolderId: cloud.driveFolderId || local.driveFolderId,
    driveFileId: cloud.driveFileId || local.driveFileId,
    syncedAt: cloud.syncedAt || local.syncedAt,
    localUpdatedAt: pickLocal ? local.localUpdatedAt || cloud.localUpdatedAt : cloud.localUpdatedAt || local.localUpdatedAt,
  };
}

function mergeEvents(local, cloud) {
  const byId = new Map();
  (Array.isArray(local) ? local : []).forEach((e) => {
    if (e && e.id) byId.set(e.id, e);
  });
  (Array.isArray(cloud) ? cloud : []).forEach((e) => {
    if (!e || !e.id) return;
    const prev = byId.get(e.id);
    byId.set(e.id, prev ? mergeEventPair(prev, e) : e);
  });
  return [...byId.values()];
}

function applyDeletedEvents(events, deletedEvents) {
  const ids = new Set(
    (Array.isArray(deletedEvents) ? deletedEvents : [])
      .map((d) => d && d.id)
      .filter(Boolean)
  );
  if (!ids.size) return events;
  return (events || []).filter((e) => e && !ids.has(e.id));
}

module.exports = { mergeEvents, mergeEventPair, applyDeletedEvents };
