"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

const GRAMMAR_META = {
  "ضمایر فاعلی (Personalpronomen)": {
    description:
      "ضمایر فاعلی جایگزین اسم می‌شوند و فاعل جمله هستند: ich (من)، du (تو، غیررسمی)، er/sie/es (او)، wir (ما)، ihr (شما، جمع غیررسمی)، sie (آن‌ها) و Sie (شما، رسمی). فعل همیشه با فاعل از نظر شخص و شمار هماهنگ می‌شود.",
    enNote:
      "Unlike English, German has formal Sie (capital S) for polite address, and informal du/ihr. Third person has three genders: er (he), sie (she), es (it).",
  },
  "فعل sein در زمان حال": {
    description:
      "فعل sein (بودن) بی‌قاعده‌ترین فعل آلمانی است. صورت‌های حال: ich bin، du bist، er/sie/es ist، wir/sie/Sie sind، ihr seid. برای معرفی، حالت، و هویت به کار می‌رود.",
    enNote:
      "Like English to be (am/is/are), sein is highly irregular — memorize the forms; they do not follow the usual -e/-st/-t pattern.",
  },
  "فعل haben در زمان حال": {
    description:
      "فعل haben (داشتن) برای مالکیت و به‌عنوان فعل کمکی در زمان Perfekt به کار می‌رود. صورت‌های حال: ich habe، du hast، er/sie/es hat، wir/Sie/sie haben، ihr habt.",
    enNote:
      "Similar to English have/has, but du hast and er hat drop the -b- sound pattern learners expect from regular verbs.",
  },
  "ترتیب کلمات در جمله ساده": {
    description:
      "در جملهٔ خبری ساده آلمانی، فعل صرف‌شده معمولاً در جایگاه دوم قرار می‌گیرد (V2). فاعل می‌تواند اول باشد یا بعد از فعل بیاید اگر عنصر دیگری (قید زمان/مکان) اول باشد.",
    enNote:
      "German V2 word order differs from English SVO: if a time phrase starts the sentence, the subject moves after the verb (Heute gehe ich…).",
  },
  "تفاوت du و Sie": {
    description:
      "du برای دوستان، خانواده و کودکان است؛ Sie (با S بزرگ) برای غریبه‌ها، محیط رسمی و احترام. در جمع غیررسمی ihr و در جمع/فرد رسمی Sie به کار می‌رود. فعل با Sie همیشه صورت جمع می‌گیرد (مثل sie «آن‌ها»).",
    enNote:
      "English only has you. German distinguishes informal du/ihr from formal Sie — using the wrong form can sound rude or overly stiff.",
  },
  "حرف تعریف معین (der, die, das)": {
    description:
      "هر اسم آلمانی جنسیت دستوری دارد: مذکر der، مؤنث die، خنثی das. حرف تعریف معین با حالت دستوری (Nominativ/Akkusativ/Dativ/Genitiv) تغییر می‌کند. جمع همهٔ جنسیت‌ها در Nominativ: die.",
    enNote:
      "English the is gender-neutral. German gender is grammatical (not biological) — der Tisch (table) is masculine. Always learn noun + article together.",
  },
  "صرف فعل بودن (sein)": {
    description:
      "sein پایهٔ جملات هویتی و توصیفی است. صورت‌های حال را حفظ کنید؛ در Perfekt با gewesen می‌آید (ich bin gewesen) و در Präteritum: war/warst/war…",
    enNote: "Cognate with English is/are via older Germanic roots; forms still look alien (bin, bist, sind) and must be memorized.",
  },
  "صرف فعل داشتن (haben)": {
    description:
      "haben هم مالکیت را بیان می‌کند هم فعل کمکی اصلی برای بیشتر افعال در Perfekt است (ich habe gemacht). صورت‌های du hast و er/sie/es hat را ویژه به خاطر بسپارید.",
    enNote: "Cognate with English have. In spoken German, Perfekt with haben is far more common than simple past for most verbs.",
  },
  "جملات پرسشی با Wie / Wo / Woher": {
    description:
      "کلمات پرسشی (W-Fragen) معمولاً اول جمله می‌آیند و فعل صرف‌شده در جایگاه دوم می‌ماند: Wie heißt du? Wo wohnst du? Woher kommst du? برای بله/خیر، فعل اول می‌آید: Kommst du?",
    enNote:
      "Like English wh-questions, but German keeps V2: question word + verb + subject. Yes/no questions invert verb and subject without do-support.",
  },
  "ضمایر ملکی (mein, dein, sein...)": {
    description:
      "ضمایر ملکی (Possessivpronomen/artikel) مالکیت را نشان می‌دهند: mein، dein، sein، ihr، unser، euer، Ihr. مثل ein صرف می‌شوند و با جنسیت و حالت اسم بعد از خود تغییر می‌کنند (mein Buch، meine Tasche، meinen Freund).",
    enNote:
      "English my/your/his barely change form. German possessive articles inflect like ein: mein, meine, meinen, meinem…",
  },
  "اعداد و سن": {
    description:
      "اعداد پایه را حفظ کنید (eins تا zwölf، سپس -zehn، -zig). برای سن از sein + عدد + Jahr(e) alt استفاده می‌شود: Ich bin 20 Jahre alt. در آلمانی یکان قبل از دهگان با und می‌آید: einundzwanzig.",
    enNote:
      "German flips English twenty-one → einundzwanzig (one-and-twenty). Age uses sein … Jahre alt, not have years.",
  },
  "رنگ‌ها": {
    description:
      "رنگ‌ها صفت هستند و وقتی قبل از اسم بیایند صرف می‌شوند (das rote Auto). به‌صورت خبری بعد از sein بدون صرف پایانی اجباری در محاوره ساده‌اند: Das Auto ist rot.",
    enNote: "Many color words are cognates (blau/blue, grün/green, braun/brown) but take adjective endings before nouns.",
  },
  "روزهای هفته": {
    description:
      "روزهای هفته مذکرند (der Montag…). برای «در روز…» از am استفاده کنید: am Montag. هفته با die Woche و آخر هفته das Wochenende است.",
    enNote:
      "English on Monday → German am Montag (an + dem). Days are masculine; no capital preposition needed beyond am/um.",
  },
  "حروف اضافه ساده (in, auf, an)": {
    description:
      "حروف اضافه ساده مکان/زمان را نشان می‌دهند. in (در/به داخل)، auf (روی سطح)، an (کنار/به دیوار یا تاریخ). بسیاری از آن‌ها Wechselpräpositionen هستند و بسته به حرکت یا حالت، Akkusativ یا Dativ می‌گیرند.",
    enNote:
      "English in/on/at map imperfectly. German an/auf/in also encode case: motion → Accusative, location → Dative.",
  },
  "فعل möchten (خواستن مؤدبانه)": {
    description:
      "möchten صورت مؤدبانهٔ «خواستن» است (در اصل Konjunktiv II از mögen). برای سفارش و درخواست مودبانه: Ich möchte einen Kaffee. صورت‌ها: möchte، möchtest، möchte، möchten، möchtet، möchten.",
    enNote:
      "Closer to English would like than want (wollen). Prefer möchten in shops and formal requests.",
  },
  "حروف اضافه مکانی (in, auf, unter ...)": {
    description:
      "حروف اضافهٔ مکانی دقیق‌تر مکان را مشخص می‌کنند: unter (زیر)، über (بالا/بیش)، neben (کنار)، zwischen (بین)، hinter (پشت)، vor (جلو). با Wechselpräpositionen: حرکت → Akk، مکان ثابت → Dat.",
    enNote:
      "Two-way prepositions are a major English-speaker pitfall: Ich gehe in den Park (Acc) vs Ich bin im Park (Dat).",
  },
  "افعال با پیشوند جداشونده (trennbare Verben)": {
    description:
      "در افعال جدایی‌پذیر (مثل aufstehen، anrufen)، در جملهٔ خبری حال، پیشوند به انتهای جمله می‌رود: Ich stehe um 7 Uhr auf. در Perfekt پیشوند به Partizip می‌چسبد: aufgestanden. در جملهٔ وابسته جدا نمی‌شود.",
    enNote:
      "English has phrasal verbs (stand up); German splits the prefix in main clauses but reattaches it in subordinate clauses and participles.",
  },
  "زمان گذشته (Perfekt)": {
    description:
      "Perfekt زمان گذشتهٔ محاوره‌ای است: فعل کمکی haben یا sein در جایگاه دوم + Partizip II در انتها. بیشتر افعال haben می‌گیرند؛ افعال حرکت/تغییر حالت اغلب sein (gehen → bin gegangen).",
    enNote:
      "Spoken German prefers Perfekt where English uses simple past. Auxiliary choice (haben/sein) has no direct English parallel.",
  },
  "افعال کمکی (Modalverben)": {
    description:
      "افعال وجهی (können، müssen، dürfen، sollen، wollen، mögen) صرف ویژه دارند و فعل اصلی به صورت مصدر در انتها می‌آید: Ich kann Deutsch sprechen. در Perfekt اغلب ساخت دو مصدری دارند.",
    enNote:
      "Like English modals (can/must), they pair with a bare infinitive at the end — but German still conjugates the modal for person.",
  },
  "حالت امری (Imperativ)": {
    description:
      "امر برای du معمولاً ریشه بدون -st است (Komm!)، برای ihr صورت جمع بدون ihr (Kommt!)، برای Sie مصدر + Sie (Kommen Sie!). افعال جدایی‌پذیر پیشوند را جدا می‌کنند: Steh auf!",
    enNote: "No English do-support. Formal imperative keeps Sie after the verb: Warten Sie bitte!",
  },
  "صفت‌های ملکی در حالت‌های مختلف": {
    description:
      "صفت/حرف تعریف ملکی با حالت اسم تغییر می‌کند: Nominativ mein Freund، Akkusativ meinen Freund، Dativ meinem Freund، Genitiv meines Freundes. الگوی صرف شبیه ein است.",
    enNote: "English my friend stays my in all roles; German meinen/meinem mark object and indirect object.",
  },
  "صفت‌های مقایسه‌ای (Komparativ)": {
    description:
      "صفت تفضیلی معمولاً با -er ساخته می‌شود: schneller، größer (گاهی trema). در مقایسه از als استفاده می‌شود: Er ist größer als ich. قبل از اسم، صفت تفضیلی هم صرف می‌شود.",
    enNote: "English uses more/-er + than; German uses -er + als (not wie for unequal comparison).",
  },
  "صفت‌های عالی (Superlativ)": {
    description:
      "عالی با am + -sten (پیش‌بینی‌پذیر): am schnellsten، یا با حرف تعریف + -ste قبل از اسم: der schnellste Zug. برخی بی‌قاعده‌اند (gut → am besten).",
    enNote: "English the best ≈ der/die/das beste or am besten depending on attributive vs predicative use.",
  },
  "زمان آینده (Futur I)": {
    description:
      "آینده با werden + مصدر در انتها ساخته می‌شود: Ich werde morgen lernen. در گفتار روزمره اغلب Präsens + قید زمان جایگزین می‌شود: Ich lerne morgen.",
    enNote: "Cognate auxiliary werden ≈ will/shall become; English will + verb is closer in meaning than word order suggests.",
  },
  "حالت داتیو (Dativ)": {
    description:
      "Dativ حالت مفعول غیرمستقیم است (به/برای کسی). حروف تعریف: dem/der/dem/den (جمع). بسیاری حروف اضافه فقط Dativ می‌گیرند (mit، zu، von، bei، nach، aus، seit). فعل‌هایی مثل helfen، danken، gehören Dativ می‌خواهند.",
    enNote:
      "English marks this with to/for or word order. German changes the article: dem Mann, der Frau — endings are the signal.",
  },
  "حالت آکوزاتیو (Akkusativ)": {
    description:
      "Akkusativ حالت مفعول مستقیم است. تغییر اصلی در مذکر: der → den، ein → einen. مؤنث/خنثی/جمع در ظاهر شبیه Nominativ می‌مانند (die/das/die). حروف اضافهٔ فقط Akk: durch، für، gegen، ohne، um.",
    enNote: "Only masculine singular shows a clear change (den). English has almost no case marking on nouns/articles.",
  },
  "جمله وابسته (Nebensatz) با dass": {
    description:
      "بعد از dass فعل صرف‌شده به انتهای بند وابسته می‌رود: Ich weiß, dass er kommt. ویرگول قبل از dass اجباری است. dass complementizer است نه das حرف تعریف/ضمیر.",
    enNote:
      "English that rarely moves the verb. German subordinate clauses are verb-final — a core word-order difference.",
  },
  "جمله شرطی (wenn)": {
    description:
      "wenn برای شرط واقعی/ممکن و «وقتی که» به کار می‌رود. بند wenn فعلی‌نهای است: Wenn es regnet, bleibe ich zu Hause. در شرط غیرواقعی از Konjunktiv II استفاده کنید.",
    enNote: "wenn can mean if or when. Unlike English, the conjugated verb goes to the end of the wenn-clause.",
  },
  "صرف فعل در زمان گذشته ساده (Präteritum)": {
    description:
      "Präteritum بیشتر در نوشتار و روایت و برای sein/haben/modalها در گفتار رایج است: ich war، ich hatte، ich konnte. افعال باقاعده: -te- (machte)؛ بی‌قاعده تغییر ریشه دارند (ging، sah).",
    enNote: "Similar role to English simple past in stories; spoken German still leans on Perfekt for most content verbs.",
  },
  "جمله‌های موصولی (Relativsätze)": {
    description:
      "ضمایر موصولی (der/die/das و صورت‌های حالتی) اسم را توصیف می‌کنند و بند موصولی فعلی‌نهای است: Das ist der Mann, der dort wohnt. انتخاب der/die/das با نقش در بند موصولی (نه فقط با مرجع) تعیین می‌شود.",
    enNote:
      "English who/which/that; German relative pronouns show gender/case (den, dem, dessen…) and force verb-final order.",
  },
  "صرف فعل werden و کاربردهای آن": {
    description:
      "werden سه نقش اصلی دارد: ۱) شدن (Er wird Arzt) ۲) آینده (Ich werde gehen) ۳) ساخت مجهول (Das Haus wird gebaut). صرف حال: werde، wirst، wird، werden، werdet، werden.",
    enNote: "One verb covers become, will-future, and passive — English splits these across become/will/be.",
  },
  "حالت مجهول (Passiv)": {
    description:
      "مجهول Vorgangspassiv: werden + Partizip II: Das Brot wird gebacken. عامل با von. حالت/نتیجه با sein + Partizip (Zustandspassiv): Das Brot ist gebacken. زمان‌ها با صرف werden ساخته می‌شوند.",
    enNote: "English uses be + past participle. German uses werden (process) vs sein (state) — both look like be to learners.",
  },
  "فعل‌های با پیشوند غیرجداشونده": {
    description:
      "پیشوندهای be-، ent-، er-، emp-، ver-، zer-، miss- جدا نمی‌شوند و Partizip بدون ge- است: besuchen → besucht، verstehen → verstanden. تکیه روی ریشه می‌ماند نه پیشوند.",
    enNote: "Opposite of separable verbs; English often uses a different verb entirely (verstehen ≈ understand).",
  },
  "زمان گذشته کامل (Plusquamperfekt)": {
    description:
      "برای عملی قبل از گذشتهٔ دیگر: hatte/war + Partizip II: Ich hatte gegessen, bevor du kamst. در روایت‌های پیچیده و گزارش‌ها مهم است.",
    enNote: "Parallel to English past perfect (had + past participle).",
  },
  "جمله‌های شرطی غیرواقعی (Konjunktiv II)": {
    description:
      "Konjunktiv II برای فرض، آرزو و مؤدب بودن: Ich wäre glücklich. Wenn ich Zeit hätte, würde ich kommen. ساخت würde + Infinitiv بسیار رایج است؛ sein/haben/modalها صورت ویژه دارند (wäre، hätte، könnte).",
    enNote: "Like English would/could/were subjunctive. würde + infinitive ≈ would + verb.",
  },
  "افعال با حرف اضافه ثابت (Verben mit festen Präpositionen)": {
    description:
      "بسیاری افعال حرف اضافهٔ ثابت و حالت مشخص دارند: warten auf + Akk، helfen bei + Dat، sprechen über + Akk. باید با هم حفظ شوند؛ ترجمهٔ لفظی از فارسی/انگلیسی اغلب غلط است.",
    enNote:
      "Similar to English depend on / wait for, but case after the preposition is fixed and must be learned per verb.",
  },
  "حالت جنسی (Genitiv)": {
    description:
      "Genitiv مالکیت و برخی حروف اضافه (wegen، trotz، während، statt) را نشان می‌دهد: des Mannes، der Frau، des Kindes. در گفتار اغلب von + Dativ جایگزین می‌شود، اما در نوشتار رسمی Genitiv مهم است.",
    enNote: "English 's / of. German genitive articles des/der and noun endings (-s/-es) mark possession.",
  },
  "جمله‌های مجهول با افعال کمکی": {
    description:
      "مجهول در زمان‌های مختلف: Perfekt مجهول = ist/sind + Partizip + worden (Das Haus ist gebaut worden). با Modal: Das muss gemacht werden. ترتیب افعال در انتها را تمرین کنید.",
    enNote: "English has been built ≈ ist gebaut worden — note worden (not geworden) in passive perfect.",
  },
  "Konjunktiv II در گذشته": {
    description:
      "برای پشیمانی یا فرض در گذشته: wäre/hätte + Partizip: Ich hätte das gewusst. Wenn er gekommen wäre… اغلب با ساخت würde در حال قاطی نشود.",
    enNote: "≈ English would have + past participle (I would have known).",
  },
  "جمله‌های شرطی نوع سوم (Konjunktiv II Plusquamperfekt)": {
    description:
      "شرط غیرواقعی گذشته (نوع ۳): Wenn ich das gewusst hätte, wäre ich nicht gegangen. هر دو بند معمولاً Konjunktiv II گذشته دارند.",
    enNote: "Third conditional: If I had known, I would have stayed — same idea, German verb-final in the wenn-clause.",
  },
  "جمله‌های شرطی نوع سوم": {
    description:
      "همان شرط نوع سوم: گذشتهٔ غیرواقعی با hätte/wäre + Partizip در بندها. برای بیان «اگر آن موقع… الان/آن موقع طور دیگری می‌شد».",
    enNote: "Same as English third conditional; focus on auxiliary choice haben vs sein in each clause.",
  },
  "جمله‌های موصولی با حروف اضافه (Relativsätze mit Präpositionen)": {
    description:
      "حرف اضافه قبل از ضمیر موصولی می‌آید: Der Freund, mit dem ich spreche… یا صورت wo- برای چیزها (worauf، womit) در سبک رسمی/نوشتاری.",
    enNote: "English the friend with whom / that I speak with; German prefers preposition + relative dem/der/denen.",
  },
  "جمله‌های موصولی با حروف اضافه": {
    description:
      "ساختار Präposition + Relativpronomen را تمرین کنید و حالت بعد از حرف اضافه را رعایت کنید (mit dem، für die، von dem).",
    enNote: "Case after the preposition controls dem vs den vs der in the relative pronoun.",
  },
  "ساختارهای جایگزین برای مجهول (man / sich lassen)": {
    description:
      "به‌جای مجهول می‌توان از man (Man sagt…) یا sich lassen (Das lässt sich machen) یا sein + zu + Infinitiv استفاده کرد. در نوشتار و گفتار طبیعی بسیار رایج‌اند.",
    enNote: "English one/you/they + verb or this can be done; German man is extremely common in place of full passives.",
  },
  "ساختارهای جایگزین برای مجهول": {
    description:
      "man + فعل معلوم، sich lassen + Infinitiv، و sein + zu + Infinitiv جایگزین‌های کاربردی مجهول هستند و اغلب طبیعی‌تر از Passiv کامل‌اند.",
    enNote: "Prefer these in everyday style; reserve werden-passive for processes and formal texts.",
  },
  "جمله‌های تأکیدی (mit es / das)": {
    description:
      "es و das می‌توانند برای تأکید، جای‌نگهدار یا اشاره به کل جمله به کار روند: Es ist wichtig, dass… / Das weiß ich. در برخی ساخت‌ها es اجباری است حتی اگر فاعل منطقی جای دیگری باشد.",
    enNote: "Like English dummy it (It is important that…), but German also uses das to point back to a whole idea.",
  },
  "جمله‌های تأکیدی": {
    description:
      "با جابه‌جایی عنصر مهم به ابتدای جمله (و حفظ V2) یا با es/das می‌توان تأکید ایجاد کرد. معنی با آهنگ و جایگاه تغییر می‌کند.",
    enNote: "Fronting for emphasis still requires the finite verb in position two.",
  },
  "جمله‌های تقابلی (obwohl, trotz, etc.)": {
    description:
      "برای تضاد: obwohl/obgleich (فعلی‌نهای)، trotz + Genitiv، trotzdem (قید در جملهٔ اصلی). entgegengesetzte Beziehungen را با ویرگول درست جدا کنید.",
    enNote: "obwohl ≈ although (verb-final); trotz ≈ despite (+ genitive); trotzdem ≈ nevertheless (V2 main clause).",
  },
  "جمله‌های تقابلی": {
    description:
      "obwohl بند وابسته می‌سازد؛ trotzdem جملهٔ جدید را با V2 ادامه می‌دهد. trotz حرف اضافه است نه حرف ربط.",
    enNote: "Do not mix obwohl (conjunction) with trotz (preposition) word order patterns.",
  },
};

