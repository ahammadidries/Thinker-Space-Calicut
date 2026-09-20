// Keep the live site's scripts, styles, images and data sources. Only adapt its
// kiosk-only fullscreen prompt for a screen that already lives inside our room.
export function createLiveDisplayDocument(html, sourceUrl) {
  const base = new URL(sourceUrl).href.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const adapter = `<base href="${base}"><script>
(() => {
  const hideFullscreenPrompt = () => {
    for (const element of document.querySelectorAll('div')) {
      if (element.children.length === 0 && element.textContent.trim() === 'Press any button to enter fullscreen') {
        element.style.setProperty('display', 'none', 'important');
        element.setAttribute('aria-hidden', 'true');
      }
    }
  };
  new MutationObserver(hideFullscreenPrompt).observe(document.documentElement, {
    childList: true, subtree: true, characterData: true
  });
  hideFullscreenPrompt();
})();
</script>`;
  // The source currently has no base element. Replace one if a future release
  // adds it, so relative URLs continue to resolve against the supplied website.
  const page = html.replace(/<base\b[^>]*>/gi, '');
  return /<head\b[^>]*>/i.test(page)
    ? page.replace(/<head\b[^>]*>/i, head => head + adapter)
    : adapter + page;
}

export function liveDisplayPlaceholder(message) {
  return `<!doctype html><html><head><style>body{margin:0;display:grid;place-items:center;height:100vh;background:#f8f9f7;color:#31483e;font:32px system-ui}</style></head><body>${message}</body></html>`;
}
