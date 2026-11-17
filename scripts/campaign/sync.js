// Shared campaign: the connection to the HavenTracker API (server/worker.js, https://api.penultimate.de) and the three-way merge
// that combines the edits of two players. Pure logic and fetch, no DOM; the page (campaign/app.js) does loading, saving and polling.
//
// Joining: an invite link carries the campaign id and a player token in the URL fragment (#join=<cid>.<token>&name=<name>). The page
// stores them in this browser (CONN_KEY) and removes them from the address bar. The token is never sent anywhere but the API.

export const API = 'https://api.penultimate.de';
const CONN_KEY = 'havenmap.campaign.server';          // { cid, token }
const CACHE_KEY = 'havenmap.campaign.server.cache';   // { cid, ver, base, record }: last known server state and local edits

export function loadConn() {
  try { const c = JSON.parse(localStorage.getItem(CONN_KEY) || 'null'); return c && c.cid && c.token ? { cid: c.cid, token: c.token } : null; } catch { return null; }
}
export function saveConn(c) { try { localStorage.setItem(CONN_KEY, JSON.stringify({ cid: c.cid, token: c.token })); } catch { /* blocked */ } }
export function clearConn() { try { localStorage.removeItem(CONN_KEY); localStorage.removeItem(CACHE_KEY); } catch { /* blocked */ } }
export function loadCache(cid) {
  try { const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); return c && c.cid === cid ? c : null; } catch { return null; }
}
export function saveCache(c) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* quota or blocked */ } }

// Invite links: #join=<cid>.<token>&name=<name>
export function parseInvite(hash) {
  const m = /^#join=([a-z0-9-]{3,40})\.([0-9a-f]{32})(?:&name=([^&]*))?$/.exec(hash || '');
  if (!m) return null;
  let name = '';
  try { name = m[3] ? decodeURIComponent(m[3]) : ''; } catch { /* bad encoding: no name */ }
  return { cid: m[1], token: m[2], name };
}
export function inviteUrl(pageUrl, cid, token, name) {
  return `${pageUrl.split('#')[0]}#join=${cid}.${token}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
}

// One API call. Returns { status, data } (data = the parsed JSON, or null); throws only when the server cannot be reached.
export async function api(method, path, token, body, { keepalive = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const r = await fetch(API + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), keepalive, cache: 'no-store' });
  let data = null;
  try { data = await r.json(); } catch { /* no JSON */ }
  return { status: r.status, data };
}

// ---- three-way merge ----------------------------------------------------------------------------------------------
// merge3(base, mine, theirs): base = the last record both sides had, mine = with my edits, theirs = with the other player's edits.
// Objects merge key by key. Arrays of objects with an id (the characters) merge by id. The edit logs (log, evlog) are combined.
// Any other value both sides changed differently is a conflict: theirs is kept and the path is added to `conflicts`.
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export function same(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  const ka = Object.keys(a).filter(k => a[k] !== undefined), kb = Object.keys(b).filter(k => b[k] !== undefined);
  return ka.length === kb.length && ka.every(k => same(a[k], b[k]));
}
const idList = a => Array.isArray(a) && a.every(x => isObj(x) && x.id != null);
const LOGS = new Set(['log', 'evlog']);
const entryKey = e => JSON.stringify(e);

export function merge3(base, mine, theirs, conflicts = [], path = '') {
  if (same(mine, theirs)) return mine;
  if (same(base, mine)) return theirs;
  if (same(base, theirs)) return mine;
  if (path === 'ver' && typeof mine === 'number' && typeof theirs === 'number') return Math.max(mine, theirs);   // the record's edit counter
  if (LOGS.has(path) && Array.isArray(mine) && Array.isArray(theirs)) {               // both added entries: keep all, in time order
    const known = new Set(theirs.map(entryKey)), add = mine.filter(e => !known.has(entryKey(e)));
    return [...theirs, ...add].map((e, i) => [e, i]).sort((x, y) => ((x[0]?.t ?? 0) - (y[0]?.t ?? 0)) || x[1] - y[1]).map(x => x[0]);
  }
  if (isObj(mine) && isObj(theirs)) {
    const b = isObj(base) ? base : {}, out = {};
    for (const k of new Set([...Object.keys(theirs), ...Object.keys(mine)])) {
      const v = merge3(b[k], mine[k], theirs[k], conflicts, path ? `${path}.${k}` : k);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  if (idList(mine) && idList(theirs)) {
    const index = a => new Map((idList(a) ? a : []).map(x => [String(x.id), x]));
    const B = index(base), M = index(mine), T = index(theirs), out = [];
    for (const id of [...T.keys(), ...[...M.keys()].filter(k => !T.has(k))]) {
      const v = merge3(B.get(id), M.get(id), T.get(id), conflicts, `${path}[${id}]`);
      if (v !== undefined) out.push(v);
    }
    return out;
  }
  conflicts.push(path || '(record)');
  return theirs;
}
