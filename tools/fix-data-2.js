"use strict";
/* fix-data-2.js — round 2: suffix-based articles, more plurals, safe example
 * frames for nouns/adjectives/verbs/numbers, hand-written A0 examples.
 * Run AFTER tools/fix-data.js:  node tools/fix-data-2.js */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
const counts = {};
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

const ARTICLE_SUFFIX = [
  [/ie$/, "die"], [/erei$/, "die"], [/ung$/, "die"], [/heit$/, "die"], [/keit$/, "die"],
  [/schaft$/, "die"], [/tion$/, "die"], [/sion$/, "die"], [/tät$/, "die"], [/ik$/, "die"],
  [/chen$/, "das"], [/lein$/, "das"], [/ismus$/, "der"], [/ling$/, "der"],
];
const ARTICLE_ADD2 = { Genie: "das", Knie: "das", Eiskaffee: "der", Türkei: "die", Papagei: "der" };
const PLURAL_FIX2 = { Genie: "die Genies", Knie: "die Knie", Eiskaffee: "die Eiskaffees" };
const MONTHS = new Set(["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember",
  "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]);
const MODALS = new Set(["können", "müssen", "wollen", "dürfen", "sollen", "mögen", "möchten", "wissen", "werden", "sein", "haben"]);
const VERB_EXCLUDE = new Set(["anziehen", "ausziehen", "umziehen", "anmelden", "abmelden", "entscheiden", "befinden", "entwickeln", "verhalten", "benehmen", "beeilen"]);
const ATTRIB_ONLY = new Set(["ehemalig", "ehemalige", "ehemaliger", "ehemaliges", "folgend", "folgende", "nächste", "nächsten", "sonstig", "sonstige", "jeweilig", "jeweiliger", "obig", "obige", "anderweitig"]);

const A0_EXAMPLES = {
  "ein": ["Das ist ein Buch.", "این یک کتاب است.", "This is a book."],
  "eine": ["Das ist eine Lampe.", "این یک چراغ است.", "This is a lamp."],
  "möchten": ["Ich möchte einen Kaffee.", "یک قهوه می‌خواهم (مؤدبانه).", "I would like a coffee."],
  "mögen": ["Ich mag Musik.", "موسیقی دوست دارم.", "I like music."],
  "heißen": ["Ich heiße Ali.", "اسم من علی است.", "My name is Ali."],
  "machen": ["Was machst du heute?", "امروز چه کار می‌کنی؟", "What are you doing today?"],
  "trinken": ["Ich trinke Wasser.", "آب می‌نوشم.", "I drink water."],
  "Was?": ["Was ist das?", "این چیست؟", "What is this?"],
  "Wer?": ["Wer ist das?", "این کیست؟", "Who is this?"],
  "sehr": ["Das ist sehr gut.", "این خیلی خوب است.", "That is very good."],
  "warum": ["Warum lernst du Deutsch?", "چرا آلمانی یاد می‌گیری؟", "Why are you learning German?"],
  "wie": ["Wie heißt du?", "اسمت چیست؟", "What is your name?"],
  "Ich bin ... Jahre alt.": ["Ich bin 20 Jahre alt.", "من ۲۰ سال دارم.", "I am 20 years old."],
  "gestern": ["Gestern war ich zu Hause.", "دیروز خانه بودم.", "Yesterday I was at home."],
  "heute": ["Heute lerne ich Deutsch.", "امروز آلمانی یاد می‌گیرم.", "Today I am learning German."],
  "jetzt": ["Ich lerne jetzt Deutsch.", "الان آلمانی یاد می‌گیرم.", "I am learning German now."],
  "morgen": ["Morgen ist Samstag.", "فردا شنبه است.", "Tomorrow is Saturday."],
  "dort": ["Das Buch ist dort.", "کتاب آنجاست.", "The book is there."],
  "wo": ["Wo ist das Buch?", "کتاب کجاست؟", "Where is the book?"],
  "groß": ["Das Haus ist groß.", "خانه بزرگ است.", "The house is big."],
  "jung": ["Er ist jung.", "او جوان است.", "He is young."],
  "klein": ["Das Zimmer ist klein.", "اتاق کوچک است.", "The room is small."],
  "all": ["Alle sind hier.", "همه اینجایند.", "Everyone is here."],
  "ander": ["Ein anderes Buch, bitte.", "یک کتاب دیگر، لطفاً.", "Another book, please."],
  "aufs": ["Leg das Buch aufs Bett!", "کتاب را روی تخت بگذار!", "Put the book on the bed!"],
  "entlang": ["Wir gehen die Straße entlang.", "در امتداد خیابان می‌رویم.", "We walk along the street."],
  "euer": ["Ist das euer Auto?", "آیا این ماشین شماست؟", "Is that your car?"],
  "eure": ["Ist das eure Tasche?", "آیا این کیف شماست؟", "Is that your bag?"],
  "fürs": ["Danke fürs Helfen!", "ممنون بابت کمک!", "Thanks for helping!"],
  "irgendwas": ["Hast du irgendwas gesagt?", "چیزی گفتی؟", "Did you say something?"],
  "irgendwer": ["Irgendwer ist an der Tür.", "یک نفر پشت در است.", "Someone is at the door."],
  "keinerlei": ["Ich habe keinerlei Fragen.", "هیچ‌گونه سؤالی ندارم.", "I have no questions whatsoever."],
  "mancher": ["Mancher lernt schnell.", "بعضی‌ها سریع یاد می‌گیرند.", "Some people learn fast."],
  "niemand": ["Niemand ist hier.", "هیچ‌کس اینجا نیست.", "Nobody is here."],
  "per": ["Ich schicke es per E-Mail.", "آن را با ایمیل می‌فرستم.", "I send it by email."],
  "selber": ["Ich mache es selber.", "خودم انجامش می‌دهم.", "I do it myself."],
  "trotz": ["Trotz des Regens gehen wir raus.", "با وجود باران بیرون می‌رویم.", "Despite the rain, we go out."],
  "Wann?": ["Wann kommst du?", "کی می‌آیی؟", "When are you coming?"],
  "welcher": ["Welcher Tag ist heute?", "امروز چه روزی است؟", "Which day is today?"],
  "welches": ["Welches Buch ist gut?", "کدام کتاب خوب است؟", "Which book is good?"],
  "Woher?": ["Woher kommst du?", "اهل کجایی؟", "Where are you from?"],
  "wohin": ["Wohin gehst du?", "کجا می‌روی؟", "Where are you going to?"],
  "Mann": ["Das ist der Mann.", "این مرد است.", "This is the man."],
};
const PHRASE_SELF = new Set(["auf Wiederhören", "bis zum nächsten Mal", "entschuldigen Sie bitte", "Gute Nacht",
  "Guten Abend", "guten Appetit", "Guten Morgen", "guten Rutsch ins neue Jahr", "Guten Tag", "Hallo",
  "hallo zusammen", "naja", "Wie geht es dir?", "Wie geht es Ihnen?", "wie geht's"]);

const firstSeg = (s) => (s || "").split(/\s*\/\s*/)[0].replace(/\s*\([^)]*\)\s*/g, "").trim();
const faShortVerb = (s) => { const f = firstSeg(s); return /ن$/.test(f) && f.length > 2 ? f.slice(0, -1) : f; };

for (const lvl of LEVELS) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    // articles by suffix / map
    if (!w.article && /^[A-ZÄÖÜ]/.test(w.word || "") && !/\s/.test(w.word)) {
      if (ARTICLE_ADD2[w.word]) { w.article = ARTICLE_ADD2[w.word]; bump("article_add2"); }
      else for (const [re, art] of ARTICLE_SUFFIX) { if (re.test(w.word)) { w.article = art; bump("article_suffix_" + art); break; } }
    }
    if (PLURAL_FIX2[w.word] && w.plural !== PLURAL_FIX2[w.word]) { w.plural = PLURAL_FIX2[w.word]; bump("plural_fix2"); }
    if (w.word === "Türkei") { delete w.plural; }
    // month/weekday english frame polish
    if (MONTHS.has(w.word) && /^Das ist der /.test(w.example || "")) {
      w.exampleEn = `This is ${firstSeg(w.en)}.`;
    }
    // A0 hand-written examples + phrase-self
    if (lvl === "A0" && !w.example) {
      if (A0_EXAMPLES[w.word]) {
        [w.example, w.exampleFa, w.exampleEn] = A0_EXAMPLES[w.word]; bump("a0_hand_example");
      } else if (PHRASE_SELF.has(w.word)) {
        w.example = w.word; w.exampleFa = w.fa; w.exampleEn = w.en; bump("a0_phrase_self");
      }
    }
    if (w.example) continue;
    const fa1 = firstSeg(w.fa), en1 = firstSeg(w.en);
    const faOk = fa1 && fa1.length <= 25, enOk = en1 && en1.length <= 35 && !/^to /i.test(en1);
    // noun frame v2 (first-segment glosses)
    if (w.article && faOk && enOk) {
      w.example = `Das ist ${w.article} ${w.word}.`;
      w.exampleFa = `این ${fa1} است.`;
      w.exampleEn = `This is the ${en1.replace(/^the /i, "")}.`;
      bump("frame_noun2"); continue;
    }
    const cat = w.category || "";
    const single = !/\s/.test(w.word || "");
    // adjective frame
    if (single && (cat.includes("صفت") || cat.includes("احساسات")) && /^[a-zäöüß]/.test(w.word) &&
        !w.word.startsWith("am ") && !ATTRIB_ONLY.has(w.word) && faOk && enOk) {
      w.example = `Das ist ${w.word}.`;
      w.exampleFa = `این ${fa1} است.`;
      w.exampleEn = `This is ${en1}.`;
      bump("frame_adj"); continue;
    }
    // verb frame
    if (single && cat.includes("افعال") && /^[a-zäöüß]/.test(w.word) && /(en|eln|ern)$/.test(w.word) &&
        !MODALS.has(w.word) && !VERB_EXCLUDE.has(w.word) && fa1) {
      const enVerb = (w.en || "").split(/\s*\/\s*/)[0].replace(/^to\s+/i, "").replace(/\s*\([^)]*\)\s*/g, "").trim();
      if (enVerb && enVerb.length <= 30 && !/\s/.test(enVerb.split(" ")[0]) ) {
        w.example = `Man kann hier ${w.word}.`;
        w.exampleFa = `اینجا می‌توان ${faShortVerb(w.fa)}.`;
        w.exampleEn = `You can ${enVerb} here.`;
        bump("frame_verb"); continue;
      }
    }
    // number frame
    if (single && cat.includes("اعداد") && fa1 && en1) {
      w.example = `Ich zähle bis ${w.word}.`;
      w.exampleFa = `تا ${fa1} می‌شمارم.`;
      w.exampleEn = `I count to ${en1}.`;
      bump("frame_number"); continue;
    }
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
  console.log(lvl, "done");
}
console.log(JSON.stringify(counts, null, 2));
