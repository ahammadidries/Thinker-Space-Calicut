# Tinkerspace Calicut — corrected first-floor reconstruction

## Source priority

The user-supplied first-floor plan (WhatsApp Image 2026-09-16 at 3.41.14 PM.jpeg) takes precedence for first-floor geometry and furniture zones. It replaces the earlier provisional service block and wider workshop interpretation. The source is copied to first-floor-source.jpeg in this directory.

All 20 original photographs and nine distributed frames from each of five videos were compared in the initial reconstruction. They remain useful for materials, wall-mounted equipment, opposite viewpoints and the veranda/stair connection. Photo IDs P1–P20 follow attachment order; video IDs and durations are in videos.json. People are excluded.

## Coordinates and dimensions

World +X points toward the veranda/right side of the plan; -X toward the windows. -Z points up the plan toward the display and annex; +Z toward the printer bench. Y is vertical. These are local directions, not compass bearings.

The main workshop is the plan's 81 m² space labelled Dining Room. Its rectangular footprint uses width 5.80 m and the right-side length 14.60 m. The source also labels the left side 14.46 m. That discrepancy is recorded rather than represented as a fictitious angled wall. Area labels are retained as source annotations, not claimed as recalculated surveyed areas.

The annex follows the stepped outline: Other 3 and Other 2 above Other 1, with the bathroom below Other 1 on the left and an open connecting landing on the right. The two upper widths are 2.21 m and 2.13 m. The overall annex projection is 5.36 m; the source labels the right-hand projection 3.53 m, compared with the traced 3.50 m. The main wall return to the right of the bathroom is 3.46 m. Unlabelled wall offsets, thicknesses, doorway widths and fixture dimensions are estimates from the raster image.

The workshop has two entrances in the right long wall and three window groups in the left long wall, positioned from the plan. The annex is reached from the veranda via the landing and common area. Its upper rooms and bathroom have real wall gaps and connected floor surfaces; there is no invented opening through the workshop's display wall.

## One physical location

P1–P3 look toward the display and P4 looks back toward the printer bench. Windows swap apparent sides because the viewpoint reverses. There is one workshop, one display and one printer bench. P6/P7 identify the display-end door; P18/P19 and V4 link the shelf, network cabinet, two printers and the other entrance to the same printer end.

P10–P12/P17 show the same stair opening from opposite directions. V3 follows the lower approach up that flight; V5 approaches the upper grade and looks along the same veranda. The walkway bypasses one straight staircase. P13/P14 and V2/V3 show lower parking; P8/P9 and V5 show the uphill access.

The new plan defines the annex layout more clearly than the earlier V1 interpretation. Veranda width, stair rise/run, floor elevation, roof profile and terrain remain photo-based estimates because they are outside or unmeasured in this plan. No unseen lower-floor rooms are reconstructed.

## Furniture and object ledger

| Group | Representation | Placement basis |
|---|---|---|
| Main tables | Three transverse groups | Plan zones and proportions |
| Window furniture | One long narrow bench and one smaller end table | Plan |
| Workshop chairs | 25 seats | Plan seat zones, straightened and spaced |
| Annex chairs | Three seats, one in Other 3 and two in Other 2 | Plan |
| Veranda chairs | Three distinct representative seats | P15 and overlapping veranda views |
| Display | One, centred on the upper workshop short wall | P1–P3/P6; plan wall |
| Printer bench | One, lower workshop short wall | P4/P18/P19 and plan |
| 3D printers | Two on the same bench | P19 shows both together; P18 repeats the larger one |
| Tall shelf | One at the printer end, right wall | P4/P18 and plan; clear of entrance |
| Network cabinet | One above the printer/shelf corner | P18/P19 |
| Window cabinet | One at the display-end window group | P5/V5 and plan |
| Fans | Three per long wall | Original photos; longitudinal spacing estimated |
| Speakers | Two per long wall | Original photos; spacing estimated |
| Sign and extra chair stacks/cameras | Unplaced and disabled | Insufficient confirmed position/count |

Each represented object has a stable ID independent of its source photographs. The scene has 31 chairs in total and 59 registered interactables.

Chairs assigned to tables are generated from table edges and seat counts. They face the tabletop, have parallel backs and evenly spaced centres. Loose seats remain in the plan's zones but are straightened. Wall, tabletop, adjacent-seat and door-swing clearances are checked. Initial alignment can be restored using the visit reset after moving chairs interactively.

## Editable files and review

- src/config/first-floor-plan.js: plan dimensions, room rectangles, walls, openings, fixtures and dimension-discrepancy notes.
- src/config/scene-config.js: object IDs, transforms, table seat rules, external geometry estimates and unresolved objects.
- src/ui/FloorPlan.js: review drawing generated from the same coordinates as the 3D scene.
- reference-analysis/first-floor-reconstruction.svg: standalone drawing of the current reconstruction.
- reference-analysis/first-floor-source.jpeg: supplied plan for direct comparison.
- artifacts/first-floor-overhead.png: local rendered 3D cutaway, generated by tools/capture-plan.cjs.

The model uses procedural geometry and materials. It is a plan-guided interactive reconstruction, not photogrammetry. Exact equipment transforms and unmeasured dimensions remain editable; unresolved objects retain null positions and are disabled instead of receiving invented definitive placements.
