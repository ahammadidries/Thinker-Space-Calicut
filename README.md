# Tinkerspace Calicut — first playable reconstruction

A single connected Three.js environment based on the supplied first-floor plan, 20 photographs and five videos. Explore the hillside approaches, upper veranda, straight staircase, workshop, bathroom and three upper rooms. All people are excluded.

## Run

Install Node.js **22.12 or newer**, then run from this folder:

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5186** in a desktop browser. Click **Enter the building**. The native Vite config loader avoids dependency scanning issues in restricted Windows folders. The project uses local procedural materials, so it does not need image CDNs or the original Downloads files at runtime.

```sh
npm run build
npm run preview
```

The production output is `dist/`. Serve that directory with any static HTTP host. Do not double-click `index.html` using a `file://` URL. The project has not been deployed publicly.

## Explore

| Input | Action |
|---|---|
| WASD / arrows | Move |
| Mouse | Look |
| E | Use highlighted object |
| R | Rotate highlighted chair |
| Shift | Sprint |
| Space | Jump |
| M | Schematic floor plan |
| Escape | Release mouse and pause |

If pointer lock is unavailable, hold the left mouse button and drag to look. The pause menu offers location shortcuts, quality settings and a visit reset. These shortcuts change the viewpoint inside the same scene. Interactions affect this visit only; they do not operate real equipment or persist changes to disk.

The 59 registered interactive objects include doors, tables, 31 individual chairs, two printers, fans, speakers, a display, lights, a switched outlet, network cabinet, shelf, cabinet and bench tools. Doors and cabinet panels stop moving when their swing would intersect the visitor. Chair movements stay on the floor, avoid colliders and remain within 0.9 m of their initial position. Fans and printer components animate. Speakers have simulated power states without audio.

## Reference consistency and editing

Read **`reference-analysis/SPATIAL-MAP.md`** for the viewpoint alignment, physical-object ledger, evidence and limits. **`src/config/first-floor-plan.js`** defines the corrected plan dimensions, partitions, openings and fixtures. **`src/config/scene-config.js`** defines furniture and scene placement. The in-app map and **`reference-analysis/first-floor-reconstruction.svg`** use these same coordinates.

- Local **-Z** is the display/uphill end; **+Z** is the printer/downhill end; **+X** is the veranda. These are not compass directions.
- One workshop is viewed in opposite directions. There is one display, one printer bench, two distinct printers, one tall shelf and one network cabinet.
- Both doors share the veranda-side wall. The shelf adjoins the printer door and terminates the workbench; it does not occupy the opening. Glass doors swing into the workshop, matching the close-ups.
- Every represented physical object has a stable ID. Repeated photographs do not create additional objects.
- Objects without a defensible placement are listed in `unplacedObjects` with `enabled: false` and `position: null`. Extra chair stacks, the sign and additional cameras are deliberately unresolved.

Transforms are in metres with Y up; rotations use radians. Positions are **absolute world coordinates**. Edit object `position`, `rotationY`, table dimensions, door openings, window bays, staircase dimensions, roof parameters and player settings there. When changing room dimensions or floor elevation, adjust the absolute furniture and opening coordinates with them. Primary shell/collision dimensions are driven by configuration; finer trims, utility fixtures and landscaping remain procedural approximations in the world modules.

The supplied plan takes precedence for the first-floor layout. The workshop uses its 5.80 m width and 14.60 m right-side length; the conflicting 14.46 m left-side label is recorded in the plan configuration. Three main table groups and the long window bench follow the plan, with chairs straightened into evenly spaced rows facing their tables. The bathroom and Other 1, Other 2 and Other 3 retain their separate connected footprints. Small offsets and unlabelled dimensions are estimated from the raster plan. Roof height/pitch, veranda/stair dimensions and terrain remain photo-based estimates. The lower building is represented by its observed exterior mass; unseen rooms are not invented. Tree planting is environmental context, not a survey of individual trees. Inspecting network or electrical equipment shows simulated states.

## Code layout

```text
src/config/          Scene dimensions, object IDs/transforms, uncertainty
src/world/           Building, roof, grounds, materials, interior assembly
src/objects/         Furniture models and animated door component
src/game/            Player, collisions and shared raycast interactions
src/ui/              Interface and schematic map
reference-analysis/  Evidence notes and source-video metadata
tests/               Spatial and collision regressions
tools/               Local reference extraction and browser checks
```

Static meshes are merged by material, foliage is instanced, textures are small canvas-generated maps, and furniture has simple collision bounds. Quality settings reduce pixel density and disable shadows. Real GPU frame rate varies; the headless test is not a hardware performance benchmark.

## Verification

```sh
npm test
npm run build
```

Spatial checks cover plan dimensions, annex partitions and openings, chair alignment and clearances, unique objects and stairs. Browser route checks cover entry/pause, both doorways, the workshop aisle, all four annex spaces, the veranda bypass, climbing/descending the full stair flight, jumping/gravity, wall occlusion of raycasts, device toggles, moving printer parts and constrained chairs. Visual captures cover both workshop directions, the annex, veranda, stairs, entry, landing screen and corrected map. Local reports are in the ignored `artifacts/` folder.

The optional `tools/browser-smoke.cjs`, `tools/test-playability.cjs` and `tools/extract-references.cjs` currently use this workstation's bundled Playwright and Chrome paths; update those paths to run them elsewhere. The reference extraction tool reads original local MP4 files and generates analysis frames, not runtime assets.

Implementation references: [Three.js documentation](https://threejs.org/docs/) and [Vite guide](https://vite.dev/guide/).
