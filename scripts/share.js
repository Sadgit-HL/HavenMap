export function initShare() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.textContent = '…';
    btn.disabled = true;

    let copied = false;
    try {
      const res  = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(location.href)}`);
      const data = await res.json();
      if (data.shorturl) {
        await navigator.clipboard.writeText(`[size=18][url=${data.shorturl}]Map[/url][/size]`);
        btn.textContent = 'Copied!';
        copied = true;
      } else {
        // is.gd rejected the URL (e.g. localhost) — fall back to full URL
        console.warn('is.gd error:', data.description);
      }
    } catch (e) {
      console.warn('Share fetch failed:', e);
    }

    if (!copied) {
      try {
        await navigator.clipboard.writeText(`[size=18][url=${location.href}]Map[/url][/size]`);
        btn.textContent = 'URL copied';
      } catch {
        btn.textContent = 'Failed';
      }
    }

    setTimeout(() => { btn.textContent = 'BGG Code'; btn.disabled = false; }, 2500);
  });
}