const EXTRA_VERBS = [
  {
    infinitive: "bleiben",
    type: "بی‌قاعده",
    fa: "ماندن",
    en: "to stay / remain",
    level: "B1",
    present: { ich: "bleibe", du: "bleibst", er_sie_es: "bleibt", wir: "bleiben", ihr: "bleibt", sie_Sie: "bleiben" },
    praeteritum: { ich: "blieb", du: "bliebst", er_sie_es: "blieb", wir: "blieben", ihr: "bliebt", sie_Sie: "blieben" },
    auxiliary: "sein",
    partizip: "geblieben",
    separable: false,
    konjunktivII: { ich: "bliebe", du: "bliebest", er_sie_es: "bliebe", wir: "blieben", ihr: "bliebet", sie_Sie: "blieben" },
    passive: null,
  },
  {
    infinitive: "beginnen",
    type: "بی‌قاعده",
    fa: "شروع کردن",
    en: "to begin",
    level: "B1",
    present: { ich: "beginne", du: "beginnst", er_sie_es: "beginnt", wir: "beginnen", ihr: "beginnt", sie_Sie: "beginnen" },
    praeteritum: { ich: "begann", du: "begannst", er_sie_es: "begann", wir: "begannen", ihr: "begannt", sie_Sie: "begannen" },
    auxiliary: "haben",
    partizip: "begonnen",
    separable: false,
    konjunktivII: { ich: "begänne", du: "begännest", er_sie_es: "begänne", wir: "begännen", ihr: "begännet", sie_Sie: "begännen" },
  },
  {
    infinitive: "erklären",
    type: "باقاعده",
    fa: "توضیح دادن",
    en: "to explain",
    level: "B1",
    present: { ich: "erkläre", du: "erklärst", er_sie_es: "erklärt", wir: "erklären", ihr: "erklärt", sie_Sie: "erklären" },
    praeteritum: { ich: "erklärte", du: "erklärtest", er_sie_es: "erklärte", wir: "erklärten", ihr: "erklärtet", sie_Sie: "erklärten" },
    auxiliary: "haben",
    partizip: "erklärt",
    separable: false,
    konjunktivII: { ich: "erklärte", du: "erklärtest", er_sie_es: "erklärte", wir: "erklärten", ihr: "erklärtet", sie_Sie: "erklärten" },
    passive: "Es wird erklärt.",
  },
  {
    infinitive: "entscheiden",
    type: "بی‌قاعده",
    fa: "تصمیم گرفتن",
    en: "to decide",
    level: "B1",
    present: { ich: "entscheide", du: "entscheidest", er_sie_es: "entscheidet", wir: "entscheiden", ihr: "entscheidet", sie_Sie: "entscheiden" },
    praeteritum: { ich: "entschied", du: "entschiedest", er_sie_es: "entschied", wir: "entschieden", ihr: "entschiedet", sie_Sie: "entschieden" },
    auxiliary: "haben",
    partizip: "entschieden",
    separable: false,
    konjunktivII: { ich: "entschiede", du: "entschiedest", er_sie_es: "entschiede", wir: "entschieden", ihr: "entschiedet", sie_Sie: "entschieden" },
  },
  {
    infinitive: "erzählen",
    type: "باقاعده",
    fa: "تعریف کردن / روایت کردن",
    en: "to tell / narrate",
    level: "B1",
    present: { ich: "erzähle", du: "erzählst", er_sie_es: "erzählt", wir: "erzählen", ihr: "erzählt", sie_Sie: "erzählen" },
    praeteritum: { ich: "erzählte", du: "erzähltest", er_sie_es: "erzählte", wir: "erzählten", ihr: "erzähltet", sie_Sie: "erzählten" },
    auxiliary: "haben",
    partizip: "erzählt",
    separable: false,
    passive: "Die Geschichte wird erzählt.",
  },
  {
    infinitive: "vergessen",
    type: "بی‌قاعده",
    fa: "فراموش کردن",
    en: "to forget",
    level: "B1",
    present: { ich: "vergesse", du: "vergisst", er_sie_es: "vergisst", wir: "vergessen", ihr: "vergesst", sie_Sie: "vergessen" },
    praeteritum: { ich: "vergaß", du: "vergaßest", er_sie_es: "vergaß", wir: "vergaßen", ihr: "vergaßt", sie_Sie: "vergaßen" },
    auxiliary: "haben",
    partizip: "vergessen",
    separable: false,
    konjunktivII: { ich: "vergäße", du: "vergäßest", er_sie_es: "vergäße", wir: "vergäßen", ihr: "vergäßet", sie_Sie: "vergäßen" },
  },
  {
    infinitive: "bekommen",
    type: "بی‌قاعده",
    fa: "گرفتن / دریافت کردن",
    en: "to get / receive",
    level: "B1",
    present: { ich: "bekomme", du: "bekommst", er_sie_es: "bekommt", wir: "bekommen", ihr: "bekommt", sie_Sie: "bekommen" },
    praeteritum: { ich: "bekam", du: "bekamst", er_sie_es: "bekam", wir: "bekamen", ihr: "bekamt", sie_Sie: "bekamen" },
    auxiliary: "haben",
    partizip: "bekommen",
    separable: false,
  },
  {
    infinitive: "verlieren",
    type: "بی‌قاعده",
    fa: "از دست دادن / باختن",
    en: "to lose",
    level: "B1",
    present: { ich: "verliere", du: "verlierst", er_sie_es: "verliert", wir: "verlieren", ihr: "verliert", sie_Sie: "verlieren" },
    praeteritum: { ich: "verlor", du: "verlorst", er_sie_es: "verlor", wir: "verloren", ihr: "verlort", sie_Sie: "verloren" },
    auxiliary: "haben",
    partizip: "verloren",
    separable: false,
    konjunktivII: { ich: "verlöre", du: "verlörest", er_sie_es: "verlöre", wir: "verlören", ihr: "verlöret", sie_Sie: "verlören" },
  },
  {
    infinitive: "gewinnen",
    type: "بی‌قاعده",
    fa: "برنده شدن / به دست آوردن",
    en: "to win / gain",
    level: "B1",
    present: { ich: "gewinne", du: "gewinnst", er_sie_es: "gewinnt", wir: "gewinnen", ihr: "gewinnt", sie_Sie: "gewinnen" },
    praeteritum: { ich: "gewann", du: "gewannst", er_sie_es: "gewann", wir: "gewannen", ihr: "gewannt", sie_Sie: "gewannen" },
    auxiliary: "haben",
    partizip: "gewonnen",
    separable: false,
  },
  {
    infinitive: "verstehen",
    type: "بی‌قاعده",
    fa: "فهمیدن",
    en: "to understand",
    level: "B1",
    present: { ich: "verstehe", du: "verstehst", er_sie_es: "versteht", wir: "verstehen", ihr: "versteht", sie_Sie: "verstehen" },
    praeteritum: { ich: "verstand", du: "verstandest", er_sie_es: "verstand", wir: "verstanden", ihr: "verstandet", sie_Sie: "verstanden" },
    auxiliary: "haben",
    partizip: "verstanden",
    separable: false,
    konjunktivII: { ich: "verstände", du: "verständest", er_sie_es: "verstände", wir: "verständen", ihr: "verständet", sie_Sie: "verständen" },
  },
  {
    infinitive: "vorschlagen",
    type: "بی‌قاعده / جدایی‌پذیر",
    fa: "پیشنهاد کردن",
    en: "to suggest / propose",
    level: "B1",
    present: { ich: "schlage vor", du: "schlägst vor", er_sie_es: "schlägt vor", wir: "schlagen vor", ihr: "schlagt vor", sie_Sie: "schlagen vor" },
    praeteritum: { ich: "schlug vor", du: "schlugst vor", er_sie_es: "schlug vor", wir: "schlugen vor", ihr: "schlugt vor", sie_Sie: "schlugen vor" },
    auxiliary: "haben",
    partizip: "vorgeschlagen",
    separable: true,
    prefix: "vor",
  },
  {
    infinitive: "teilnehmen",
    type: "بی‌قاعده / جدایی‌پذیر",
    fa: "شرکت کردن",
    en: "to take part / participate",
    level: "B2",
    present: { ich: "nehme teil", du: "nimmst teil", er_sie_es: "nimmt teil", wir: "nehmen teil", ihr: "nehmt teil", sie_Sie: "nehmen teil" },
    praeteritum: { ich: "nahm teil", du: "nahmst teil", er_sie_es: "nahm teil", wir: "nahmen teil", ihr: "nahmt teil", sie_Sie: "nahmen teil" },
    auxiliary: "haben",
    partizip: "teilgenommen",
    separable: true,
    prefix: "teil",
  },
  {
    infinitive: "erreichen",
    type: "باقاعده",
    fa: "رسیدن به / دستیابی",
    en: "to reach / achieve",
    level: "B2",
    present: { ich: "erreiche", du: "erreichst", er_sie_es: "erreicht", wir: "erreichen", ihr: "erreicht", sie_Sie: "erreichen" },
    praeteritum: { ich: "erreichte", du: "erreichtest", er_sie_es: "erreichte", wir: "erreichten", ihr: "erreichtet", sie_Sie: "erreichten" },
    auxiliary: "haben",
    partizip: "erreicht",
    separable: false,
    passive: "Das Ziel wird erreicht.",
  },
  {
    infinitive: "vermeiden",
    type: "بی‌قاعده",
    fa: "اجتناب کردن",
    en: "to avoid",
    level: "B2",
    present: { ich: "vermeide", du: "vermeidest", er_sie_es: "vermeidet", wir: "vermeiden", ihr: "vermeidet", sie_Sie: "vermeiden" },
    praeteritum: { ich: "vermied", du: "vermiedest", er_sie_es: "vermied", wir: "vermieden", ihr: "vermiedet", sie_Sie: "vermieden" },
    auxiliary: "haben",
    partizip: "vermieden",
    separable: false,
  },
  {
    infinitive: "überzeugen",
    type: "باقاعده",
    fa: "متقاعد کردن",
    en: "to convince",
    level: "B2",
    present: { ich: "überzeuge", du: "überzeugst", er_sie_es: "überzeugt", wir: "überzeugen", ihr: "überzeugt", sie_Sie: "überzeugen" },
    praeteritum: { ich: "überzeugte", du: "überzeugtest", er_sie_es: "überzeugte", wir: "überzeugten", ihr: "überzeugtet", sie_Sie: "überzeugten" },
    auxiliary: "haben",
    partizip: "überzeugt",
    separable: false,
    passive: "Er wird überzeugt.",
  },
  {
    infinitive: "entstehen",
    type: "بی‌قاعده",
    fa: "به وجود آمدن",
    en: "to arise / emerge",
    level: "B2",
    present: { ich: "entstehe", du: "entstehst", er_sie_es: "entsteht", wir: "entstehen", ihr: "entsteht", sie_Sie: "entstehen" },
    praeteritum: { ich: "entstand", du: "entstandest", er_sie_es: "entstand", wir: "entstanden", ihr: "entstandet", sie_Sie: "entstanden" },
    auxiliary: "sein",
    partizip: "entstanden",
    separable: false,
  },
  {
    infinitive: "behaupten",
    type: "باقاعده",
    fa: "ادعا کردن",
    en: "to claim / assert",
    level: "B2",
    present: { ich: "behaupte", du: "behauptest", er_sie_es: "behauptet", wir: "behaupten", ihr: "behauptet", sie_Sie: "behaupten" },
    praeteritum: { ich: "behauptete", du: "behauptetest", er_sie_es: "behauptete", wir: "behaupteten", ihr: "behauptetet", sie_Sie: "behaupteten" },
    auxiliary: "haben",
    partizip: "behauptet",
    separable: false,
  },
  {
    infinitive: "berücksichtigen",
    type: "باقاعده",
    fa: "در نظر گرفتن",
    en: "to consider / take into account",
    level: "C1",
    present: { ich: "berücksichtige", du: "berücksichtigst", er_sie_es: "berücksichtigt", wir: "berücksichtigen", ihr: "berücksichtigt", sie_Sie: "berücksichtigen" },
    praeteritum: { ich: "berücksichtigte", du: "berücksichtigtest", er_sie_es: "berücksichtigte", wir: "berücksichtigten", ihr: "berücksichtigtet", sie_Sie: "berücksichtigten" },
    auxiliary: "haben",
    partizip: "berücksichtigt",
    separable: false,
    passive: "Das wird berücksichtigt.",
  },
  {
    infinitive: "widersprechen",
    type: "بی‌قاعده",
    fa: "مخالفت کردن / نقض کردن",
    en: "to contradict",
    level: "C1",
    present: { ich: "widerspreche", du: "widersprichst", er_sie_es: "widerspricht", wir: "widersprechen", ihr: "widersprecht", sie_Sie: "widersprechen" },
    praeteritum: { ich: "widersprach", du: "widersprachst", er_sie_es: "widersprach", wir: "widersprachen", ihr: "widerspracht", sie_Sie: "widersprachen" },
    auxiliary: "haben",
    partizip: "widersprochen",
    separable: false,
  },
  {
    infinitive: "voraussetzen",
    type: "باقاعده / جدایی‌پذیر",
    fa: "پیش‌فرض گرفتن",
    en: "to presuppose / assume",
    level: "C1",
    present: { ich: "setze voraus", du: "setzt voraus", er_sie_es: "setzt voraus", wir: "setzen voraus", ihr: "setzt voraus", sie_Sie: "setzen voraus" },
    praeteritum: { ich: "setzte voraus", du: "setztest voraus", er_sie_es: "setzte voraus", wir: "setzten voraus", ihr: "setztet voraus", sie_Sie: "setzten voraus" },
    auxiliary: "haben",
    partizip: "vorausgesetzt",
    separable: true,
    prefix: "voraus",
  },
  {
    infinitive: "nachweisen",
    type: "بی‌قاعده / جدایی‌پذیر",
    fa: "اثبات کردن / نشان دادن",
    en: "to prove / demonstrate",
    level: "C1",
    present: { ich: "weise nach", du: "weist nach", er_sie_es: "weist nach", wir: "weisen nach", ihr: "weist nach", sie_Sie: "weisen nach" },
    praeteritum: { ich: "wies nach", du: "wiesest nach", er_sie_es: "wies nach", wir: "wiesen nach", ihr: "wiest nach", sie_Sie: "wiesen nach" },
    auxiliary: "haben",
    partizip: "nachgewiesen",
    separable: true,
    prefix: "nach",
    passive: "Es wird nachgewiesen.",
  },
  {
    infinitive: "unterscheiden",
    type: "بی‌قاعده",
    fa: "تمایز قائل شدن",
    en: "to distinguish / differentiate",
    level: "C1",
    present: { ich: "unterscheide", du: "unterscheidest", er_sie_es: "unterscheidet", wir: "unterscheiden", ihr: "unterscheidet", sie_Sie: "unterscheiden" },
    praeteritum: { ich: "unterschied", du: "unterschiedest", er_sie_es: "unterschied", wir: "unterschieden", ihr: "unterschiedet", sie_Sie: "unterschieden" },
    auxiliary: "haben",
    partizip: "unterschieden",
    separable: false,
  },
];

