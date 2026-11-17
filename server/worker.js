// HavenTracker API: a Cloudflare Worker with one KV namespace bound as DB and a secret ADMIN_TOKEN.
// Design: docs/ai/design/server-and-commit.md (campaign, tokens) and docs/ai/design/map-integration.md (sessions, turns).
// Paste this file into the Worker's code editor in the Cloudflare dashboard and deploy.
//
// Keys in KV
//   c:<cid>                     { ver, record, t, by }               the campaign record with its version
//   tok:<sha256 of token>       { cid, role, seat, label, id }        a player or read-only token (only the hash is stored)
//   s:<cid>:<sid>               { sid, scn, started, turn, status }   a session (scenario in play)
//   t:<cid>:<sid>:<n, 5 digits> { n, t, by, note, state }             a map turn; never changed once written
//
// Auth: header "Authorization: Bearer <token>". Roles: admin (the ADMIN_TOKEN secret, every campaign), player (read and
// write one campaign), read (read one campaign).
//
// Note: KV is eventually consistent. A write can take up to about a minute to show in other locations, so the version checks
// below are a guard against overwriting, not a lock. For turns hours apart this is enough.

const ORIGINS = ['https://sadgit-hl.github.io', 'http://localhost:8080', 'http://localhost:8099'];
const MAX_RECORD = 1_000_000, MAX_STATE = 200_000, MAX_NOTE = 200;
const ID = /^[a-z0-9-]{3,40}$/;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400' } });
    }
    try {
      const res = await route(req, env);
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (e) {
      const status = e.status || 500;
      return json({ error: status === 500 ? 'server error' : e.message }, status, cors);
    }
  },
};

