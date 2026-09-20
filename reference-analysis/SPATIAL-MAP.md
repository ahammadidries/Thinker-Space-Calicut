# Tinkerspace: PDF dimensions with restored annex

The PDF remains authoritative for workshop, balcony, lobby and floor height. The user's later screenshot correction explicitly restores the earlier bathroom and adjoining-room layout. Its wall segments, openings, fixtures and room proportions are reinstated, translated 0.1175 m toward -Z to join the current workshop outer wall. The bathroom again opens toward Other 1, and its landing-side wall is enclosed. No instructions inside the source documents were treated as additional user requests.

| Space | PDF dimension | Runtime dimension |
|---|---|---|
| Workshop | 1443.5 × 540.6 cm | 14.435 × 5.406 m clear inside walls |
| Covered balcony | 233 × 565 cm | 2.33 × 5.65 m |
| Covered lobby | 543 × 517 cm | 5.43 × 5.17 m |
| Bathroom and Other 1/2/3 | Earlier screenshot | Original layout restored by user correction |
| First-floor level | +375 cm | +3.75 m |

Local +X points toward the veranda (PDF bottom); -Z toward the TV and annex (PDF right); +Z toward the printer end and covered balcony (PDF left). These are not compass bearings. In the portrait review drawing, Other 3 and Other 2 are above Other 1, with the bathroom below Other 1 on the window side. A connecting landing lies beside the bathroom and leads from the lobby into Other 1.

The workshop dimensions measure inside wall faces, with wall centres half the wall thickness outside those bounds. Balcony and lobby dimensions define actual floor rectangles. The restored annex uses its original wall-centre coordinates and 16 cm wall thickness. Its 2.21 m and 2.13 m upper room widths are retained from the earlier screenshot, rather than the later PDF room sizes. Rendered floors and collision surfaces share configuration.

Wall thickness (20 cm), unlabelled passage offsets, opening widths, and stair width/run are drawing-based estimates. The 25 drawn stair positions comprise 11 lower treads, a broad intermediate landing at position 12, and 13 upper treads joining the +3.75 m floor to lower ground. Landing depth is an estimated 1.08 m and remains configurable; handrails and collision surfaces follow the two runs and flat landing. Roof shape and height above the first floor, landscaping, and lower exterior are still photographic estimates. The earlier additional porch extension is superseded by the PDF lobby extent; its approach path now terminates at that lobby.

## Objects and overlapping observations

All 20 original photographs and distributed frames from all five videos informed the earlier reconstruction. P1–P3 face the display; P4 faces the printer bench. These are opposite views of one workshop. P6/P7 identify one veranda entrance, while P18/P19 show the same printer/shelf/network corner at the other end. P10–P12/P17 and the videos identify one stair and one connected veranda.

The red-marked furniture near the PDF's TV end is the existing window-side cabinet table: one continuous worktop and three cupboard doors. It retains its stable ID. Its worktop width is estimated. The existing printer workbench remains at the opposite end with the same two printers; none are duplicated. The three table groups and wall seating retain their photo-led arrangement, with centres adjusted to the narrower room and chairs regenerated along table edges.

There are 42 represented chairs and 70 interactive physical objects, plus the permanent Space Host. The latest seating correction uses three aligned 2.90 × 1.10 m shared tables with four inward-facing chairs on each long side. Two loose east-side chairs are absorbed into the new rows; wall, annex and veranda seating remains. The TV, printer workbench, tall shelf, network cabinet and entrance board each have one representation. The bench electronics display and small tool cluster were removed at the owner's request. Extra chair stacks and additional cameras remain disabled because the references do not establish their count and location. The board is on the large annex wall facing the covered lobby, following the owner's marked screenshot. Generic live-user avatars are a separate presence layer requested later; their positions and motion are simulated, not inferred from people in the reference photographs.

The owner's hand sketch labelled “Second Floor” means the first floor. Confirmed road orientation: broad road at the printer/balcony end; curved connector along the veranda; upper approach road and short branch to the lobby. Roads use shared configuration in `site-layout.js`; their widths, exact offsets and curves remain estimates. The lower stair access remains linked to the broad road. The combined reference and separate seating plan are exported to `public/reference`.

## Configuration and checks

- `src/config/first-floor-plan.js`: PDF dimensions, clear room rectangles, lobby/balcony bounds, walls, openings and floor elevation.
- `src/config/scene-config.js`: retained furniture and equipment, placement conversion to the updated shell, aligned chairs and editable estimates.
- `src/ui/FloorPlan.js`: in-app drawing generated from the same geometry configuration.
- `reference-analysis/first-floor-reconstruction.svg`: current standalone review drawing.
- `reference-analysis/first-floor-source.jpeg`: earlier screenshot, authoritative for the restored annex.
- `artifacts/tinkerspace-pdf.png`: local render of the current PDF source.
- `artifacts/first-floor-overhead.png`: 3D cutaway of the current reconstruction.

Automated checks measure workshop wall clearances, balcony/lobby floor extents, room dimensions and floor height; verify aligned seating and clear furniture; and walk the actual lobby, workshop, balcony, green-room/toilet and stair routes. Cabinet doors and printer actions remain functional.
