# German Pronunciation & Language Learning Masterclass

> A single-page web app for learning German, from absolute beginner (A0) to advanced (C1): vocabulary, grammar, verbs, cases, reading, quizzes, flashcards and a dedicated pronunciation masterclass.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## Overview

This site teaches German in one place, instead of splitting vocabulary, grammar and pronunciation across separate tools. Learners browse words by CEFR level and topic, study grammar lessons, practise verb conjugation and grammatical cases, test themselves with quizzes and dictation, and review with spaced-repetition flashcards, all with progress, XP, daily streaks and badges tracked on the device.

Grammar explanations are written in Persian, before the German examples, with "Difference from English" notes for bilingual learners. Noun gender is always visible through a colour-coded article chip (der, die, das), and vocabulary audio speaks the article as well as the word.

## Attribution

Ownership is split across two parts of this project, and that split is kept intentionally:

- **Phonetics Masterclass section** — the pronunciation rules, IPA breakdowns, minimal-pairs listening drills, and the overall concept of this specific section were **not created by me**. I found this section elsewhere and folded it into my project purely for **personal, non-commercial use**, to help myself learn German pronunciation and accent. I do not claim authorship or credit for this section. If you are the original creator and want it removed, modified, or credited differently, please open an issue or reach out and I will comply.
- **Everything else in this repository is my own work**, built from scratch: the overall site architecture and single-page navigation, the vocabulary, grammar, verb-conjugation, cases, reading, quiz, flashcard and progress-tracking modules, the CEFR-level content data, the design system and responsive layout, and all integration work that ties the phonetics section into the rest of the site (shared styling, shared navigation, shared vocabulary data, bug fixes, and content audits).

## Features

- **Vocabulary browser** — over 3,500 entries across A0 to C1, searchable and filterable by CEFR level and topic, with audio, IPA, plurals, example sentences, and a colour-coded article chip so noun gender is always visible.
- **Grammar lessons** — 60 lessons with rule explanations in Persian before the examples, plus "Difference from English" notes and cultural notes for B2 and C1.
- **Verb conjugation** — 69 verbs: present, past and perfect through C1, with subjunctive II and passive examples where available, plus practice.
- **Grammatical cases (Kasus)** — articles, pronouns and prepositions, plus a dedicated two-way preposition (Akkusativ / Dativ) exercise.
- **Dictation** — 18 items (3 per level); listen and type what you hear, with umlaut and sharp-s handling.
- **Dialogues** — 12 short two-speaker audio dialogues (2 per level).
- **45-day study path** — daily tasks linking vocabulary, grammar, dictation, dialogues, flashcards and quizzes.
- **Placement test** — 30 questions, with a short CEFR recommendation on the home page.
- **Reading comprehension** — 12 short texts (2 per level) with questions.
- **Level quiz** — a 10-question quiz mixing vocabulary, verb conjugation and case and article questions, with guaranteed unique distractors.
- **Flashcards** — a Leitner-style spaced-repetition (SM-2) deck across all levels, with a "due today" queue on the home dashboard.
- **Progress and backup** — per-level progress, XP, daily streak and badges, with JSON export and import for cross-device backup.
- **Phonetics Masterclass** *(sourced, see Attribution above)* — vowel, consonant and ending pronunciation rules, a word analyzer, minimal-pairs listening practice, and a recording and comparison tool.
- **Pronunciation audio** — spoken vocabulary and dialogues, with a Web Speech fallback where native audio is not available.
- **Design** — dark and light themes (respecting the system preference on first visit), keyboard navigation, and a responsive layout for mobile and desktop.

## Tech Stack

| Area | Technology |
| --- | --- |
| App type | Single-page web app, no build step |
| Languages | HTML5, CSS3, vanilla JavaScript |
| Styling | `style.css` (CSS variables for theming, responsive layout) |
| Logic | `script.js` (all controls bound in script, no inline handlers) |
| Audio proxy | `worker.js` (Cloudflare Worker proxy for pronunciation audio) |
| Data tools | `tools/` (data validation and enrichment scripts) |

## Getting Started

### Prerequisites

No build step and no package installation are required. Any modern browser and a static file server are enough.

### Installation

```bash
git clone https://github.com/GoldenTitab/Deutsch-Pronunciation.git
cd Deutsch-Pronunciation
```

### Run

Serve the repository root with any static file server and open the main page, or open the main HTML file directly in a browser. All progress is stored in the browser (localStorage), so no account or server database is needed.

## Project Structure

```
style.css       # All styling, theming (CSS variables) and responsive layout
script.js       # All application logic and event bindings
worker.js       # Cloudflare Worker proxy for pronunciation audio
tools/          # Data validation and enrichment scripts
```

## Usage

Start on the home dashboard: take the placement test to get a CEFR recommendation, follow the 45-day study path for daily tasks, browse vocabulary by level and topic, practise a grammar lesson or a verb set, and review the flashcards that are due today. Use JSON export in the progress section to back up your progress before switching devices.

## Data Quality

Vocabulary articles and plurals have been cross-checked against a German dictionary dump, with curated fixes for wrong genders, wrong plurals and broken example sentences, and with machine-generated example sentences removed where they taught incorrect German. Some long-tail IPA transcriptions, plurals and category assignments have not had a full native-speaker review, and a small share of entries still have no example sentence; those limits are documented in the repository history rather than hidden.

## Contributing

Issues are welcome, especially corrections to articles, plurals, IPA transcriptions and example sentences. If you are the original creator of the Phonetics Masterclass section, see the Attribution section above for how to request removal, modification or different credit.

## License

No license file is present in this repository.
