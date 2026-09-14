<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="PaperSimple turns a research paper into an interactive visual narrative">
</p>

<p align="center">
  <a href="https://ai.studio/apps/fcd7f267-d84f-4c89-bcc5-0cbccc10ce51"><strong>Open in Google AI Studio</strong></a>
</p>

<p align="center"><strong>English</strong> · <a href="./README.zh-CN.md">中文</a></p>

PaperSimple transforms a research paper into an explorable editorial narrative. Upload a PDF, DOCX, Markdown, or text file—or provide a public URL—and the app extracts the source, identifies its central ideas, and maps suitable concepts to interactive diagrams.

## From dense paper to guided story

- Import PDF, DOCX, Markdown, and plain text
- Extract up to the first 20 PDF pages in the browser
- Pull recent papers from arXiv across AI, biology, chemistry, and materials
- Generate a structured bilingual narrative in English or Chinese
- Render surface-code, transformer, metric, flow, chart, and 3D scenes
- Save favorite papers locally
- Export the generated experience as a PDF

The included AlphaQubit narrative is a complete built-in example, with a surface-code explainer, recurrent-transformer view, and performance comparison.

## Run locally

Prerequisites: Node.js and a Gemini API key.

```bash
cp .env.example .env
npm install
npm run dev
```

The development command starts the Express proxy and Vite application together. Gemini calls go through the server so the API key is not intentionally placed in client requests.

Validate a change with:

```bash
npm run lint
npm run build
```

## Narrative pipeline

| Stage | Implementation |
| --- | --- |
| Acquire | File upload, public URL fetch, or arXiv query |
| Extract | PDF.js, Mammoth, or UTF-8 text decoding |
| Structure | Gemini JSON schema for title, introduction, sections, authors, and visual cues |
| Visualize | React, Three.js / React Three Fiber, and project-specific SVG-style diagrams |
| Present | Animated editorial layout with English / Chinese switching |
| Keep | Browser-local favorites and PDF export |

## Important limits

- URL import depends on the remote resource being public and retrievable through the configured proxy path.
- PDF extraction currently reads at most 20 pages.
- Generated explanations and diagrams can omit or misstate source details; check the original publication before relying on them.
- The app is a communication prototype, not a peer-review, citation-verification, or scientific validation system.
- Recent-paper metadata comes from arXiv search and may not represent a journal's official publication record.

## Key files

- [`App.tsx`](./App.tsx) — discovery, favorites, generation state, and built-in narrative
- [`components/ArticleGenerator.tsx`](./components/ArticleGenerator.tsx) — file and URL extraction
- [`components/GeneratedArticle.tsx`](./components/GeneratedArticle.tsx) — narrative presentation and export
- [`components/Diagrams.tsx`](./components/Diagrams.tsx) — scientific diagram components
- [`components/QuantumScene.tsx`](./components/QuantumScene.tsx) — 3D hero and quantum scenes
- [`services/geminiService.ts`](./services/geminiService.ts) — structured generation
- [`services/paperService.ts`](./services/paperService.ts) — arXiv discovery and local translation cache
