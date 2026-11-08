// Campaign storage behind one small interface, so the backend can change (local file now, token-protected server
// later: docs/HANDOVER.md section 14, backend notes) without touching the views.
//
//   store.load()          -> Promise<record | null>
//   store.save(record)    -> Promise<void>
//   store.importFile(file) / store.exportBlob(record) for moving the JSON by hand
import { normalize } from './record.js';

const KEY = 'havenmap.campaign.v1';

export const localStore = {
  async load() {
    try {
      const txt = localStorage.getItem(KEY);
      return txt ? normalize(JSON.parse(txt)) : null;
    } catch { return null; }          // storage blocked or corrupt: behave as empty
  },
  async save(record) {
    try { localStorage.setItem(KEY, JSON.stringify(record)); } catch { /* quota or blocked */ }
  },
  async clear() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
  async importFile(file) {
    return normalize(JSON.parse(await file.text()));
  },
  exportBlob(record) {
    return new Blob([JSON.stringify(record, null, 1)], { type: 'application/json' });
  },
};
