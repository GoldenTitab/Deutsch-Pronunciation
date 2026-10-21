"use strict";
/* add-core.js — second dialogue per level + dictation top-up (3 per level). */
const fs = require("fs"); const path = require("path");
const file = path.join(__dirname, "..", "data", "core.json");
const core = JSON.parse(fs.readFileSync(file, "utf8"));
const L = (speaker, de, fa, en) => ({ speaker, de, fa, en });
const dialogues = [
  { level: "A0", title: "در کافه", lines: [
    L("Kellner", "Guten Tag! Was möchten Sie?", "روز بخیر! چه میل دارید؟", "Good day! What would you like?"),
    L("Gast", "Einen Kaffee, bitte.", "یک قهوه، لطفاً.", "A coffee, please."),
    L("Kellner", "Mit Milch und Zucker?", "با شیر و شکر؟", "With milk and sugar?"),
    L("Gast", "Ja, bitte. Und ein Wasser.", "بله، لطفاً. و یک لیوان آب.", "Yes, please. And a glass of water."),
    L("Kellner", "Kommt sofort.", "همین الان می‌آورم.", "Coming right up."),
    L("Gast", "Vielen Dank!", "خیلی ممنون!", "Thank you very much!"),
  ]},
  { level: "A1", title: "خرید بلیت قطار", lines: [
    L("Sara", "Entschuldigung, wann fährt der Zug nach Berlin?", "ببخشید، قطار برلین کی حرکت می‌کند؟", "Excuse me, when does the train to Berlin leave?"),
    L("Beamter", "Um 10.30 Uhr von Gleis fünf.", "ساعت ده‌ونیم از سکوی پنج.", "At 10:30 from platform five."),
    L("Sara", "Und wie viel kostet ein Ticket?", "و قیمت یک بلیت چقدر است؟", "And how much is a ticket?"),
    L("Beamter", "Neunundzwanzig Euro, bitte.", "بیست‌ونه یورو، لطفاً.", "Twenty-nine euros, please."),
    L("Sara", "Hier, bitte. Danke schön!", "بفرمایید. خیلی ممنون!", "Here you are. Thank you!"),
    L("Beamter", "Gern geschehen. Gute Reise!", "خواهش می‌کنم. سفر خوبی داشته باشید!", "You're welcome. Have a good trip!"),
  ]},
  { level: "A2", title: "پیش پزشک", lines: [
    L("Arzt", "Guten Tag, was fehlt Ihnen?", "روز بخیر، مشکلتان چیست؟", "Good day, what seems to be the problem?"),
    L("Patient", "Ich habe seit zwei Tagen Fieber und Kopfschmerzen.", "از دو روز پیش تب و سردرد دارم.", "I've had a fever and a headache for two days."),
    L("Arzt", "Trinken Sie viel Wasser und ruhen Sie sich aus.", "آب زیاد بنوشید و استراحت کنید.", "Drink plenty of water and get some rest."),
    L("Patient", "Brauche ich ein Medikament?", "به دارو نیاز دارم؟", "Do I need any medicine?"),
    L("Arzt", "Ja, nehmen Sie diese Tabletten zweimal am Tag.", "بله، این قرص‌ها را روزی دو بار بخورید.", "Yes, take these tablets twice a day."),
    L("Patient", "Vielen Dank, auf Wiedersehen.", "خیلی ممنون، خداحافظ.", "Thank you very much, goodbye."),
  ]},
  { level: "B1", title: "مصاحبه کاری", lines: [
    L("Chefin", "Guten Tag, setzen Sie sich bitte. Erzählen Sie mir von sich.", "روز بخیر، بفرمایید بنشینید. از خودتان بگویید.", "Good day, please take a seat. Tell me about yourself."),
    L("Bewerber", "Ich habe drei Jahre als Lehrer gearbeitet und suche eine neue Herausforderung.", "سه سال به‌عنوان معلم کار کرده‌ام و دنبال چالش تازه‌ای هستم.", "I worked as a teacher for three years and am looking for a new challenge."),
    L("Chefin", "Warum möchten Sie bei uns arbeiten?", "چرا می‌خواهید پیش ما کار کنید؟", "Why would you like to work with us?"),
    L("Bewerber", "Weil Ihre Firma einen sehr guten Ruf hat.", "چون شرکت شما شهرت بسیار خوبی دارد.", "Because your company has a very good reputation."),
    L("Chefin", "Gut. Wir melden uns nächste Woche bei Ihnen.", "خوب است. هفته‌ی آینده با شما تماس می‌گیریم.", "Good. We will get back to you next week."),
    L("Bewerber", "Vielen Dank für das Gespräch.", "از این گفت‌وگو خیلی ممنونم.", "Thank you very much for the interview."),
  ]},
  { level: "B2", title: "بحث درباره محیط زیست", lines: [
    L("Moderator", "Heute diskutieren wir über den Klimaschutz. Was ist Ihre Meinung?", "امروز درباره‌ی حفاظت از اقلیم بحث می‌کنیم. نظر شما چیست؟", "Today we are discussing climate protection. What is your opinion?"),
    L("Gast A", "Meiner Meinung nach müssen wir sofort handeln, bevor es zu spät ist.", "به نظر من باید فوراً اقدام کنیم، پیش از آنکه دیر شود.", "In my opinion, we must act immediately before it is too late."),
    L("Gast B", "Ich stimme zu, aber die Wirtschaft darf darunter nicht leiden.", "موافقم، اما اقتصاد نباید از آن آسیب ببیند.", "I agree, but the economy must not suffer as a result."),
    L("Gast A", "Erneuerbare Energien schaffen sogar neue Arbeitsplätze.", "انرژی‌های تجدیدپذیر حتی فرصت‌های شغلی تازه می‌سازند.", "Renewable energies even create new jobs."),
    L("Moderator", "Ein guter Punkt. Gibt es weitere Vorschläge?", "نکته‌ی خوبی است. پیشنهاد دیگری هم هست؟", "A good point. Are there any further suggestions?"),
    L("Gast B", "Ja, der öffentliche Verkehr sollte günstiger werden.", "بله، حمل‌ونقل عمومی باید ارزان‌تر شود.", "Yes, public transport should become cheaper."),
  ]},
  { level: "C1", title: "سمینار دانشگاهی", lines: [
    L("Professorin", "Kommen wir nun zur Kernfrage: Verändert künstliche Intelligenz unser Denken?", "حالا به پرسش اصلی می‌رسیم: آیا هوش مصنوعی تفکر ما را دگرگون می‌کند؟", "Let us now turn to the core question: Is artificial intelligence changing our thinking?"),
    L("Student", "Aus meiner Sicht hängt das davon ab, wie wir die Technologie nutzen.", "از نظر من این به چگونگی استفاده‌ی ما از فناوری بستگی دارد.", "From my point of view, it depends on how we use the technology."),
    L("Professorin", "Könnten Sie das an einem Beispiel erläutern?", "می‌توانید آن را با یک مثال توضیح دهید؟", "Could you illustrate that with an example?"),
    L("Student", "Gern. Wer Suchmaschinen klug nutzt, lernt schneller, verliert aber vielleicht die Geduld für lange Texte.", "حتماً. کسی که از موتورهای جستجو هوشمندانه استفاده کند سریع‌تر یاد می‌گیرد، اما شاید حوصله‌ی متن‌های طولانی را از دست بدهد.", "Gladly. Those who use search engines wisely learn faster but may lose patience for long texts."),
    L("Professorin", "Ein interessanter Zusammenhang. Das vertiefen wir nächste Woche.", "ارتباط جالبی است. هفته‌ی آینده آن را عمیق‌تر بررسی می‌کنیم.", "An interesting connection. We will explore that in depth next week."),
  ]},
];
const dictation = [
  { level: "A0", text: "Ich trinke gern Tee.", fa: "من چای دوست دارم.", hint: "نوشیدنی و علاقه" },
  { level: "B1", text: "Obwohl es regnete, sind wir spazieren gegangen.", fa: "با اینکه باران می‌بارید، به پیاده‌روی رفتیم.", hint: "جمله با obwohl" },
  { level: "B2", text: "Die Entscheidung wurde nach langer Diskussion getroffen.", fa: "تصمیم پس از بحثی طولانی گرفته شد.", hint: "مجهول (Passiv)" },
  { level: "C1", text: "Ungeachtet der Schwierigkeiten wurde das Projekt fristgerecht abgeschlossen.", fa: "با وجود مشکلات، پروژه به‌موقع به پایان رسید.", hint: "مجهول و حرف اضافه‌ی پیشرفته" },
];
const titles = new Set(core.dialogues.map(d => d.title));
for (const d of dialogues) if (!titles.has(d.title)) core.dialogues.push(d);
const texts = new Set(core.dictation.map(d => d.text));
for (const d of dictation) if (!texts.has(d.text)) core.dictation.push(d);
fs.writeFileSync(file, JSON.stringify(core, null, 2) + "\n", "utf8");
console.log("dialogues:", core.dialogues.length, "dictation:", core.dictation.length);
console.log("dialogues/level:", core.dialogues.reduce((a, d) => (a[d.level] = (a[d.level] || 0) + 1, a), {}));
console.log("dictation/level:", core.dictation.reduce((a, d) => (a[d.level] = (a[d.level] || 0) + 1, a), {}));
