<div align="center">

<img src="https://img.shields.io/badge/%F0%9F%8E%A0_Carousel_Studio-DINA_Lab-6d5ae6?style=for-the-badge&labelColor=15171c" alt="Carousel Studio" />

# Carousel Studio

**Turn one idea into a carousel worth swiping.**

An AI-assisted, design-system-driven editor for social media carousels —  
LinkedIn-first, developer-friendly, bilingual (LTR & RTL), extensible to every platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-6d5ae6.svg?style=flat-square)](./LICENSE)
[![React 19](https://img.shields.io/badge/React-19-149eca.svg?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg?style=flat-square)](https://vite.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg?style=flat-square)](https://tailwindcss.com)
[![Bilingual: LTR / RTL](<https://img.shields.io/badge/Direction-LTR%20%7C%20RTL%20(Persian)-emerald.svg?style=flat-square>)](#-bilingual--persian-rtl-excellence)
[![Built by DINA Lab](https://img.shields.io/badge/Built_by-DINA_Lab_IUST-ff4d8d.svg?style=flat-square)](#-about-dina-lab)

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Extending](#-extending) · [Roadmap](#-roadmap) · [About DINA Lab](#-about-dina-lab)

</div>

---

## ✨ What is this?

Most carousel tools are heavyweight design apps that ask you to become a graphic designer.  
Carousel Studio inverts the deal:

> **You focus on communicating the idea. The product handles typography, code presentation, and visual polish.**

1. **Describe** an idea — or paste long-form content to automatically split it into slides.
2. **Generate** a structured outline with the built-in AI assistant (deterministic mock provider out of the box).
3. **Write & Code** with inline text editing and developer-grade syntax-highlighted code windows & terminal simulators.
4. **Style** everything instantly across LTR and RTL (Persian) modes with token-based themes.
5. **Brand** with circular Lab badges and high-converting author outro cards.
6. **Preview** in a simulated LinkedIn feed and **export** pixel-perfect PNGs, ZIP bundles, or PDF decks client-side.

No accounts. No telemetry. 100% offline-capable and zero CORS issues.

---

## 🚀 Features

### 💻 Developer-First Code & Terminal Blocks

- **IDE Code Window:** macOS-style traffic light window chrome, authentic transparent language logos (React, TypeScript, Python, Java, C#, C++, Go, Rust, HTML, CSS, SQL, Bash), and auto-detection from filename extension.
- **Terminal Simulator:** Authentic shell titlebar (current path / session), prompt tokenization (`$`, `➜`, `❯`), command/flag highlighting, and status output colors.
- **Strict Isolation:** Code blocks stay strictly left-to-right (`dir="ltr"`, `unicode-bidi: isolate`) using **Fira Code**, even inside full Persian RTL slides.
- **Lightweight Highlighter:** Pure, dependency-free tokenizer rendering flat `<span>` runs — zero canvas conflicts during exports.

### 🇮🇷 Bilingual & Persian (RTL) Excellence

- **One-Click Direction Switcher:** Toggle between English (LTR) and Persian (RTL) effortlessly.
- **Self-Hosted Typography:** Ships with `@fontsource/vazirmatn` and `@fontsource/fira-code` for crisp, reliable offline exports.
- **Intelligent BiDi Formatting:** Persian numerals (`۰۱ / ۰۷`) for slide counters and lists, mirrored progress rails, and auto-adjusted line heights for Persian script ascenders.

### 👤 Creator & Lab Badging (Cover & Outro Cards)

- **Cover Slide Attribution:** Sleek footer badge with circular author avatar, name, and role.
- **Circular Lab Emblem:** Dedicated badge for institution/lab branding (DINA Lab / IUST) with crisp circular cropping.
- **High-Converting Outro Slide:** Rich end-card featuring author bio, circular photo, and a grid of social handles (LinkedIn, GitHub, Telegram, X/Twitter, Instagram, Email, Website) designed for maximum engagement.

### 🎨 Composable Content & Token-Driven Themes

- **11 Modular Block Types:** Heading, Paragraph, Quote, List, Image, Icon, Statistic, Comparison, Callout, CTA, and **Code/Terminal**.
- **9 Core Layout Arrangements:** `cover`, `statement`, `body`, `list`, `quote`, `stat`, `compare`, `callout`, `cta`. Switching layouts **never destroys content**.
- **Curated Design Themes:** Minimal, Professional, Modern Tech, Dark Editorial, Bold, Personal Brand, Warm Paper, Gradient Pop, Mono, and **Persian Tech**.

### ⚡ Seamless Client-Side Export

- Simulated LinkedIn in-feed preview with real-time slide navigation.
- Native resolution rendering (1080×1350 portrait / 1080×1080 square).
- Single-slide PNG, batch ZIP archive, or multi-page PDF documents for LinkedIn slides — completely generated in the browser.

---

## 🛠 Quick Start

```bash
# Requirements: Node 20+
git clone https://github.com/DINA-Lab-IUST/carousel-studio.git
cd carousel-studio

npm install
npm run dev        # → http://localhost:5173

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start local development server      |
| `npm run build`     | Typecheck + production Vite build   |
| `npm run preview`   | Preview production build locally    |
| `npm run typecheck` | TypeScript strict verification      |
| `npm run test`      | Run Vitest test suite (unit & BiDi) |

🧭 Architecture

src/
├── app/                 # Router + appearance (dark/light/system theme)
├── components/ui/       # Design-system primitives (Button, Modal, Segmented, ...)
├── features/
│   ├── dashboard/       # Project grid with live scaled thumbnails
│   ├── newproject/      # Idea → outline / content split / blank starter
│   ├── editor/          # TopBar · SlideRail · Canvas · ContentPanel · DesignPanel
│   ├── slides/          # SlideView · BlockRenderer · EditableText · SlideFrame
│   ├── preview/         # Full-screen player + LinkedIn post simulator
│   └── themes/          # Theme swatches
├── lib/                 # Pure domain logic (framework-free)
│   ├── types.ts         # Block / Slide / CodeLanguage / ThemeTokens schema
│   ├── blocks.ts        # Block factories + text extraction
│   ├── highlight.ts     # Pure TypeScript syntax & terminal tokenizer
│   ├── codeLogos.tsx    # Official transparent SVG brand marks
│   ├── layouts.ts       # Layout registry and visual alignment rules
│   ├── themes.ts        # Themes token sets (typography, palettes, BiDi rules)
│   ├── platforms.ts     # Platform presets (LinkedIn, Instagram)
│   ├── export.ts        # html-to-image rasterization + jsPDF + JSZip
│   └── utils.ts         # BiDi numeral helpers, PRNG, and downloads
├── services/ai/         # AIService interface + MockAIService
└── store/               # Zustand store with document state & undo/redo stack

🧩 Extending

| Want to add…           | Implementation Path                                                                |
| ---------------------- | ---------------------------------------------------------------------------------- |
| A new block type       | Add variant in `lib/types.ts`, factory in `lib/blocks.ts`, case in `BlockRenderer` |
| A programming language | Add spec in `lib/highlight.ts` and SVG mark in `lib/codeLogos.tsx`                 |
| A new theme or layout  | Add token object in `lib/themes.ts` or layout rule in `lib/layouts.ts`             |
| A custom Persian font  | Install `@fontsource/<font>`, import in `main.tsx`, and add to `FONT_OPTIONS`      |
| A real AI provider     | Implement `AIService` and return it from `services/ai/index.ts`                    |

🗺 Roadmap

- [x] Syntax-highlighted Code & Terminal simulator blocks
- [x] Full Persian (RTL) & BiDi numeral localization
- [x] Creator branding & circular Lab emblem integration
- [ ] Seamless continuous carousel flow templates (connecting visual bridges
  across slides)
- [ ] Real AI provider integration via backend proxy (BYO API key)
- [ ] Drag-and-drop image upload directly on canvas
- [ ] Scheduled LinkedIn & Instagram publishing integration

👥 About DINA Lab

DINA Lab — Distributed Infrastructure for NextGen Applications — is an applied
research laboratory at Iran University of Science and Technology (IUST)
exploring distributed systems, developer experience, and next-generation
application infrastructure.

This project is part of the lab's initiative to create software where complex,
professional-grade tooling feels intuitive and frictionless.

📝 License & Copyright

Copyright © 2026 DINA Lab — Distributed Infrastructure for NextGen Applications
Iran University of Science and Technology (IUST)

Released under the MIT License.

Built with ☕ and an unreasonable attention to typography and developer
experience.
```
