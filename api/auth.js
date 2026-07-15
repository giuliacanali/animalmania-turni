// Mini-backend per le credenziali condivise (livello A).
// Salva le due password su Upstash Redis (KV) e gestisce una sessione firmata.
// Se le variabili d'ambiente non ci sono, risponde backend:false così il
// front-end torna alle password locali di auth-config.js (nessun blocco).
const crypto = require("crypto");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const SECRET = process.env.SESSION_SECRET || "";
const K_ADMIN = "am_auth:admin";
const K_EMP = "am_auth:employee";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 giorni

function backendReady() { return KV_URL && KV_TOKEN && SECRET; }

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
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}|${sig}`;
}
function verifyToken(tok) {
  if (!tok) return null;
  const parts = tok.split("|");
  if (parts.length !== 3) return null;
  if (sign(parts[0], parts[1]) !== tok) return null;
  if (Number(parts[1]) < Date.now()) return null;
  return parts[0];
}
function cookie(req, name) {
  const m = (req.headers.cookie || "").match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function setSession(res, role) {
  const tok = sign(role, Date.now() + MAX_AGE * 1000);
  res.setHeader("Set-Cookie", `am_session=${encodeURIComponent(tok)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

module.exports = async (req, res) => {
  if (!backendReady()) { res.status(200).json({ backend: false }); return; }
  const action = (req.query && req.query.action) || (req.body && req.body.action);

  try {
    // Prime le password di default la prima volta (da env, se presenti).
    let adminPw = await kv(["GET", K_ADMIN]);
    let empPw = await kv(["GET", K_EMP]);
    if (adminPw == null && process.env.ADMIN_PASSWORD) { adminPw = process.env.ADMIN_PASSWORD; await kv(["SET", K_ADMIN, adminPw]); }
    if (empPw == null && process.env.EMPLOYEE_PASSWORD) { empPw = process.env.EMPLOYEE_PASSWORD; await kv(["SET", K_EMP, empPw]); }

    if (req.method === "GET" && action === "session") {
      const role = verifyToken(cookie(req, "am_session"));
      const out = { backend: true, role: role || null };
      if (role === "admin") out.employeePassword = empPw || "";
      res.status(200).json(out);
      return;
    }

    if (req.method === "POST" && action === "login") {
      const pw = (req.body && req.body.password) || "";
      let role = null;
      if (adminPw && pw === adminPw) role = "admin";
      else if (empPw && pw === empPw) role = "employee";
      if (!role) { res.status(401).json({ backend: true, role: null }); return; }
      setSession(res, role);
      res.status(200).json({ backend: true, role });
      return;
    }

    if (req.method === "POST" && action === "set-credentials") {
      const role = verifyToken(cookie(req, "am_session"));
      if (role !== "admin") { res.status(403).json({ error: "forbidden" }); return; }
      const b = req.body || {};
      if (b.adminPassword) await kv(["SET", K_ADMIN, String(b.adminPassword)]);
      if (b.employeePassword) await kv(["SET", K_EMP, String(b.employeePassword)]);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "POST" && action === "logout") {
      res.setHeader("Set-Cookie", "am_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: "bad request" });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
