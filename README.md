# German Pronunciation & Language Learning Masterclass

A single-page web app for learning German — vocabulary, grammar, verb conjugation, grammatical cases, reading comprehension, level quizzes, spaced-repetition flashcards, progress tracking, and a dedicated pronunciation (phonetics) masterclass.

## Attribution

Ownership is split across two parts of this project:

- **Phonetics Masterclass section** — the pronunciation rules, IPA breakdowns, minimal-pairs listening drills, and the overall concept of this specific section were **not created by me**. I found this section elsewhere and folded it into my project purely for **personal, non-commercial use**, to help myself learn German pronunciation and accent. I do not claim authorship or credit for this section. If you are the original creator and want it removed, modified, or credited differently, please open an issue or reach out and I will comply.
- **Everything else in this repository — is my own work**, built from scratch: the overall site architecture and single-page navigation, the vocabulary/grammar/verb-conjugation/cases/reading/quiz/flashcard/progress-tracking modules, the CEFR-level content data, the design system and responsive layout, and all integration work that ties the phonetics section into the rest of the site (shared styling, shared navigation, shared vocabulary data, bug fixes, and content audits).

This is a personal educational project. No commercial use is intended.

## Features

- **Vocabulary browser** — 3,503 entries (A0: 204 · A1: 1,519 · A2: 1,011 · B1: 477 · B2: 204 · C1: 88), searchable, filterable by CEFR level and topic, with audio, IPA, plurals, example sentences, and a colour-coded article chip (der = blue, die = rose, das = green) so noun gender is always visible
- **Grammar lessons** — 60 lessons with rule explanations in Persian (before examples), plus "Difference from English" notes for bilingual learners, and Landeskunde for B2/C1
- **Verb conjugation** — 69 verbs: Präsens, Präteritum, Perfekt through C1; Konjunktiv II and passive examples where available, with practice
- **Grammatical cases (Kasus)** — articles, pronouns, prepositions, plus a dedicated **Wechselpräpositionen** (Akk/Dat) exercise
- **Dictation** — 18 items (3 per level); listen and type what you hear; checks ä/ö/ü/ß (with ss≈ß flexibility)
- **Dialogues** — 12 short two-speaker audio dialogues (2 per level)
- **45-day study path** — daily tasks linking vocabulary, grammar, dictation, dialogues, flashcards, and quizzes
- **Placement test** — 30 questions, short CEFR recommendation on the home page
- **Reading comprehension** — 12 short texts (2 per level) with questions
- **Level quiz** — a 10-question quiz mixing vocabulary, verb conjugation, and case/article questions (distractors are guaranteed unique)
- **Flashcards** — a Leitner-style spaced-repetition (SM-2) flashcard deck across all levels, with a "due today" queue on the home dashboard
- **Progress + backup** — per-level progress, XP, daily streak, badges; **export/import JSON** for cross-device backup
- **Phonetics Masterclass** *(sourced, see Attribution)* — vowel/consonant/ending pronunciation rules, a word analyzer, minimal-pairs listening practice, and a recording/comparison tool
- Dark/light theme (respects your system preference on first visit), keyboard navigation, PWA/offline support, and a responsive layout for mobile and desktop

## Structure

The site is a single-page app:

```
index.html          entry point — every section (home, path, vocabulary,
                     grammar, conjugation, cases, reading, dialogues,
                     dictation, writing, levels, quiz, flashcards, progress, phonetics)
style.css            all styling, theming (CSS variables), and responsive layout
script.js            app logic — routing, exercises, path, dictation, XP, backup
manifest.json        PWA manifest
sw.js                service worker (offline cache, cache name: german-with-me-v4)
worker.js            optional Cloudflare Worker for server-side text-to-speech
tools/
  enrich-data.js     content enrichment (grammar meta, extra verbs, seed lists) —
                     conservative: never overwrites curated core sections,
                     never guesses a plural it cannot derive safely
  fix-data.js        one-shot data repair (articles, plurals, broken examples) + fix-report.json
  fix-data-2.js      round 2: suffix-based articles, safe example frames, A0 examples
  fix-data-3.js      round 3: everyday-noun articles
  fix-data-4.js      round 4 (runtime-QA finds): Abitur gender, umlaut/weak plurals,
                     plural-only -schmerzen nouns, invalid feminine stem+e plurals
  add-vocab.js       curated B2/C1 vocabulary expansion (batch 1)
  add-vocab-2.js     curated B2/C1 vocabulary expansion (batch 2)
  add-core.js        second dialogue per level + dictation top-up
  validate-data.js   data quality gate — run before committing data changes
data/
  core.json          levels, grammar, verbs, cases, readings, dialogues,
                     study plan, dictation, placement, wechsel items
  vocab-A0.json … vocab-C1.json   vocabulary (word, article, plural, IPA,
                     fa/en glosses, example + translations)
```

