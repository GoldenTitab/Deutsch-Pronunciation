"use strict";
/* fix-data-9.js — translation repairs caught by the extended validator:
 * superlative 'the the' + three legacy 'The the X is …' exampleEn strings. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const FIX = {
  "Karibik": { example: "Die Karibik ist wunderschön.", exampleFa: "کارائیب بسیار زیباست.", exampleEn: "The Caribbean is beautiful." },
  "Vereinigten Staaten": { example: "Die Vereinigten Staaten sind groß.", exampleFa: "ایالات متحده بزرگ است.", exampleEn: "The United States is large." },
  "Öffentlichkeit": { example: "Die Öffentlichkeit wartet.", exampleFa: "افکار عمومی منتظر است.", exampleEn: "The public is waiting." },
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const w of arr) {
    if (FIX[w.word]) { Object.assign(w, FIX[w.word]); n++; }
    if (/^am \w+(sten|ten)$/.test(w.word) && w.exampleEn && /\bthe the\b/i.test(w.exampleEn)) {
      w.exampleEn = "That is the " + (w.en || "").replace(/^the\s+/i, "") + ".";
      n++;
    }
  }
  if (n) { fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8"); console.log(lvl, "fixed", n); }
}
