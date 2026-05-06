import { compressedStateUrl } from './state.js';

const SHARE_MODE_KEY = 'havenmap.shareMode';
export const SHARE_MODES = {
  ISGD: 'isgd',
  LZ: 'lz',
};

export function getShareMode() {
  return localStorage.getItem(SHARE_MODE_KEY) || SHARE_MODES.ISGD;
}

export function setShareMode(mode) {
  const next = Object.values(SHARE_MODES).includes(mode) ? mode : SHARE_MODES.ISGD;
  localStorage.setItem(SHARE_MODE_KEY, next);
}

function bggCode(url) {
  return `[size=18][url=${url}]Map[/url][/size]`;
}

async function copyBggUrl(url) {
  await navigator.clipboard.writeText(bggCode(url));
}

async function createIsgdUrl(url) {
  const res  = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
  const data = await res.json();
  if (!data.shorturl) throw new Error(data.description || 'is.gd did not return a short URL');
  return data.shorturl;
}

export function initShare() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.textContent = '…';
    btn.disabled = true;

    let copied = false;
    try {
      if (getShareMode() === SHARE_MODES.LZ) {
        await copyBggUrl(compressedStateUrl());
        btn.textContent = 'Copied!';
        copied = true;
      } else {
        const shortUrl = await createIsgdUrl(location.href);
        await copyBggUrl(shortUrl);
        btn.textContent = 'Copied!';
        copied = true;
      }
    } catch (e) {
      console.warn('Share failed:', e);
    }

    if (!copied) {
      try {
        await copyBggUrl(compressedStateUrl());
        btn.textContent = 'URL copied';
      } catch {
        btn.textContent = 'Failed';
      }
    }

    setTimeout(() => { btn.textContent = 'BGG Code'; btn.disabled = false; }, 2500);
  });
}
