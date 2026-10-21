"use strict";
/* fix-data-7.js — kill the two surviving generator families from the original data:
 *   "Der/Die/Das X ist interessant."  and  "Ich benutze X jeden Tag."
 * Replacement: noun frame with the verified article, or a hand-written example
 * for verbs / adjectives / phrases. Also fills the last example-less entries. */
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const counts = {}; const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };
const E = (example, exampleFa, exampleEn) => ({ example, exampleFa, exampleEn });

const CURATED = {
  // weather verbs & adjectives (family A leftovers)
  "regnen": E("Es regnet heute.", "امروز باران می‌بارد.", "It is raining today."),
  "schneien": E("Es schneit im Winter.", "در زمستان برف می‌بارد.", "It snows in winter."),
  "blitzen": E("Es blitzt und donnert.", "رعد و برق می‌زند.", "There is lightning and thunder."),
  "donnern": E("Es donnert laut.", "صدای رعد بلند است.", "It is thundering loudly."),
  "scheinen": E("Die Sonne scheint.", "خورشید می‌تابد.", "The sun is shining."),
  "fließen": E("Der Fluss fließt schnell.", "رود سریع جریان دارد.", "The river flows fast."),
  "fressen": E("Die Tiere fressen.", "حیوان‌ها غذا می‌خورند.", "The animals are eating."),
  "picknicken": E("Wir picknicken im Park.", "ما در پارک پیک‌نیک می‌کنیم.", "We have a picnic in the park."),
  "bewölkt": E("Es ist bewölkt.", "هوا ابری است.", "It is cloudy."),
  "heiß": E("Es ist heiß heute.", "امروز گرم است.", "It is hot today."),
  "kalt": E("Es ist kalt.", "هوا سرد است.", "It is cold."),
  "kühl": E("Es ist kühl.", "هوا خنک است.", "It is cool."),
  "nass": E("Die Straße ist nass.", "خیابان خیس است.", "The street is wet."),
  "neblig": E("Es ist neblig.", "هوا مه‌آلود است.", "It is foggy."),
  "regnerisch": E("Das Wetter ist regnerisch.", "هوا بارانی است.", "The weather is rainy."),
  "sonnig": E("Es ist sonnig.", "هوا آفتابی است.", "It is sunny."),
  "trocken": E("Die Luft ist trocken.", "هوا خشک است.", "The air is dry."),
  "warm": E("Es ist warm.", "هوا گرم است.", "It is warm."),
  "windig": E("Es ist windig.", "باد می‌وزد.", "It is windy."),
  "erneuerbar": E("Die Energie ist erneuerbar.", "این انرژی تجدیدپذیر است.", "The energy is renewable."),
  "fossil": E("Das ist ein fossiler Brennstoff.", "این یک سوخت فسیلی است.", "That is a fossil fuel."),
  "nachhaltig": E("Das Produkt ist nachhaltig.", "این محصول پایدار است.", "The product is sustainable."),
  // phrases from family A
  "am See": E("Wir sitzen am See.", "ما کنار دریاچه نشسته‌ایم.", "We are sitting by the lake."),
  "bei Regen": E("Bei Regen bleibe ich zu Hause.", "هنگام باران در خانه می‌مانم.", "When it rains, I stay at home."),
  "bei schlechtem Wetter": E("Bei schlechtem Wetter bleiben wir drin.", "در هوای بد داخل می‌مانیم.", "In bad weather, we stay inside."),
  "bei schönem Wetter": E("Bei schönem Wetter gehen wir raus.", "در هوای خوب بیرون می‌رویم.", "In nice weather, we go out."),
  "Gassi gehen": E("Er geht mit dem Hund Gassi.", "او سگ را برای گردش می‌برد.", "He takes the dog for a walk."),
  "Grad Celsius": E("Es sind 20 Grad Celsius.", "هوا ۲۰ درجه‌ی سانتی‌گراد است.", "It is 20 degrees Celsius."),
  "Genfer See": E("Der Genfer See ist groß.", "دریاچه‌ی ژنو بزرگ است.", "Lake Geneva is big."),
  "Alpen": E("Die Alpen sind hoch.", "آلپ بلند است.", "The Alps are high."),
  "Schwarzwald": E("Der Schwarzwald ist in Deutschland.", "جنگل سیاه در آلمان است.", "The Black Forest is in Germany."),
  // tech verbs & adjectives (family B leftovers)
  "benutzen": E("Ich benutze das Handy jeden Tag.", "من هر روز از موبایل استفاده می‌کنم.", "I use the phone every day."),
  "booten": E("Der Computer bootet schnell.", "کامپیوتر سریع بالا می‌آید.", "The computer boots quickly."),
  "drucken": E("Sie druckt den Brief.", "او نامه را چاپ می‌کند.", "She prints the letter."),
  "einloggen": E("Ich logge mich ein.", "من وارد حسابم می‌شوم.", "I log in."),
  "entfernen": E("Er entfernt den Fleck.", "او لکه را پاک می‌کند.", "He removes the stain."),
  "entwickeln": E("Sie entwickelt eine App.", "او یک اپ می‌سازد.", "She develops an app."),
  "filmen": E("Er filmt die Feier.", "او از جشن فیلم می‌گیرد.", "He films the party."),
  "klicken": E("Klicken Sie hier!", "اینجا کلیک کنید!", "Click here!"),
  "löschen": E("Ich lösche die Datei.", "من فایل را حذف می‌کنم.", "I delete the file."),
  "senden": E("Ich sende eine Nachricht.", "من پیامی می‌فرستم.", "I send a message."),
  "sichern": E("Er sichert die Daten.", "او از داده‌ها نسخه‌ی پشتیبان می‌گیرد.", "He backs up the data."),
  "starten": E("Wir starten das Programm.", "ما برنامه را اجرا می‌کنیم.", "We start the program."),
  "steuern": E("Sie steuert den Roboter.", "او ربات را کنترل می‌کند.", "She controls the robot."),
  "surfen": E("Er surft im Internet.", "او در اینترنت گشت می‌زند.", "He surfs the internet."),
  "verbinden": E("Das Kabel verbindet die Geräte.", "کابل دستگاه‌ها را وصل می‌کند.", "The cable connects the devices."),
  "funktionieren": E("Die App funktioniert gut.", "این اپ خوب کار می‌کند.", "The app works well."),
  "herunterladen": E("Ich lade das Video herunter.", "من ویدیو را دانلود می‌کنم.", "I download the video."),
  "installieren": E("Er installiert die App.", "او اپ را نصب می‌کند.", "He installs the app."),
  "telefonieren": E("Wir telefonieren jeden Abend.", "ما هر عصر تلفنی صحبت می‌کنیم.", "We talk on the phone every evening."),
  "veröffentlichen": E("Sie veröffentlicht ein Video.", "او ویدیویی منتشر می‌کند.", "She publishes a video."),
  "durchstellen": E("Ich stelle Sie durch.", "شما را وصل می‌کنم.", "I will put you through."),
  "aktualisiert": E("Die App ist aktualisiert.", "اپ به‌روز شده است.", "The app is updated."),
  "automatisch": E("Die Tür öffnet automatisch.", "در به صورت خودکار باز می‌شود.", "The door opens automatically."),
  "digital": E("Wir arbeiten digital.", "ما دیجیتالی کار می‌کنیم.", "We work digitally."),
  "online": E("Der Kurs ist online.", "دوره آنلاین است.", "The course is online."),
  "technisch": E("Das ist technisch schwer.", "این از نظر فنی سخت است.", "That is technically difficult."),
  "virtuell": E("Das Treffen ist virtuell.", "جلسه مجازی است.", "The meeting is virtual."),
  // last example-less entries
  "bereits": E("Er ist bereits da.", "او از قبل اینجاست.", "He is already here."),
  "verabredet": E("Wir sind um acht verabredet.", "ما ساعت هشت قرار داریم.", "We have arranged to meet at eight."),
  "Ostern": E("Ostern ist im Frühling.", "عید پاک در بهار است.", "Easter is in spring."),
  "Prag": E("Prag ist eine schöne Stadt.", "پراگ شهر زیبایی است.", "Prague is a beautiful city."),
  "China": E("China ist ein großes Land.", "چین کشور بزرگی است.", "China is a big country."),
  "europäisch": E("Das ist ein europäisches Land.", "این یک کشور اروپایی است.", "That is a European country."),
  "indisch": E("Das Essen ist indisch.", "غذا هندی است.", "The food is Indian."),
  "Großeltern": E("Meine Großeltern leben in Wien.", "پدربزرگ و مادربزرگم در وین زندگی می‌کنند.", "My grandparents live in Vienna."),
  "am größten": E("Das Haus ist am größten.", "آن خانه از همه بزرگ‌تر است.", "The house is the biggest."),
  "am höchsten": E("Der Berg ist am höchsten.", "آن کوه از همه بلندتر است.", "The mountain is the highest."),
  "am Telefon": E("Er ist am Telefon.", "او پشت تلفن است.", "He is on the phone."),
};
const FAM_A = /^Der\/Die\/Das .+ ist interessant\.$/;
const FAM_B = /^Ich benutze .+ jeden Tag\.$/;

for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const w of arr) {
    const isFam = w.example && (FAM_A.test(w.example) || FAM_B.test(w.example) || w.example === "Ich benutze.");
    if (!isFam && w.example) continue;
    if (!w.example && !CURATED[w.word]) continue;
    if (CURATED[w.word]) { Object.assign(w, CURATED[w.word]); bump("curated"); continue; }
    if (isFam && w.article) {
      const fa1 = (w.fa || "").split(/\s*\/\s*/)[0].trim();
      const en1 = (w.en || "").split(/\s*\/\s*/)[0].trim().replace(/^the\s+/i, "");
      Object.assign(w, E(`Das ist ${w.article} ${w.word}.`, `این ${fa1} است.`, `This is the ${en1}.`));
      bump("noun_frame"); continue;
    }
    if (isFam) { delete w.example; delete w.exampleFa; delete w.exampleEn; bump("cleared_unfixable"); }
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
let tot = 0, ex = 0;
for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
  for (const w of JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8"))) { tot++; if (w.example) ex++; }
}
console.log(counts, `| coverage: ${ex}/${tot}`);