const K2_PATCH = {
  sein: { ich: "wäre", du: "wärest", er_sie_es: "wäre", wir: "wären", ihr: "wäret", sie_Sie: "wären" },
  haben: { ich: "hätte", du: "hättest", er_sie_es: "hätte", wir: "hätten", ihr: "hättet", sie_Sie: "hätten" },
  werden: { ich: "würde", du: "würdest", er_sie_es: "würde", wir: "würden", ihr: "würdet", sie_Sie: "würden" },
  können: { ich: "könnte", du: "könntest", er_sie_es: "könnte", wir: "könnten", ihr: "könntet", sie_Sie: "könnten" },
  müssen: { ich: "müsste", du: "müsstest", er_sie_es: "müsste", wir: "müssten", ihr: "müsstet", sie_Sie: "müssten" },
  dürfen: { ich: "dürfte", du: "dürftest", er_sie_es: "dürfte", wir: "dürften", ihr: "dürftet", sie_Sie: "dürften" },
  sollen: { ich: "sollte", du: "solltest", er_sie_es: "sollte", wir: "sollten", ihr: "solltet", sie_Sie: "sollten" },
  wollen: { ich: "wollte", du: "wolltest", er_sie_es: "wollte", wir: "wollten", ihr: "wolltet", sie_Sie: "wollten" },
  gehen: { ich: "ginge", du: "gingest", er_sie_es: "ginge", wir: "gingen", ihr: "ginget", sie_Sie: "gingen" },
  kommen: { ich: "käme", du: "kämest", er_sie_es: "käme", wir: "kämen", ihr: "kämet", sie_Sie: "kämen" },
  geben: { ich: "gäbe", du: "gäbest", er_sie_es: "gäbe", wir: "gäben", ihr: "gäbet", sie_Sie: "gäben" },
  nehmen: { ich: "nähme", du: "nähmest", er_sie_es: "nähme", wir: "nähmen", ihr: "nähmet", sie_Sie: "nähmen" },
  sehen: { ich: "sähe", du: "sähest", er_sie_es: "sähe", wir: "sähen", ihr: "sähet", sie_Sie: "sähen" },
  wissen: { ich: "wüsste", du: "wüsstest", er_sie_es: "wüsste", wir: "wüssten", ihr: "wüsstet", sie_Sie: "wüssten" },
};

