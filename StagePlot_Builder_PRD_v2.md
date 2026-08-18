# Product Requirement Document (PRD): StagePlot Builder

A lightweight, browser-based 2D stage and venue layout tool designed for live sound production students and technicians to quickly draft clear, standardized sound reinforcement diagrams.

---

## 1. Core Architecture & Tech Stack

* **Frontend Framework:** React / TypeScript with Tailwind CSS for UI panels.
* **Canvas Engine:** HTML5 Canvas via `Konva.js` (or `react-konva`) for object manipulation, scaling, rotation, and dynamic line rendering.
* **State Management:** `Zustand` or `Redux Toolkit` (manages active template, placed object coordinates, custom labels, and dynamic connections).
* **Export Pipeline:** `html2canvas` / direct canvas rasterization for PNG export, and `jspdf` for vector/print-ready diagram output.
* **Persistence:** Google Firebase (Firestore for project/document data, Firebase Auth for user accounts). Integration details to be finalized during build.
* **Hosting:** Vercel.

---

## 2. Venue Templates & Canvas

Users choose a preset template on creation. No additional templates beyond the two below are planned.

| Template Name | Stage Dimensions (Aspect) | Typical Capacity | Pre-Configured Zones |
| --- | --- | --- | --- |
| **Small Club / Bar** | 6m × 4m (End-on) | 100–250 | Raised Stage, Open Floor, Rear Central FOH Booth |
| **Mid-Sized Theatre / Hall** | 12m × 8m (Proscenium) | 500–1000 | Thrust/Stage, Seated Stalls, Dedicated Central FOH Mix Position |

* **Zonal Visual Markers:** Distinct background fills and dashed perimeter lines labeling **Stage**, **Audience**, and **FOH Position**. These zones provide structural reference only — the canvas within them is otherwise a free-form blank workspace, with asset placement, spacing, and layout entirely at the user's discretion.

---

## 3. Asset Palette & Categorization

All items have a fixed default pixel footprint matched to standard stage scale, with preset category color fills. Assets are generic categories only — no sub-type variants (e.g. no microphone, DI box, or stand types) are in scope.

```
[Icon Palette Sidebar]
 ├── FOH & PA (Accent: Indigo/Blue)
 │    ├── Main PA Speaker (Left/Right Pair or Single)
 │    ├── Subwoofer
 │    └── FOH Mixing Console
 ├── Monitoring (Accent: Orange)
 │    ├── Foldback Wedge (Standard Angled Profile)
 │    └── Drum / Side Fill
 ├── Backline & Instruments (Accent: Emerald Green)
 │    ├── Drum Kit (Top-down footprint)
 │    ├── Guitar / Bass Amp Cab
 │    ├── Keyboard / Synth Rig
 │    └── Pedalboard / Floor FX
 └── Infrastructure (Accent: Amber/Dark Gray)
      ├── Stage Box (I/O Drop Box)
      └── 13A Mains Power Drop (Socket/Lightning Icon)

```

---

## 4. Canvas Interactions & Dynamic Snapping

* **Drag-and-Drop:** Drag assets directly from the left-hand sidebar onto the venue canvas.
* **Selection & Transform:**
  * Click to select an asset (displays bounding box and single rotation handle).
  * Smooth rotation with 45° snap increments (holding Shift for free 1° rotation).
  * Backspace/Delete key removes active item.
* **Custom Naming / Labeling:**
  * Double-click any placed icon to edit inline text (e.g., "Mix 1 - Lead Vox", "Gtr 1 Power", "Stage Left Sub").
  * Text automatically anchors above or below the asset without clipping.
* **Smart Multicore Connection:**
  * When both a **FOH Mixing Console** and a **Stage Box** are present on the canvas, a high-contrast multicore line automatically draws between their anchor nodes.
  * **Only one multicore connection is permitted per drawing.** If more than one Stage Box is placed, the multicore connects to the first-placed Stage Box only; additional Stage Boxes render on canvas without a connection line. This keeps the connection logic simple and unambiguous.
  * Dragging either connected node dynamically updates the line coordinates in real time.

### 4.1 Undo / Redo
* Standard undo/redo stack (Ctrl+Z / Ctrl+Shift+Z, or Cmd equivalents on macOS) covering all canvas mutations: add, delete, move, rotate, label edit, and connection changes.
* Minimum history depth of 50 actions per session.
* History resets on project load (i.e. not persisted between sessions).

### 4.2 Grid Snapping & Alignment Guides
* Optional visible background grid, toggleable on/off, with a sensible default spacing tied to the template's real-world scale (e.g. 0.5m increments).
* Snap-to-grid on drag, toggleable independently of grid visibility, so users can place freely or snap as needed.
* Dynamic alignment guides (smart guides) that appear when a dragged asset's edges or center align with another asset's edges or center — standard behavior seen in tools like Figma.

### 4.3 Multi-Select & Copy-Paste
* Marquee (click-drag) selection to select multiple assets at once.
* Shift-click to add/remove individual assets from a selection.
* Group operations on multi-selection: move, rotate, delete.
* Copy/paste (Ctrl+C / Ctrl+V) for single or multiple selected assets, with pasted copies offset slightly from the originals to avoid exact overlap.

