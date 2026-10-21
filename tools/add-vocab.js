"use strict";
/* add-vocab.js — curated B2/C1 expansion (hand-written, CEFR-aligned).
 * Asserts: no duplicates against any level, complete fields. Run once. */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];

const C1 = [
  ["Voraussetzung", "die", "die Voraussetzungen", "[foˈʁaʊ̯sˌzɛt͡sʊŋ]", "پیش‌شرط", "prerequisite", "جامعه، سیاست و حقوق", "Eine wichtige Voraussetzung für den Erfolg ist Geduld.", "یک پیش‌شرط مهم برای موفقیت، صبر است.", "An important prerequisite for success is patience."],
  ["Schlussfolgerung", "die", "die Schlussfolgerungen", "[ˈʃlʊsˌfɔlɡəʁʊŋ]", "نتیجه‌گیری", "conclusion", "علم و فلسفه", "Aus den Daten zog sie eine klare Schlussfolgerung.", "او از داده‌ها به یک نتیجه‌گیری روشن رسید.", "From the data she drew a clear conclusion."],
  ["Annahme", "die", "die Annahmen", "[ˈanˌnaːmə]", "فرض، گمان", "assumption", "علم و فلسفه", "Diese Annahme erwies sich als falsch.", "این فرض نادرست از آب درآمد.", "This assumption turned out to be wrong."],
  ["Behauptung", "die", "die Behauptungen", "[bəˈhaʊ̯ptʊŋ]", "ادعا", "claim", "علم و فلسفه", "Seine Behauptung ließ sich nicht beweisen.", "ادعای او قابل اثبات نبود.", "His claim could not be proven."],
  ["Standpunkt", "der", "die Standpunkte", "[ˈʃtantpʊŋkt]", "دیدگاه، موضع", "point of view", "جامعه، سیاست و حقوق", "Aus meinem Standpunkt ist der Plan riskant.", "از دیدگاه من این طرح پرریسک است.", "From my point of view, the plan is risky."],
  ["Auffassung", "die", "die Auffassungen", "[ˈaʊ̯fˌfasʊŋ]", "برداشت، نظر", "view, opinion", "علم و فلسفه", "Ich teile diese Auffassung nicht.", "من این نظر را قبول ندارم.", "I do not share this view."],
  ["Hinsicht", "die", "die Hinsichten", "[ˈhɪnˌzɪçt]", "جنبه، لحاظ", "respect, aspect", "علم و فلسفه", "In dieser Hinsicht hat er recht.", "از این لحاظ حق با اوست.", "In this respect he is right."],
  ["Maßnahme", "die", "die Maßnahmen", "[ˈmaːsˌnaːmə]", "اقدام، تدبیر", "measure", "جامعه، سیاست و حقوق", "Die Regierung ergriff sofortige Maßnahmen.", "دولت اقدامات فوری انجام داد.", "The government took immediate measures."],
  ["Herausforderung", "die", "die Herausforderungen", "[hɛˈʁaʊ̯sˌfɔʁdəʁʊŋ]", "چالش", "challenge", "مفاهیم و اشیای روزمره", "Der Klimawandel ist eine globale Herausforderung.", "تغییر اقلیم یک چالش جهانی است.", "Climate change is a global challenge."],
  ["Ansatz", "der", "die Ansätze", "[ˈanˌzat͡s]", "رویکرد", "approach", "علم و فلسفه", "Dieser Ansatz führt zu besseren Ergebnissen.", "این رویکرد به نتایج بهتری می‌انجامد.", "This approach leads to better results."],
  ["Verfahren", "das", "die Verfahren", "[fɛɐ̯ˈfaːʁən]", "روش، رویه", "procedure", "فناوری", "Das neue Verfahren spart Zeit und Kosten.", "روش جدید در زمان و هزینه صرفه‌جویی می‌کند.", "The new procedure saves time and costs."],
  ["Vereinbarung", "die", "die Vereinbarungen", "[fɛɐ̯ˈʔaɪ̯nbaːʁʊŋ]", "توافق", "agreement", "جامعه، سیاست و حقوق", "Beide Seiten hielten sich an die Vereinbarung.", "هر دو طرف به توافق پایبند ماندند.", "Both sides kept to the agreement."],
  ["Zustimmung", "die", "die Zustimmungen", "[ˈt͡suːˌʃtɪmʊŋ]", "موافقت، تأیید", "approval", "جامعه، سیاست و حقوق", "Der Vorschlag fand breite Zustimmung.", "این پیشنهاد با موافقت گسترده روبه‌رو شد.", "The proposal met with broad approval."],
  ["Ablehnung", "die", "die Ablehnungen", "[ˈapˌleːnʊŋ]", "رد، مخالفت", "rejection", "جامعه، سیاست و حقوق", "Die Ablehnung des Antrags überraschte viele.", "رد این درخواست بسیاری را شگفت‌زده کرد.", "The rejection of the application surprised many."],
  ["Rückgang", "der", "die Rückgänge", "[ˈʁʏkˌɡaŋ]", "کاهش", "decline", "اقتصاد و مالی", "Ein Rückgang der Nachfrage ist zu beobachten.", "کاهشی در تقاضا مشاهده می‌شود.", "A decline in demand can be observed."],
  ["Berücksichtigung", "die", "die Berücksichtigungen", "[bəˈʁʏkˌzɪçtɪɡʊŋ]", "در نظر گرفتن، ملاحظه", "consideration", "علم و فلسفه", "Die Berücksichtigung seiner Erfahrung war wichtig.", "در نظر گرفتن تجربه‌ی او مهم بود.", "Taking his experience into consideration was important."],
  ["Erkenntnis", "die", "die Erkenntnisse", "[ɛɐ̯ˈkɛntnɪs]", "شناخت، بینش", "insight, realization", "علم و فلسفه", "Die Studie brachte neue Erkenntnisse.", "این پژوهش به بینش‌های تازه‌ای انجامید.", "The study produced new insights."],
  ["Zusammenhang", "der", "die Zusammenhänge", "[t͡suˈzamənˌhaŋ]", "ارتباط، پیوند", "connection, context", "علم و فلسفه", "In diesem Zusammenhang ist Vorsicht geboten.", "در این ارتباط احتیاط لازم است.", "In this context, caution is advised."],
  ["Fragestellung", "die", "die Fragestellungen", "[ˈfʁaːɡəˌʃtɛlʊŋ]", "پرسش پژوهش", "research question", "علم و فلسفه", "Die Fragestellung muss präzise formuliert werden.", "پرسش پژوهش باید دقیق صورت‌بندی شود.", "The research question must be formulated precisely."],
  ["Untersuchung", "die", "die Untersuchungen", "[ʊntɐˈzuːxʊŋ]", "بررسی، تحقیق", "investigation, study", "علم و فلسفه", "Eine Untersuchung der Ursachen ist im Gange.", "بررسی علت‌ها در جریان است.", "An investigation of the causes is under way."],
  ["Darstellung", "die", "die Darstellungen", "[ˈdaːɐ̯ˌʃtɛlʊŋ]", "ارائه، نمایش", "presentation, depiction", "علم و فلسفه", "Die grafische Darstellung erleichtert das Verständnis.", "ارائه‌ی نموداری فهم را آسان می‌کند.", "The graphical presentation facilitates understanding."],
  ["Einschätzung", "die", "die Einschätzungen", "[ˈaɪ̯nˌʃɛt͡sʊŋ]", "ارزیابی، برآورد", "assessment", "جامعه، سیاست و حقوق", "Nach meiner Einschätzung wird das Projekt gelingen.", "به ارزیابی من این پروژه موفق خواهد شد.", "In my assessment, the project will succeed."],
  ["Enttäuschung", "die", "die Enttäuschungen", "[ɛntˈtɔɪ̯ʃʊŋ]", "ناامیدی", "disappointment", "روان‌شناسی و سلامت روان", "Die Niederlage war eine große Enttäuschung.", "شکست ناامیدی بزرگی بود.", "The defeat was a great disappointment."],
  ["Überzeugung", "die", "die Überzeugungen", "[yːbɐˈt͡sɔɪ̯ɡʊŋ]", "باور، اعتقاد", "conviction, belief", "روان‌شناسی و سلامت روان", "Er sprach mit fester Überzeugung.", "او با باوری راسخ سخن گفت.", "He spoke with firm conviction."],
  ["Vorurteil", "das", "die Vorurteile", "[ˈfoːɐ̯ʔʊʁˌtaɪ̯l]", "پیش‌داوری", "prejudice", "روان‌شناسی و سلامت روان", "Vorurteile verhindern ein faires Urteil.", "پیش‌داوری‌ها مانع قضاوت منصفانه می‌شوند.", "Prejudices prevent a fair judgment."],
  ["Wahrnehmung", "die", "die Wahrnehmungen", "[ˈvaːɐ̯ˌneːmʊŋ]", "ادراک", "perception", "روان‌شناسی و سلامت روان", "Die Wahrnehmung von Zeit ist subjektiv.", "ادراک زمان ذهنی است.", "The perception of time is subjective."],
  ["Klimawandel", "der", null, "[ˈkliːmaˌvandl̩]", "تغییر اقلیم", "climate change", "محیط‌زیست و انرژی", "Der Klimawandel bedroht viele Küstenregionen.", "تغییر اقلیم بسیاری از مناطق ساحلی را تهدید می‌کند.", "Climate change threatens many coastal regions."],
  ["Erderwärmung", "die", null, "[ˈeːɐ̯tʔɛɐ̯ˌvɛʁmʊŋ]", "گرمایش زمین", "global warming", "محیط‌زیست و انرژی", "Die Erderwärmung schreitet schneller voran als erwartet.", "گرمایش زمین سریع‌تر از انتظار پیش می‌رود.", "Global warming is progressing faster than expected."],
  ["Treibhauseffekt", "der", null, "[ˈtʁaɪ̯phaʊ̯sʔɛˌfɛkt]", "اثر گلخانه‌ای", "greenhouse effect", "محیط‌زیست و انرژی", "Der Treibhauseffekt verstärkt die Erderwärmung.", "اثر گلخانه‌ای گرمایش زمین را تشدید می‌کند.", "The greenhouse effect intensifies global warming."],
  ["Artenvielfalt", "die", null, "[ˈaʁtn̩ˌfiːlfalt]", "تنوع زیستی", "biodiversity", "محیط‌زیست و انرژی", "Der Schutz der Artenvielfalt ist dringend nötig.", "حفاظت از تنوع زیستی فوراً لازم است.", "Protecting biodiversity is urgently needed."],
  ["Digitalisierung", "die", null, "[diɡitaliˈziːʁʊŋ]", "دیجیتالی‌شدن", "digitalization", "فناوری", "Die Digitalisierung verändert die Arbeitswelt.", "دیجیتالی‌شدن دنیای کار را دگرگون می‌کند.", "Digitalization is changing the world of work."],
  ["Automatisierung", "die", "die Automatisierungen", "[aʊ̯tomatiˈziːʁʊŋ]", "خودکارسازی", "automation", "فناوری", "Die Automatisierung ersetzt einfache Tätigkeiten.", "خودکارسازی جای فعالیت‌های ساده را می‌گیرد.", "Automation replaces simple tasks."],
  ["Cybersicherheit", "die", null, "[ˈsaɪ̯bɐˌzɪçɐhaɪ̯t]", "امنیت سایبری", "cybersecurity", "فناوری", "Cybersicherheit wird für Firmen immer wichtiger.", "امنیت سایبری برای شرکت‌ها روزبه‌روز مهم‌تر می‌شود.", "Cybersecurity is becoming increasingly important for companies."],
  ["Arbeitslosigkeit", "die", null, "[ˈaʁbaɪ̯t͡sloːzɪçkaɪ̯t]", "بیکاری", "unemployment", "اقتصاد و مالی", "Die Arbeitslosigkeit ist leicht gesunken.", "بیکاری اندکی کاهش یافته است.", "Unemployment has fallen slightly."],
  ["Bruttoinlandsprodukt", "das", "die Bruttoinlandsprodukte", "[ˈbʁʊtoˌʔɪnlant͡spʁoˌdʊkt]", "تولید ناخالص داخلی", "gross domestic product", "اقتصاد و مالی", "Das Bruttoinlandsprodukt ist um zwei Prozent gewachsen.", "تولید ناخالص داخلی دو درصد رشد کرده است.", "The gross domestic product grew by two percent."],
  ["Steuererklärung", "die", "die Steuererklärungen", "[ˈʃtɔɪ̯ɐʔɛɐ̯ˌkleːʁʊŋ]", "اظهارنامه مالیاتی", "tax return", "اقتصاد و مالی", "Die Steuererklärung muss bis Juli abgegeben werden.", "اظهارنامه مالیاتی باید تا ماه ژوئیه تحویل داده شود.", "The tax return must be submitted by July."],
  ["Glaubwürdigkeit", "die", null, "[ˈɡlaʊ̯pvʏʁdɪçkaɪ̯t]", "اعتبار، باورپذیری", "credibility", "جامعه، سیاست و حقوق", "Seine Glaubwürdigkeit litt unter den Widersprüchen.", "اعتبار او از تناقض‌ها آسیب دید.", "His credibility suffered from the contradictions."],
  ["Meinungsfreiheit", "die", null, "[ˈmaɪ̯nʊŋsˌfʁaɪ̯haɪ̯t]", "آزادی بیان", "freedom of expression", "جامعه، سیاست و حقوق", "Die Meinungsfreiheit ist ein Grundrecht.", "آزادی بیان یک حق بنیادین است.", "Freedom of expression is a fundamental right."],
  ["Gleichberechtigung", "die", null, "[ˈɡlaɪ̯çbəˌʁɛçtɪɡʊŋ]", "برابری حقوق", "equal rights", "جامعه، سیاست و حقوق", "Die Gleichberechtigung ist im Grundgesetz verankert.", "برابری حقوق در قانون اساسی تثبیت شده است.", "Equal rights are enshrined in the Basic Law."],
  ["Staatsbürgerschaft", "die", "die Staatsbürgerschaften", "[ˈʃtaːt͡sˌbʏʁɡɐʃaft]", "تابعیت", "citizenship", "جامعه، سیاست و حقوق", "Sie beantragte die deutsche Staatsbürgerschaft.", "او برای تابعیت آلمان درخواست داد.", "She applied for German citizenship."],
];

