"use strict";
/* fix-data-5.js — dictionary cross-check against the official de.wiktionary dump
 * (pages-articles multistream; the API rate-limits bulk use, dumps are the sanctioned route).
 * Input: /tmp/wikidump/de-texts.json ({word: wikitext}) extracted from the dump.
 * --report: compare only, write tools/wiki-report.json.
 * --apply:  fill missing articles/plurals + apply ADJUDICATE fixes.
 * Sources inside each page: {{Deutsch Substantiv Übersicht}} Genus + Nominativ Plural,
 * cross-checked with the {{Wortart|Substantiv}} gender marker on the same page. */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const TEXTS = "/tmp/wikidump/de-texts.json";
const REPORT_FILE = path.join(__dirname, "wiki-report.json");
const SKIP = new Set(["Geschwister", "Vereinigten Staaten"]); // plural-only by design
const ADJUDICATE = {
  // sense-driven overrides (dictionary's first box is a different sense / regional variant)
  Steuer: { article: "die", plural: "die Steuern" },        // tax (dict box 1 = steering wheel, das)
  Silvester: { article: "das" }, Schnitzel: { article: "das" }, Yoga: { article: "das" }, // standard neuter (dict box 1 = regional m)
  Schnupfen: { article: "der" },                            // Duden standard (de.wiki lists n)
  Ton: { plural: "die Töne" },                              // sound sense (dict box 1 = clay, Tone)
  Schild: { article: "das", plural: "die Schilder" },       // sign (Schilde = shields)
  Keks: { plural: "die Kekse" },                            // standard (dict first = Austrian zero plural)
  // uncountable / plural-only modelling
  Basilikum: { plural: null }, Ostern: { plural: null }, Sport: { plural: null },
  Milch: { plural: null }, Mittagszeit: { plural: null }, Vollzeit: { plural: null }, Vielfalt: { plural: null }, // dict lists rare/dialectal plurals; taught as uncountable
  Musik: { plural: null }, Freizeit: { plural: null }, Handel: { plural: null },
  Prag: { article: null, plural: null },
  Wien: { article: null }, China: { article: null },
  Leute: { plural: null, note: "فقط به صورت جمع به کار می‌رود." },
  Medien: { article: null, plural: null, note: "فقط به صورت جمع به کار می‌رود (جمعِ Medium)." },
  "Großeltern": { plural: null, note: "فقط به صورت جمع به کار می‌رود." },
};
const G2A = { m: "der", f: "die", n: "das" };

function parseDe(txt) {
  if (!txt) return null;
  const res = {};
  const ub = txt.indexOf("{{Deutsch Substantiv Übersicht");
  if (ub >= 0) {
    const block = txt.slice(ub, (txt.indexOf("\n}}", ub) + 3) || undefined);
    const g = /\|Genus 1\s*=\s*([mfn])/.exec(block) || /\|Genus\s*=\s*([mfn])/.exec(block);
    if (g) res.genus = g[1];
    const p = /\|Nominativ Plural(?: 1)?\s*=\s*([^\|\n]+)/.exec(block);
    if (p) {
      const v = p[1].trim().replace(/\[\[|\]\]/g, "");
      if (v && v !== "—" && v !== "-" && !v.includes("{{") && !/kein/i.test(v)) res.plural = v;
    }
  }
  const w = /\{\{Wortart\|Substantiv\|Deutsch\}\}[^=]{0,14}\{\{([mfn])\}\}/.exec(txt);
  if (w) res.wortart = w[1];
  if (/Pluraletantum/.test(txt)) res.tantum = "pl";
  if (/Singularetantum/.test(txt)) res.tantum = "sg";
  return (res.genus || res.plural || res.wortart) ? res : null;
}

const mode = process.argv[2] || "--report";
const texts = JSON.parse(fs.readFileSync(TEXTS, "utf8"));
const levels = ["A0", "A1", "A2", "B1", "B2", "C1"];
const files = {};
for (const lvl of levels) files[lvl] = JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"));

const stats = { fill: 0, confirm: 0, article_conflict: 0, plural_fill: 0, plural_conflict: 0, no_source: 0, genus_internal_conflict: 0 };
const conflicts = [], fills = [], pluralFills = [], pluralConflicts = [], internal = [];
for (const lvl of levels) {
  for (const w of files[lvl]) {
    if (!/^[A-ZÄÖÜ][^ ]*$/.test(w.word) || SKIP.has(w.word)) continue;
    const c = parseDe(texts[w.word]);
    if (!c) { if (!w.article) stats.no_source++; continue; }
    if (c.genus && c.wortart && c.genus !== c.wortart) { stats.genus_internal_conflict++; internal.push({ word: w.word, lvl, genus: c.genus, wortart: c.wortart }); }
    const genus = c.genus || c.wortart;
    if (genus) {
      const art = G2A[genus];
      if (!w.article) { fills.push({ word: w.word, lvl, art, fa: w.fa }); stats.fill++; }
      else if (w.article !== art) { conflicts.push({ word: w.word, lvl, ours: w.article, dict: art, fa: w.fa }); stats.article_conflict++; }
      else stats.confirm++;
    }
    if (c.plural) {
      const want = "die " + c.plural;
      if (!w.plural) { pluralFills.push({ word: w.word, lvl, want }); stats.plural_fill++; }
      else if (w.plural !== want) pluralConflicts.push({ word: w.word, lvl, ours: w.plural, dict: want, fa: w.fa, tantum: c.tantum || null });
    }
  }
}
stats.plural_conflict = pluralConflicts.length;
console.log(JSON.stringify(stats));
fs.writeFileSync(REPORT_FILE, JSON.stringify({ stats, conflicts, internal, fills, pluralFills, pluralConflicts }, null, 1), "utf8");
console.log("report → tools/wiki-report.json");
if (mode === "--report") process.exit(0);

let applied = { article_fill: 0, plural_fill: 0, adj: 0 };
const byWord = {};
for (const f of fills) (byWord[f.word] ||= {}).article = f.art;
for (const f of pluralFills) (byWord[f.word] ||= {}).plural = f.want;
for (const c of conflicts) (byWord[c.word] ||= {}).article = c.dict;
for (const c of pluralConflicts) (byWord[c.word] ||= {}).plural = c.dict;
for (const lvl of levels) {
  for (const w of files[lvl]) {
    const a = ADJUDICATE[w.word];
    let touchedA = false, touchedP = false;
    if (a) {
      if (a.article !== undefined) { touchedA = true; if (w.article !== a.article) { if (a.article) w.article = a.article; else delete w.article; applied.adj++; } }
      if (a.plural !== undefined) { touchedP = true; if (a.plural) { if (w.plural !== a.plural) { w.plural = a.plural; delete w.pluralNote; applied.adj++; } } else if (w.plural) { delete w.plural; applied.adj++; } }
      if (a.note && !w.grammarNote) { w.grammarNote = a.note; applied.adj++; }
    }
    const b = byWord[w.word];
    if (!b) continue;
    if (!touchedA && b.article && w.article !== b.article) { w.article = b.article; applied.article_fill++; }
    if (!touchedP && b.plural && w.plural !== b.plural) { w.plural = b.plural; delete w.pluralNote; applied.plural_fill++; }
  }
  fs.writeFileSync(path.join(DATA, `vocab-${lvl}.json`), JSON.stringify(files[lvl], null, 2) + "\n", "utf8");
}
console.log("applied:", JSON.stringify(applied));