In-page navigation switches between sections without loading a separate page. Content data is split into `core.json` plus one `vocab-<LEVEL>.json` per CEFR level, fetched in parallel on load.

## Pronunciation Audio

Word pronunciation uses two tiers, in order:

1. A server-side text-to-speech call to a Cloudflare Worker (higher quality, consistent voice) — optional, see Setup below.
2. A fallback to the browser's built-in Web Speech API if the worker is unavailable or not configured.

In the vocabulary table and flashcards, nouns are spoken **with their article** ("die Oma"), so you hear the gender together with the word.

## Setup Instructions

The site works out of the box using the browser's built-in speech synthesis. The Cloudflare Worker step below is optional and only improves pronunciation audio quality/consistency.

1. **Deploy the site**:
   - Upload `index.html`, `style.css`, `script.js`, `manifest.json`, `sw.js`, and the `data/` folder to any static host (GitHub Pages, Netlify, Vercel, or your own server).

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

## Data quality

Run the gate after any data edit:

```bash
node tools/validate-data.js
```

It verifies, among other things: valid JSON and required fields, no article prefixes left in `word`, no duplicate words across levels, no known broken example patterns, every quiz/reading/placement answer present in its options, complete verb paradigms, and a 45-day study plan whose tasks all point at real sections.

### Note for existing users

In this rebuild the article moved out of the word string into its own field ("die Oma" → word `Oma` + article `die`). Learned-word and flashcard keys are based on the word string, so for ~220 nouns those marks reset once; everything else (XP, streak, badges, other words) is preserved.

## Rebuild changelog (2026)

A full audit + repair pass over code and data:

**Data**
- **Articles normalised**: der/die/das prefixes stripped from `word` into the `article` field site-wide; the 28 prefix/field gender conflicts adjudicated to the correct gender (e.g. *das Auge*, *die Tochter*, *das Stereotyp*).
- **Articles completed**: ~210 nouns that had a plural but no gender received one — from the stripped prefixes, from certain suffix rules (-ung, -heit, -keit, -schaft, -tion, -ie, -chen …), and from a curated everyday-noun list. The article is now displayed everywhere as a colour chip; vocabulary audio speaks the article too.
- **Plurals repaired**: the old generator appended endings blindly (*die Omaen, die Herre, die Ampelen, die Gebäuden, die Butteren* …). Curated fixes + provable signature rules applied; plurals of uncountable nouns and unverifiable machine guesses removed rather than taught wrong; the "تقریبی" (approximate) markers are gone. A runtime-QA pass additionally caught the neuter *das Abitur* (stored as feminine, with a plural belonging to a different word), umlaut-less plurals (*die Magen* → *die Mägen*), weak-noun plurals (*Geldautomaten*), 69 impossible feminine stem+e plurals, and plural-only *-schmerzen* nouns.
- **Broken examples removed at the data level**: ~1,600 machine-generated sentences that taught wrong German (*Das Buch liegt sehr dem Tisch*, *X ist ein wichtiges Wort*, *Ich fühle mich + noun*, *Wo ist der/die/das …?* …), with narrow allow-lists that keep the valid uses (professions after *Mein Beruf ist*, time phrases after *Wir treffen uns*, subjects after *In der Schule lernen wir*, ability verbs after *Kannst du*, foods after *Ich esse gerne*). Safe replacement frames were generated only where they are grammatically guaranteed (nouns, predicative adjectives, verbs, numbers), and all 58 missing A0 examples were written by hand — A0 example coverage is now 100%, site-wide 76%.
- **Fake cognate notes removed**: 548 auto-generated "Possible cognate with English …" notes (the heuristic even matched *hundert* → "one hundred").
- **Entry repairs**: *die Augen* (duplicate of *das Auge*), *die Socken* → *die Socke*, *akzeptiert* → *akzeptieren*, plural-only nouns (*Geschwister*, *Vereinigten Staaten*) modelled correctly; 21 cross-level duplicates removed (kept at the lowest level).
- **C1/B2 expansion**: +57 curated entries with hand-written examples (C1: 49 → 88 after de-duplication, B2: 186 → 204), a second dialogue for every level (12 total), and dictation topped up to 3 items per level (18 total).

