"use strict";
/* validate-data.js — data quality gate. Run: node tools/validate-data.js
 * Exits non-zero and prints every violation it finds. */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
const errors = [];
const err = (m) => errors.push(m);

const core = JSON.parse(fs.readFileSync(path.join(DATA, "core.json"), "utf8"));
const SECTIONS = new Set(["home", "path", "vocabulary", "grammar", "conjugation", "cases", "levels",
  "reading", "dialogues", "dictation", "writing", "quiz", "flashcards", "progress", "phonetics"]);

for (const q of core.placementTest) if (!q.options.includes(q.answer)) err(`placement answer not in options: ${q.q}`);
for (const r of core.readings) for (const q of r.questions) if (!q.options.includes(q.answer)) err(`reading answer not in options: ${r.title} / ${q.q}`);
for (const d of core.studyPlan) for (const t of d.tasks || []) if (t.section && !SECTIONS.has(t.section)) err(`studyPlan day ${d.day}: bad section ${t.section}`);
if (core.studyPlan.length !== 45) err(`studyPlan must have 45 days, has ${core.studyPlan.length}`);
const PRON = ["ich", "du", "er_sie_es", "wir", "ihr", "sie_Sie"];
for (const v of core.verbs) {
  for (const tense of ["present", "praeteritum"]) for (const p of PRON) if (!v[tense] || !v[tense][p]) err(`verb ${v.infinitive}: missing ${tense}.${p}`);
  if (!["sein", "haben"].includes(v.auxiliary)) err(`verb ${v.infinitive}: bad auxiliary ${v.auxiliary}`);
}
for (const w of core.wechselExercises) if (!["Akkusativ", "Dativ"].includes(w.caseNeeded)) err(`wechsel: bad caseNeeded ${w.caseNeeded}`);

const BROKEN_EXAMPLES = [
  /ist ein wichtiges Wort/i, /^Das Buch liegt (sehr|wirklich|oft|gern) dem Tisch/, /^Die Zahl .+ ist wichtig/,
  /^Wo ist der\/die\/das /, /^Das ist mein\/e /, /^Das kostet viel /, /^Ich fühle mich [A-ZÄÖÜ]/,
  /^Kannst du sich /, /Mein Beruf ist (der|die|das) /, /^Ich lerne das Wort/,
  /^Der\/Die\/Das /, /^Ich benutze \S+ jeden Tag\.$/, /^(Der|Die|Das) [^ ]+ ist (wichtig|nützlich)\.$/, /^(Der|Die|Das) (der|die|das) /,
  /^Hier ist (der|die|das) [^ ]+ ist /, /esse gerne der /, /^Mein(e)? .+ ist gesund.$/, / ist ein wichtiges Thema.$/
];
const seen = new Map();
let total = 0, withExample = 0, withArticle = 0, nouns = 0;
for (const lvl of LEVELS) {
  const arr = JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"));
  for (const w of arr) {
    total++;
    const tag = `${lvl}/${w.word}`;
    if (!w.word || !w.fa || !w.en || !w.ipa) err(`${tag}: missing word/fa/en/ipa`);
    if (w.level !== lvl) err(`${tag}: level field is ${w.level}`);
    if (/^(der|die|das)\s/i.test(w.word)) err(`${tag}: article prefix still in word`);
    if (w.article && !["der", "die", "das"].includes(w.article)) err(`${tag}: bad article ${w.article}`);
    if (/^[A-ZÄÖÜ]/.test(w.word) && !/\s/.test(w.word)) { nouns++; if (w.article) withArticle++; }
    if (w.plural && !/^die /.test(w.plural)) err(`${tag}: plural must start with "die ": ${w.plural}`);
    if (w.article === "die" && w.plural === "die " + w.word + "e") err(`${tag}: feminine plural cannot be stem+e: ${w.plural}`);
    if (w.example) {
      withExample++;
      for (const re of BROKEN_EXAMPLES) if (re.test(w.example)) err(`${tag}: broken example survives: ${w.example}`);
      if (w.exampleEn && /\bthe the\b/i.test(w.exampleEn)) err(`${tag}: exampleEn has 'the the': ${w.exampleEn}`);
      if (!w.exampleFa || !w.exampleEn) err(`${tag}: example without fa/en translation`);
    }
    if (w.enNote && /^Possible cognate with English/.test(w.enNote)) err(`${tag}: auto cognate note survives`);
    const key = (w.word || "").toLowerCase();
    if (seen.has(key)) err(`${tag}: duplicate of ${seen.get(key)} entry`);
    seen.set(key, lvl);
  }
}
console.log(`vocab: ${total} entries | with example: ${withExample} (${Math.round(withExample / total * 100)}%) | nouns with article: ${withArticle}/${nouns}`);
console.log(`core: grammar ${core.grammar.length} | verbs ${core.verbs.length} | readings ${core.readings.length} | dialogues ${core.dialogues.length} | dictation ${core.dictation.length} | placement ${core.placementTest.length} | studyPlan ${core.studyPlan.length}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):`);
  errors.slice(0, 60).forEach(e => console.error(" -", e));
  process.exit(1);
}
console.log("✓ all data checks passed");