const DIALOGUES = [
  {
    level: "A0",
    title: "سلام و معارفه",
    lines: [
      { speaker: "Anna", de: "Guten Tag! Wie heißt du?", fa: "روز بخیر! اسمت چیست؟", en: "Hello! What is your name?" },
      { speaker: "Omar", de: "Ich heiße Omar. Und du?", fa: "من عمر هستم. تو چطور؟", en: "My name is Omar. And you?" },
      { speaker: "Anna", de: "Ich bin Anna. Freut mich!", fa: "من آنا هستم. از آشنایی خوشحالم!", en: "I'm Anna. Nice to meet you!" },
      { speaker: "Omar", de: "Freut mich auch. Bis bald!", fa: "من هم همین‌طور. به زودی!", en: "Nice to meet you too. See you soon!" },
    ],
  },
  {
    level: "A1",
    title: "در کافه",
    lines: [
      { speaker: "Kellner", de: "Guten Morgen! Was möchten Sie?", fa: "صبح بخیر! چه می‌خواهید؟", en: "Good morning! What would you like?" },
      { speaker: "Sara", de: "Ich möchte einen Kaffee und ein Brötchen, bitte.", fa: "یک قهوه و یک نان کوچک لطفاً.", en: "I'd like a coffee and a roll, please." },
      { speaker: "Kellner", de: "Mit Milch oder ohne?", fa: "با شیر یا بدون؟", en: "With milk or without?" },
      { speaker: "Sara", de: "Mit Milch, bitte. Was kostet das?", fa: "با شیر لطفاً. قیمتش چقدر است؟", en: "With milk, please. How much is it?" },
      { speaker: "Kellner", de: "Das macht vier Euro.", fa: "چهار یورو می‌شود.", en: "That'll be four euros." },
    ],
  },
  {
    level: "A2",
    title: "مسیر پرسیدن",
    lines: [
      { speaker: "Tourist", de: "Entschuldigung, wo ist der Bahnhof?", fa: "ببخشید، ایستگاه قطار کجاست؟", en: "Excuse me, where is the train station?" },
      { speaker: "Frau", de: "Gehen Sie geradeaus und dann links.", fa: "مستقیم بروید و بعد به چپ.", en: "Go straight ahead and then left." },
      { speaker: "Tourist", de: "Ist es weit von hier?", fa: "از اینجا دور است؟", en: "Is it far from here?" },
      { speaker: "Frau", de: "Nein, nur zehn Minuten zu Fuß.", fa: "نه، فقط ده دقیقه پیاده.", en: "No, only ten minutes on foot." },
      { speaker: "Tourist", de: "Vielen Dank für Ihre Hilfe!", fa: "از کمکتان خیلی ممنونم!", en: "Thank you very much for your help!" },
    ],
  },
  {
    level: "B1",
    title: "برنامهٔ آخر هفته",
    lines: [
      { speaker: "Leila", de: "Hast du am Wochenende Zeit?", fa: "آخر هفته وقت داری؟", en: "Do you have time on the weekend?" },
      { speaker: "Markus", de: "Ja, ich wollte eigentlich wandern gehen.", fa: "بله، در اصل می‌خواستم پیاده‌روی بروم.", en: "Yes, I actually wanted to go hiking." },
      { speaker: "Leila", de: "Super! Wenn das Wetter gut ist, komme ich mit.", fa: "عالی! اگر هوا خوب باشد باهات می‌آیم.", en: "Great! If the weather is good, I'll join you." },
      { speaker: "Markus", de: "Dann treffen wir uns am Samstag um neun am Park.", fa: "پس شنبه ساعت نه در پارک همدیگر را می‌بینیم.", en: "Then we'll meet on Saturday at nine at the park." },
    ],
  },
  {
    level: "B2",
    title: "بحث محیط‌زیست",
    lines: [
      { speaker: "Nora", de: "Meiner Meinung nach sollten wir mehr öffentliche Verkehrsmittel nutzen.", fa: "به نظر من باید بیشتر از حمل‌ونقل عمومی استفاده کنیم.", en: "In my opinion we should use more public transport." },
      { speaker: "Tim", de: "Da hast du recht, aber es ist nicht immer praktisch.", fa: "حقت با توست، اما همیشه عملی نیست.", en: "You're right, but it's not always practical." },
      { speaker: "Nora", de: "Trotzdem müssen wir etwas gegen den Klimawandel tun.", fa: "با این حال باید کاری علیه تغییر اقلیم بکنیم.", en: "Still, we have to do something about climate change." },
      { speaker: "Tim", de: "Stimmt. Wenn jeder ein bisschen spart, hilft das schon.", fa: "درسته. اگر هر کس کمی صرفه‌جویی کند، کمک می‌کند.", en: "True. If everyone saves a bit, that already helps." },
    ],
  },
  {
    level: "C1",
    title: "مصاحبهٔ کاری",
    lines: [
      { speaker: "HR", de: "Erzählen Sie bitte, warum Sie sich auf diese Stelle beworben haben.", fa: "لطفاً بگویید چرا برای این موقعیت درخواست داده‌اید.", en: "Please tell us why you applied for this position." },
      { speaker: "Bewerber", de: "Ich interessiere mich sehr für internationale Projekte und bringe einschlägige Erfahrung mit.", fa: "به پروژه‌های بین‌المللی علاقه دارم و تجربهٔ مرتبط دارم.", en: "I'm very interested in international projects and bring relevant experience." },
      { speaker: "HR", de: "Wie würden Sie mit einem engen Abgabetermin umgehen?", fa: "با ضرب‌الاجل تنگ چگونه برخورد می‌کنید؟", en: "How would you deal with a tight deadline?" },
      { speaker: "Bewerber", de: "Ich priorisiere Aufgaben, kommuniziere frühzeitig und hole mir bei Bedarf Unterstützung.", fa: "کارها را اولویت‌بندی می‌کنم، زود هماهنگ می‌کنم و در صورت نیاز کمک می‌گیرم.", en: "I prioritize tasks, communicate early, and get support when needed." },
    ],
  },
];

