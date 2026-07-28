# German Pronunciation & Language Learning Masterclass

A single-page web app for learning German — vocabulary, grammar, verb conjugation, grammatical cases, reading comprehension, level quizzes, spaced-repetition flashcards, progress tracking, and a dedicated pronunciation (phonetics) masterclass.

## Attribution

Ownership is split across two parts of this project:

- **Phonetics Masterclass section** — the pronunciation rules, IPA breakdowns, minimal-pairs listening drills, and the overall concept of this specific section were **not created by me**. I found this section elsewhere and folded it into my project purely for **personal, non-commercial use**, to help myself learn German pronunciation and accent. I do not claim authorship or credit for this section. If you are the original creator and want it removed, modified, or credited differently, please open an issue or reach out and I will comply.
- **Everything else in this repository — is my own work**, built from scratch: the overall site architecture and single-page navigation, the vocabulary/grammar/verb-conjugation/cases/reading/quiz/flashcard/progress-tracking modules, the CEFR-level content data, the design system and responsive layout, and all integration work that ties the phonetics section into the rest of the site (shared styling, shared navigation, shared vocabulary data, bug fixes, and content audits).

This is a personal educational project. No commercial use is intended.

## Features

- **Vocabulary browser** — searchable, filterable by CEFR level (A0–C1) and topic, with audio pronunciation for every word
- **Grammar reference** — grammar modules plus Landeskunde (culture notes) for B2/C1
- **Verb conjugation** — present tense and Perfekt for key regular, irregular, and modal verbs, with a practice exercise
- **Grammatical cases (Kasus)** — articles, pronouns, and prepositions across all four German cases, with a practice exercise
- **Reading comprehension** — one short text with questions per level
- **Level quiz** — a 10-question quiz mixing vocabulary, verb conjugation, and case/article questions
- **Flashcards** — a Leitner-style spaced-repetition (SM-2) flashcard deck across all levels
- **Progress tracking** — per-level progress, word counts, and a completion ring
- **Phonetics Masterclass** *(sourced, see Attribution)* — vowel/consonant/ending pronunciation rules, a word analyzer, minimal-pairs listening practice, and a recording/comparison tool
- Dark/light theme toggle, keyboard navigation, and a responsive layout for mobile and desktop

## Structure

The site is a single-page app:

```
index.html          entry point — every section lives here (home, vocabulary,
                     grammar, conjugation, cases, reading, levels, quiz,
                     flashcards, progress, phonetics masterclass)
style.css            all styling, theming, and responsive layout
script.js            all app logic — routing between sections, rendering,
                     search/filtering, spaced repetition, quizzes, and the
                     phonetics masterclass logic
worker.js            optional Cloudflare Worker for server-side text-to-speech
data/
  core.json          levels, grammar, verbs, cases, reading passages, culture notes
  vocab-A0.json      vocabulary for level A0
  vocab-A1.json      vocabulary for level A1
  vocab-A2.json      vocabulary for level A2
  vocab-B1.json      vocabulary for level B1
  vocab-B2.json      vocabulary for level B2
  vocab-C1.json      vocabulary for level C1
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
