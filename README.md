# Tinkerspace Calicut — first playable reconstruction

A single connected Three.js environment using the PDF workshop and covered-space dimensions, the restored earlier annex layout, annotated furniture references, 20 photographs and five videos. Explore the hillside approaches, covered lobby, veranda, staircase, workshop, bathroom and adjoining rooms. Live active users now appear as generic office avatars with their names; their movement is simulated.

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

The 70 registered interactive objects include doors, tables, 42 individual chairs, two printers, fans, speakers, a display, lights, a switched outlet, network cabinet, shelf, three-door cabinet table and entrance sign. A separate permanent Space Host adds the 71st interaction when his model loads. The three shared tables are aligned and each seats eight people, four on each long side. The electronics display and small tool cluster have been removed from the printer bench at the owner's request. Doors and cabinet panels stop moving when their swing would intersect the visitor. Chair movements stay on the floor, avoid colliders and remain within 0.9 m of their initial position. Fans and printer components animate. Speakers have simulated power states without audio.

The exterior roads follow the owner's confirmed sketch orientation: a broad road at the printer/balcony end, a curved road along the veranda, and a short upper branch to the first-floor lobby. The existing lower stair access remains connected. Roads share their sampled layout with the reference drawing and collision surfaces; tree placement excludes their footprints. Road widths and curves are indicative because the sketch has no survey dimensions. `node tools/create-site-reference.mjs` regenerates the SVG references in `public/reference`; `node tools/check-site-reference.cjs` exports PNGs and checks live seating, clear aisles and roads. The floor-plan dialog links to the combined reference image.