const B2 = [
  ["Gewohnheit", "die", "die Gewohnheiten", "[ɡəˈvoːnhaɪ̯t]", "عادت", "habit", "مفاهیم و اشیای روزمره", "Rauchen ist eine schädliche Gewohnheit.", "سیگار کشیدن عادت زیان‌باری است.", "Smoking is a harmful habit."],
  ["Entschluss", "der", "die Entschlüsse", "[ɛntˈʃlʊs]", "تصمیم", "decision", "روان‌شناسی و سلامت روان", "Er fasste den Entschluss, ins Ausland zu ziehen.", "او تصمیم گرفت به خارج نقل مکان کند.", "He made the decision to move abroad."],
  ["Bedingung", "die", "die Bedingungen", "[bəˈdɪŋʊŋ]", "شرط", "condition", "جامعه، سیاست و حقوق", "Unter dieser Bedingung stimme ich zu.", "با این شرط موافقت می‌کنم.", "Under this condition, I agree."],
  ["Empfehlung", "die", "die Empfehlungen", "[ɛmˈpfeːlʊŋ]", "پیشنهاد، توصیه", "recommendation", "مفاهیم و اشیای روزمره", "Auf Empfehlung eines Freundes sah ich den Film.", "با توصیه‌ی یک دوست آن فیلم را دیدم.", "On a friend's recommendation, I watched the film."],
  ["Erlebnis", "das", "die Erlebnisse", "[ɛɐ̯ˈleːpnɪs]", "تجربه (رویداد)", "experience (event)", "مفاهیم و اشیای روزمره", "Die Reise war ein unvergessliches Erlebnis.", "آن سفر تجربه‌ای فراموش‌نشدنی بود.", "The trip was an unforgettable experience."],
  ["Fortschritt", "der", "die Fortschritte", "[ˈfɔʁtˌʃʁɪt]", "پیشرفت", "progress", "علم و فلسفه", "Die Medizin hat große Fortschritte gemacht.", "پزشکی پیشرفت‌های بزرگی کرده است.", "Medicine has made great progress."],
  ["Forschung", "die", "die Forschungen", "[ˈfɔʁʃʊŋ]", "پژوهش", "research", "علم و فلسفه", "Die Forschung auf diesem Gebiet ist aufwendig.", "پژوهش در این زمینه پرهزینه است.", "Research in this field is costly."],
  ["Entdeckung", "die", "die Entdeckungen", "[ɛntˈdɛkʊŋ]", "کشف", "discovery", "علم و فلسفه", "Die Entdeckung des Penicillins veränderte die Medizin.", "کشف پنی‌سیلین پزشکی را دگرگون کرد.", "The discovery of penicillin changed medicine."],
  ["Erfindung", "die", "die Erfindungen", "[ɛɐ̯ˈfɪndʊŋ]", "اختراع", "invention", "علم و فلسفه", "Die Erfindung des Rades war ein Meilenstein.", "اختراع چرخ یک نقطه عطف بود.", "The invention of the wheel was a milestone."],
  ["Ursache", "die", "die Ursachen", "[ˈuːɐ̯ˌzaxə]", "علت", "cause", "علم و فلسفه", "Die Ursache des Unfalls ist noch unklar.", "علت تصادف هنوز نامشخص است.", "The cause of the accident is still unclear."],
  ["Wirkung", "die", "die Wirkungen", "[ˈvɪʁkʊŋ]", "اثر، تأثیر", "effect", "علم و فلسفه", "Das Medikament zeigt schon Wirkung.", "دارو کم‌کم اثر می‌کند.", "The medicine is already taking effect."],
  ["Folge", "die", "die Folgen", "[ˈfɔlɡə]", "پیامد", "consequence", "علم و فلسفه", "Die Folgen der Krise sind bis heute spürbar.", "پیامدهای بحران تا امروز محسوس است.", "The consequences of the crisis are still felt today."],
  ["Zweck", "der", "die Zwecke", "[t͡svɛk]", "هدف، منظور", "purpose", "مفاهیم و اشیای روزمره", "Der Zweck dieser Übung ist das Wiederholen.", "هدف این تمرین مرور کردن است.", "The purpose of this exercise is revision."],
  ["Absicht", "die", "die Absichten", "[ˈapˌzɪçt]", "قصد", "intention", "روان‌شناسی و سلامت روان", "Es war nicht meine Absicht, dich zu verletzen.", "قصد من آزار تو نبود.", "It was not my intention to hurt you."],
  ["Gelegenheit", "die", "die Gelegenheiten", "[ɡəˈleːɡn̩haɪ̯t]", "فرصت", "opportunity", "مفاهیم و اشیای روزمره", "Nutze die Gelegenheit, Deutsch zu sprechen!", "از فرصت استفاده کن و آلمانی حرف بزن!", "Take the opportunity to speak German!"],
  ["Vorteil", "der", "die Vorteile", "[ˈfoːɐ̯ˌtaɪ̯l]", "مزیت", "advantage", "مفاهیم و اشیای روزمره", "Ein großer Vorteil ist die flexible Arbeitszeit.", "یک مزیت بزرگ، ساعت کاری انعطاف‌پذیر است.", "A big advantage is the flexible working hours."],
  ["Nachteil", "der", "die Nachteile", "[ˈnaːxˌtaɪ̯l]", "عیب، مضرت", "disadvantage", "مفاهیم و اشیای روزمره", "Jeder Vorteil hat auch einen Nachteil.", "هر مزیتی عیبی هم دارد.", "Every advantage also has a disadvantage."],
  ["Umweltschutz", "der", null, "[ˈʊmvɛltˌʃʊt͡s]", "حفاظت از محیط زیست", "environmental protection", "محیط‌زیست و انرژی", "Umweltschutz beginnt im Alltag.", "حفاظت از محیط زیست از زندگی روزمره آغاز می‌شود.", "Environmental protection starts in everyday life."],
  ["Verschmutzung", "die", "die Verschmutzungen", "[fɛɐ̯ˈʃmʊt͡sʊŋ]", "آلودگی", "pollution", "محیط‌زیست و انرژی", "Die Verschmutzung der Flüsse nimmt zu.", "آلودگی رودخانه‌ها رو به افزایش است.", "The pollution of the rivers is increasing."],
  ["erneuerbar", null, null, "[ɛɐ̯ˈnɔɪ̯ɐbaːɐ̯]", "تجدیدپذیر", "renewable", "محیط‌زیست و انرژی", "Erneuerbare Energien werden immer billiger.", "انرژی‌های تجدیدپذیر روزبه‌روز ارزان‌تر می‌شوند.", "Renewable energies are getting cheaper."],
  ["Auskunft", "die", "die Auskünfte", "[ˈaʊ̯sˌkʊnft]", "اطلاعات، راهنمایی", "information (official)", "جامعه، سیاست و حقوق", "Bei der Auskunft erhalten Sie alle Informationen.", "در باجه‌ی اطلاعات همه‌ی اطلاعات را دریافت می‌کنید.", "At the information desk you will receive all the information."],
  ["Antrag", "der", "die Anträge", "[ˈanˌtʁaːk]", "درخواست (رسمی)", "application, request", "جامعه، سیاست و حقوق", "Der Antrag wurde gestern genehmigt.", "درخواست دیروز تأیید شد.", "The application was approved yesterday."],
  ["Genehmigung", "die", "die Genehmigungen", "[ɡəˈneːmɪɡʊŋ]", "مجوز، تأییدیه", "permit, approval", "جامعه، سیاست و حقوق", "Für den Umbau brauchst du eine Genehmigung.", "برای بازسازی به مجوز نیاز داری.", "You need a permit for the renovation."],
  ["Geduld", "die", null, "[ɡəˈdʊlt]", "صبر", "patience", "روان‌شناسی و سلامت روان", "Beim Lernen braucht man Geduld.", "در یادگیری به صبر نیاز است.", "Learning requires patience."],
];

function toEntry(row, level) {
  const [word, article, plural, ipa, fa, en, category, example, exampleFa, exampleEn] = row;
  const e = { word, ipa, fa, en, level, category, example, exampleFa, exampleEn };
  if (plural) e.plural = plural;
  if (article) e.article = article;
  return e;
}

const existing = new Set();
for (const lvl of LEVELS) {
  const arr = JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"));
  arr.forEach(w => existing.add((w.word || "").toLowerCase()));
}
let added = 0;
for (const [lvl, rows] of [["C1", C1], ["B2", B2]]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const row of rows) {
    const key = row[0].toLowerCase();
    if (existing.has(key)) { console.log("SKIP dup:", lvl, row[0]); continue; }
    existing.add(key);
    arr.push(toEntry(row, lvl));
    added++;
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
  console.log(lvl, "now", arr.length);
}
console.log("added:", added);
