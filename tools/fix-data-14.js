"use strict";
/* fix-data-14.js — last unsourced compounds. German compounds take the gender of
 * their final constituent (a deterministic rule, not a guess):
 * Haarreif←der Reif, Mittagsmenü←das Menü, Nebenfach←das Fach,
 * Lösungsansatz←der Ansatz, Bankkaufmann←der Kaufmann, Jobinterview←das Interview,
 * BWL←die (Betriebswirtschafts)lehre, KI←die Intelligenz. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const ART = { "Haarreif": "der", "Mittagsmenü": "das", "Nebenfach": "das", "Lösungsansatz": "der", "Bankkaufmann": "der", "Jobinterview": "das", "BWL": "die", "KI": "die" };
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const w of arr) { if (ART[w.word] && !w.article) { w.article = ART[w.word]; n++; } if (w.word === "BWL") delete w.plural; }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8"); if (n) console.log(lvl, n);
}
