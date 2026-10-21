"use strict";
/* fix-data-8.js — the last six example-less entries + CO2-Fußabdruck plural umlaut. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const FIX = {
  "draußen": { example: "Wir spielen draußen.", exampleFa: "ما بیرون بازی می‌کنیم.", exampleEn: "We play outside." },
  "Big Data": { example: "Firmen nutzen Big Data.", exampleFa: "شرکت‌ها از داده‌های کلان استفاده می‌کنند.", exampleEn: "Companies use big data." },
  "KI": { example: "KI hilft uns jeden Tag.", exampleFa: "هوش مصنوعی هر روز به ما کمک می‌کند.", exampleEn: "AI helps us every day." },
  "Künstliche Intelligenz": { example: "Künstliche Intelligenz hilft uns.", exampleFa: "هوش مصنوعی به ما کمک می‌کند.", exampleEn: "Artificial intelligence helps us." },
  "Machine Learning": { example: "Machine Learning ist ein Teil der KI.", exampleFa: "یادگیری ماشین بخشی از هوش مصنوعی است.", exampleEn: "Machine learning is part of AI." },
  "CO2-Fußabdruck": { article: "der", plural: "die CO2-Fußabdrücke", example: "Der CO2-Fußabdruck ist groß.", exampleFa: "ردپای کربن بزرگ است.", exampleEn: "The carbon footprint is large." },
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const w of arr) if (FIX[w.word]) { Object.assign(w, FIX[w.word]); n++; }
  if (n) { fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8"); console.log(lvl, "fixed", n); }
}
