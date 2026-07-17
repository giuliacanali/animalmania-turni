// Dati condivisi (negozi, dipendenti, turni, ferie) salvati sul server, così
// tutti vedono la stessa cosa. Lettura: qualsiasi utente loggato. Scrittura:
// solo admin. Se il backend non è configurato risponde backend:false e il
// front-end resta in locale.
const crypto = require("crypto");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const SECRET = process.env.SESSION_SECRET || "";
const K_DATA = "am_data";

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

  try {
    if (req.method === "GET") {
      const raw = await kv(["GET", K_DATA]);
      res.status(200).json({ backend: true, data: raw ? JSON.parse(raw) : null });
      return;
    }
    if (req.method === "POST") {
      if (role !== "admin") { res.status(403).json({ error: "forbidden" }); return; }
      const b = req.body || {};
      if (!Array.isArray(b.stores) || !Array.isArray(b.employees)) {
        res.status(400).json({ error: "invalid payload" });
        return;
      }
      const updatedAt = Date.now();
      const payload = JSON.stringify({ stores: b.stores, employees: b.employees, schedules: b.schedules || {}, updatedAt });
      await kv(["SET", K_DATA, payload]);
      res.status(200).json({ ok: true, updatedAt });
      return;
    }
    res.status(400).json({ error: "bad request" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
