"use strict";
/* fix-data-13.js — curated examples for the 32 entries cleared by fix-data-12,
 * the mangled "macht" phrase entry, and accusative case in the essen frame. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const E = (example, exampleFa, exampleEn) => ({ example, exampleFa, exampleEn });
const CURATED = {
  "beißen": E("Der Hund beißt nicht.", "سگ گاز نمی‌گیرد.", "The dog does not bite."),
  "bewegen": E("Er bewegt sich viel.", "او زیاد حرکت می‌کند.", "He moves a lot."),
  "blass": E("Sie ist blass.", "او رنگ‌پریده است.", "She is pale."),
  "blond": E("Sie ist blond.", "او بلوند است.", "She is blonde."),
  "bluten": E("Die Wunde blutet.", "زخم خونریزی می‌کند.", "The wound is bleeding."),
  "dick": E("Das Buch ist dick.", "کتاب قطور است.", "The book is thick."),
  "durstig": E("Ich bin durstig.", "من تشنه‌ام.", "I am thirsty."),
  "dünn": E("Er ist dünn.", "او لاغر است.", "He is thin."),
  "fit": E("Sie ist fit.", "او روی فرم است.", "She is fit."),
  "gesund": E("Das Essen ist gesund.", "غذا سالم است.", "The food is healthy."),
  "hungrig": E("Ich bin hungrig.", "من گرسنه‌ام.", "I am hungry."),
  "krank": E("Er ist krank.", "او مریض است.", "He is ill."),
  "müde": E("Ich bin müde.", "من خسته‌ام.", "I am tired."),
  "schwanger": E("Sie ist schwanger.", "او باردار است.", "She is pregnant."),
  "stark": E("Er ist stark.", "او قوی است.", "He is strong."),
  "stechen": E("Die Biene sticht.", "زنبور نیش می‌زند.", "The bee stings."),
  "steif": E("Mein Nacken ist steif.", "گردنم گرفته است.", "My neck is stiff."),
  "verletzt": E("Er ist verletzt.", "او زخمی است.", "He is injured."),
  "wach": E("Ich bin wach.", "من بیدارم.", "I am awake."),
  "weh": E("Mein Kopf tut weh.", "سرم درد می‌کند.", "My head hurts."),
  "meditieren": E("Sie meditiert jeden Tag.", "او هر روز مدیتیشن می‌کند.", "She meditates every day."),
  "schnarchen": E("Er schnarcht laut.", "او بلند خرخر می‌کند.", "He snores loudly."),
  "schwindelig": E("Mir ist schwindelig.", "سرم گیج می‌رود.", "I feel dizzy."),
  "sich erholen": E("Er erholt sich gut.", "او خوب بهبود می‌یابد.", "He is recovering well."),
  "versichert": E("Ich bin versichert.", "من بیمه هستم.", "I am insured."),
  "Bürgerbüro": { article: "das", ...E("Das ist das Bürgerbüro.", "این اداره‌ی امور شهروندان است.", "This is the citizens' office.") },
  "fordern": E("Sie fordert mehr Zeit.", "او وقت بیشتری می‌خواهد.", "She demands more time."),
  "hiermit": E("Hiermit sende ich den Antrag.", "بدین‌وسیله درخواست را می‌فرستم.", "I hereby send the application."),
  "korrupt": E("Der Beamte ist korrupt.", "آن کارمند فاسد است.", "The official is corrupt."),
  "politisch": E("Das ist ein politisches Thema.", "این یک موضوع سیاسی است.", "That is a political topic."),
  "sozial": E("Das ist ein soziales Problem.", "این یک مشکل اجتماعی است.", "That is a social problem."),
  "international": E("Das ist eine internationale Schule.", "این یک مدرسه‌ی بین‌المللی است.", "That is an international school."),
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    if (CURATED[w.word] && !w.example) Object.assign(w, CURATED[w.word]);
    if (w.word === "macht") {
      delete w.article; delete w.plural;
      w.ipa = "[maxt]";
      Object.assign(w, E("Das macht fünf Euro.", "جمعش می‌شود پنج یورو.", "That comes to five euros."));
    }
    if (w.example && /^Ich esse gerne der .+\.$/.test(w.example)) {
      w.example = w.example.replace("esse gerne der ", "esse gerne den ");
    }
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
let tot = 0, ex = 0;
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  for (const w of JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"))) { tot++; if (w.example) ex++; }
}
console.log(`coverage: ${ex}/${tot}`);