const WECHSEL_ITEMS = [
  { sentence: "Ich gehe ___ den Park.", answer: "in", caseNeeded: "Akkusativ", reason: "حرکت به مقصد (Wohin?)", full: "Ich gehe in den Park." },
  { sentence: "Ich bin ___ dem Park.", answer: "in", caseNeeded: "Dativ", reason: "مکان ثابت (Wo?)", full: "Ich bin in dem Park. (im Park)" },
  { sentence: "Das Buch liegt ___ dem Tisch.", answer: "auf", caseNeeded: "Dativ", reason: "مکان ثابت روی سطح", full: "Das Buch liegt auf dem Tisch." },
  { sentence: "Ich lege das Buch ___ den Tisch.", answer: "auf", caseNeeded: "Akkusativ", reason: "حرکت گذاشتن روی سطح", full: "Ich lege das Buch auf den Tisch." },
  { sentence: "Das Bild hängt ___ der Wand.", answer: "an", caseNeeded: "Dativ", reason: "مکان ثابت روی دیوار", full: "Das Bild hängt an der Wand." },
  { sentence: "Ich hänge das Bild ___ die Wand.", answer: "an", caseNeeded: "Akkusativ", reason: "حرکت نصب کردن", full: "Ich hänge das Bild an die Wand." },
  { sentence: "Die Katze sitzt ___ dem Stuhl.", answer: "unter", caseNeeded: "Dativ", reason: "مکان ثابت زیر", full: "Die Katze sitzt unter dem Stuhl." },
  { sentence: "Die Katze krabbelt ___ den Stuhl.", answer: "unter", caseNeeded: "Akkusativ", reason: "حرکت به زیر", full: "Die Katze krabbelt unter den Stuhl." },
  { sentence: "Wir wohnen ___ der Stadt.", answer: "in", caseNeeded: "Dativ", reason: "محل زندگی ثابت", full: "Wir wohnen in der Stadt." },
  { sentence: "Wir fahren ___ die Stadt.", answer: "in", caseNeeded: "Akkusativ", reason: "حرکت به شهر", full: "Wir fahren in die Stadt." },
  { sentence: "Er stellt die Lampe ___ den Schrank.", answer: "neben", caseNeeded: "Akkusativ", reason: "حرکت قرار دادن کنار", full: "Er stellt die Lampe neben den Schrank." },
  { sentence: "Die Lampe steht ___ dem Schrank.", answer: "neben", caseNeeded: "Dativ", reason: "مکان ثابت کنار", full: "Die Lampe steht neben dem Schrank." },
];

