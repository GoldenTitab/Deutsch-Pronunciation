"use strict";
/* fix-data-3.js — round 3 article completion: more certain suffix rules + everyday nouns. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const counts = {}; const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };
const ADD3 = {
  Abitur: "das", Schicksal: "das", Eigentum: "das", Datum: "das", Zentrum: "das", Museum: "das",
  Gymnasium: "das", Studium: "das", Praktikum: "das", Publikum: "das", Visum: "das", Labor: "das",
  Pass: "der", Personalausweis: "der", Führerschein: "der", Vertrag: "der", Termin: "der",
  Kalender: "der", Wecker: "der", Spiegel: "der", Kamm: "der", Handtuch: "das", Seife: "die",
  Zahnbürste: "die", Zahnpasta: "die", Shampoo: "das", Dusche: "die", Badewanne: "die",
  Toilette: "die", Waschmaschine: "die", Kühlschrank: "der", Herd: "der", Ofen: "der",
  Pfanne: "die", Teller: "der", Löffel: "der", Gabel: "die", Messer: "das", Tasse: "die",
  Flasche: "die", Dose: "die", Rucksack: "der", Regenschirm: "der", Brille: "die", Hut: "der",
  Mütze: "die", Schal: "der", Handschuh: "der", Hose: "die", Rock: "der", Hemd: "das",
  Jacke: "die", Mantel: "der", Schuh: "der", Gürtel: "der", Ring: "der", Kette: "die",
};
const ANZ_EXCLUDE = new Set(["Tanz", "Kranz", "Glanz", "Schwanz"]);
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    if (w.article || !/^[A-ZÄÖÜ]/.test(w.word || "") || /\s/.test(w.word)) continue;
    if (ADD3[w.word]) { w.article = ADD3[w.word]; bump("add3"); continue; }
    if (/enz$/.test(w.word)) { w.article = "die"; bump("suffix_enz"); continue; }
    if (/anz$/.test(w.word) && !ANZ_EXCLUDE.has(w.word)) { w.article = "die"; bump("suffix_anz"); continue; }
    if (/(ade|age|ette|ine|ose|üre)$/.test(w.word)) { w.article = "die"; bump("suffix_loan_die"); continue; }
    if (/ur$/.test(w.word)) { w.article = "die"; bump("suffix_ur"); continue; }
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
console.log(counts);
