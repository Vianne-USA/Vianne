#!/usr/bin/env node
/**
 * Extract product photos from a Price List xlsx and upload to Google Drive
 * via the live /api/product-images endpoint (uses server Drive credentials).
 *
 * Usage:
 *   node scripts/push-images-to-cloud.js EVT001 "/path/to/JCK Price List-1.xlsx"
 */
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const XLSX = require("xlsx");

const API = process.env.VIANNE_API || "https://vianne-lac.vercel.app";
const BATCH = 6;

function normXLKey(k) {
  return String(k || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
function xlVal(row, keys) {
  const map = {};
  Object.entries(row || {}).forEach(([k, v]) => {
    map[normXLKey(k)] = v;
  });
  for (const k of keys) {
    const v = map[normXLKey(k)];
    if (v != null && String(v).trim() !== "") return v;
  }
  return "";
}
function xlNum(v) {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(/[$,₹\s]/g, ""));
  return isNaN(n) ? 0 : n;
}
function parseSheetRows(ws) {
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
  if (!aoa.length) return { idByRow: {} };
  let hIdx = 0;
  for (let i = 0; i < Math.min(aoa.length, 20); i++) {
    const line = aoa[i].map((c) => String(c || "").toLowerCase()).join(" ");
    if (line.includes("unique") && line.includes("code")) {
      hIdx = i;
      break;
    }
    if (line.includes("jewel") && line.includes("code")) {
      hIdx = i;
      break;
    }
  }
  const headers = (aoa[hIdx] || []).map((h) => String(h || "").trim());
  const idByRow = {};
  for (let r = hIdx + 1; r < aoa.length; r++) {
    if (!aoa[r].some((v) => v !== "" && v != null)) continue;
    const row = {};
    headers.forEach((h, i) => {
      if (h) row[h] = aoa[r][i] != null ? aoa[r][i] : "";
    });
    const excelRow = r + 1;
    let id = String(
      xlVal(row, ["Unique Code", "Jewel Code", "JewelCode", "Code", "SKU", "ID", "Item Code", "VJ Code"]) || ""
    )
      .trim()
      .toUpperCase();
    if (!id) {
      for (const v of Object.values(row)) {
        const s = String(v || "").trim().toUpperCase();
        if (/^VJ[A-Z]{2,4}\d+/i.test(s)) {
          id = s;
          break;
        }
      }
    }
    let fp = xlNum(xlVal(row, ["Round Off Final", "Round Off", "Final Price"]));
    if (fp <= 0) fp = xlNum(xlVal(row, ["Sale Price", "Price", "FP", "MRP"]));
    if (fp <= 0) fp = xlNum(xlVal(row, ["Inward + Tarriffs", "Inward + Tariffs", "IPT", "Inward+Tariffs"]));
    if (id && id.length >= 3 && fp > 0) idByRow[excelRow] = id;
  }
  return { idByRow };
}
function codeForExcelRow(excelRow, idByRow) {
  for (let r = excelRow; r >= 1; r--) {
    if (idByRow[r]) return idByRow[r];
  }
  return null;
}
function parseDrawingRels(relsXml) {
  const relMap = {};
  relsXml.replace(/<(?:Relationship|[^>]*:Relationship)[^>]*>/g, (tag) => {
    const id = (tag.match(/\bId="([^"]+)"/) || tag.match(/\bid="([^"]+)"/))?.[1];
    const tgt = (tag.match(/\bTarget="([^"]+)"/) || tag.match(/\btarget="([^"]+)"/))?.[1];
    if (id && tgt) relMap[id] = "xl/" + tgt.replace(/^\.\.\//, "");
    return tag;
  });
  return relMap;
}
async function extractXLImages(buf, idByRow) {
  const zip = await JSZip.loadAsync(buf);
  const imgs = {};
  const drawingPaths = Object.keys(zip.files).filter((n) => /xl\/drawings\/drawing\d+\.xml$/i.test(n));
  for (const dp of drawingPaths) {
    const xml = await zip.file(dp).async("string");
    const relsPath = dp.replace("drawings/", "drawings/_rels/").replace(/\.xml$/i, ".xml.rels");
    if (!zip.files[relsPath]) continue;
    const relMap = parseDrawingRels(await zip.file(relsPath).async("string"));
    const re = /<xdr:row>(\d+)<\/xdr:row>[\s\S]*?r:(?:embed|link)="([^"]+)"/g;
    let m;
    while ((m = re.exec(xml))) {
      const code = codeForExcelRow(parseInt(m[1], 10) + 1, idByRow);
      const mediaPath = relMap[m[2]];
      if (!code || !mediaPath || imgs[code]) continue;
      const b64 = await zip.file(mediaPath).async("base64");
      if (b64) imgs[code] = b64;
    }
  }
  return imgs;
}
async function fetchEventIds(eventId) {
  const r = await fetch(`${API}/api/data`);
  const d = await r.json();
  const ev = (d.events || []).find((e) => e && e.id === eventId);
  if (!ev) throw new Error("Event not found on cloud: " + eventId);
  return (ev.inv || []).map((i) => String(i.id).toUpperCase()).filter(Boolean);
}
async function uploadBatch(eventId, chunk) {
  const r = await fetch(`${API}/api/product-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, images: chunk }),
  });
  const d = await r.json();
  if (!r.ok || !d.ok) throw new Error(d.error || `Upload failed HTTP ${r.status}`);
  return d.uploaded || chunk.length;
}
async function main() {
  const eventId = process.argv[2];
  const xlsxPath = process.argv[3];
  if (!eventId || !xlsxPath) {
    console.error("Usage: node scripts/push-images-to-cloud.js EVENT_ID /path/to/price-list.xlsx");
    process.exit(1);
  }
  const abs = path.resolve(xlsxPath);
  if (!fs.existsSync(abs)) {
    console.error("File not found:", abs);
    process.exit(1);
  }
  console.log("Event:", eventId);
  console.log("File:", abs);
  console.log("API:", API);
  const invIds = await fetchEventIds(eventId);
  console.log("Event has", invIds.length, "inventory items on cloud");
  const buf = fs.readFileSync(abs);
  const wb = XLSX.read(buf, { type: "buffer" });
  let idByRow = {};
  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    if (!ws) continue;
    const parsed = parseSheetRows(ws);
    if (Object.keys(parsed.idByRow).length >= Object.keys(idByRow).length) idByRow = parsed.idByRow;
  }
  console.log("Parsed", Object.keys(idByRow).length, "product rows from Excel");
  const allImgs = await extractXLImages(buf, idByRow);
  console.log("Extracted", Object.keys(allImgs).length, "embedded photos");
  const want = new Set(invIds.length ? invIds : Object.keys(allImgs));
  const entries = Object.entries(allImgs).filter(([id]) => want.has(id));
  console.log("Uploading", entries.length, "photos for this event…");
  let uploaded = 0;
  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH).map(([id, data]) => ({ id, data }));
    try {
      const n = await uploadBatch(eventId, chunk);
      uploaded += n;
      process.stdout.write(`\r  ${Math.min(i + BATCH, entries.length)}/${entries.length} (${uploaded} on Drive)`);
    } catch (e) {
      console.error("\nBatch failed at", i, e.message);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log("\nDone. Uploaded", uploaded, "photos to Drive for", eventId);
  const testId = entries[0]?.[0] || invIds[0];
  if (testId) {
    const tr = await fetch(`${API}/api/product-images?eventId=${eventId}&id=${testId}`);
    console.log("Verify", testId, "→ HTTP", tr.status, tr.headers.get("content-type"));
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
