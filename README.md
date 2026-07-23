# German Pronunciation Masterclass

## ⚠️ Disclaimer

This project is **not my own work**. The source code was created by someone else; I did not design or develop it.

I have uploaded it to my personal GitHub account purely for **personal, non-commercial use** — specifically to help myself **learn German pronunciation and accent** as a Progressive Web App (PWA) that I can install on my phone and use offline.

I do not claim authorship, credit, or any rights to this code. If you are the original creator of this project and would like it removed, modified, or properly credited, please reach out to me or open an issue, and I will gladly comply.

## Structure

The site is a single-page app: `index.html` holds every section (home, vocabulary, grammar, levels, flashcards, progress, and the Phonetics Masterclass), and the in-page navigation switches between them without leaving the tab or loading a separate page. The old standalone `phonetics.html` is no longer linked and can be deleted from the repo.

## Purpose

This repository hosts a static web page (converted into an installable PWA) that helps with:

- Practicing German vowel and consonant pronunciation
- Understanding pronunciation rules and IPA transcriptions
- Listening to word pronunciations via the browser's built-in speech synthesis

## Setup Instructions

1. **Replace the TTS Worker URL**:
   - Everything (vocabulary, grammar, flashcards, and the Phonetics Masterclass) now lives in a single `index.html`, loading `script.js` then `phonetics.js`. Only `script.js` declares `TTS_WORKER_URL`; `phonetics.js` reuses it, so you only need to edit it in one place.
   - Example: `const TTS_WORKER_URL = 'https://tts-proxy.your-subdomain.workers.dev/';`

2. **Configure the Cloudflare Worker**:
   - Follow the instructions in `worker.js` to set up your own Cloudflare Worker.
   - Set the `TTS_API_KEY` secret with your Google Cloud TTS API key.

3. **Add Icons**:
   - Place `icon-192.png` and `icon-512.png` inside an `icons/` folder for PWA support.

4. **Deploy**:
   - Upload all files to a web server (or use GitHub Pages, Netlify, etc.).
   - The app will work offline once visited.

## Usage

This is for personal educational use only. No commercial use is intended.