const DICTATION = [
  { level: "A0", text: "Guten Tag", fa: "روز بخیر", hint: "احوال‌پرسی" },
  { level: "A0", text: "Ich heiße Sara", fa: "اسم من سارا است", hint: "معارفه" },
  { level: "A1", text: "Wo wohnst du", fa: "کجا زندگی می‌کنی؟", hint: "بدون علامت سؤال بنویس" },
  { level: "A1", text: "Ich möchte einen Kaffee", fa: "یک قهوه می‌خواهم", hint: "möchten" },
  { level: "A1", text: "Die Mädchen sind nett", fa: "دخترها مهربان‌اند", hint: "ä و ß نیست — Mädchen" },
  { level: "A2", text: "Können Sie mir helfen", fa: "می‌توانید کمکم کنید؟", hint: "ö" },
  { level: "A2", text: "Ich muss nach Hause gehen", fa: "باید به خانه بروم", hint: "müssen" },
  { level: "A2", text: "Die Straße ist groß", fa: "خیابان بزرگ است", hint: "ß و ß/ß — Straße" },
  { level: "B1", text: "Wenn es regnet bleibe ich zu Hause", fa: "اگر باران ببارد خانه می‌مانم", hint: "بدون ویرگول هم قبول" },
  { level: "B1", text: "Ich hätte gern einen Apfel", fa: "یک سیب می‌خواهم (مودبانه)", hint: "ä در hätte و Apfel" },
  { level: "B2", text: "Das muss geändert werden", fa: "این باید تغییر کند (مجهول)", hint: "Passiv" },
  { level: "B2", text: "Ich würde das nicht machen", fa: "این کار را نمی‌کردم", hint: "ü در würde" },
  { level: "C1", text: "Trotz des Regens gingen wir spazieren", fa: "علی‌رغم باران قدم زدیم", hint: "Genitiv" },
  { level: "C1", text: "Es lässt sich nicht vermeiden", fa: "اجتناب‌ناپذیر است", hint: "ß در lässt" },
];

