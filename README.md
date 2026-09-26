<div align="center">

<img src="https://img.shields.io/badge/%F0%9F%8E%A0_Carousel_Studio-DINA_Lab-6d5ae6?style=for-the-badge&labelColor=15171c" alt="Carousel Studio" />

# Carousel Studio

**Turn one idea into a carousel worth swiping.**

An AI-assisted, design-system-driven editor for social media carousels —
LinkedIn-first, extensible to every platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-6d5ae6.svg?style=flat-square)](./LICENSE)
[![React 19](https://img.shields.io/badge/React-19-149eca.svg?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg?style=flat-square)](https://vite.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg?style=flat-square)](https://tailwindcss.com)
[![Built by DINA Lab](https://img.shields.io/badge/Built_by-DINA_Lab_IUST-ff4d8d.svg?style=flat-square)](#-about-dina-lab)

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Extending](#-extending) · [Roadmap](#-roadmap) · [About DINA Lab](#-about-dina-lab)

</div>

---

## ✨ What is this?

Most carousel tools are heavyweight design apps that ask you to become a designer.
Carousel Studio inverts the deal:

> **You focus on communicating the idea. The product handles turning that idea into a beautiful carousel.**

1. **Describe** an idea — or paste a draft you already wrote.
2. **Generate** a structured outline with the built-in AI assistant (mock provider out of the box).
3. **Refine** content on-canvas with inline editing.
4. **Style** everything with one of nine designed themes, then fine-tune with the design panel.
5. **Preview** exactly how the post will look in a LinkedIn feed.
6. **Export** pixel-perfect PNGs, a ZIP bundle, or a PDF — at full 1080×1350.

No accounts. No servers. No lock-in. Everything runs locally in your browser.

---

## 🚀 Features

### Editor-first experience
- Three-area layout: **slide rail → canvas → contextual panel**
- Drag to reorder, duplicate, delete, and add slides in a click
- Inline text editing directly on the slide
- Keyboard shortcuts: `←/→` navigate · `Ctrl+Z/Y` undo/redo · `Ctrl+D` duplicate slide · `P` preview · `E` export

### Composable content model
Slides are **data**, not hardcoded screens. Ten reusable block types —
heading, paragraph, quote, list, image, icon, statistic, comparison, callout, CTA —
combined with nine layout arrangements (`cover`, `statement`, `body`, `list`, `quote`, `stat`, `compare`, `callout`, `cta`).

Switching a layout **never destroys content**; blocks are preserved and re-arranged.

### A theme system, not template hell
Nine carefully designed themes ship out of the box:

`Minimal` · `Professional` · `Modern Tech` · `Dark Editorial` · `Bold` · `Personal Brand` · `Warm Paper` · `Gradient Pop` · `Mono`

Each theme is a small **token set** (typography, palette, radii, spacing, shadows, background style) applied as CSS variables — so changing a theme restyles every slide instantly while preserving all content. Per-project token overrides included.

### Lightweight AI, cleanly isolated
Outline generation from an idea · splitting long-form text into slides ·
rewrite / shorten / expand · hook generation · CTA improvement · per-slide regeneration.

All AI output is **structured document data** — never arbitrary UI code. The provider is a clean interface (`src/services/ai`); a realistic deterministic mock ships by default and a real API can replace it without touching the editor.

### Preview & export that match reality
- Full-screen carousel player with a simulated LinkedIn post frame
- Platform presets are abstract (LinkedIn portrait/square and Instagram included; more are one-line additions)
- PNG export of the current slide, ZIP export of all slides, and PDF — all rendered at exact platform resolution, entirely client-side

---

## 🛠 Quick Start

```bash
# Requirements: Node 20+
git clone https://github.com/DINA-Lab-IUST/carousel-studio.git
cd carousel-studio

npm install
npm run dev        # → http://localhost:5173
```

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | Typecheck + production build         |
| `npm run preview`    | Serve the production build locally   |
| `npm run typecheck`  | TypeScript strict check              |
| `npm run test`       | Unit tests (Vitest)                  |

On first run the app seeds a complete sample carousel so the product feels real immediately.

---

## 🧭 Architecture

```
src/
├── app/                 # Router + appearance (dark/light/system)
├── components/ui/       # Design-system primitives (Button, Modal, Toast, …)
├── features/
│   ├── dashboard/       # Project grid with live thumbnails
│   ├── newproject/      # Idea → outline / split / blank
│   ├── editor/          # TopBar · SlideRail · Canvas · RightPanel
│   ├── slides/          # SlideView · BlockRenderer · EditableText · SlideFrame
│   ├── preview/         # Full-screen player + LinkedIn post mock
│   └── themes/          # Theme swatches
├── lib/                 # Pure domain logic (framework-free)
│   ├── types.ts         # Block / Slide / Project / ThemeTokens
│   ├── blocks.ts        # Block factories + metadata
│   ├── layouts.ts       # Layout registry
│   ├── themes.ts        # 9 themes as token sets
│   ├── platforms.ts     # Platform presets (LinkedIn, Instagram)
│   ├── outline.ts       # Pure outline → slides mapping
│   ├── project.ts       # Project factory
│   └── sampleProject.ts # Realistic seeded sample
├── services/ai/         # AIService interface + MockAIService
└── store/               # Single zustand store: data + session + undo history
```

**Design decisions**

- **One store, three concerns.** Persisted documents (projects), editor session state (active slide, selection, zoom), and undo history live in a single `zustand` store with `localStorage` persistence.
- **Slides are pure data.** The renderer derives everything — positioning, type scale, colors — from the block list + theme tokens. No slide HTML is ever stored.
- **Themes are tokens, not templates.** `resolveTheme(themeId, overrides)` returns a flat token map applied as CSS variables; brand kits simply write overrides.
- **The AI boundary is a type.** `AIService` returns outlines and text; the UI owns all rendering. Swapping providers is a one-file change.
- **Export reuses the render layer.** Exports rasterize the *same* DOM the editor shows, so what you preview is what you ship.

---

## 🧩 Extending

| Want to add…            | Do this                                                                    |
| ----------------------- | -------------------------------------------------------------------------- |
| A new block type        | One variant in `lib/types.ts`, a factory in `lib/blocks.ts`, a case in `BlockRenderer` |
| A new layout            | One entry in `lib/layouts.ts`                                              |
| A new theme             | One token object in `lib/themes.ts`                                        |
| A new platform preset   | One entry in `lib/platforms.ts`                                            |
| A real AI provider      | Implement `AIService`, return it from `services/ai/index.ts`               |
| Cloud sync / auth / DB  | Replace the store's `persist` layer — components never touch storage       |

---

## 🗺 Roadmap

- [ ] Real AI provider via a backend proxy (BYO key)
- [ ] Drag-and-drop image handling on canvas
- [ ] Instagram-first onboarding and aspect guidance
- [ ] Scheduled posting integrations
- [ ] Multi-carousel brand analytics

---

## 👥 About DINA Lab

**DINA Lab** — *Distributed Infrastructure for NextGen Applications* — is the applied
research laboratory at **Iran University of Science and Technology (IUST)** exploring
distributed systems, developer experience, and next-generation application infrastructure.

This project is part of the lab's work on making powerful, complex tooling feel simple.

<div align="center">

### 📝 License & Copyright

Copyright © 2026 **DINA Lab** — *Distributed Infrastructure for NextGen Applications*
Iran University of Science and Technology (IUST)

Released under the [MIT License](./LICENSE).

<sub>Built with ☕ and an unreasonable attention to typography.</sub>

</div>
