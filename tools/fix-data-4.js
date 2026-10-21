"use strict";
/* fix-data-4.js — round 4 (found by runtime QA): Abitur gender, umlaut/weak plurals,
 * invalid die+stem+e plurals, plural-only -schmerzen nouns, more everyday articles. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const counts = {}; const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };
const PLURAL_FIX4 = {
  Magen: "die Mägen", Ofen: "die Öfen", Hafen: "die Häfen", Garten: "die Gärten",
  Schaden: "die Schäden", Laden: "die Läden", Mantel: "die Mäntel", Vogel: "die Vögel",
  Nagel: "die Nägel", Faden: "die Fäden", Geldautomat: "die Geldautomaten",
  Geschäftsfrau: "die Geschäftsfrauen",
};
const WEAK_DER = new Set(["Student", "Polizist", "Tourist", "Automat", "Architekt", "Präsident",
  "Assistent", "Praktikant", "Komponist", "Journalist", "Soldat", "Kandidat", "Patient",
  "Fotograf", "Dozent", "Produzent", "Dirigent", "Agent", "Planet", "Elefant", "Diamant",
  "Satellit", "Typ"]);
const ARTICLE_ADD4 = {
  Roman: "der", Bauch: "der", Magen: "der", Rücken: "der", Hals: "der", Finger: "der",
  Zeh: "der", Ellbogen: "der", Knochen: "der", Muskel: "der", Nerv: "der",
  Student: "der", Polizist: "der", Tourist: "der", Architekt: "der", Präsident: "der",
  Assistent: "der", Praktikant: "der", Komponist: "der", Journalist: "der", Soldat: "der",
  Kandidat: "der", Patient: "der", Fotograf: "der", Dozent: "der", Produzent: "der",
  Dirigent: "der", Agent: "der",
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    // Abitur is neuter; its stored plural mixed in a different word (Abiturient)
    if (w.word === "Abitur") {
      w.article = "das"; w.plural = "die Abiture"; delete w.pluralNote; bump("abitur_fixed"); continue;
    }
    // -schmerzen nouns are plural-only in real usage
    if (/schmerzen$/i.test(w.word)) {
      delete w.article; delete w.plural; delete w.pluralNote;
      if (!w.grammarNote) w.grammarNote = "فقط به صورت جمع به کار می‌رود: Ich habe …schmerzen.";
      const fa1 = (w.fa || "").split(/\s*\/\s*/)[0].trim();
      const en1 = (w.en || "").split(/\s*\/\s*/)[0].trim();
      w.example = `Ich habe ${w.word}.`;
      if (fa1) w.exampleFa = `${fa1} دارم.`;
      if (en1) w.exampleEn = `I have a ${en1}.`;
      bump("schmerzen_plural_only"); continue;
    }
    if (!w.article && ARTICLE_ADD4[w.word]) { w.article = ARTICLE_ADD4[w.word]; bump("article_add4"); }
    if (!w.article && /rin$/.test(w.word) && /^[A-ZÄÖÜ]/.test(w.word)) { w.article = "die"; bump("article_rin_die"); }
    if (w.plural && PLURAL_FIX4[w.word] && w.plural !== PLURAL_FIX4[w.word]) {
      w.plural = PLURAL_FIX4[w.word]; delete w.pluralNote; bump("plural_fix4");
    }
    if (w.plural) {
      const m = /^die (.+)$/.exec(w.plural);
      if (m) {
        const x = m[1], s = w.word;
        // weak (n-declension) masculines take -en, not -e
        if (WEAK_DER.has(s) && x === s + "e") { w.plural = "die " + s + "en"; delete w.pluralNote; bump("plural_weak_en"); }
        // a feminine plural can never be stem + e (that pattern is masc/neut only)
        else if (w.article === "die" && x === s + "e") { delete w.plural; delete w.pluralNote; bump("plural_dropped_die_e"); }
      }
    }
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
console.log(counts);