**Code**
- Fixed: home "due flashcards" counter read a localStorage key nothing ever writes (`germanMainSR` → the real SR key), so it always showed 0; the home "review due" button set `.checked` on a `<button>`, so due-mode never activated.
- Fixed: level-quiz questions could contain duplicate options (two words sharing one Persian translation; identical verb forms across pronouns) — distractors are now deduplicated.
- Removed dead code: an unused `normalizeDictation` (now actually used by the dictation checker, replacing a duplicated inline implementation), a fragile monkey-patch of `renderHome` plus its no-op hook block, the render-time example-suppression hack (data is clean now), 4 unused CSS classes, and duplicated rules in the inline `<style>`.
- Removed all inline `onclick` attributes; every control is bound in `script.js` (also CSP-friendly).
- Theme unified: the phonetics analyzer card used a hard-coded dark-navy gradient in both themes; it now follows the theme via CSS variables (brand blue in light mode, deep navy in dark). The voice banner text colour is theme-safe. One breakpoint scale (899px). First visit respects `prefers-color-scheme`.
- `enrich-data.js` moved to `tools/` (the location this README always claimed; from the repo root its `../data` path was wrong), its plural guesser made conservative, its meta example template removed, and its core-section overwrites turned into seed-only fills so re-running it can no longer destroy curated content.
- `worker.js` hardened: CORS preflight, GET-only, missing-key and upstream-failure handling.
- Service worker cache: `german-with-me-v2` → `german-with-me-v3` (round 2) → `german-with-me-v4` (round 3, responsive header/nav fix).
- Writing-practice sample corrected: *aus dem Iran* (not *aus Iran*).

**Round 2 (same day)** — dictionary-verified completion pass (tools/fix-data-5…14.js):
- Every noun article cross-checked against the de.wiktionary dump: 721 filled, 140 wrong articles corrected (der Name, das Wasser, die Mutter…), 592 plurals corrected or filled; remaining article-less items are place names, plural-only words and non-nouns by design (98.9% coverage).
- Example coverage 76% → 100%: the surviving generator families ("X ist wichtig", "Ich benutze X jeden Tag", "Der/Die/Das X ist interessant", "Mein X ist gesund") were replaced with verified frames and ~500 hand-written examples; accusative case fixed in the food frame ("Ich esse gerne den Apfel").
- New features: Word of the Day on the home dashboard and an Article Trainer (der/die/das, 10 rounds, XP) inside the Quiz section.
- Bug fix: flashcard "due" review now contains only cards that are actually due (it previously mixed in every unstudied word), matching the home counter and the empty state.
- 11 hand-written C1 entries added (3,514 total). The validator (tools/validate-data.js) now guards against every junk family found.

**Still honest limitations**
- ~36% of nouns still have no verified article — gender was never guessed; the chip simply doesn't render for them. A dictionary-grade pass could close this.
- ~24% of entries have no example sentence (they still show IPA, translation, plural, and audio). Priority for a future pass: high-frequency A1/A2 verbs.
- Some A1/A2 category assignments remain approximate (the category is a filter label, not a claim).
- Long-tail IPA transcriptions and plurals have not had a full native-speaker review.
- Real native-speaker audio recordings and server-side accounts/cloud sync remain out of pure front-end scope.
