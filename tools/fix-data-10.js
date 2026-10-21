"use strict";
/* fix-data-10.js — remove the last generator family: "<Article> X ist wichtig/nützlich."
 * (~500 examples, many with pre-repair wrong articles baked in).
 * Nouns → verified-article frame; plural-only → plural frame; places → article-less
 * frame; verbs/adjectives/adverbs → hand-written examples; the rest are cleared. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const counts = {}; const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };
const E = (example, exampleFa, exampleEn) => ({ example, exampleFa, exampleEn });
const FAM = / ist (wichtig|nützlich)\.$/;
const PLACES = new Set(["Wien", "Venedig", "München", "Zürich", "Berlin", "Freiburg", "Hamburg", "Genf", "Lissabon", "Warschau", "Prag", "Mallorca", "Asien", "Australien", "Frankreich", "Indien", "Italien", "Polen", "Schweden", "Spanien", "Syrien", "Ägypten", "Österreich", "Großbritannien", "Asien"]);
const CURATED = {
  "hier": E("Ich bin hier.", "من اینجام.", "I am here."),
  "drüben": E("Das Haus ist drüben.", "خانه آن طرف است.", "The house is over there."),
  "hierher": E("Komm hierher!", "بیا اینجا!", "Come here!"),
  "hinten": E("Er sitzt hinten.", "او عقب نشسته است.", "He is sitting at the back."),
  "oben": E("Das Buch ist oben.", "کتاب بالاست.", "The book is upstairs."),
  "unten": E("Sie wartet unten.", "او پایین منتظر است.", "She is waiting downstairs."),
  "vorne": E("Ich sitze vorne.", "من جلو می‌نشینم.", "I sit at the front."),
  "innen": E("Es ist innen warm.", "داخل گرم است.", "It is warm inside."),
  "außen": E("Es ist außen kalt.", "بیرون سرد است.", "It is cold outside."),
  "drinnen": E("Wir bleiben drinnen.", "ما داخل می‌مانیم.", "We stay inside."),
  "ausgehen": E("Wir gehen heute aus.", "ما امروز بیرون می‌رویم.", "We are going out today."),
  "dirigieren": E("Er dirigiert das Orchester.", "او ارکستر را رهبری می‌کند.", "He conducts the orchestra."),
  "eislaufen": E("Im Winter laufen wir Eis.", "در زمستان پاتیناژ می‌کنیم.", "In winter, we go ice skating."),
  "fischen": E("Er fischt am See.", "او کنار دریاچه ماهیگیری می‌کند.", "He fishes at the lake."),
  "gewinnen": E("Sie gewinnt das Spiel.", "او بازی را می‌برد.", "She wins the game."),
  "golfen": E("Sie golft gern.", "او دوست دارد گلف بازی کند.", "She likes to play golf."),
  "joggen": E("Ich jogge jeden Morgen.", "من هر صبح می‌دوم.", "I jog every morning."),
  "malen": E("Sie malt ein Bild.", "او تصویری نقاشی می‌کند.", "She paints a picture."),
  "mitspielen": E("Er spielt im Team mit.", "او در تیم بازی می‌کند.", "He plays in the team."),
  "reisen": E("Wir reisen nach Italien.", "ما به ایتالیا سفر می‌کنیم.", "We travel to Italy."),
  "reiten": E("Sie reitet ein Pferd.", "او اسب‌سواری می‌کند.", "She rides a horse."),
  "rennen": E("Die Kinder rennen schnell.", "بچه‌ها سریع می‌دوند.", "The children run fast."),
  "schießen": E("Er schießt ein Tor.", "او گل می‌زند.", "He scores a goal."),
  "singen": E("Sie singt sehr gut.", "او خیلی خوب آواز می‌خواند.", "She sings very well."),
  "springen": E("Er springt hoch.", "او بالا می‌پرد.", "He jumps high."),
  "tanzen": E("Wir tanzen gern.", "ما دوست داریم برقصیم.", "We like to dance."),
  "ansagen": E("Sie sagt den nächsten Halt an.", "او ایستگاه بعدی را اعلام می‌کند.", "She announces the next stop."),
  "bedürfen": E("Das bedarf Zeit.", "این به زمان نیاز دارد.", "That requires time."),
  "bergen": E("Retter bergen die Verletzten.", "امدادگران مجروحان را نجات می‌دهند.", "Rescuers recover the injured."),
  "betonen": E("Er betont das Wort.", "او روی کلمه تأکید می‌کند.", "He stresses the word."),
  "betreffen": E("Das betrifft dich.", "این به تو مربوط می‌شود.", "That concerns you."),
  "dienen": E("Das dient der Gesundheit.", "این برای سلامتی مفید است.", "That serves your health."),
  "enthalten": E("Die Flasche enthält Wasser.", "بطری حاوی آب است.", "The bottle contains water."),
  "erfolgen": E("Die Zahlung erfolgt morgen.", "پرداخت فردا انجام می‌شود.", "The payment takes place tomorrow."),
  "erscheinen": E("Die Zeitung erscheint täglich.", "روزنامه هر روز منتشر می‌شود.", "The newspaper appears daily."),
  "genügen": E("Das genügt.", "همین کافی است.", "That is enough."),
  "geschehen": E("Was ist geschehen?", "چه اتفاقی افتاده است؟", "What happened?"),
  "läuten": E("Die Glocke läutet.", "زنگ به صدا درمی‌آید.", "The bell is ringing."),
  "passieren": E("Ein Unfall ist passiert.", "حادثه‌ای رخ داده است.", "An accident happened."),
  "beachten": E("Bitte beachten Sie die Regeln.", "لطفاً قوانین را رعایت کنید.", "Please observe the rules."),
  "beten": E("Sie betet jeden Tag.", "او هر روز دعا می‌کند.", "She prays every day."),
  "einbrechen": E("Diebe brechen nachts ein.", "دزدها شب وارد می‌شوند.", "Burglars break in at night."),
  "einhalten": E("Er hält den Termin ein.", "او به قرار پایبند است.", "He keeps the appointment."),
  "erlassen": E("Die Regierung erlässt ein Gesetz.", "دولت قانونی تصویب می‌کند.", "The government issues a law."),
  "melden": E("Ich melde mich morgen.", "فردا خبر می‌دهم.", "I will get in touch tomorrow."),
  "protestieren": E("Sie protestieren laut.", "آن‌ها با صدای بلند اعتراض می‌کنند.", "They protest loudly."),
  "schützen": E("Die Jacke schützt vor Regen.", "ژاکت از باران محافظت می‌کند.", "The jacket protects against rain."),
  "spenden": E("Er spendet Geld.", "او پول اهدا می‌کند.", "He donates money."),
  "stehlen": E("Diebe stehlen das Auto.", "دزدها ماشین را می‌دزدند.", "Thieves steal the car."),
  "besitzen": E("Er besitzt ein Haus.", "او یک خانه دارد.", "He owns a house."),
  "betragen": E("Die Rechnung beträgt 50 Euro.", "صورتحساب ۵۰ یورو می‌شود.", "The bill amounts to 50 euros."),
  "bezahlen": E("Ich bezahle mit Karte.", "من با کارت پرداخت می‌کنم.", "I pay by card."),
  "einlösen": E("Er löst den Gutschein ein.", "او کوپن را نقد می‌کند.", "He redeems the voucher."),
  "einzahlen": E("Sie zahlt Geld ein.", "او پول واریز می‌کند.", "She deposits money."),
  "erwerben": E("Sie erwirbt das Haus.", "او خانه را می‌خرد.", "She acquires the house."),
  "reduzieren": E("Wir reduzieren den Preis.", "ما قیمت را کم می‌کنیم.", "We reduce the price."),
  "stabilisieren": E("Die Lage stabilisiert sich.", "اوضاع در حال ثابت شدن است.", "The situation is stabilising."),
  "umtauschen": E("Ich tausche die Jacke um.", "من ژاکت را تعویض می‌کنم.", "I exchange the jacket."),
  "verkaufen": E("Sie verkauft ihr Auto.", "او ماشینش را می‌فروشد.", "She sells her car."),
  "destabilisieren": E("Das destabilisiert das Land.", "این کشور را بی‌ثبات می‌کند.", "That destabilises the country."),
  "repräsentieren": E("Er repräsentiert die Firma.", "او نماینده‌ی شرکت است.", "He represents the company."),
  "unterschreiben": E("Bitte unterschreiben Sie hier.", "لطفاً اینجا امضا کنید.", "Please sign here."),
  "basieren": E("Der Film basiert auf einem Buch.", "فیلم بر اساس یک کتاب است.", "The film is based on a book."),
  "berechnen": E("Er berechnet die Kosten.", "او هزینه‌ها را محاسبه می‌کند.", "He calculates the costs."),
  "definieren": E("Sie definiert das Wort.", "او کلمه را تعریف می‌کند.", "She defines the word."),
  "durchdenken": E("Ich denke den Plan durch.", "من نقشه را کامل بررسی می‌کنم.", "I think the plan through."),
  "erfinden": E("Er erfindet eine Maschine.", "او ماشینی اختراع می‌کند.", "He invents a machine."),
  "ergeben": E("Das ergibt Sinn.", "این منطقی است.", "That makes sense."),
  "existieren": E("So etwas existiert nicht.", "چنین چیزی وجود ندارد.", "Such a thing does not exist."),
  "messen": E("Er misst die Temperatur.", "او دما را اندازه می‌گیرد.", "He measures the temperature."),
  "testen": E("Wir testen die App.", "ما اپ را تست می‌کنیم.", "We test the app."),
  "beibehalten": E("Er behält die Regel bei.", "او قانون را حفظ می‌کند.", "He keeps the rule."),
  "garantieren": E("Ich garantiere das.", "این را تضمین می‌کنم.", "I guarantee that."),
  "bergsteigen": E("Sie geht im Sommer bergsteigen.", "او در تابستان کوهنوردی می‌کند.", "She goes mountaineering in summer."),
  "Fahrradfahren": E("Fahrradfahren ist gesund.", "دوچرخه‌سواری سالم است.", "Cycling is healthy."),
  "Fallschirmspringen": E("Fallschirmspringen ist aufregend.", "چتربازی هیجان‌انگیز است.", "Parachuting is exciting."),
  "günstig": E("Das Hotel ist günstig.", "هتل ارزان است.", "The hotel is good value."),
  "reich": E("Er ist reich.", "او ثروتمند است.", "He is rich."),
  "fällig": E("Die Rechnung ist fällig.", "موعد پرداخت صورتحساب رسیده است.", "The bill is due."),
  "inklusive": E("Das Frühstück ist inklusive.", "صبحانه شامل می‌شود.", "Breakfast is included."),
  "wirtschaftlich": E("Das ist wirtschaftlich.", "این به‌صرفه است.", "That is economical."),
  "sportlich": E("Sie ist sportlich.", "او ورزشکار است.", "She is athletic."),
  "heilig": E("Das ist ein heiliger Ort.", "این مکان مقدسی است.", "That is a holy place."),
  "schuldig": E("Er ist schuldig.", "او گناهکار است.", "He is guilty."),
  "verboten": E("Rauchen ist verboten.", "سیگار کشیدن ممنوع است.", "Smoking is forbidden."),
  "öffentlich": E("Das Gebäude ist öffentlich.", "این ساختمان عمومی است.", "The building is public."),
  "gesellschaftlich": E("Das ist ein gesellschaftliches Thema.", "این یک موضوع اجتماعی است.", "That is a social issue."),
  "unentschieden": E("Das Spiel ist unentschieden.", "بازی مساوی است.", "The match is a draw."),
  "einschließlich": E("Bis einschließlich Freitag.", "تا جمعه (شامل جمعه).", "Until and including Friday."),
  "zusätzlich": E("Zusätzlich brauchen wir Zeit.", "علاوه بر این به وقت نیاز داریم.", "In addition, we need time."),
  "wenig": E("Ich habe wenig Zeit.", "وقت کمی دارم.", "I have little time."),
  "viel": E("Er hat viel Arbeit.", "او کار زیادی دارد.", "He has a lot of work."),
  "bisschen": E("Ein bisschen Wasser, bitte.", "کمی آب، لطفاً.", "A little water, please."),
  "übrig": E("Es ist noch Kuchen übrig.", "هنوز کیک باقی مانده است.", "There is still cake left."),
  "orange": E("Das T-Shirt ist orange.", "تی‌شرت نارنجی است.", "The T-shirt is orange."),
  "passen": E("Die Schuhe passen mir.", "کفش‌ها اندازه‌ام هستند.", "The shoes fit me."),
};
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    if (!w.example || !FAM.test(w.example)) continue;
    if (CURATED[w.word]) { Object.assign(w, CURATED[w.word]); bump("curated"); continue; }
    const fa1 = (w.fa || "").split(/\s*\/\s*/)[0].trim();
    const en1 = (w.en || "").split(/\s*\/\s*/)[0].trim().replace(/^the\s+/i, "");
    const pluralOnly = /فقط به صورت جمع/.test(w.grammarNote || "") || ["Menschenrechte", "Schuhe", "Kosten", "Daten"].includes(w.word);
    if (pluralOnly) {
      Object.assign(w, E(`Das sind die ${w.word}.`, `این‌ها ${fa1} هستند.`, `These are the ${en1}.`));
      bump("plural_frame"); continue;
    }
    if (PLACES.has(w.word) || /کشورها/.test(w.category || "")) {
      Object.assign(w, E(`Das ist ${w.word}.`, `این ${fa1} است.`, `This is ${en1}.`));
      bump("place_frame"); continue;
    }
    if (w.article && /^[A-ZÄÖÜ]/.test(w.word)) {
      Object.assign(w, E(`Das ist ${w.article} ${w.word}.`, `این ${fa1} است.`, `This is the ${en1}.`));
      bump("noun_frame"); continue;
    }
    delete w.example; delete w.exampleFa; delete w.exampleEn;
    bump("cleared");
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
let tot = 0, ex = 0;
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  for (const w of JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"))) { tot++; if (w.example) ex++; }
}
console.log(counts, `| coverage: ${ex}/${tot}`);
