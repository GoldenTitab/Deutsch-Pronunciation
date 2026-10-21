"use strict";
/*
 * fix-data.js — one-shot data repair for the Deutsch learning site.
 * Run from the project root:  node tools/fix-data.js
 * Fixes (all logged to tools/fix-report.json):
 *  1. Article normalisation: strip der/die/das prefix from `word` into `article`,
 *     adjudicate the 28 known prefix/field gender conflicts.
 *  2. Plural repair: curated fixes, provable signature rules, drop plurals of
 *     uncountable nouns; drop the "تقریبی" pluralNote once a plural is verified.
 *  3. Article completion for ~150 common nouns that had a plural but no article.
 *  4. Removal of machine-generated example sentences that teach wrong German
 *     (template families), with narrow allow-lists for the valid uses.
 *  5. Safe replacement examples for nouns ("Das ist der/die/das …") — only where
 *     the fa/en glosses are plain noun phrases.
 *  6. Removal of auto-generated "Possible cognate" enNotes (unreliable).
 *  7. Cross-level duplicate removal (kept at the lowest level).
 *  8. Entry repairs: Augen (dup of Auge), Socken→Socke, akzeptiert→akzeptieren,
 *     plural-only nouns (Geschwister, Vereinigten Staaten).
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "data");
const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1"];
const report = { counts: {}, log: [] };
const bump = (k, n = 1) => { report.counts[k] = (report.counts[k] || 0) + n; };

/* ---------------- maps ---------------- */
const ARTICLE_OVERRIDES = { Stereotyp: "das", Stiefel: "der" };
const PLURAL_ONLY = new Set(["Geschwister", "Vereinigten Staaten"]);
const PLURAL_FIX = {
  Oma: "die Omas", Opa: "die Opas", Sofa: "die Sofas", Villa: "die Villas",
  Ampel: "die Ampeln", Schulter: "die Schultern", Kartoffel: "die Kartoffeln",
  Zwiebel: "die Zwiebeln", Krankenschwester: "die Krankenschwestern",
  Käse: "die Käse", Gebäude: "die Gebäude", Gemüse: "die Gemüse",
  Herr: "die Herren", Party: "die Partys", Grillparty: "die Grillpartys",
  Baby: "die Babys", Hobby: "die Hobbys", Karnevalsumzug: "die Karnevalsumzüge",
  Zug: "die Züge", Platz: "die Plätze", Ball: "die Bälle", Hand: "die Hände",
  Wand: "die Wände", Satz: "die Sätze", Bart: "die Bärte", Zahn: "die Zähne",
  Kopf: "die Köpfe", Topf: "die Töpfe", Baum: "die Bäume", Traum: "die Träume",
  Raum: "die Räume", Markt: "die Märkte", Plan: "die Pläne", Sohn: "die Söhne",
  Wort: "die Wörter", Bild: "die Bilder", Glas: "die Gläser", Blatt: "die Blätter",
  Dorf: "die Dörfer", Krankenhaus: "die Krankenhäuser", Lied: "die Lieder",
  Kleid: "die Kleider", Ei: "die Eier", Huhn: "die Hühner", Rind: "die Rinder",
  Kalb: "die Kälber", Volk: "die Völker", Fahrrad: "die Fahrräder",
  Auge: "die Augen", Socke: "die Socken", Stiefel: "die Stiefel",
  Tochter: "die Töchter", Mutter: "die Mütter", Vater: "die Väter",
  Bruder: "die Brüder", Schwester: "die Schwestern", Stadt: "die Städte",
  Nacht: "die Nächte", Buch: "die Bücher", Haus: "die Häuser", Land: "die Länder",
  Kind: "die Kinder", Mann: "die Männer", Frau: "die Frauen",
};
const PLURAL_DROP = new Set(["Butter", "Hurra", "Milch", "Fleisch", "Obst", "Schnee",
  "Regen", "Glück", "Hunger", "Durst", "Gepäck", "Reis", "Mehl", "Honig", "Zucker", "Salz", "Pfeffer"]);
