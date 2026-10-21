"use strict";
const fs = require("fs"); const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const LEVELS = ["A0","A1","A2","B1","B2","C1"];
const C1 = [
  ["Gesichtspunkt","der","die Gesichtspunkte","[ɡəˈzɪçt͡sˌpʊŋkt]","منظر، وجه","aspect, point of view","جامعه، سیاست و حقوق","Von diesem Gesichtspunkt aus ist es verständlich.","از این منظر قابل درک است.","From this point of view it is understandable."],
  ["Wechselwirkung","die","die Wechselwirkungen","[ˈvɛksl̩ˌvɪʁkʊŋ]","برهم‌کنش","interaction","علم و فلسفه","Die Wechselwirkung beider Stoffe ist gefährlich.","برهم‌کنش این دو ماده خطرناک است.","The interaction of the two substances is dangerous."],
  ["Rahmenbedingung","die","die Rahmenbedingungen","[ˈʁaːmənbəˌdɪŋʊŋ]","شرط چارچوبی","framework condition","جامعه، سیاست و حقوق","Die Rahmenbedingungen für Firmen haben sich verbessert.","شرایط چارچوبی برای شرکت‌ها بهبود یافته است.","The framework conditions for companies have improved."],
  ["Aussagekraft","die",null,"[ˈaʊ̯szaːɡəˌkʁaft]","معناداری، قدرت بیان","meaningfulness","علم و فلسفه","Die Aussagekraft der Studie ist begrenzt.","معناداری این مطالعه محدود است.","The meaningfulness of the study is limited."],
  ["Stellenwert","der",null,"[ˈʃtɛlənˌveːɐ̯t]","جایگاه، اهمیت","significance, status","جامعه، سیاست و حقوق","Bildung hat einen hohen Stellenwert.","آموزش جایگاه والایی دارد.","Education has a high status."],
  ["Tragweite","die",null,"[ˈtʁaːkˌvaɪ̯tə]","دامنه‌ی پیامد","implications, scope","جامعه، سیاست و حقوق","Die Tragweite der Entscheidung wurde unterschätzt.","دامنه‌ی پیامد این تصمیم دست‌کم گرفته شد.","The implications of the decision were underestimated."],
  ["Verhältnismäßigkeit","die",null,"[fɛɐ̯ˈhɛltnɪsˌmeːsɪçkaɪ̯t]","تناسب","proportionality","جامعه، سیاست و حقوق","Die Verhältnismäßigkeit der Strafe wurde geprüft.","تناسب مجازات بررسی شد.","The proportionality of the punishment was examined."],
  ["Auseinandersetzung","die","die Auseinandersetzungen","[aʊ̯sʔaɪ̯ˈnandɐˌzɛt͡sʊŋ]","بحث و بررسی، مجادله","debate, dispute","جامعه، سیاست و حقوق","Eine sachliche Auseinandersetzung mit dem Thema ist nötig.","بررسی عینی این موضوع لازم است.","An objective debate on the topic is necessary."],
  ["Herangehensweise","die","die Herangehensweisen","[hɛˈʁanɡeːənsˌvaɪ̯zə]","شیوه‌ی برخورد","approach, way of tackling","علم و فلسفه","Seine Herangehensweise an das Problem war ungewöhnlich.","شیوه‌ی برخورد او با مسئله غیرمعمول بود.","His approach to the problem was unusual."],
  ["Datenlage","die",null,"[ˈdaːtn̩ˌlaːɡə]","وضعیت داده‌ها","data situation","علم و فلسفه","Die Datenlage ist noch unzureichend.","وضعیت داده‌ها هنوز کافی نیست.","The available data is still insufficient."],
  ["Forschungsstand","der",null,"[ˈfɔʁʃʊŋsˌʃtant]","وضعیت پژوهش‌های موجود","state of research","علم و فلسفه","Der Forschungsstand wurde im ersten Kapitel zusammengefasst.","وضعیت پژوهش‌ها در فصل اول خلاصه شد.","The state of research was summarized in the first chapter."],
  ["Ressourcenknappheit","die",null,"[ʁeˈsʊʁsn̩ˌknaphaɪ̯t]","کمبود منابع","resource scarcity","محیط‌زیست و انرژی","Die Ressourcenknappheit zwingt zum Sparen.","کمبود منابع ما را به صرفه‌جویی وادار می‌کند.","Resource scarcity forces us to save."],
  ["Verhaltensänderung","die","die Verhaltensänderungen","[fɛɐ̯ˈhaltn̩sˌʔɛndəʁʊŋ]","تغییر رفتار","behavior change","روان‌شناسی و سلامت روان","Eine dauerhafte Verhaltensänderung braucht Zeit.","تغییر پایدار رفتار به زمان نیاز دارد.","A lasting behavior change takes time."],
  ["Selbstwahrnehmung","die",null,"[ˈzɛlpstˌvaːɐ̯neːmʊŋ]","خودادراکی","self-perception","روان‌شناسی و سلامت روان","Die Selbstwahrnehmung beeinflusst das Selbstvertrauen.","خودادراکی بر اعتمادبه‌نفس اثر می‌گذارد.","Self-perception influences self-confidence."],
  ["Informationsflut","die",null,"[ɪnfoʁmaˈt͡si̯oːnsˌfluːt]","سیل اطلاعات","information overload","فناوری","Die Informationsflut im Netz überfordert viele Nutzer.","سیل اطلاعات در اینترنت بسیاری از کاربران را کلافه می‌کند.","The flood of information online overwhelms many users."],
  ["Benutzerfreundlichkeit","die",null,"[bəˈnʊt͡sɐˌfʁɔɪ̯ntlɪçkaɪ̯t]","کاربرپسندی","user-friendliness","فناوری","Die Benutzerfreundlichkeit der App wurde gelobt.","کاربرپسندی این اپ تحسین شد.","The app's user-friendliness was praised."],
];
const B2 = [
  ["Teilnahme","die",null,"[ˈtaɪ̯lˌnaːmə]","شرکت (در رویداد)","participation","جامعه، سیاست و حقوق","Die Teilnahme an dem Kurs ist kostenlos.","شرکت در این دوره رایگان است.","Participation in the course is free of charge."],
  ["Veranstaltung","die","die Veranstaltungen","[fɛɐ̯ˈʔanʃtaltʊŋ]","رویداد، مراسم","event","جامعه، سیاست و حقوق","Die Veranstaltung beginnt um achtzehn Uhr.","این رویداد ساعت شش عصر آغاز می‌شود.","The event starts at 6 p.m."],
  ["Umfrage","die","die Umfragen","[ˈʊmˌfʁaːɡə]","نظرسنجی","survey","جامعه، سیاست و حقوق","Laut einer Umfrage sind die meisten zufrieden.","طبق یک نظرسنجی بیشتر مردم راضی‌اند.","According to a survey, most people are satisfied."],
  ["Bevölkerung","die",null,"[bəˈfœlkəʁʊŋ]","جمعیت (مردم)","population","جامعه، سیاست و حقوق","Die Bevölkerung der Stadt wächst schnell.","جمعیت شهر به‌سرعت در حال رشد است.","The city's population is growing fast."],
  ["Erweiterung","die","die Erweiterungen","[ɛɐ̯ˈvaɪ̯təʁʊŋ]","گسترش","expansion, extension","مفاهیم و اشیای روزمره","Die Erweiterung des Flughafens ist geplant.","گسترش فرودگاه برنامه‌ریزی شده است.","The expansion of the airport is planned."],
  ["Behandlung","die","die Behandlungen","[bəˈhandlʊŋ]","درمان","treatment","روان‌شناسی و سلامت روان","Die Behandlung dauert mehrere Wochen.","درمان چند هفته طول می‌کشد.","The treatment lasts several weeks."],
  ["Verletzung","die","die Verletzungen","[fɛɐ̯ˈlɛt͡sʊŋ]","آسیب، مصدومیت","injury","روان‌شناسی و سلامت روان","Die Verletzung war zum Glück nicht schwer.","خوشبختانه آسیب جدی نبود.","Fortunately, the injury was not serious."],
  ["Ernährung","die",null,"[ɛɐ̯ˈneːʁʊŋ]","تغذیه","nutrition, diet","روان‌شناسی و سلامت روان","Eine gesunde Ernährung ist wichtig für Kinder.","تغذیه‌ی سالم برای کودکان مهم است.","A healthy diet is important for children."],
  ["Entspannung","die",null,"[ɛntˈʃpanʊŋ]","آرام‌سازی، استراحت","relaxation","روان‌شناسی و سلامت روان","Nach der Arbeit brauche ich Entspannung.","بعد از کار به استراحت نیاز دارم.","After work I need relaxation."],
  ["Wasserkreislauf","der",null,"[ˈvasɐˌkʁaɪ̯slaʊ̯f]","چرخه‌ی آب","water cycle","محیط‌زیست و انرژی","Der Wasserkreislauf hält die Natur im Gleichgewicht.","چرخه‌ی آب طبیعت را در تعادل نگه می‌دارد.","The water cycle keeps nature in balance."],
  ["Energiequelle","die","die Energiequellen","[enɛɐ̯ˈɡiːˌkvɛlə]","منبع انرژی","energy source","محیط‌زیست و انرژی","Die Sonne ist eine unerschöpfliche Energiequelle.","خورشید منبعی پایان‌ناپذیر از انرژی است.","The sun is an inexhaustible energy source."],
  ["Ausstoß","der",null,"[ˈaʊ̯sˌʃtoːs]","انتشار (گازها)","emissions","محیط‌زیست و انرژی","Der Ausstoß von CO₂ muss sinken.","انتشار دی‌اکسید کربن باید کاهش یابد.","CO₂ emissions must decrease."],
  ["Anwendung","die","die Anwendungen","[ˈanˌvɛndʊŋ]","کاربرد، اپلیکیشن","application","فناوری","Die Anwendung ist leicht zu bedienen.","کار با این اپلیکیشن آسان است.","The application is easy to use."],
  ["Speicherung","die",null,"[ˈʃpaɪ̯çəʁʊŋ]","ذخیره‌سازی","storage (data)","فناوری","Die Speicherung der Daten erfolgt automatisch.","ذخیره‌سازی داده‌ها به‌صورت خودکار انجام می‌شود.","The data is stored automatically."],
  ["Tastatur","die","die Tastaturen","[tasˈtaːtuːɐ̯]","صفحه‌کلید","keyboard","فناوری","Die Tastatur meines Laptops ist kaputt.","صفحه‌کلید لپ‌تاپم خراب است.","My laptop's keyboard is broken."],
];
const existing = new Set();
for (const lvl of LEVELS) JSON.parse(fs.readFileSync(path.join(DATA, `vocab-${lvl}.json`), "utf8")).forEach(w => existing.add((w.word||"").toLowerCase()));
let added = 0;
for (const [lvl, rows] of [["C1", C1], ["B2", B2]]) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  const arr = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [word, article, plural, ipa, fa, en, category, example, exampleFa, exampleEn] of rows) {
    if (existing.has(word.toLowerCase())) { console.log("SKIP dup:", lvl, word); continue; }
    existing.add(word.toLowerCase());
    const e = { word, ipa, fa, en, level: lvl, category, example, exampleFa, exampleEn };
    if (plural) e.plural = plural; if (article) e.article = article;
    arr.push(e); added++;
  }
  fs.writeFileSync(file, JSON.stringify(arr, null, 2) + "\n", "utf8");
  console.log(lvl, "now", arr.length);
}
console.log("added:", added);
