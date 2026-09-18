import * as THREE from 'three';

function texture(draw, size = 512) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  draw(canvas.getContext('2d'), size);
  const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
export function seededRandom(seed = 21) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
export function createMaterials() {
  const rng = seededRandom();
  const woodMap = texture((c, s) => {
    c.fillStyle = '#c89b5c'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 1400; i++) { const y = rng() * s; c.strokeStyle = `rgba(${rng() > .5 ? '100,62,27' : '255,228,177'},${rng() * .22})`; c.lineWidth = rng() * 2 + .2; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(150, y + rng() * 8, 340, y - rng() * 8, s, y); c.stroke(); }
    for (let i = 0; i < 8; i++) { c.fillStyle = '#75533344'; c.fillRect(0, i * 64, s, 1); }
  });
  const floorMap = texture((c, s) => {
    c.fillStyle = '#c9c4b1'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 18000; i++) { c.fillStyle = rng() > .5 ? '#ffffff0b' : '#6556450c'; c.fillRect(rng() * s, rng() * s, 2, 2); }
    c.strokeStyle = '#8d8776'; c.lineWidth = 3; c.strokeRect(0, 0, s, s);
  }); floorMap.repeat.set(5.8 / .6, 14.6 / .6);
  const annexMap = floorMap.clone(); annexMap.repeat.set(4, 3);
  const roofMap = texture((c, s) => {
    c.fillStyle = '#a96644'; c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 128) for (let x = 0; x < s; x += 64) {
      const grad = c.createLinearGradient(x, 0, x + 64, 0); grad.addColorStop(0, '#603a2c'); grad.addColorStop(.18, '#a8694a'); grad.addColorStop(.58, '#c0805b'); grad.addColorStop(.85, '#a05e42'); grad.addColorStop(1, '#6b3e2e'); c.fillStyle = grad; c.fillRect(x, y, 64, 128);
      c.fillStyle = '#49332999'; c.fillRect(x, y, 64, 5); c.fillStyle = '#e5b48555'; c.fillRect(x + 6, y + 8, 49, 2);
    }
    for (let i = 0; i < 9000; i++) { c.fillStyle = '#34251c12'; c.fillRect(rng() * s, rng() * s, 2, 3); }
  });
  const pathMap = texture((c, s) => { c.fillStyle = '#b8a187'; c.fillRect(0, 0, s, s); for (let i = 0; i < 26000; i++) { c.fillStyle = ['#55473755', '#fff2d533', '#9d776c77'][i % 3]; c.fillRect(rng() * s, rng() * s, 1.5, 1.5); } });
  const meshMap = texture((c, s) => { c.fillStyle = '#202622'; c.fillRect(0, 0, s, s); c.fillStyle = '#8e9790'; for (let y = 4; y < s; y += 12) for (let x = 4; x < s; x += 12) c.fillRect(x, y, 4, 4); });
  const leafMap = texture((c, s) => {
    for (let i = 0; i < 780; i++) {
      const angle = rng() * Math.PI * 2, radius = Math.sqrt(rng()) * s * .44;
      const x = s / 2 + Math.cos(angle) * radius, y = s / 2 + Math.sin(angle) * radius * .86;
      const shade = 42 + Math.floor(rng() * 34); c.fillStyle = `hsl(${80 + rng() * 35} 32% ${shade}%)`;
      c.beginPath(); c.ellipse(x, y, 4 + rng() * 9, 2 + rng() * 4, rng() * 6, 0, Math.PI * 2); c.fill();
    }
  });
  const mat = (color, extras = {}) => new THREE.MeshStandardMaterial({ color, roughness: .78, ...extras });
  return {
    wall: mat('#d1cdbc'), darkWall: mat('#7b8370'), wood: mat('#ffffff', { map: woodMap, roughness: .48 }),
    floor: mat('#ffffff', { map: floorMap, roughness: .5 }), annexFloor: mat('#eeeade', { map: annexMap, roughness: .5 }), bathroomFloor: mat('#cce0df', { map: annexMap, roughness: .45 }), veranda: mat('#424c43', { roughness: .36 }),
    steel: mat('#242b27', { metalness: .55, roughness: .44 }), black: mat('#222723'), mesh: mat('#ffffff', { map: meshMap }),
    roof: mat('#ffffff', { map: roofMap, side: THREE.DoubleSide, roughness: .9 }),
    concrete: mat('#bab39d'), white: mat('#f1eee2', { roughness: .5 }), silver: mat('#9ba5a0', { metalness: .7, roughness: .3 }),
    glass: mat('#aec9b9', { transparent: true, opacity: .16, roughness: .13, metalness: .1, depthWrite: false }),
    path: mat('#ffffff', { map: pathMap }), curb: mat('#a9573e'), soil: mat('#657345'),
    leaf: mat('#ffffff', { map: leafMap, alphaTest: .45, side: THREE.DoubleSide }), trunk: mat('#675b41'), moss: mat('#788a48'),
    led: new THREE.MeshBasicMaterial({ color: '#edffe1' }), indicator: new THREE.MeshBasicMaterial({ color: '#b2ef65' }),
    rubber: mat('#171d1c'), blue: mat('#5292b2'), red: mat('#bc6251'), paper: mat('#e7e4d1'),
  };
}

export function makeDisplayTexture() {
  return texture((c, s) => {
    c.fillStyle = '#172d26'; c.fillRect(0, 0, s, s);
    c.fillStyle = '#c5ed93'; c.font = '20px sans-serif'; c.fillText('TINKERSPACE  /  CALICUT', 34, 52);
    c.fillStyle = '#f1f4df'; c.font = 'bold 61px sans-serif'; c.fillText('Make room', 32, 155); c.fillText('for ideas.', 32, 221);
    c.strokeStyle = '#608b69'; c.lineWidth = 2;
    for (let i = 0; i < 5; i++) { c.strokeRect(34 + i * 7, 280 + i * 7, 160, 130); }
    c.fillStyle = '#c5ed93'; c.font = '18px sans-serif'; c.fillText('EXPLORE · MAKE · CONNECT', 34, 465);
  });
}

export function makeTinkerspaceBoardTexture() {
  const rng = seededRandom(86);
  return texture((c, s) => {
    c.fillStyle = '#b97945'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 2700; i++) {
      const x = rng() * s, y = rng() * s, w = 3 + rng() * 27, h = 1 + rng() * 6;
      c.save(); c.translate(x, y); c.rotate((rng() - .5) * 1.7);
      c.fillStyle = ['#6e381d66', '#e6b37880', '#80442166', '#f1c68a55'][i % 4]; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
    }
    c.fillStyle = '#29251f'; c.font = '700 48px Arial, sans-serif'; c.textAlign = 'center';
    c.fillText('TINKERSPACE', s / 2, s * .72);
    c.font = '700 56px Arial, sans-serif'; c.fillText('CALICUT', s / 2, s * .84);
  });
}