The workshop TV embeds [the live Tinkerspace Calicut website](https://jasimcm.github.io/tinkerspace_digital_calicut/) directly. Its clock and data run inside the actual page. Every 60 seconds the app checks the source HTML and reloads only when a new version is available. Internet access is required for the TV. Configure `objects.display.url` and `refreshIntervalMs` in `src/config/scene-config.js`. Press E while facing the TV, then click its startup prompt; R switches power. The page may request another startup click following a website deployment. A CSS3D page behind a depth-tested WebGL screen keeps walls and furniture in front of the TV.

## Reference consistency and editing

### Permanent Space Host

Jasim, the permanent Space Host, stands beside and slightly in front of the TV at `[1.43, 3.75, -6.32]`. His position and collision footprint leave the screen and glass-door swing clear. He is independent of live presence: no API record, seat reservation, walking route or departure event controls him. Approach and aim at him, then press **E** or click to start a conversation. The generated nameplate reads `Jasim` with `SPACE HOST` below, alongside the separate speech-icon `Talk to me` indicator. All labels are depth-tested runtime billboards, outside the character asset.

`public/models/space-host.glb` is an original stylized approximation informed by the supplied front/profile/body photos, with short textured black hair, eyebrows, modeled facial features, subtle beard tint, forest-green button-up shirt, charcoal trousers, sneakers and a watch. It uses 18,424 triangles, a 19-bone humanoid rig, 12 PBR materials, UVs and blended elbow/knee/torso weights. The self-contained binary is about 1.71 MB and has no texture dependencies or baked labels. `HostShirt` is independently editable. See `public/models/README.md` for loader/recolor examples.

Nine exported clips are `Idle`, `Breathing`, `Greeting`, `Talking`, `HeadTurn`, `LookAtVisitor`, `HandGesture`, `TurnLeft` and `TurnRight`. All retain a fixed root and planted feet; turns rotate the upper body in place. The runtime blends gestures, greets nearby visitors with a cooldown and gently tracks their gaze. It reduces motion when the visitor's system requests it. This is a standing host, not a walking or seated avatar.

`src/config/host-config.js` owns placement, shirt color and the name/role labels. `src/host/host-knowledge.js` maintains short conversational answers, source links and suggested follow-ups. `HostConversation.js` matches typed questions and paraphrases to these topics, remembers context for follow-ups (for example, printing → “Is it free?”), and varies repeated replies. The six starter topics are the space, fees, beginners, activities, location and events. Chat history is limited to 41 message bubbles in memory for this visit; it is neither transmitted nor persisted. Start over clears the conversation.

This is a local, curated conversation engine, not a general-purpose language model or live event-calendar service. Unknown questions receive an honest fallback. Dates, access hours and equipment/material costs are not invented; event answers link to current TinkerHub listings and direct the visitor to the Calicut venue. Verified public sources and the owner's supplied address/copy are recorded in `reference-analysis/HOST-KNOWLEDGE.md`. Dialog controls support keyboard focus containment, Enter to send, Escape, safe plain-text rendering, responsive layout and returning to exploration without the pause panel covering the conversation.

Rebuild with `node tools/export-host.mjs`. `/tools/host-preview.html` on the dev server shows front, three-quarter, profile and face detail. `node tools/review-host.cjs` captures idle/greeting/talking review sheets; `node tools/check-host.cjs` checks empty-roster persistence, placement, recoloring, four minutes of fixed position, Jasim's labels, raycast selection, all six typed questions, follow-up context, links, safe input, mobile layout, focus and return to exploration. Its TV response is mocked to keep the test deterministic. Unit checks validate the conversation router plus GLB loading, normalized skin weights, UVs, materials, clip binding and planted feet.

### Live makers

The reusable asset is `public/models/office-avatar.glb` (about 425 KB, 4,464 triangles, 19 bones, seven PBR materials). It contains `Idle`, `Walk`, `Sit`, `SittingIdle` and `GetUp` clips, driven by `THREE.AnimationMixer`. Geometry is shared between instances; skeletons and the `AvatarShirt` material are independent. Skin, hair, trousers, shoes and badge keep their original colors. Personal names are drawn on separate camera-facing nameplates, never exported in the GLB.

`src/config/avatar-config.js` controls the API URL, 20-second polling, colors, navigation and timing. A person is deduplicated by `membershipId` (with `mid`/`id` fallbacks); shirts use a deterministic ID hash. The active endpoint is authoritative for presence. Successful departures remove the avatar, collider and chair reservation. Errors retain the last known roster, turn status dots amber and retry. No avatar photos, credentials or personal data are stored in model files.

Most users begin seated and remain there for 120–240 seconds. Short walking breaks use collision-checked first-floor paths, followed by another seat. Chairs are reserved exclusively and cannot be moved while occupied/reserved. The roster provides no measured positions, so the UI explicitly labels motion as simulated. Standing visitors wait when seats or paths are unavailable; if the floor has no safe spawn space, remaining users wait for space and are retried at the next poll.

Rebuild the asset with `node tools/export-avatar.mjs`. The manifest alongside the GLB lists meshes, materials, bones and clips. Open `/tools/avatar-preview.html` on the dev server to review standing, walking and seated poses. `tools/check-avatars.cjs` tests a 14-person simulation; `tools/check-live-presence.cjs` checks the live API and failure/recovery behavior. Both use this workstation's bundled Playwright paths.

Read **`reference-analysis/SPATIAL-MAP.md`** for the viewpoint alignment, physical-object ledger, evidence and limits. **`src/config/first-floor-plan.js`** defines the corrected plan dimensions, partitions, openings and fixtures. **`src/config/scene-config.js`** defines furniture and scene placement. The in-app map and **`reference-analysis/first-floor-reconstruction.svg`** use these same coordinates.

- Local **-Z** is the display/uphill end; **+Z** is the printer/downhill end; **+X** is the veranda. These are not compass directions.
- One workshop is viewed in opposite directions. There is one display, one printer bench, two distinct printers, one tall shelf and one network cabinet.
- Both doors share the veranda-side wall. The shelf adjoins the printer door and terminates the workbench; it does not occupy the opening. Glass doors swing into the workshop, matching the close-ups.
- Every represented physical object has a stable ID. Repeated photographs do not create additional objects.
- Objects without a defensible placement are listed in `unplacedObjects` with `enabled: false` and `position: null`. Extra chair stacks and additional cameras are deliberately unresolved. The entrance sign is mounted on the large annex wall facing the covered lobby, as marked by the owner.
- The red-marked furniture in the later TINKERSPACE.pdf is represented by the existing window-side cabinet table, now with a continuous worktop and three opening doors. The separate printer bench retains its two printers at the opposite end.

Transforms are in metres with Y up; rotations use radians. The end of `scene-config.js` re-anchors photo-derived furniture centres from the previous room proportions to the PDF shell, retains physical furniture sizes and regenerates table-chair alignment. Edit that conversion and its explicit overrides when changing placement. Rendered coordinates, map drawing and collision geometry share the resulting configuration. `first-floor-plan.js` owns the clear room dimensions and floor rectangles.

The PDF controls the workshop (14.435 × 5.406 m clear), covered balcony (2.33 × 5.65 m), covered lobby (5.43 × 5.17 m) and finished floor (+3.75 m). At the user's correction, the bathroom, Other 1/2/3, connecting landing and fixtures return to the earlier screenshot layout. This annex is translated 0.1175 m to meet the current workshop wall; the PDF green-room and toilet dimensions do not apply to it. The stair has 11 lower treads, broad landing 12 and 13 upper treads, following the PDF's 25 drawn positions. Its unlabelled run, width and landing depth are configurable estimates. The three-door cabinet table, printer bench and aligned seating remain photo-led furniture. Roof height/pitch and terrain remain photographic estimates. Unseen lower-floor interiors are not invented.

## Code layout

```text
src/config/          Scene dimensions, object IDs/transforms, uncertainty
src/world/           Building, roof, grounds, materials, interior assembly
src/objects/         Furniture models and animated door component
src/host/            Reference-informed host asset, animation controller and FAQ
src/avatars/         Shared visitor asset, presence polling and movement
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