const ARTICLE_ADD = {
  Jahrhundert: "das", Gast: "der", Gespräch: "das", Anfang: "der", Dienstag: "der",
  Februar: "der", Feiertag: "der", Kontakt: "der", Witz: "der", Karneval: "der",
  Luftballon: "der", Unsinn: "der", Herr: "der", Party: "die", Grillparty: "die",
  Oktoberfest: "das", Karnevalsumzug: "der", Dutzend: "das", Morgen: "der", Abend: "der",
  Mittag: "der", Mitternacht: "die", Januar: "der", März: "der", April: "der", Mai: "der",
  Juni: "der", Juli: "der", August: "der", September: "der", Oktober: "der", November: "der",
  Dezember: "der", Montag: "der", Mittwoch: "der", Donnerstag: "der", Freitag: "der",
  Samstag: "der", Sonntag: "der", Woche: "die", Monat: "der", Jahr: "das", Minute: "die",
  Sekunde: "die", Stunde: "die", Frühling: "der", Sommer: "der", Herbst: "der", Winter: "der",
  Norden: "der", Süden: "der", Osten: "der", Westen: "der", Wetter: "das", Regen: "der",
  Schnee: "der", Wind: "der", Sonne: "die", Mond: "der", Stern: "der", Wolke: "die",
  Meer: "das", Fluss: "der", Berg: "der", Baum: "der", Blume: "die", Hund: "der",
  Katze: "die", Vogel: "der", Fisch: "der", Pferd: "das", Kuh: "die", Schwein: "das",
  Maus: "die", Brot: "das", Ei: "das", Apfel: "der", Banane: "die", Orange: "die",
  Zitrone: "die", Tomate: "die", Gurke: "die", Knoblauch: "der", Kaffee: "der",
  Tee: "der", Bier: "das", Wein: "der", Saft: "der", Wasser: "das", Tisch: "der",
  Stuhl: "der", Bett: "das", Tür: "die", Fenster: "das", Wand: "die", Boden: "der",
  Dach: "das", Küche: "die", Bad: "das", Garten: "der", Haus: "das", Wohnung: "die",
  Zimmer: "das", Schule: "die", Lehrer: "der", Lehrerin: "die", Schüler: "der",
  Schülerin: "die", Buch: "das", Heft: "das", Stift: "der", Bleistift: "der",
  Papier: "das", Frage: "die", Antwort: "die", Problem: "das", Beispiel: "das",
  Wort: "das", Satz: "der", Brief: "der", Sprache: "die", Land: "das", Stadt: "die",
  Dorf: "das", Straße: "die", Platz: "der", Markt: "der", Geschäft: "das", Laden: "der",
  Preis: "der", Geld: "das", Bank: "die", Arbeit: "die", Beruf: "der", Büro: "das",
  Firma: "die", Chef: "der", Arzt: "der", Ärztin: "die", Krankenhaus: "das",
  Krankheit: "die", Schmerz: "der", Kopf: "der", Auge: "das", Ohr: "das", Nase: "die",
  Mund: "der", Zahn: "der", Hand: "die", Fuß: "der", Bein: "das", Arm: "der",
  Herz: "das", Familie: "die", Mutter: "die", Vater: "der", Bruder: "der",
  Schwester: "die", Kind: "das", Freund: "der", Freundin: "die", Mann: "der",
  Frau: "die", Mensch: "der", Zeit: "die", Tag: "der", Nacht: "die", Uhr: "die",
  Auto: "das", Bus: "der", Zug: "der", Fahrrad: "das", Flugzeug: "das", Schiff: "das",
  Bahnhof: "der", Flughafen: "der", Hotel: "das", Reise: "die", Urlaub: "der",
  Tasche: "die", Koffer: "der", Schlüssel: "der", Handy: "das", Computer: "der",
  Telefon: "das", Fernseher: "der", Radio: "das", Zeitung: "die", Film: "der",
  Musik: "die", Lied: "das", Sport: "der", Spiel: "das", Ball: "der", Liebe: "die",
  Leben: "das", Welt: "die", Luft: "die", Feuer: "das", Licht: "das", Farbe: "die",
};
const EVAL_ADJ = new Set(("gut toll super witzig lustig interessant wichtig schön hässlich schwer leicht einfach " +
  "schwierig langweilig spannend komisch seltsam merkwürdig nett traurig schlimm furchtbar schrecklich wunderbar " +
  "fantastisch genial doof blöd normal eigenartig erstaunlich überraschend enttäuschend peinlich unangenehm " +
  "angenehm praktisch nützlich unnötig notwendig möglich unmöglich richtig falsch wahr klar deutlich sicher " +
  "gefährlich gesund ungesund lecker eklig sauber schmutzig neu modern beliebt bekannt berühmt teuer billig").split(" "));
