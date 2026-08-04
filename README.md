# German Pronunciation & Language Learning Masterclass

A single-page web app for learning German — vocabulary, grammar, verb conjugation, grammatical cases, reading comprehension, level quizzes, spaced-repetition flashcards, progress tracking, and a dedicated pronunciation (phonetics) masterclass.

## Attribution

Ownership is split across two parts of this project:

- **Phonetics Masterclass section** — the pronunciation rules, IPA breakdowns, minimal-pairs listening drills, and the overall concept of this specific section were **not created by me**. I found this section elsewhere and folded it into my project purely for **personal, non-commercial use**, to help myself learn German pronunciation and accent. I do not claim authorship or credit for this section. If you are the original creator and want it removed, modified, or credited differently, please open an issue or reach out and I will comply.
- **Everything else in this repository — is my own work**, built from scratch: the overall site architecture and single-page navigation, the vocabulary/grammar/verb-conjugation/cases/reading/quiz/flashcard/progress-tracking modules, the CEFR-level content data, the design system and responsive layout, and all integration work that ties the phonetics section into the rest of the site (shared styling, shared navigation, shared vocabulary data, bug fixes, and content audits).

This is a personal educational project. No commercial use is intended.

## Features

- **Vocabulary browser** — searchable, filterable by CEFR level (A0–C1) and topic, with audio, example sentences, and plural forms
- **Grammar lessons** — rule explanations in Persian (before examples), plus “Difference from English” notes for bilingual learners, and Landeskunde for B2/C1
- **Verb conjugation** — Präsens, Präteritum, Perfekt through C1; Konjunktiv II and passive examples where available, with practice
- **Grammatical cases (Kasus)** — articles, pronouns, prepositions, plus a dedicated **Wechselpräpositionen** (Akk/Dat) exercise
- **Dictation** — listen and type what you hear; checks ä/ö/ü/ß (with ss≈ß flexibility)
- **Dialogues** — short two-speaker audio dialogues per level
- **45-day study path** — daily tasks linking vocabulary, grammar, dictation, dialogues, flashcards, and quizzes
- **Placement test** — short CEFR recommendation on the home page
- **Reading comprehension** — one short text with questions per level
- **Level quiz** — a 10-question quiz mixing vocabulary, verb conjugation, and case/article questions
- **Flashcards** — a Leitner-style spaced-repetition (SM-2) flashcard deck across all levels
- **Progress + backup** — per-level progress, XP, daily streak, badges; **export/import JSON** for cross-device backup
- **Phonetics Masterclass** *(sourced, see Attribution)* — vowel/consonant/ending pronunciation rules, a word analyzer, minimal-pairs listening practice, and a recording/comparison tool
- Dark/light theme toggle, keyboard navigation, and a responsive layout for mobile and desktop

## Structure

The site is a single-page app:

```
index.html          entry point — every section (home, path, vocabulary,
                     grammar, conjugation, cases, reading, dialogues,
                     dictation, levels, quiz, flashcards, progress, phonetics)
style.css            all styling, theming, and responsive layout
script.js            app logic — routing, exercises, path, dictation, XP, backup
worker.js            optional Cloudflare Worker for server-side text-to-speech
tools/
  enrich-data.js     one-shot content enrichment (grammar rules, verbs, etc.)
data/
  core.json          levels, grammar (+descriptions), verbs, cases, readings,
                     dialogues, study plan, dictation, placement, wechsel items
  vocab-A0.json … vocab-C1.json   vocabulary (+ examples, plurals where set)
```

In-page navigation switches between sections without loading a separate page. Content data is split into `core.json` plus one `vocab-<LEVEL>.json` per CEFR level, fetched in parallel on load instead of one large file.

## Pronunciation Audio

Word pronunciation uses two tiers, in order:

1. A server-side text-to-speech call to a Cloudflare Worker (higher quality, consistent voice) — optional, see Setup below.
2. A fallback to the browser's built-in Web Speech API if the worker is unavailable or not configured.

## Setup Instructions

The site works out of the box using the browser's built-in speech synthesis. The Cloudflare Worker step below is optional and only improves pronunciation audio quality/consistency.

1. **Deploy the site**:
   - Upload `index.html`, `style.css`, `script.js`, and the `data/` folder to any static host (GitHub Pages, Netlify, Vercel, or your own server).

2. *(Optional)* **Set up server-side TTS**:
   - Deploy `worker.js` as a Cloudflare Worker.
   - Set the `TTS_API_KEY` secret on the Worker with your Google Cloud TTS API key.
   - Update `TTS_WORKER_URL` at the top of `script.js` with your deployed Worker's URL, e.g.:
     ```js
     const TTS_WORKER_URL = 'https://tts-proxy.your-subdomain.workers.dev/';
     ```
   - If this step is skipped, the site automatically falls back to the browser's built-in voice.

## Usage

This is for personal educational use only. No commercial use is intended.