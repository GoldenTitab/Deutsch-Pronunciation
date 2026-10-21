"use strict";
/* add-vocab-3.js — C1 expansion batch 3: hand-written academic/formal nouns.
 * Same dedupe guard as add-vocab.js: skips anything already present in any level. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const norm = (s) => s.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").replace(/[^a-z0-9 ]/gi, "").trim();
const POL = "جامعه، سیاست و حقوق", SCI = "علم و فلسفه", ECO = "اقتصاد و مالی";
const NEW = [
  { word: "Einwand", article: "der", plural: "die Einwände", ipa: "[ˈaɪ̯nvant]", fa: "اعتراض / ایراد", en: "objection", category: POL, example: "Er erhob einen Einwand gegen den Vorschlag.", exampleFa: "او به آن پیشنهاد اعتراض کرد.", exampleEn: "He raised an objection to the proposal." },
  { word: "Einschränkung", article: "die", plural: "die Einschränkungen", ipa: "[ˈaɪ̯nˌʃʁɛŋkʊŋ]", fa: "محدودیت", en: "restriction / limitation", category: POL, example: "Diese Einschränkung gilt für alle.", exampleFa: "این محدودیت برای همه اعمال می‌شود.", exampleEn: "This restriction applies to everyone." },
  { word: "Umsetzung", article: "die", plural: "die Umsetzungen", ipa: "[ˈʊmˌzɛt͡sʊŋ]", fa: "اجرا / پیاده‌سازی", en: "implementation", category: POL, example: "Die Umsetzung des Plans dauert lange.", exampleFa: "اجرای این طرح طول می‌کشد.", exampleEn: "The implementation of the plan is taking a long time." },
  { word: "Bewältigung", article: "die", ipa: "[bəˈvɛltɪɡʊŋ]", fa: "غلبه / مدیریت (بحران)", en: "coping / overcoming", category: SCI, example: "Die Bewältigung der Krise ist nicht leicht.", exampleFa: "مدیریت این بحران آسان نیست.", exampleEn: "Coping with the crisis is not easy." },
  { word: "Auseinandersetzung", article: "die", plural: "die Auseinandersetzungen", ipa: "[aʊ̯sʔaɪ̯ˈnandɐˌzɛt͡sʊŋ]", fa: "مناقشه / بحث جدی", en: "dispute / confrontation", category: POL, example: "Es kam zu einer heftigen Auseinandersetzung.", exampleFa: "مناقشه‌ی شدیدی درگرفت.", exampleEn: "A heated dispute broke out." },
  { word: "Sachverhalt", article: "der", plural: "die Sachverhalte", ipa: "[ˈzaxfɛɐ̯ˌhalt]", fa: "موضوع / واقعیت امر", en: "facts of the matter", category: POL, example: "Der Sachverhalt ist noch unklar.", exampleFa: "واقعیت ماجرا هنوز مشخص نیست.", exampleEn: "The facts of the matter are still unclear." },
  { word: "Angelegenheit", article: "die", plural: "die Angelegenheiten", ipa: "[ˈanɡəˌleːɡn̩haɪ̯t]", fa: "موضوع / کار", en: "matter / affair", category: POL, example: "Das ist meine Angelegenheit.", exampleFa: "این به خودم مربوط است.", exampleEn: "That is my own affair." },
  { word: "Verordnung", article: "die", plural: "die Verordnungen", ipa: "[fɛɐ̯ˈʔɔʁdnʊŋ]", fa: "آیین‌نامه / مقررات", en: "regulation / decree", category: POL, example: "Die Verordnung tritt morgen in Kraft.", exampleFa: "این آیین‌نامه از فردا لازم‌الاجرا می‌شود.", exampleEn: "The regulation comes into force tomorrow." },
  { word: "Ermittlung", article: "die", plural: "die Ermittlungen", ipa: "[ɛɐ̯ˈmɪtlʊŋ]", fa: "تحقیقات (قضایی)", en: "investigation", category: POL, example: "Die Ermittlungen dauern noch an.", exampleFa: "تحقیقات هنوز ادامه دارد.", exampleEn: "The investigation is still ongoing." },
  { word: "Verpflichtung", article: "die", plural: "die Verpflichtungen", ipa: "[fɛɐ̯ˈpflɪçtʊŋ]", fa: "تعهد / تکلیف", en: "obligation / commitment", category: POL, example: "Er hat viele berufliche Verpflichtungen.", exampleFa: "او تعهدات شغلی زیادی دارد.", exampleEn: "He has many professional obligations." },
  { word: "Zustimmung", article: "die", ipa: "[ˈt͡suːˌʃtɪmʊŋ]", fa: "موافقت / رضایت", en: "consent / approval", category: POL, example: "Der Plan fand große Zustimmung.", exampleFa: "این طرح با موافقت زیادی روبه‌رو شد.", exampleEn: "The plan met with great approval." },
  { word: "Ablehnung", article: "die", plural: "die Ablehnungen", ipa: "[ˈapˌleːnʊŋ]", fa: "رد / مخالفت", en: "rejection", category: POL, example: "Der Antrag stieß auf Ablehnung.", exampleFa: "آن درخواست با مخالفت روبه‌رو شد.", exampleEn: "The application met with rejection." },
  { word: "Verhandlung", article: "die", plural: "die Verhandlungen", ipa: "[fɛɐ̯ˈhandlʊŋ]", fa: "مذاکره", en: "negotiation", category: POL, example: "Die Verhandlungen waren schwierig.", exampleFa: "مذاکرات دشوار بود.", exampleEn: "The negotiations were difficult." },
  { word: "Vereinbarung", article: "die", plural: "die Vereinbarungen", ipa: "[fɛɐ̯ˈʔaɪ̯nbaːʁʊŋ]", fa: "توافق / قرارداد", en: "agreement / arrangement", category: POL, example: "Wir haben eine Vereinbarung getroffen.", exampleFa: "ما به توافقی رسیدیم.", exampleEn: "We reached an agreement." },
  { word: "Überlegung", article: "die", plural: "die Überlegungen", ipa: "[yːbɐˈleːɡʊŋ]", fa: "ملاحظه / تأمل", en: "consideration / reflection", category: SCI, example: "Nach langer Überlegung sagte er zu.", exampleFa: "او پس از تأمل طولانی موافقت کرد.", exampleEn: "After long consideration, he agreed." },
  { word: "Feststellung", article: "die", plural: "die Feststellungen", ipa: "[ˈfɛstˌʃtɛlʊŋ]", fa: "احراز / نتیجه‌گیری", en: "finding / determination", category: SCI, example: "Diese Feststellung überraschte alle.", exampleFa: "این نتیجه‌گیری همه را شگفت‌زده کرد.", exampleEn: "This finding surprised everyone." },
  { word: "Beobachtung", article: "die", plural: "die Beobachtungen", ipa: "[bəˈʔoːbaxtʊŋ]", fa: "مشاهده", en: "observation", category: SCI, example: "Die Beobachtung dauerte zwei Stunden.", exampleFa: "مشاهده دو ساعت طول کشید.", exampleEn: "The observation lasted two hours." },
  { word: "Zusammenhang", article: "der", plural: "die Zusammenhänge", ipa: "[t͡suˈzamənˌhaŋ]", fa: "ارتباط / بافت", en: "context / connection", category: SCI, example: "In diesem Zusammenhang ist das wichtig.", exampleFa: "در این بافت، این موضوع مهم است.", exampleEn: "In this context, that is important." },
  { word: "Auswirkung", article: "die", plural: "die Auswirkungen", ipa: "[ˈaʊ̯sˌvɪʁkʊŋ]", fa: "پیامد / اثر", en: "effect / consequence", category: SCI, example: "Die Entscheidung hat große Auswirkungen.", exampleFa: "این تصمیم پیامدهای بزرگی دارد.", exampleEn: "The decision has major consequences." },
  { word: "Hinsicht", article: "die", ipa: "[ˈhɪnˌzɪçt]", fa: "جنبه / لحاظ", en: "respect / regard", category: SCI, example: "In dieser Hinsicht hast du recht.", exampleFa: "از این لحاظ حق با توست.", exampleEn: "In this respect, you are right." },
];
const existing = new Set();
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  for (const w of JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"))) existing.add(norm(w.word));
}
const file = path.join(DATA, "vocab-C1.json");
const c1 = JSON.parse(fs.readFileSync(file, "utf8"));
let added = 0;
for (const e of NEW) { if (existing.has(norm(e.word))) { console.log("skip dup:", e.word); continue; } c1.push({ ...e, level: "C1" }); existing.add(norm(e.word)); added++; }
fs.writeFileSync(file, JSON.stringify(c1, null, 2) + "\n", "utf8");
console.log(`C1: added ${added}, total now ${c1.length}`);
