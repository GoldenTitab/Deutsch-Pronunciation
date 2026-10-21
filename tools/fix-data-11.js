"use strict";
/* fix-data-11.js — examples for the final 11 cleared entries. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const E = (example, exampleFa, exampleEn) => ({ example, exampleFa, exampleEn });
const FIX = {
  "woher": E("Woher kommst du?", "تو از کجا می‌آیی؟", "Where do you come from?"),
  "ermöglichen": E("Das ermöglicht vieles.", "این خیلی چیزها را ممکن می‌کند.", "That makes many things possible."),
  "berechtigen": E("Die Karte berechtigt zum Eintritt.", "این کارت اجازه‌ی ورود می‌دهد.", "The card entitles you to entry."),
  "legitimieren": E("Das legitimiert sein Handeln.", "این کار او را توجیه می‌کند.", "That legitimises his actions."),
  "explizieren": E("Er expliziert den Begriff.", "او مفهوم را شرح می‌دهد.", "He explicates the concept."),
  "extrapolieren": E("Man kann die Daten extrapolieren.", "می‌توان داده‌ها را برون‌یابی کرد.", "One can extrapolate the data."),
  "implizieren": E("Das impliziert ein Risiko.", "این مستلزم یک خطر است.", "That implies a risk."),
  "kontrastieren": E("Die Farben kontrastieren stark.", "رنگ‌ها تضاد شدیدی دارند.", "The colours contrast strongly."),
  "postulieren": E("Er postuliert eine neue Theorie.", "او نظریه‌ی جدیدی مطرح می‌کند.", "He postulates a new theory."),
  "reflektieren": E("Sie reflektiert über den Text.", "او درباره‌ی متن تأمل می‌کند.", "She reflects on the text."),
  "synthetisieren": E("Der Körper synthetisiert Vitamin D.", "بدن ویتامین D می‌سازد.", "The body synthesises vitamin D."),
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const w of arr) if (FIX[w.word] && !w.example) { Object.assign(w, FIX[w.word]); n++; }
  if (n) { fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8"); console.log(lvl, n); }
}
