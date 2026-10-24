// Dati condivisi (negozi, dipendenti, turni, ferie) salvati sul server, così
// tutti vedono la stessa cosa. Lettura: qualsiasi utente loggato. Scrittura:
// solo admin. Se il backend non è configurato risponde backend:false e il
// front-end resta in locale.
const crypto = require("crypto");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const SECRET = process.env.SESSION_SECRET || "";
const K_DATA = "am_data";
const K_IX = "am_data_hist_ix";          // indice (piccolo): elenco timestamp versioni
const SNAP = (ts) => "am_data_hist:" + ts; // una chiave per versione
const HIST_MAX = 20;                       // quante versioni conservare
const HIST_SPACING_MS = 10 * 60 * 1000;    // distanza minima tra due versioni salvate

function ready() { return KV_URL && KV_TOKEN && SECRET; }

async function kv(command) {
  const r = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const d = await r.json();
  return d.result;
}
function sign(role, exp) {
  const data = `${role}|${exp}`;
  return `${data}|` + crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}
function verifyToken(tok) {
  if (!tok) return null;
  const p = tok.split("|");
  if (p.length !== 3) return null;
  if (sign(p[0], p[1]) !== tok) return null;
  if (Number(p[1]) < Date.now()) return null;
  return p[0];
}
function cookie(req, name) {
  const m = (req.headers.cookie || "").match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

module.exports = async (req, res) => {
  if (!ready()) { res.status(200).json({ backend: false }); return; }
  const role = verifyToken(cookie(req, "am_session"));
  if (!role) { res.status(401).json({ error: "unauthorized" }); return; }

  // Eventuale parametro ?hist=... (lista versioni o una versione specifica)
  let hist = null;
  try { hist = new URL(req.url, "http://x").searchParams.get("hist"); } catch (e) {}

  try {
    if (req.method === "GET") {
      // --- Storico versioni (solo admin) ---
      if (hist !== null) {
        if (role !== "admin") { res.status(403).json({ error: "forbidden" }); return; }
        if (hist === "list") {
          const ixRaw = await kv(["GET", K_IX]);
          const ix = ixRaw ? JSON.parse(ixRaw) : [];
          res.status(200).json({ backend: true, history: ix });
          return;
        }
        const snapRaw = await kv(["GET", SNAP(hist)]);
        res.status(200).json({ backend: true, data: snapRaw ? JSON.parse(snapRaw) : null });
        return;
      }

      const raw = await kv(["GET", K_DATA]);
      let data = raw ? JSON.parse(raw) : null;
      // Ai dipendenti mostriamo SOLO le settimane pubblicate: le bozze non
      // vengono nemmeno inviate, così non possono vederle in anticipo.
      if (data && role !== "admin") {
        const pub = Array.isArray(data.published) ? data.published : Object.keys(data.schedules || {});
        const filtered = {};
        for (const wk of Object.keys(data.schedules || {})) {
          if (pub.includes(wk)) filtered[wk] = data.schedules[wk];
        }
        data = { ...data, schedules: filtered, published: pub };
      }
      res.status(200).json({ backend: true, data });
      return;
    }
    if (req.method === "POST") {
      if (role !== "admin") { res.status(403).json({ error: "forbidden" }); return; }
      const b = req.body || {};
      if (!Array.isArray(b.stores) || !Array.isArray(b.employees)) {
        res.status(400).json({ error: "invalid payload" });
        return;
      }
      // Prima di sovrascrivere, archivia la versione PRECEDENTE nello storico,
      // ma spaziata nel tempo (non a ogni micro-salvataggio) e limitata a HIST_MAX.
      const prevRaw = await kv(["GET", K_DATA]);
      if (prevRaw) {
        try {
          const prev = JSON.parse(prevRaw);
          const prevTs = Number(prev.updatedAt) || 0;
          const ixRaw = await kv(["GET", K_IX]);
          let ix = ixRaw ? JSON.parse(ixRaw) : [];
          const newest = ix.length ? Number(ix[0]) : 0;
          if (prevTs && (!newest || prevTs - newest >= HIST_SPACING_MS)) {
            await kv(["SET", SNAP(prevTs), prevRaw]);
            ix.unshift(prevTs);
            const keep = ix.slice(0, HIST_MAX);
            for (const old of ix.slice(HIST_MAX)) await kv(["DEL", SNAP(old)]);
            await kv(["SET", K_IX, JSON.stringify(keep)]);
          }
        } catch (e) { /* lo storico non deve mai bloccare il salvataggio */ }
      }
      const updatedAt = Date.now();
      const payload = JSON.stringify({ stores: b.stores, employees: b.employees, schedules: b.schedules || {}, holidays: Array.isArray(b.holidays) ? b.holidays : [], published: Array.isArray(b.published) ? b.published : [], week: b.week || null, updatedAt });
      await kv(["SET", K_DATA, payload]);
      res.status(200).json({ ok: true, updatedAt });
      return;
    }
    res.status(400).json({ error: "bad request" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