const PLACEMENT = [
  { level: "A0", q: "معنی «Guten Tag» چیست؟", options: ["روز بخیر", "خداحافظ", "لطفاً", "متشکرم"], answer: "روز بخیر" },
  { level: "A1", q: "کدام جمله درست است؟", options: ["Ich bin 20 Jahre alt.", "Ich habe 20 Jahre.", "Ich bin 20 alt Jahre.", "Ich years 20 bin."], answer: "Ich bin 20 Jahre alt." },
  { level: "A1", q: "حرف تعریف das برای کدام است؟", options: ["خنثی", "فقط مذکر", "فقط جمع", "فقط مؤنث"], answer: "خنثی" },
  { level: "A2", q: "صورت درست: Ich ___ gestern ins Kino ___ . (gehen)", options: ["bin … gegangen", "habe … gegangen", "bin … gegehen", "habe … ging"], answer: "bin … gegangen" },
  { level: "A2", q: "در «Steh auf!» پیشوند کجاست؟", options: ["جدا در انتها", "به فعل چسبیده", "حذف شده", "قبل از فاعل"], answer: "جدا در انتها" },
  { level: "B1", q: "فعل در بند dass کجا می‌رود؟", options: ["انتهای بند", "جایگاه دوم", "اول جمله", "حذف می‌شود"], answer: "انتهای بند" },
  { level: "B1", q: "Akkusativ مذکر der چه می‌شود؟", options: ["den", "dem", "des", "die"], answer: "den" },
  { level: "B2", q: "ساخت مجهول رایج؟", options: ["werden + Partizip II", "sein + Infinitiv", "haben + Präsens", "müssen + Nominativ"], answer: "werden + Partizip II" },
  { level: "B2", q: "Konjunktiv II برای sein؟", options: ["wäre", "wurde", "bin", "sei gewesen nur"], answer: "wäre" },
  { level: "C1", q: "trotz معمولاً کدام حالت را می‌گیرد؟", options: ["Genitiv", "فقط Akkusativ", "فقط Nominativ", "هیچ‌کدام"], answer: "Genitiv" },
];

function buildStudyPlan() {
  const plan = [];
  const levels = ["A0", "A0", "A0", "A0", "A0", "A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1", "A1", "A2", "A2", "A2", "A2", "A2", "A2", "A2", "A2", "A2", "A2", "B1", "B1", "B1", "B1", "B1", "B1", "B1", "B1", "B2", "B2", "B2", "B2", "B2", "B2", "C1", "C1", "C1", "C1", "C1", "C1"];
  const foci = {
    A0: ["الفبا و اعداد", "ضمایر و sein/haben", "احوال‌پرسی", "واژگان پایه خانه/خانواده", "مرور و دیکته ساده"],
    A1: ["حرف تعریف der/die/das", "واژگان غذا و خرید", "möchten و کافه", "زمان و روزهای هفته", "ضمایر ملکی", "حروف اضافه ساده", "فلش‌کارت + آزمون"],
    A2: ["Perfekt", "افعال جدایی‌پذیر", "Modalverben", "Imperativ", "Komparativ", "Wechselpräpositionen", "مکالمه مسیر", "خواندن A2"],
    B1: ["Akkusativ/Dativ", "Nebensatz mit dass", "wenn-Sätze", "Präteritum", "Relativsätze", "Futur I", "دیالوگ برنامه", "آزمون B1"],
    B2: ["Passiv", "Konjunktiv II", "Plusquamperfekt", "پیشوندهای غیرجدا", "بحث نظر دادن", "دیکته پیشرفته"],
    C1: ["Genitiv", "Verben mit Präpositionen", "Konditional III", "Relativ mit Präposition", "مصاحبه کاری", "جمع‌بندی C1"],
  };
  for (let day = 1; day <= 45; day++) {
    const level = levels[day - 1];
    const list = foci[level];
    const focus = list[(day - 1) % list.length];
    plan.push({
      day,
      level,
      title: `روز ${day}: ${focus}`,
      tasks: [
        { type: "vocabulary", label: `۲۰–۳۰ واژه سطح ${level}`, section: "vocabulary", level },
        { type: "grammar", label: `گرامر مرتبط: ${focus}`, section: "grammar", level },
        { type: "practice", label: day % 3 === 0 ? "دیکتهٔ شنیداری" : day % 3 === 1 ? "فلش‌کارت" : "آزمون کوتاه", section: day % 3 === 0 ? "dictation" : day % 3 === 1 ? "flashcards" : "quiz", level },
        { type: "listening", label: day % 2 === 0 ? "دیالوگ صوتی" : "متن‌خوانی", section: day % 2 === 0 ? "dialogues" : "reading", level },
      ],
    });
  }
  return plan;
}

