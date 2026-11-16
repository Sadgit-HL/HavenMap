// The one place that turns an image address into a file under images/. The address is what the code used before the
// images were reorganised: a repo path such as 'images/common/elements/air.png', or a remote address such as the
// Wordhaven_Assets URLs. The extension does not matter. The table is generated (scripts/images-index.js).
import { IMAGE_INDEX } from './images-index.js';

const plain = key => {
  let s = String(key ?? '');
  try { s = decodeURIComponent(s); } catch { /* keep as it is */ }
  return s.replace(/^(\.\.\/)+/, '').replace(/\.[A-Za-z0-9]+$/, '');
};

// The file under images/ for an address, relative to the page that loads this module's caller, or null when the address
// is not known. prefix is '../' from a page one folder down (campaign/), '' from the root.
export function imageFile(key, prefix = '') {
  const file = IMAGE_INDEX[plain(key)];
  return file ? prefix + 'images/' + file : null;
}

// Same, for code that runs in a module (no page prefix): the path relative to this module's folder.
export const imageUrlFrom = (key, base) => {
  const file = IMAGE_INDEX[plain(key)];
  return file ? new URL('images/' + file, base).href : null;
};

// Same, for a module that lives in a sub-folder: rootHref is the URL of the HavenMap root (new URL('../../', import.meta.url)).
export const imageHref = (key, rootHref) => {
  const file = IMAGE_INDEX[plain(key)];
  return file ? rootHref + 'images/' + file : null;
};
