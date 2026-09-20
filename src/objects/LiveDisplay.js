import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { createLiveDisplayDocument, liveDisplayPlaceholder } from './live-display-page.js';

// A real browser page, positioned behind a depth-tested opening in the WebGL TV.
// Walls and furniture still occlude it; no screenshots or copied website data.
export function makeLiveDisplay(parent, config) {
  const frame = document.createElement('iframe');
  frame.id = 'workshop-live-tv';
  frame.title = 'Tinkerspace Calicut live display';
  frame.dataset.sourceUrl = config.url;
  frame.srcdoc = liveDisplayPlaceholder('Loading live display…');
  frame.tabIndex = -1;
  // srcdoc must remain an opaque origin: the remote page may run its own code,
  // but cannot access the office DOM, storage or fullscreen controls.
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('allow', "fullscreen 'none'");
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  Object.assign(frame.style, { width: '1920px', height: '1080px', border: '0', background: '#fafafa' });
  const page = new CSS3DObject(frame);
  page.name = 'live-tv-page';
  page.scale.setScalar(1.6 / 1920);
  page.position.z = .05;
  frame.style.pointerEvents = 'none';
  parent.add(page);

  const aperture = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .9), new THREE.MeshBasicMaterial({
    color: 0x000000, opacity: 0, blending: THREE.NoBlending,
  }));
  aperture.name = 'live-tv-screen';
  aperture.position.z = .05;
  parent.add(aperture);
  let powered = true, lastRefresh = 0, checking = false, version = null;
  const checkForUpdate = async () => {
    checking = true;
    lastRefresh = Date.now();
    try {
      const url = new URL(config.url);
      url.searchParams.set('_tv_check', lastRefresh.toString());
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Live display HTTP ${response.status}`);
      const html = await response.text();
      // The source polls its live data itself. Only replace its document when
      // the deployment changes; every replacement gets the same TV adaptation.
      if (version !== html) {
        frame.srcdoc = createLiveDisplayDocument(html, config.url);
      }
      version = html;
    } catch {
      // Retain a running page during an outage. Initial failures retry on the
      // normal update interval, while E still offers the original website link.
      if (version === null) frame.srcdoc = liveDisplayPlaceholder('Live display unavailable. Retrying…');
    }
    finally { checking = false; }
  };
  return {
    setPowered(on) {
      powered = on;
      page.visible = on;
      aperture.material.opacity = on ? 0 : 1;
    },
    update() {
      if (powered && !checking && !document.hidden && Date.now() - lastRefresh >= config.refreshIntervalMs) checkForUpdate();
    },
  };
}
