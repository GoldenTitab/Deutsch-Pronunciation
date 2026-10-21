"use strict";
/* fix-data-12.js — last two junk frames:
 *  "Mein(e) X ist gesund."  (wrong possessive for feminine nouns, absurd semantics)
 *  "X ist ein wichtiges Thema." (template; one verb slipped in)
 * Both → verified noun frame; exceptions curated. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const counts = {}; const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };
const E = (example, exampleFa, exampleEn) => ({ example, exampleFa, exampleEn });
const CURATED = {
  "ermitteln": E("Die Polizei ermittelt.", "پلیس تحقیق می‌کند.", "The police are investigating."),
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    if (!w.example) continue;
    const junk = /^Mein(e)? .+ ist gesund\.$/.test(w.example) || / ist ein wichtiges Thema\.$/.test(w.example);
    if (!junk) continue;
    if (CURATED[w.word]) { Object.assign(w, CURATED[w.word]); bump("curated"); continue; }
    if (w.article && /^[A-ZÄÖÜ]/.test(w.word)) {
      const fa1 = (w.fa || "").split(/\s*\/\s*/)[0].trim();
      const en1 = (w.en || "").split(/\s*\/\s*/)[0].trim().replace(/^the\s+/i, "");
      Object.assign(w, E(`Das ist ${w.article} ${w.word}.`, `این ${fa1} است.`, `This is the ${en1}.`));
      bump("noun_frame"); continue;
    }
    delete w.example; delete w.exampleFa; delete w.exampleEn;
    bump("cleared");
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
console.log(counts);
