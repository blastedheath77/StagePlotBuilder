# StagePlot Builder 🎛️

A lightweight, browser-based 2D stage and venue layout tool designed for live sound production students and technicians to quickly draft clear, standardized sound reinforcement diagrams.

## ✨ Features

- **Venue Templates**:
  - **Small Club / Bar**: 6m × 4m (End-on) layout with Raised Stage, Standing Floor, and Rear Central FOH Booth.
  - **Mid-Sized Theatre / Hall**: 12m × 8m (Proscenium) layout with Proscenium/Thrust Stage, Seated Stalls, and Central Mix Position.
- **Audio Equipment Catalog (11 Assets)**:
  - **FOH & PA**: Main PA Speaker, Subwoofer, FOH Mixing Console.
  - **Monitoring**: Foldback Wedge, Drum / Side Fill.
  - **Backline & Instruments**: Drum Kit, Guitar / Bass Amp Cab, Keyboard / Synth Rig, Pedalboard / Floor FX.
  - **Infrastructure**: Stage Box (I/O Drop), 13A Mains Power Drop.
- **Smart Multicore Connection**: Automatic dynamic line linking FOH Mixing Console to Stage Box with live coordinate updates.
- **Transform & Snapping**:
  - 45° rotation handle increments (with free rotation support).
  - Smart alignment guides (Figma-style center and edge bounds).
  - 0.5m scale grid with independent toggleable snapping.
- **Multi-Select & Area Marquee**: Click-and-drag marquee selection, group movement, grouped deletion, copy (`Ctrl+C`), and paste (`Ctrl+V`).
- **Custom Labeling**: Double-click any placed icon to edit inline text cleanly anchored without clipping.
- **Undo / Redo Stack**: 50+ actions history stack (`Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`).
- **Scale Reference**: Metric scale rulers (meters & decimeters) synchronized with viewport zoom and pan.
- **Export Pipeline**:
  - High-resolution PNG rasterization.
  - Print-ready PDF diagram with metadata title block.
  - Standard PRD JSON schema export and import.
- **Persistence**: Firebase Auth + Firestore cloud syncing with automatic local offline storage fallback.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Canvas Engine**: [Konva.js](https://konvajs.org/) via `react-konva`
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Export Engine**: `jspdf` & HTML5 Canvas API
- **Persistence / Auth**: [Google Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📄 License

MIT