const SUBJECTS = new Set(("Mathematik Mathe Deutsch Englisch Französisch Biologie Chemie Physik Geschichte " +
  "Geografie Erdkunde Sport Kunst Musik Religion Informatik Latein Spanisch Philosophie Wirtschaft Politik " +
  "Sozialkunde Naturwissenschaften").split(" "));
const ABILITY_VERBS = new Set(("schwimmen laufen rennen tanzen singen schlafen kommen lernen fahren helfen lesen " +
  "schreiben malen spielen arbeiten warten kochen reiten klettern springen fliegen tauchen segeln wandern " +
  "joggen trainieren üben zuhören sprechen lachen weinen träumen leben wohnen bleiben sitzen stehen liegen").split(" "));
const DRINKS = new Set(("Wasser Alkohol Bier Wein Saft Kaffee Tee Milch Cola Limonade Schnaps Sekt Champagner " +
  "Whisky Wodka Gin Rum Likör Kakao Espresso Cappuccino").split(" "));

/* ------------- broken example families ------------- */
function exampleIsBroken(w) {
  const ex = (w.example || "").trim();
  if (!ex) return false;
  const word = w.word || "";
  if (/ist ein wichtiges Wort/i.test(ex)) return "wichtiges-wort";
  if (/^Das Buch liegt .+ dem Tisch/.test(ex)) return "liegt-tisch";
  if (/^Die Zahl .+ ist wichtig/.test(ex)) return "zahl-wichtig";
  if (/^Wo ist der\/die\/das /.test(ex)) return "wo-ist-placeholder";
  if (/^Das ist mein\/e /.test(ex)) return "mein-e-placeholder";
  if (/^Ich reise mit (?!dem |der |mein|sein|ihr|dies)/.test(ex)) return "reise-mit-bare";
  if (/^Das kostet viel /.test(ex)) return "kostet-viel";
  if (/^Wir sprechen über (?!den |die |das |meine |seine |ihre |dies)/.test(ex)) return "sprechen-ueber-bare";
  if (/^Ich fühle mich [A-ZÄÖÜ]/.test(ex)) return "fuehle-mich-noun";
  if (/^Kannst du sich /.test(ex)) return "kannst-du-sich";
  if (/^Ich esse gerne /.test(ex)) {
    if (DRINKS.has(word)) return "esse-statt-trinke";
    if (!/غذا/.test(w.category || "")) return "esse-gerne-nonfood";
    return null;
  }
  if (/^Das finde ich /.test(ex)) return EVAL_ADJ.has(word) ? null : "finde-ich";
  if (/^Wir treffen uns /.test(ex)) {
    return /uns (am |im |um |heute |morgen |regelmäßig |später |bald |gleich |dort |hier |jetzt |wieder |nächsten |nächste )/.test(ex) ? null : "treffen-uns";
  }
  if (/Mein Beruf ist (der|die|das) /.test(ex)) return "beruf-mit-artikel";
  if (/^Kannst du [a-zäöüß]+\?$/.test(ex)) {
    const verb = ex.replace(/^Kannst du /, "").replace(/\?$/, "");
    return ABILITY_VERBS.has(verb) ? null : "kannst-du-bare";
  }
  if (/^In der Schule lernen wir /.test(ex)) return SUBJECTS.has(word) ? null : "schule-objekt";
  if (/^Ich zähle bis /.test(ex)) {
    return (w.category || "").includes("اعداد") ? null : "zaehle-bis";
  }
  return null;
}

