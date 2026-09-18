// The review drawing and 3D world read the same plan and furniture coordinates.
export function createFloorPlan(config) {
  const { plan, building: b } = config, scale = 34;
  const X = x => (x + 3.8) * scale, Z = z => (z + 13.5) * scale;
  const rect = (x, z, w, d, fill, stroke = 'none', sw = 1) => `<rect x="${X(x)}" y="${Z(z)}" width="${w * scale}" height="${d * scale}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const line = (a, c, color = '#4c5360', width = 4) => `<path d="M${X(a[0])},${Z(a[1])}L${X(c[0])},${Z(c[1])}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
  const text = (x, z, value, size = 9, color = '#465343') => `<text x="${X(x)}" y="${Z(z)}" text-anchor="middle" fill="${color}" font-size="${size}">${value}</text>`;
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 850" role="img" aria-label="Reconstructed first-floor plan: 5.80 by 14.60 metre workshop, bathroom, Other 1, Other 2, Other 3 and aligned chairs" font-family="Segoe UI,Arial,sans-serif">';
  svg += '<rect width="420" height="850" fill="#f7f6ed"/>';
  const v = b.veranda, s = b.stairs, r = plan.main;
  svg += rect(v.innerX, v.nearZ, v.outerX - v.innerX, v.farZ - v.nearZ, '#e2e7d8', '#a4b191');
  svg += rect(r.minX - .3, r.maxZ, v.innerX - r.minX + .3, v.farZ - r.maxZ, '#e2e7d8');
  svg += rect(r.minX, r.minZ, r.maxX - r.minX, r.maxZ - r.minZ, '#ece1d1');
  for (const room of plan.rooms) svg += rect(room.minX, room.minZ, room.maxX - room.minX, room.maxZ - room.minZ, room.id === 'bathroom' ? '#dbeef2' : room.id === 'entry-landing' ? '#e2e7d8' : '#f3f4ed');
  svg += line([r.minX, r.minZ], [r.maxX, r.minZ]); svg += line([r.minX, r.maxZ], [r.maxX, r.maxZ]);
  for (const [x, openings] of [[r.minX, b.windows], [r.maxX, b.doors]]) {
    let edge = r.minZ;
    for (const o of openings) {
      svg += line([x, edge], [x, o.z - o.width / 2]);
      if (x < 0) svg += line([x, o.z - o.width / 2], [x, o.z + o.width / 2], '#83a8a4', 1.6);
      else {
        for (const side of [-1, 1]) svg += line([x, o.z + side * o.width / 2], [x - o.width / 2, o.z + side * o.width / 2], '#849176', 1);
      }
      edge = o.z + o.width / 2;
    }
    svg += line([x, edge], [x, r.maxZ]);
  }
  for (const wall of plan.annexWalls) svg += line(wall.a, wall.b);
  for (const table of [...config.objects.tables, config.objects.windowDesk, config.objects.workbench]) svg += rect(table.position[0] - table.width / 2, table.position[2] - table.depth / 2, table.width, table.depth, '#c9ad83', '#ac916b');
  for (const [item, width, depth] of [[config.objects.shelf, .48, 1.4], [config.objects.windowCabinet, .55, 1.5]]) svg += rect(item.position[0] - width / 2, item.position[2] - depth / 2, width, depth, '#bea67d', '#907950');
  for (const p of config.objects.printers) svg += rect(p.position[0] - .23, p.position[2] - .23, .46, .46, '#53645b', '#edf0dd');
  svg += rect(config.objects.display.position[0] - .83, r.minZ + .07, 1.66, .075, '#253f31');
  for (const chair of config.chairs) {
    const x = X(chair.position[0]), y = Z(chair.position[2]);
    svg += `<g transform="translate(${x},${y}) rotate(${-chair.rotationY * 180 / Math.PI})"><rect x="-8.3" y="-7.8" width="16.6" height="15.6" rx="1.8" fill="#647963" stroke="#f0f3e8" stroke-width=".7"/><path d="M-9.4 2v8h18.8V2" stroke="#344b3b" fill="none" stroke-width="2"/></g>`;
  }
  for (const fixture of plan.fixtures) {
    const [x, , z] = fixture.position;
    if (fixture.kind === 'toilet') svg += `<ellipse cx="${X(x)}" cy="${Z(z)}" rx="7" ry="8.6" fill="#fff" stroke="#92a5a8"/>` + rect(x - .2, z + .17, .4, .15, '#fff', '#92a5a8');
    else svg += rect(x - (fixture.width || .58) / 2, z - (fixture.depth || .42) / 2, fixture.width || .58, fixture.depth || .42, fixture.kind === 'counter' ? '#c9ad83' : '#fff', '#92a5a8');
  }
  for (const room of plan.rooms) {
    const x = (room.minX + room.maxX) / 2, z = (room.minZ + room.maxZ) / 2;
    if (room.id === 'entry-landing') { svg += text(x, z + .1, 'LANDING', 8); continue; }
    const labelZ = room.id.startsWith('other-') && room.id !== 'other-1' ? z + .5 : z - .08;
    svg += text(x, labelZ, room.label, 9) + text(x, labelZ + .32, `${room.statedArea} m²`, 8);
  }
  svg += text(0, -5.78, 'WORKSHOP', 10) + text(0, -5.44, '81 m² · plan label', 8);
  svg += text(.3, 6.34, 'PRINTER WORKBENCH', 7);
  svg += rect(s.minX, s.topZ, s.maxX - s.minX, s.bottomZ - s.topZ, '#c1cbb3', '#849476');
  for (let i = 1; i < s.steps; i++) svg += line([s.minX, s.topZ + i * (s.bottomZ - s.topZ) / s.steps], [s.maxX, s.topZ + i * (s.bottomZ - s.topZ) / s.steps], '#879778', .6);
  svg += `<path d="M${X((s.minX + s.maxX) / 2)},${Z(s.topZ + .45)}v${(s.bottomZ - s.topZ - .9) * scale}l-4 -7m4 7l4 -7" fill="none" stroke="#f6f8e9" stroke-width="1.5"/>`;
  svg += `<text x="${X(3.75)}" y="${Z(.1)}" transform="rotate(90 ${X(3.75)} ${Z(.1)})" text-anchor="middle" font-size="9" letter-spacing="2" fill="#6c7f5d">VERANDA</text>`;
  const horizontalDimension = (x1, x2, z, label) => line([x1, z], [x2, z], '#7d8478', .6) + line([x1, z - .08], [x1, z + .08], '#7d8478', .6) + line([x2, z - .08], [x2, z + .08], '#7d8478', .6) + text((x1 + x2) / 2, z - .12, label, 8);
  svg += horizontalDimension(-2.77, -.56, -13, '2.21 m') + horizontalDimension(-.56, 1.57, -13, '2.13 m');
  svg += horizontalDimension(-.56, 2.9, -7.54, '3.46 m') + horizontalDimension(-2.9, 2.9, 8.08, '5.80 m');
  svg += line([-3.38, -7.3], [-3.38, 7.3], '#7d8478', .6) + `<text transform="translate(${X(-3.52)},${Z(0)}) rotate(-90)" text-anchor="middle" font-size="8" fill="#697660">14.60 m · right-side dimension</text>`;
  svg += '<circle id="map-marker" r="4.5" cx="390" cy="820" fill="#406a40" stroke="white" stroke-width="1.5"/>';
  svg += '<text x="210" y="814" text-anchor="middle" font-size="8" fill="#6e7e65">FIRST FLOOR · CHAIRS ALIGNED TO TABLES</text><text x="210" y="831" text-anchor="middle" font-size="7" fill="#8a9682">Veranda and stairs remain photo-based; omitted from source plan.</text></svg>';
  return { svg, X, Z };
}