### 4.4 Scale Reference
* A visible ruler or scale bar rendered on the canvas (e.g. along the top and left edges, or as a fixed legend element) reflecting the template's real-world dimensions.
* Scale reference updates correctly with zoom level so it remains an accurate spatial reference at any zoom.

---

## 5. UI Layout Wireframe

```
+--------------------------------------------------------------------------------------------------+
|  [App Logo] StagePlot Builder    | Template: [ Small Club v ] | [ Zoom - / + ] [ Reset View ]    | [ Export PNG ] [ Export PDF ] |
+-------------------+------------------------------------------------------------------------------+
| ASSET PALETTE     | VENUE CANVAS                                                                 |
| ----------------- | +--------------------------------------------------------------------------+ |
| [Search Assets..] | |                              STAGE ZONE                                  | |
|                   | |   +-------+                                            +-------+         | |
| > FOH PA          | |   | L PA  |        [ Drum Kit ]                        | R PA  |         | |
|   [ PA Speaker ]  | |   +-------+     [Power]                            +-------+         | |
|   [ Subwoofer ]   | |                                                                          | |
|   [ FOH Console ] | |         [ Amp ]                [ Amp ]                 [Stage Box]       | |
|                   | |         [Power]                [Power]                      o            | |
| > Monitoring      | |                                                             |            | |
|   [ Wedge ]       | |      /\ (Wedge 1)            /\ (Wedge 2)                   |            | |
|   [ Side Fill ]   | |     /  \                    /  \                            | (Multicore)|
|                   | |-------------------------------------------------------------|------------| |
| > Backline        | |                              AUDIENCE ZONE                  |            | |
|   [ Drum Kit ]    | |                                                             |            | |
|   [ Amp Cab ]     | |                                                             |            | |
|   [ Pedalboard ]  | |                                                             |            | |
|                   | |-------------------------------------------------------------|------------| |
| > Infrastructure  | |                              FOH ZONE                       |            | |
|   [ Stage Box ]   | |                                                        +----o----+       | |
|   [ Power Drop ]  | |                                                        | FOH Desk|       | |
|                   | |                                                        +---------+       | |
|                   | +--------------------------------------------------------------------------+ |
+-------------------+------------------------------------------------------------------------------+

```

---

## 6. Export Schema & Data Model

Each stage layout exports to JSON for storage and reload capabilities, and is persisted to Firestore in the same shape:

```json
{
  "templateId": "small_club_01",
  "version": "1.0",
  "elements": [
    {
      "id": "foh_console_1",
      "type": "foh_console",
      "label": "M32 FOH",
      "x": 620,
      "y": 780,
      "rotation": 0
    },
    {
      "id": "stage_box_1",
      "type": "stage_box",
      "label": "DL32 Stage Left",
      "x": 710,
      "y": 140,
      "rotation": 0
    },
    {
      "id": "power_drop_1",
      "type": "power_drop",
      "label": "Pedalboard Power 13A",
      "x": 310,
      "y": 160,
      "rotation": 0
    }
  ],
  "connections": [
    {
      "type": "multicore",
      "from": "foh_console_1",
      "to": "stage_box_1"
    }
  ]
}
```

---

## 7. Persistence — Firebase

* **Data store:** Firestore, storing one document per stage plot project using the schema in Section 6, plus standard metadata fields (owner UID, created/updated timestamps, project name).
* **Auth:** Firebase Authentication gates project save/load; anonymous/local-only use may still be supported for quick one-off diagrams that are exported without being saved to an account (to be confirmed during build).
* **Autosave / manual save:** To be decided during build — either periodic autosave to Firestore or an explicit "Save" action; either way, undo/redo history (Section 4.1) does not need to persist to Firestore, only the resulting canvas state.
* Detailed security rules, collection structure, and offline-sync behavior will be defined during implementation rather than in this PRD.

---

## 8. Collaboration Workflow (GitHub)

The project will be developed collaboratively with a colleague using GitHub, with work split across branches. To support this cleanly:

* **Branching strategy:** `main` as the protected, always-deployable branch; feature branches per unit of work (e.g. `feature/multicore-connection`, `feature/grid-snapping`); merge via Pull Request rather than direct push to `main`.
* **Environment separation:** Separate Firebase projects (or at minimum separate Firestore collections/prefixes) for development and production, so both collaborators can work and test against Firestore without risk of corrupting or colliding on shared data. Vercel Preview Deployments per PR, each pointing at the dev Firebase project, are recommended so both collaborators can review changes live before merging.
* **Config/secrets:** Firebase config and any API keys kept out of source control via environment variables (`.env.local`, Vercel Environment Variables), with an `.env.example` committed for onboarding.
* **Shared conventions:** A consistent linting/formatting setup (e.g. ESLint + Prettier) and a lightweight PR template or checklist so both collaborators produce consistent code without needing constant back-and-forth review of style.
* **Ownership of data model changes:** Because both the Firestore schema and the JSON export schema (Section 6) are shared contracts, changes to either should be flagged in the PR description so the other collaborator isn't broken by an unannounced schema change.

---

## 9. Out of Scope (for clarity)

* Asset sub-types (microphone, DI box, or stand variants) — assets remain generic categories only.
* Companion input list / channel list generation.
* Additional venue templates beyond the two listed in Section 2.
* Multiple simultaneous multicore connections in a single drawing.