const PLURAL_OVERRIDES = {
  "die Uhr": "die Uhren",
  "die Stunde": "die Stunden",
  "die Minute": "die Minuten",
  "der Morgen": "die Morgen",
  "der Abend": "die Abende",
  "die Nacht": "die Nächte",
  "die Woche": "die Wochen",
  "das Wochenende": "die Wochenenden",
  "der Monat": "die Monate",
  "das Jahr": "die Jahre",
  "die Sonne": "die Sonnen",
  "der Mann": "die Männer",
  "die Frau": "die Frauen",
  "das Kind": "die Kinder",
  "das Haus": "die Häuser",
  "der Tag": "die Tage",
  "das Buch": "die Bücher",
  "der Freund": "die Freunde",
  "die Freundin": "die Freundinnen",
  "der Tisch": "die Tische",
  "der Stuhl": "die Stühle",
  "die Stadt": "die Städte",
  "das Land": "die Länder",
  "der Bus": "die Busse",
  "die Bahn": "die Bahnen",
  "das Auto": "die Autos",
  "der Apfel": "die Äpfel",
  "die Banane": "die Bananen",
  "das Brot": "die Brote",
  "der Lehrer": "die Lehrer",
  "die Lehrerin": "die Lehrerinnen",
  "das Mädchen": "die Mädchen",
  "der Vater": "die Väter",
  "die Mutter": "die Mütter",
  "der Bruder": "die Brüder",
  "die Schwester": "die Schwestern",
  "das Zimmer": "die Zimmer",
  "die Tür": "die Türen",
  "das Fenster": "die Fenster",
  "die Straße": "die Straßen",
  "der Hund": "die Hunde",
  "die Katze": "die Katzen",
  "das Problem": "die Probleme",
  "die Frage": "die Fragen",
  "die Antwort": "die Antworten",
  "der Computer": "die Computer",
  "das Handy": "die Handys",
  "die Universität": "die Universitäten",
  "das Museum": "die Museen",
  "der Arzt": "die Ärzte",
  "die Ärztin": "die Ärztinnen",
};

function guessPlural(word) {
  if (PLURAL_OVERRIDES[word]) return PLURAL_OVERRIDES[word];
  const m = word.match(/^(der|die|das)\s+(.+)$/i);
  if (!m) return null;
  const article = m[1].toLowerCase();
  const noun = m[2];
  // uncountable-ish / already plural-looking
  if (/heit$|keit$|ung$|schaft$|tion$|sion$/i.test(noun)) return `die ${noun}en`.replace(/een$/, "en");
  if (/ung$/i.test(noun)) return `die ${noun}en`;
  if (/heit$|keit$/i.test(noun)) return `die ${noun}en`;
  if (/in$/i.test(noun) && article === "die") return `die ${noun}nen`;
  if (/e$/i.test(noun)) return `die ${noun}n`;
  if (/el$|er$|en$/i.test(noun) && article !== "die") return `die ${noun}`; // many neutral/masc no change
  if (/chen$|lein$/i.test(noun)) return `die ${noun}`;
  if (/um$/i.test(noun)) return `die ${noun.slice(0, -2)}en`;
  if (/us$/i.test(noun)) return `die ${noun}se`;
  if (article === "die") return `die ${noun}en`;
  if (article === "das") return `die ${noun}er`; // imperfect but better than nothing for practice pool filter
  if (article === "der") return `die ${noun}e`;
  return null;
}

function makeExample(w) {
  const word = w.word || "";
  const fa = w.fa || "";
  const en = w.en || "";
  const cat = w.category || "";

  if (/^(der|die|das)\s+/i.test(word)) {
    return {
      example: `Hier ist ${word}.`,
      exampleFa: `اینجا ${fa} است.`,
      exampleEn: `Here is ${en}.`,
    };
  }
  if (cat.includes("افعال") || /en$|eln$|ern$/i.test(word) && !/\s/.test(word) && word[0] === word[0].toLowerCase()) {
    const cap = word.charAt(0).toUpperCase() + word.slice(1);
    return {
      example: `Ich will ${word}.`,
      exampleFa: `می‌خواهم ${fa}.`,
      exampleEn: `I want to ${en.replace(/^to\s+/i, "")}.`,
    };
  }
  if (cat.includes("صفت") || cat.includes("احساسات") || cat.includes("رنگ")) {
    return {
      example: `Das ist ${word}.`,
      exampleFa: `این ${fa} است.`,
      exampleEn: `That is ${en}.`,
    };
  }
  if (cat.includes("احوال") || /\s/.test(word) || /!$|\?$/.test(word)) {
    return {
      example: word,
      exampleFa: fa,
      exampleEn: en,
    };
  }
  return {
    example: `Ich lerne das Wort „${word}“.`,
    exampleFa: `من واژه «${fa || word}» را یاد می‌گیرم.`,
    exampleEn: `I am learning the word “${word}”.`,
  };
}

function enrichVocabFile(filePath) {
  const list = readJson(filePath);
  let examples = 0;
  let plurals = 0;
  const out = list.map((w) => {
    const next = { ...w };
    if (!next.example) {
      Object.assign(next, makeExample(w));
      examples++;
    }
    if (!next.plural) {
      const pl = guessPlural(w.word);
      if (pl) {
        next.plural = pl;
        if (!PLURAL_OVERRIDES[w.word]) next.pluralNote = "تقریبی — برای تمرین؛ در موارد بی‌قاعده ممکن است فرق کند";
        plurals++;
      }
    }
    if (!next.enNote && next.en && next.word) {
      const bare = next.word.replace(/^(der|die|das)\s+/i, "");
      if (bare.length > 3 && next.en.toLowerCase().includes(bare.slice(0, 4).toLowerCase())) {
        next.enNote = `Possible cognate with English “${next.en}”.`;
      }
    }
    return next;
  });
  writeJson(filePath, out);
  return { total: out.length, examples, plurals };
}

function main() {
  const corePath = path.join(DATA, "core.json");
  const core = readJson(corePath);

  let descCount = 0;
  core.grammar = core.grammar.map((g) => {
    const meta = GRAMMAR_META[g.title];
    if (!meta) return g;
    descCount++;
    return {
      ...g,
      description: g.description || meta.description,
      enNote: g.enNote || meta.enNote || undefined,
    };
  });

  const existing = new Set(core.verbs.map((v) => v.infinitive));
  core.verbs = core.verbs.map((v) => {
    const patch = { ...v };
    if (K2_PATCH[v.infinitive] && !patch.konjunktivII) patch.konjunktivII = K2_PATCH[v.infinitive];
    if (v.infinitive === "machen" && !patch.passive) patch.passive = "Es wird gemacht.";
    if (v.infinitive === "sehen" && !patch.passive) patch.passive = "Es wird gesehen.";
    if (v.infinitive === "geben" && !patch.passive) patch.passive = "Es wird gegeben.";
    return patch;
  });
  for (const v of EXTRA_VERBS) {
    if (!existing.has(v.infinitive)) core.verbs.push(v);
  }

  core.dialogues = DIALOGUES;
  core.wechselExercises = WECHSEL_ITEMS;
  core.dictation = DICTATION;
  core.placementTest = PLACEMENT;
  core.studyPlan = buildStudyPlan();

  writeJson(corePath, core);

  const vocabStats = {};
  for (const lvl of ["A0", "A1", "A2", "B1", "B2", "C1"]) {
    const fp = path.join(DATA, `vocab-${lvl}.json`);
    if (fs.existsSync(fp)) vocabStats[lvl] = enrichVocabFile(fp);
  }

  console.log("Grammar entries with description applied:", descCount);
  console.log("Verbs total:", core.verbs.length);
  console.log("Dialogues:", core.dialogues.length);
  console.log("Study plan days:", core.studyPlan.length);
  console.log("Dictation items:", core.dictation.length);
  console.log("Wechsel items:", core.wechselExercises.length);
  console.log("Placement Qs:", core.placementTest.length);
  console.log("Vocab:", vocabStats);
}

main();