// ---- helpers ----
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}
function fail(status, message) { const e = new Error(message); e.status = status; throw e; }
async function sha(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomHex(bytes) { return [...crypto.getRandomValues(new Uint8Array(bytes))].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function body(req, max) {
  const txt = await req.text();
  if (txt.length > max) fail(413, 'too large');
  try { return JSON.parse(txt || '{}'); } catch { return fail(400, 'body is not JSON'); }
}
async function listAll(env, prefix) {
  const keys = [];
  let cursor;
  do {
    const r = await env.DB.list({ prefix, cursor });
    keys.push(...r.keys);
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  return keys;
}
const pad = n => String(n).padStart(5, '0');

// ---- who is calling ----
async function who(req, env) {
  const t = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!t) return null;
  const h = await sha(t);
  if (env.ADMIN_TOKEN && h === await sha(env.ADMIN_TOKEN)) return { role: 'admin', label: 'admin' };
  const tok = await env.DB.get(`tok:${h}`, 'json');
  return tok || null;
}
// need: 'read' (any token of the campaign), 'player' (player or admin), 'admin'
function need(user, cid, level) {
  if (!user) fail(401, 'token missing or unknown');
  if (user.role === 'admin') return;
  if (level === 'admin' || user.cid !== cid) fail(403, 'not allowed');
  if (level === 'player' && user.role !== 'player') fail(403, 'read-only token');
}
const byOf = user => user.label || (user.seat != null ? `seat ${user.seat}` : user.role);

// ---- routes ----
async function route(req, env) {
  const p = new URL(req.url).pathname.split('/').filter(Boolean), m = req.method;
  if (!p.length) return json({ app: 'HavenTracker API', ok: true });
  if (p[0] !== 'c') fail(404, 'not found');
  const user = await who(req, env);

  // POST /c   { cid, record }   create a campaign (admin)
  if (p.length === 1 && m === 'POST') {
    need(user, null, 'admin');
    const b = await body(req, MAX_RECORD);
    if (!ID.test(b.cid || '')) fail(400, 'cid: 3 to 40 characters of a-z, 0-9 and -');
    if (await env.DB.get(`c:${b.cid}`)) fail(409, 'campaign exists');
    await env.DB.put(`c:${b.cid}`, JSON.stringify({ ver: 1, record: b.record ?? null, t: Date.now(), by: 'admin' }));
    return json({ cid: b.cid, ver: 1 }, 201);
  }

  const cid = p[1];
  if (!ID.test(cid || '')) fail(404, 'not found');
  const campaign = async () => (await env.DB.get(`c:${cid}`, 'json')) || fail(404, 'no such campaign');

  // GET /c/:cid   the record and its version
  if (p.length === 2 && m === 'GET') { need(user, cid, 'read'); return json(await campaign()); }
  // GET /c/:cid/ver   only the version (the page checks it every minute; small answer, little traffic through the relay)
  if (p.length === 3 && p[2] === 'ver' && m === 'GET') { need(user, cid, 'read'); const c = await campaign(); return json({ ver: c.ver, t: c.t, by: c.by }); }
  // PUT /c/:cid   { base, record }   save; 409 when base is not the current version
  if (p.length === 2 && m === 'PUT') {
    need(user, cid, 'player');
    const b = await body(req, MAX_RECORD), c = await campaign();
    if (b.base !== c.ver) return json({ error: 'stale', ver: c.ver }, 409);
    if (!b.record || typeof b.record !== 'object') fail(400, 'record missing');
    const next = { ver: c.ver + 1, record: b.record, t: Date.now(), by: byOf(user) };
    await env.DB.put(`c:${cid}`, JSON.stringify(next));
    return json({ ver: next.ver });
  }

  // tokens (admin): GET list, POST { role: 'player' | 'read', seat, label } -> the token once, DELETE /tokens/:id
  if (p[2] === 'tokens') {
    need(user, cid, 'admin');
    const all = async () => (await listAll(env, 'tok:')).filter(k => k.metadata?.cid === cid);
    if (p.length === 3 && m === 'GET') return json((await all()).map(k => k.metadata));
    if (p.length === 3 && m === 'POST') {
      await campaign();
      const b = await body(req, 2000);
      if (!['player', 'read'].includes(b.role)) fail(400, "role: 'player' or 'read'");
      const token = randomHex(16), h = await sha(token);
      const meta = { cid, role: b.role, seat: b.seat ?? null, label: String(b.label || '').slice(0, 40), id: h.slice(0, 8) };
      await env.DB.put(`tok:${h}`, JSON.stringify(meta), { metadata: meta });
      return json({ token, ...meta }, 201);
    }
    if (p.length === 4 && m === 'DELETE') {
      const k = (await all()).find(x => x.metadata.id === p[3]);
      if (!k) fail(404, 'no such token');
      await env.DB.delete(k.name);
      return json({ deleted: p[3] });
    }
    fail(405, 'method not allowed');
  }

  // GET /c/:cid/export   everything of the campaign (admin backup)
  if (p[2] === 'export' && p.length === 3 && m === 'GET') {
    need(user, cid, 'admin');
    const sessions = [];
    for (const k of await listAll(env, `s:${cid}:`)) {
      const s = await env.DB.get(k.name, 'json');
      const turns = [];
      for (const tk of await listAll(env, `t:${cid}:${s.sid}:`)) turns.push(await env.DB.get(tk.name, 'json'));
      sessions.push({ ...s, turns });
    }
    return json({ cid, campaign: await campaign(), sessions, exported: Date.now() });
  }

  // sessions and turns
  if (p[2] === 's') {
    const sid = p[3];
    // GET /c/:cid/s   all sessions
    if (p.length === 3 && m === 'GET') {
      need(user, cid, 'read');
      return json((await listAll(env, `s:${cid}:`)).map(k => k.metadata));
    }
    // POST /c/:cid/s   { scn, state, note }   start a session; the state is turn 0
    if (p.length === 3 && m === 'POST') {
      need(user, cid, 'player');
      await campaign();
      const b = await body(req, MAX_STATE);
      checkState(b.state);
      const s = { sid: Date.now().toString(36) + randomHex(2), scn: b.scn ?? null, started: Date.now(), turn: 0, status: 'running' };
      await putTurn(env, cid, s.sid, 0, user, b.note, b.state);
      await env.DB.put(`s:${cid}:${s.sid}`, JSON.stringify(s), { metadata: s });
      return json(s, 201);
    }
    if (!ID.test(sid || '')) fail(404, 'not found');
    const session = async () => (await env.DB.get(`s:${cid}:${sid}`, 'json')) || fail(404, 'no such session');
    // GET /c/:cid/s/:sid   the session with its latest turn number
    if (p.length === 4 && m === 'GET') { need(user, cid, 'read'); return json(await session()); }
    // PUT /c/:cid/s/:sid   { status: 'running' | 'finished' }
    if (p.length === 4 && m === 'PUT') {
      need(user, cid, 'player');
      const b = await body(req, 2000), s = await session();
      if (!['running', 'finished'].includes(b.status)) fail(400, "status: 'running' or 'finished'");
      const next = { ...s, status: b.status };
      await env.DB.put(`s:${cid}:${sid}`, JSON.stringify(next), { metadata: next });
      return json(next);
    }
    if (p[4] === 't') {
      // GET /c/:cid/s/:sid/t   the turn list (number, time, who, note), without the states
      if (p.length === 5 && m === 'GET') {
        need(user, cid, 'read');
        return json((await listAll(env, `t:${cid}:${sid}:`)).map(k => k.metadata));
      }
      // POST /c/:cid/s/:sid/t   { base, state, note }   publish the next turn; 409 when base is not the latest turn
      if (p.length === 5 && m === 'POST') {
        need(user, cid, 'player');
        const b = await body(req, MAX_STATE), s = await session();
        if (s.status !== 'running') fail(409, 'session is not running');
        if (b.base !== s.turn) return json({ error: 'stale', turn: s.turn }, 409);
        checkState(b.state);
        const n = s.turn + 1;
        await putTurn(env, cid, sid, n, user, b.note, b.state);
        const next = { ...s, turn: n };
        await env.DB.put(`s:${cid}:${sid}`, JSON.stringify(next), { metadata: next });
        return json({ turn: n }, 201);
      }
      // GET /c/:cid/s/:sid/t/:n   one turn ('latest' for the newest)
      if (p.length === 6 && m === 'GET') {
        need(user, cid, 'read');
        const n = p[5] === 'latest' ? (await session()).turn : Number(p[5]);
        if (!Number.isInteger(n) || n < 0) fail(400, 'turn number');
        return json((await env.DB.get(`t:${cid}:${sid}:${pad(n)}`, 'json')) || fail(404, 'no such turn'));
      }
    }
  }
  fail(404, 'not found');
}

function checkState(state) {
  if (!state || typeof state !== 'object' || typeof state.mapVersion !== 'string') fail(400, 'state: a map state with mapVersion');
}
async function putTurn(env, cid, sid, n, user, note, state) {
  const meta = { n, t: Date.now(), by: byOf(user), note: String(note || '').slice(0, MAX_NOTE) };
  await env.DB.put(`t:${cid}:${sid}:${pad(n)}`, JSON.stringify({ ...meta, state }), { metadata: meta });
}