/* ------------- plural validation / repair ------------- */
function repairPlural(w) {
  if (!w.plural) return;
  const stem = w.word;
  if (PLURAL_FIX[stem]) {
    if (w.plural !== PLURAL_FIX[stem]) { w.plural = PLURAL_FIX[stem]; bump("plural_fixed"); }
    delete w.pluralNote; return;
  }
  if (PLURAL_DROP.has(stem)) { delete w.plural; delete w.pluralNote; bump("plural_dropped_uncountable"); return; }
  const m = /^die (.+)$/.exec(w.plural);
  if (!m) { return; } // variant lists etc. — leave untouched
  const x = m[1];
  if (x === stem || x.includes("/")) { delete w.pluralNote; return; }
  if (x === stem + "en") {
    if (/a$/.test(stem)) { w.plural = "die " + stem + "s"; bump("plural_fixed_a_s"); }
    else if (/e$/.test(stem)) { w.plural = w.article === "die" ? "die " + stem + "n" : "die " + stem; bump("plural_fixed_e"); }
    else if (/(el|er)$/.test(stem) && w.article === "die") { w.plural = "die " + stem + "n"; bump("plural_fixed_el_er_n"); }
    else { delete w.pluralNote; return; } // +en is regular for many nouns
    delete w.pluralNote; return;
  }
  if (x === stem + "e" && /y$/.test(stem)) { w.plural = "die " + stem + "s"; bump("plural_fixed_y_s"); delete w.pluralNote; return; }
  if (x === stem + "n" || x === stem + "s" || x === stem + "e" || x === stem + "er") { delete w.pluralNote; return; }
  // unverifiable irregular form: keep only if it was NOT machine-guessed
  if (w.pluralNote) { delete w.plural; delete w.pluralNote; bump("plural_dropped_unverified"); }
}

/* ------------- main ------------- */
const seenGlobal = new Map(); // bare word (lowercase) -> level kept
for (const lvl of LEVELS) {
  const file = path.join(DATA, `vocab-${lvl}.json`);
  let arr = JSON.parse(fs.readFileSync(file, "utf8"));
  const out = [];
  for (let w of arr) {
    w = { ...w };
    // entry repairs before normalisation
    if (lvl === "A1" && w.word === "die Augen") { bump("entry_removed_augen_dup"); continue; }
    if (w.word === "die Socken") { w.word = "die Socke"; bump("entry_fixed_socke"); }
    if (w.word === "akzeptiert") {
      w.word = "akzeptieren"; w.ipa = "[akt͡sɛpˈtiːʁən]"; bump("entry_fixed_akzeptieren");
      delete w.example; delete w.exampleFa; delete w.exampleEn;
    }
    // 1. article normalisation
    const pm = /^(der|die|das)\s+(.+)$/i.exec(w.word || "");
    if (pm) {
      const prefixArt = pm[1].toLowerCase();
      w.word = pm[2];
      const correct = ARTICLE_OVERRIDES[w.word] || prefixArt;
      if (w.article && w.article !== correct) { bump("article_conflict_fixed"); report.log.push(`${lvl}: ${w.word} article ${w.article} -> ${correct}`); }
      w.article = correct;
      bump("article_prefix_stripped");
    }
    if (!w.article && ARTICLE_ADD[w.word]) { w.article = ARTICLE_ADD[w.word]; bump("article_added"); }
    // plural-only nouns
    if (PLURAL_ONLY.has(w.word)) {
      w.article = "die";
      delete w.plural; delete w.pluralNote;
      if (!w.grammarNote) w.grammarNote = "این اسم فقط به صورت جمع به کار می‌رود (Plurale tantum).";
      bump("plural_only_fixed");
    }
    // 7. cross-level duplicates
    const key = (w.word || "").toLowerCase();
    if (seenGlobal.has(key)) { bump("cross_level_dup_removed"); report.log.push(`${lvl}: dup '${w.word}' kept at ${seenGlobal.get(key)}`); continue; }
    seenGlobal.set(key, lvl);
    // 2. plurals
    repairPlural(w);
    // 6. auto enNotes
    if (w.enNote && /^Possible cognate with English/.test(w.enNote)) { delete w.enNote; bump("auto_ennote_removed"); }
    // 4. broken examples
    const why = exampleIsBroken(w);
    if (why) { delete w.example; delete w.exampleFa; delete w.exampleEn; bump("example_removed_" + why); }
    // 5. safe replacement example for nouns
    if (!w.example && w.article && !PLURAL_ONLY.has(w.word)) {
      const faOk = w.fa && !/[/()]/.test(w.fa) && w.fa.length <= 32;
      const enOk = w.en && !/[/()]/.test(w.en) && !/^to /i.test(w.en) && w.en.length <= 40;
      if (faOk && enOk) {
        w.example = `Das ist ${w.article} ${w.word}.`;
        w.exampleFa = `این ${w.fa} است.`;
        w.exampleEn = `This is the ${w.en.replace(/^the /i, "")}.`;
        bump("example_generated_noun_frame");
      }
    }
    out.push(w);
  }
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n", "utf8");
  report.counts[lvl + "_final"] = out.length;
  console.log(lvl, "->", out.length);
}
fs.writeFileSync(path.join(__dirname, "fix-report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report.counts, null, 2));
