"use strict";

let APP_DATA = null;
let learnedWords = new Set();

function wKey(w) {
  return (w && (w.id || w.word)) || '';
}
let vocabPage = 1;
const PAGE_SIZE = 20;
let currentVocab = [];
let flashCards = [];
let flashIndexValue = 0;
let vocabSearchTimeout, verbSearchTimeout;

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const vocabBody = document.getElementById('vocabBody');
const vocabSearch = document.getElementById('vocabSearch');
const vocabLevelFilter = document.getElementById('vocabLevelFilter');
const vocabCategoryFilter = document.getElementById('vocabCategoryFilter');
const vocabPagination = document.getElementById('vocabPagination');
const vocabRandomBtn = document.getElementById('vocabRandomBtn');
const grammarGrid = document.getElementById('grammarGrid');
const grammarLevelFilter = document.getElementById('grammarLevelFilter');
const levelsGrid = document.getElementById('levelsGrid');
const flashcardLevelFilter = document.getElementById('flashcardLevelFilter');
const flashcardCount = document.getElementById('flashcardCount');
const flashcardShuffle = document.getElementById('flashcardShuffle');
const flashcard = document.getElementById('flashcard');
const flashFront = document.getElementById('flashFront');
const flashBack = document.getElementById('flashBack');
const flashFa = document.getElementById('flashFa');
const flashEn = document.getElementById('flashEn');
const flashLevel = document.getElementById('flashLevel');
const flipBtn = document.getElementById('flipBtn');
const flashPrev = document.getElementById('flashPrev');
const flashNext = document.getElementById('flashNext');
const flashIndex = document.getElementById('flashIndex');
const progressFill = document.getElementById('progressFill');
const statWords = document.getElementById('statWords');
const statTotal = document.getElementById('statTotal');
const statPercent = document.getElementById('statPercent');
const progressLevelsDiv = document.getElementById('progressLevels');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const themeToggle = document.getElementById('themeToggle');
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
const homeFeatures = document.getElementById('homeFeatures');
const verbSearch = document.getElementById('verbSearch');
const verbLevelFilter = document.getElementById('verbLevelFilter');
const verbGrid = document.getElementById('verbGrid');
const casesContent = document.getElementById('casesContent');
const quizLevelFilter = document.getElementById('quizLevelFilter');
const quizStartBtn = document.getElementById('quizStartBtn');
const quizArea = document.getElementById('quizArea');
const globalSearchForm = document.getElementById('globalSearchForm');
const globalSearchInput = document.getElementById('globalSearchInput');
const readingLevelFilter = document.getElementById('readingLevelFilter');
const readingContent = document.getElementById('readingContent');
const verbExerciseBtn = document.getElementById('verbExerciseBtn');
const verbExerciseArea = document.getElementById('verbExerciseArea');
const caseExerciseBtn = document.getElementById('caseExerciseBtn');
const caseExerciseArea = document.getElementById('caseExerciseArea');
const flashcardDueToggle = document.getElementById('flashcardDueToggle');
const flashRateRow = document.getElementById('flashRateRow');
const progressRing = document.getElementById('progressRing');
const progressRingText = document.getElementById('progressRingText');
const ariaLiveRegion = document.getElementById('ariaLiveRegion');

function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function celebrate() {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti-wrap';
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    piece.style.animationDuration = (1.8 + Math.random() * 1.2) + 's';
    wrap.appendChild(piece);
  }
  document.body.appendChild(wrap);
  setTimeout(function() {
    var c = document.querySelector('.confetti-wrap');
    if (c) c.remove();
  }, 3200);
}

async function speakGerman(text, showBanner = false) {
  if (!text) return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    const utterance = new SpeechSynthesisUtterance(String(text));
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.startsWith('de'));
    if (deVoice) utterance.voice = deVoice;
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
    if (showBanner && !deVoice) {
      const banner = document.getElementById('no-german-voice-banner');
      if (banner) banner.classList.remove('hidden');
    }
  });
}

async function playPhoneticsAudio(word, btnElement) {
  let icon, bars;
  if (btnElement) {
    icon = btnElement.querySelector('.play-icon, .fa-volume-up');
    bars = btnElement.querySelectorAll('.equalizer-bar');
    btnElement.classList.add('playing-audio', 'playing-bg');
    if (icon) icon.classList.add('hidden');
    if (bars) bars.forEach(b => b.classList.remove('hidden'));
  }
  const resetBtn = () => {
    if (!btnElement) return;
    btnElement.classList.remove('playing-audio', 'playing-bg');
    if (icon) icon.classList.remove('hidden');
    if (bars) bars.forEach(b => b.classList.add('hidden'));
  };

  try {
    await speakGerman(word, true);
  } catch (e) {
    showToast('پخش صدا با هیچ منبعی ممکن نشد. اتصال اینترنت را بررسی کن.');
  } finally {
    resetBtn();
  }
}

function attachSpeaker(container) {
  container.querySelectorAll('.audio-btn').forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = clone.dataset.word;
      if (word) playPhoneticsAudio(word, clone);
    });
  });
}

function loadTheme() {
  const dark = localStorage.getItem('theme') === 'dark';
  document.body.classList.toggle('dark', dark);
  themeToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute('aria-label', dark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک');
}

themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute('aria-label', dark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک');
});

loadTheme();

navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  var overlay = document.getElementById('navOverlay');
  if (overlay) overlay.hidden = !navList.classList.contains('open');
});

var navOverlay = document.getElementById('navOverlay');
navOverlay && navOverlay.addEventListener('click', function() {
  navList.classList.remove('open');
  navOverlay.hidden = true;
  navToggle && navToggle.focus();
});

document.addEventListener('click', (e) => {
  if (!navList.contains(e.target) && !navToggle.contains(e.target)) {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

const megaParent = document.getElementById('megaParent');
const megaToggle = document.getElementById('megaToggle');
const megaMenu = document.getElementById('megaMenu');

function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

if (megaParent && isTouchDevice()) {
  let touchTimeout = null;
  megaToggle.addEventListener('click', function(e) {
    e.preventDefault();
    const isOpen = megaParent.classList.toggle('mega-menu-touch-open');
    megaToggle.setAttribute('aria-expanded', String(isOpen));
    clearTimeout(touchTimeout);
  });
  document.addEventListener('click', function(e) {
    if (!megaParent.contains(e.target)) {
      megaParent.classList.remove('mega-menu-touch-open');
      if (megaToggle) megaToggle.setAttribute('aria-expanded', 'false');
    }
  });
  megaMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      megaParent.classList.remove('mega-menu-touch-open');
      if (megaToggle) megaToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (megaParent) {
  megaToggle.addEventListener('click', function(e) {
    if (!isTouchDevice()) return;
    e.preventDefault();
  });
}

const SECTION_LABELS = {
  home: 'خانه',
  path: 'مسیر روزانه',
  vocabulary: 'واژگان',
  grammar: 'گرامر',
  conjugation: 'صرف افعال',
  cases: 'حالت‌های دستوری',
  levels: 'سطوح',
  quiz: 'آزمون سطح',
  reading: 'متن‌خوانی',
  dialogues: 'دیالوگ',
  dictation: 'دیکته',
  flashcards: 'فلش‌کارت',
  progress: 'پیشرفت من',
  phonetics: 'مسترکلاس فونتیک'
};

let renderedSections = new Set();

function renderSection(id) {
  switch(id) {
    case 'vocabulary': renderVocab(); break;
    case 'grammar': renderGrammar(); break;
    case 'conjugation': renderVerbs(); break;
    case 'cases': renderCases(); break;
    case 'reading': renderReading(); break;
    case 'dialogues': renderDialogues(); break;
    case 'quiz': renderQuiz(); break;
    case 'flashcards': initFlashcards(); break;
    case 'progress': updateProgress(); break;
    case 'levels': renderLevels(); break;
    case 'phonetics': break; // static HTML
    case 'path': renderStudyPath(); break;
    case 'dictation': renderDictation(); break;
  }
}

function runSectionInit(section) {
  if (section === 'home') { renderHome(); renderHomeGamification(); renderedSections.add('home'); }
  if (section === 'path' && !renderedSections.has('path')) { renderStudyPath(); renderedSections.add('path'); }
  if (section === 'vocabulary' && !renderedSections.has('vocabulary')) { filterVocab(); renderedSections.add('vocabulary'); }
  if (section === 'grammar' && !renderedSections.has('grammar')) { renderGrammar(); renderCultureNotes(); renderedSections.add('grammar'); }
  if (section === 'conjugation' && !renderedSections.has('conjugation')) { renderVerbs(); renderedSections.add('conjugation'); }
  if (section === 'cases' && !renderedSections.has('cases')) { renderCases(); renderedSections.add('cases'); }
  if (section === 'reading' && !renderedSections.has('reading')) { renderReading(); renderedSections.add('reading'); }
  if (section === 'dialogues' && !renderedSections.has('dialogues')) { renderDialogues(); renderedSections.add('dialogues'); }
  if (section === 'dictation') { /* area filled on start */ renderedSections.add('dictation'); }
  if (section === 'levels' && !renderedSections.has('levels')) { renderLevels(); renderedSections.add('levels'); }
  if (section === 'flashcards' && !renderedSections.has('flashcards')) { initFlashcards(); renderedSections.add('flashcards'); }
  if (section === 'progress' && !renderedSections.has('progress')) { updateProgress(); renderedSections.add('progress'); }
}

function activateSection(id, opts = {}) {
  const target = document.getElementById(id);
  if (!target) return;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  target.classList.add('active');
  document.querySelectorAll('.nav-list a').forEach(l => l.classList.remove('active'));
  const navLink = document.querySelector(`.nav-list a[data-section="${id}"]`);
  if (navLink) navLink.classList.add('active');
  navList.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  if (opts.scrollTop !== false) window.scrollTo({ top: 0, behavior: 'smooth' });
  if (opts.updateHash !== false && location.hash.slice(1) !== id) {
    history.pushState(null, '', '#' + id);
  }
  if (ariaLiveRegion) ariaLiveRegion.textContent = 'بخش ' + (SECTION_LABELS[id] || id) + ' نمایش داده شد';
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.addEventListener('blur', function cleanup() {
    target.removeAttribute('tabindex');
    target.removeEventListener('blur', cleanup);
  }, { once: true });
  runSectionInit(id);
}

function goToSection(id) {
  activateSection(id);
}

document.querySelectorAll('.nav-list a[data-section]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const section = a.dataset.section;
    if (section) activateSection(section);
  });
});

function resolveHashTarget(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const section = el.classList.contains('section') ? el : el.closest('.section');
  if (!section) return null;
  return { section, target: el };
}

function goToHash(id, { updateHash = true } = {}) {
  const resolved = resolveHashTarget(id);
  if (!resolved) return false;
  const isTopLevel = resolved.section === resolved.target;
  if (!resolved.section.classList.contains('active')) {
    activateSection(resolved.section.id, { updateHash: false, scrollTop: isTopLevel });
  }
  if (!isTopLevel) {
    requestAnimationFrame(() => resolved.target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  if (updateHash && location.hash.slice(1) !== id) {
    history.pushState(null, '', '#' + id);
  }
  return true;
}

window.addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  if (id) goToHash(id, { updateHash: false });
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link || link.hasAttribute('data-section')) return;
  const id = link.getAttribute('href').slice(1);
  if (!id) return;
  if (goToHash(id, { updateHash: true })) e.preventDefault();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  const flashSection = document.getElementById('flashcards');
  if (flashSection && flashSection.classList.contains('active')) {
    const active = document.activeElement;
    if (active === document.body || active === flashcard || active === document.getElementById('flashFront') || active === document.getElementById('flashBack')) {
      if (e.key === 'ArrowRight') { e.preventDefault(); flashNext.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); flashPrev.click(); }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipBtn.click();
      }
    }
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var mega = document.getElementById('megaMenu');
    if (mega && mega.style.display !== 'none' && mega.style.display !== '') {
      mega.style.display = '';
      document.getElementById('megaToggle') && document.getElementById('megaToggle').focus();
    }
    var nav = document.getElementById('primary-nav');
    var overlay = document.getElementById('navOverlay');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (overlay) overlay.hidden = true;
      document.getElementById('navToggle') && document.getElementById('navToggle').focus();
    }
    var modal = document.getElementById('confirmModal');
    if (modal && !modal.hidden) {
      modal.hidden = true;
      document.getElementById('confirmNo') && document.getElementById('confirmNo').focus();
    }
  }
});

globalSearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const term = globalSearchInput.value.trim();
  if (!term || !APP_DATA) return;
  const lower = term.toLowerCase();
  const isVerb = (APP_DATA.verbs || []).some(v => v.infinitive.toLowerCase() === lower);
  if (isVerb) {
    verbSearch.value = term;
    goToSection('conjugation');
    renderVerbs();
  } else {
    vocabLevelFilter.value = 'all';
    vocabSearch.value = term;
    goToSection('vocabulary');
    filterVocab();
  }
  globalSearchInput.blur();
});

async function loadData() {
  try {
    const coreRes = await fetch('data/core.json');
    if (!coreRes.ok) throw new Error('Failed to load data/core.json');
    APP_DATA = await coreRes.json();
    APP_DATA.vocabulary = [];

    const levelIds = (APP_DATA.levels || []).map(l => l.id);
    const vocabChunks = await Promise.all(levelIds.map(async id => {
      try {
        const r = await fetch(`data/vocab-${id}.json`);
        return r.ok ? await r.json() : [];
      } catch (_) { return []; }
    }));
    APP_DATA.vocabulary = vocabChunks.flat();

    currentVocab = APP_DATA.vocabulary || [];
    currentPathDay = getStudyDayIndex();
    renderHome();
    renderedSections = new Set(['home']);
    renderHomeGamification();
    if (typeof populateRecorderSelect === 'function') populateRecorderSelect();
    const hash = location.hash.slice(1);
    if (hash) goToHash(hash, { updateHash: false });
  } catch (err) {
    console.error('Error loading data:', err);
    document.querySelector('main').innerHTML = `
      <div style="text-align:center;padding:3rem;direction:rtl;">
        <h2 style="color:#d32f2f;">خطا در بارگذاری داده‌ها</h2>
        <p>لطفاً پوشه‌ی data را در کنار این صفحه قرار دهید.</p>
        <p style="font-size:0.8rem;opacity:0.7;">${escHtml(err.message)}</p>
      </div>
    `;
  } finally {
    const overlay = document.getElementById('appLoadingOverlay');
    if (overlay) overlay.classList.add('hidden');
  }
}

function renderHome() {
  if (!APP_DATA || !homeFeatures) return;
  const features = [
    { icon: 'fa-graduation-cap', title: 'از A0 تا C1', desc: 'مسیر گام‌به‌گام از الفبا تا سطح پیشرفته' },
    { icon: 'fa-route', title: 'مسیر ۴۵ روزه', desc: 'هر روز درس مشخص: واژه، گرامر، تمرین' },
    { icon: 'fa-volume-up', title: 'تلفظ دقیق IPA', desc: 'فونتیک، دیکته و دیالوگ صوتی' },
    { icon: 'fa-language', title: 'ترجمهٔ دوزبانه', desc: 'فارسی، انگلیسی و نکات تفاوت با انگلیسی' },
    { icon: 'fa-diagram-project', title: 'صرف و حالت‌ها', desc: 'افعال تا C1، Passiv، Konjunktiv II و Wechsel' },
    { icon: 'fa-list-check', title: 'آزمون و پیشرفت', desc: 'تعیین سطح، دیکته، خروجی JSON و XP' },
  ];
  homeFeatures.innerHTML = features.map(f => `
    <div class="feature">
      <i class="fas ${f.icon}"></i>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>
  `).join('');

  const pathArea = document.getElementById('homePathArea');
  if (pathArea) {
    const today = getStudyDayIndex();
    const dayPlan = (APP_DATA.studyPlan || [])[today] || (APP_DATA.studyPlan || [])[0];
    const path = [
      { section: 'path', label: dayPlan ? `امروز: ${dayPlan.title}` : 'مسیر یادگیری روزانه را باز کن' },
      { section: 'vocabulary', label: 'واژگان سطح فعلی را مرور کن' },
      { section: 'grammar', label: 'قواعد گرامری هم‌سطح را با توضیح بخوان' },
      { section: 'dictation', label: 'دیکتهٔ شنیداری (ä ö ü ß) را تمرین کن' },
      { section: 'dialogues', label: 'یک دیالوگ صوتی گوش بده' },
      { section: 'flashcards', label: 'با فلش‌کارت واژگان را تثبیت کن' },
      { section: 'quiz', label: 'آزمون سطح را بده' },
    ];
    pathArea.innerHTML = `
      <div class="progress-levels" style="margin-top:2rem;">
        <h3 style="margin-bottom:0.5rem;">مسیر یادگیری پیشنهادی</h3>
        ${path.map(p => `<button class="btn-secondary home-path-btn" data-goto="${p.section}" style="text-align:right;justify-content:flex-start;">${escHtml(p.label)}</button>`).join('')}
      </div>
    `;
    pathArea.querySelectorAll('.home-path-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const navLink = document.querySelector(`.nav-list a[data-section="${btn.dataset.goto}"]`);
        if (navLink) navLink.click();
      });
    });
  }
  renderHomeGamification();
}

const LEVEL_ICONS = { A0: 'fa-seedling', A1: 'fa-shoe-prints', A2: 'fa-walking', B1: 'fa-hiking', B2: 'fa-mountain', C1: 'fa-trophy' };

function getQuizReadyBadge(levelId) {
  try {
    const stored = JSON.parse(localStorage.getItem('germanQuizLast_' + levelId));
    if (stored && stored.total > 0 && (stored.score / stored.total) >= 0.8) {
      return `<span class="level-badge" style="background-color:rgba(16,185,129,0.15);color:var(--accent-color);margin-top:0.5rem;display:inline-block;">✓ آماده‌ی سطح بعد</span>`;
    }
  } catch (_) {}
  return '';
}

function renderLevels() {
  if (!APP_DATA || !APP_DATA.levels) return;
  levelsGrid.innerHTML = APP_DATA.levels.map(l => `
    <div class="level-card">
      <div class="level"><i class="fas ${LEVEL_ICONS[l.id] || 'fa-graduation-cap'}"></i> ${escHtml(l.label || l.id)}</div>
      <div class="level-desc">${escHtml(l.desc || '')}</div>
      ${getQuizReadyBadge(l.id)}
      <button class="btn-small" data-level="${escHtml(l.id)}">مشاهده واژگان</button>
    </div>
  `).join('');

  levelsGrid.querySelectorAll('.btn-small').forEach(btn => {
    btn.addEventListener('click', () => {
      vocabLevelFilter.value = btn.dataset.level;
      filterVocab();
      goToSection('vocabulary');
    });
  });
}

function filterVocab() {
  if (!APP_DATA) return;
  const search = vocabSearch.value.toLowerCase().trim();
  const level = vocabLevelFilter.value;
  const category = vocabCategoryFilter.value;
  currentVocab = (APP_DATA.vocabulary || []).filter(w => {
    const matchSearch = w.word.toLowerCase().includes(search) ||
      (w.fa && w.fa.includes(search)) ||
      (w.en && w.en.toLowerCase().includes(search));
    const matchLevel = level === 'all' || w.level === level;
    const matchCategory = category === 'all' || w.category === category;
    return matchSearch && matchLevel && matchCategory;
  });
  vocabPage = 1;
  renderVocab();
}

function renderVocab() {
  if (!APP_DATA) return;
  const start = (vocabPage - 1) * PAGE_SIZE;
  const page = currentVocab.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    vocabBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;opacity:0.6;">کلمه‌ای یافت نشد</td></tr>`;
    vocabPagination.innerHTML = '';
    return;
  }

  vocabBody.innerHTML = page.map(w => {
    const isLearned = learnedWords.has(wKey(w));
    const ex = w.example || '';
    const exAudio = ex || w.word;
    return `
    <tr data-word="${escHtml(w.word)}">
      <td data-label="کلمه"><strong lang="de">${escHtml(w.word)}</strong></td>
      <td data-label="جمع" dir="ltr" lang="de">${w.plural ? escHtml(w.plural) : '—'}${w.pluralNote ? ` <span class="plural-note" title="${escHtml(w.pluralNote)}">≈</span>` : ''}</td>
      <td class="ipa" data-label="تلفظ" dir="ltr">${escHtml(w.ipa || '')}</td>
      <td data-label="فارسی">${escHtml(w.fa || '')}</td>
      <td data-label="English" dir="ltr" lang="en">${escHtml(w.en || '')}${w.enNote ? `<div class="en-note" dir="ltr" lang="en">${escHtml(w.enNote)}</div>` : ''}</td>
      <td data-label="مثال" class="vocab-example-cell">
        ${ex ? `<span dir="ltr" lang="de">${escHtml(ex)}</span>
          <button class="audio-btn" data-word="${escHtml(exAudio)}" aria-label="پخش مثال"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
          ${w.exampleFa ? `<div class="trans">🇮🇷 ${escHtml(w.exampleFa)}</div>` : ''}
          ${w.exampleEn ? `<div class="trans" dir="ltr" lang="en">🇬🇧 ${escHtml(w.exampleEn)}</div>` : ''}` : '—'}
      </td>
      <td data-label="سطح"><span class="level-badge">${escHtml(w.level || '')}</span>${w.category ? ` <span class="level-badge category-badge">${escHtml(w.category)}</span>` : ''}</td>
      <td class="vocab-actions" data-label="عملیات">
        <button class="audio-btn" data-word="${escHtml(w.word)}" aria-label="پخش تلفظ ${escHtml(w.word)}"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
        <button class="audio-btn learn-toggle ${isLearned ? 'learned' : ''}" data-word="${escHtml(w.word)}" data-key="${escHtml(wKey(w))}" aria-label="${isLearned ? 'حذف از یادگرفته‌ها' : 'علامت‌گذاری به‌عنوان یادگرفته'}" aria-pressed="${isLearned}">
          <i class="fas ${isLearned ? 'fa-check-circle' : 'fa-circle'}"></i>
        </button>
      </td>
    </tr>`;
  }).join('');

  vocabBody.querySelectorAll('.audio-btn:not(.learn-toggle)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = btn.dataset.word;
      if (word) playPhoneticsAudio(word, btn);
    });
  });

  vocabBody.querySelectorAll('.learn-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.key;
      if (!key) return;
      if (learnedWords.has(key)) {
        learnedWords.delete(key);
        btn.classList.remove('learned');
        btn.querySelector('i').className = 'fas fa-circle';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'علامت‌گذاری به‌عنوان یادگرفته');
      } else {
        learnedWords.add(key);
        btn.classList.add('learned');
        btn.querySelector('i').className = 'fas fa-check-circle';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'حذف از یادگرفته‌ها');
        var xpGained = 2;
        addXP(xpGained, 'واژه جدید');
        var liveRegion = document.getElementById('ariaLiveRegion');
        if (liveRegion) liveRegion.textContent = '+' + xpGained + ' XP';
      }
      saveProgress();
      updateProgressBar();
      renderHomeGamification();
    });
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(currentVocab.length / PAGE_SIZE) || 1;
  vocabPagination.innerHTML = '';
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  prevBtn.setAttribute('aria-label', 'صفحه قبل');
  prevBtn.disabled = vocabPage === 1;
  prevBtn.addEventListener('click', () => { if (vocabPage > 1) { vocabPage--; renderVocab(); } });
  vocabPagination.appendChild(prevBtn);

  const maxVisible = 5;
  let startPage = Math.max(1, vocabPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.setAttribute('aria-label', `صفحه ${i}`);
    if (i === vocabPage) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
    }
    btn.addEventListener('click', () => { vocabPage = i; renderVocab(); });
    vocabPagination.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  nextBtn.setAttribute('aria-label', 'صفحه بعد');
  nextBtn.disabled = vocabPage === totalPages;
  nextBtn.addEventListener('click', () => { if (vocabPage < totalPages) { vocabPage++; renderVocab(); } });
  vocabPagination.appendChild(nextBtn);
}

vocabSearch.addEventListener('input', () => {
  clearTimeout(vocabSearchTimeout);
  vocabSearchTimeout = setTimeout(filterVocab, 250);
});
vocabLevelFilter.addEventListener('change', filterVocab);
vocabCategoryFilter.addEventListener('change', filterVocab);

vocabRandomBtn.addEventListener('click', () => {
  if (!APP_DATA || !APP_DATA.vocabulary || APP_DATA.vocabulary.length === 0) return;
  const random = APP_DATA.vocabulary[Math.floor(Math.random() * APP_DATA.vocabulary.length)];
  vocabLevelFilter.value = 'all';
  vocabCategoryFilter.value = 'all';
  vocabSearch.value = random.word;
  filterVocab();
});

function renderGrammar() {
  if (!APP_DATA || !APP_DATA.grammar) return;
  const level = grammarLevelFilter.value;
  const filtered = level === 'all' ? APP_DATA.grammar : APP_DATA.grammar.filter(g => g.level === level);

  if (filtered.length === 0) {
    grammarGrid.innerHTML = '<p style="opacity:0.6;text-align:center;padding:2rem;">درسی برای این سطح یافت نشد</p>';
    return;
  }

  const groups = [];
  const byTitle = new Map();
  filtered.forEach(g => {
    const key = (g.title || '') + '|' + (g.level || '');
    if (!byTitle.has(key)) {
      const item = { ...g, examplesList: [] };
      byTitle.set(key, item);
      groups.push(item);
    }
    const item = byTitle.get(key);
    if (g.description && !item.description) item.description = g.description;
    if (g.enNote && !item.enNote) item.enNote = g.enNote;
    if (g.examples && Array.isArray(g.examples)) item.examplesList.push(...g.examples);
    else if (g.example) item.examplesList.push(g.example);
    if (g.fa && !item.fa) item.fa = g.fa;
    if (g.en && !item.en) item.en = g.en;
  });

  grammarGrid.innerHTML = groups.map(g => {
    let extraContent = '';
    if (g.description) {
      extraContent += `
        <div class="grammar-rule-box">
          <div class="grammar-rule-label"><i class="fas fa-book-open"></i> قاعدهٔ گرامری</div>
          <div class="grammar-desc">${escHtml(g.description)}</div>
        </div>`;
    }
    if (g.enNote) {
      extraContent += `
        <div class="en-diff-box" dir="ltr" lang="en">
          <strong>Difference from English / Cognate tip</strong>
          <p>${escHtml(g.enNote)}</p>
        </div>`;
    }
    const examples = [...new Set(g.examplesList || [])];
    if (examples.length) {
      extraContent += `<div class="grammar-examples-label">مثال‌ها</div>`;
      extraContent += examples.map(ex => `
        <div class="example" dir="ltr">
          <span lang="de">${escHtml(ex)}</span>
          <button class="audio-btn" data-word="${escHtml(ex)}" aria-label="پخش تلفظ جمله"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
        </div>
      `).join('');
    }
    // Show fa/en for first example set only as translations under examples
    return `
    <div class="grammar-card">
      <div class="title">${escHtml(g.title || 'مبحث گرامری')}</div>
      <span class="level-tag">${escHtml(g.level || '')}</span>
      ${extraContent}
      ${g.fa ? `<div class="trans">🇮🇷 ${escHtml(g.fa)}</div>` : ''}
      ${g.en ? `<div class="trans">🇬🇧 ${escHtml(g.en)}</div>` : ''}
    </div>
    `;
  }).join('');

  attachSpeaker(grammarGrid);
}

grammarLevelFilter.addEventListener('change', renderGrammar);

function renderCultureNotes() {
  const wrap = document.getElementById('cultureNotesWrap');
  const grid = document.getElementById('cultureNotesGrid');
  if (!grid || !APP_DATA || !APP_DATA.cultureNotes) return;

  const level = grammarLevelFilter.value;
  const notes = level === 'all' ? APP_DATA.cultureNotes : APP_DATA.cultureNotes.filter(n => n.level === level);

  if (wrap) wrap.style.display = notes.length ? '' : 'none';

  grid.innerHTML = notes.map(n => `
    <div class="grammar-card">
      <div class="title">${escHtml(n.title || '')}</div>
      <span class="level-tag">${escHtml(n.level || '')}</span>
      <div class="example" dir="ltr">
        <span lang="de">${escHtml(n.text || '')}</span>
        ${n.text ? `<button class="audio-btn" data-word="${escHtml(n.text)}" aria-label="پخش تلفظ متن"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>` : ''}
      </div>
      ${n.fa ? `<div class="trans">🇮🇷 ${escHtml(n.fa)}</div>` : ''}
    </div>
  `).join('');

  attachSpeaker(grid);
}

grammarLevelFilter.addEventListener('change', renderCultureNotes);

const PRONOUN_LABELS = { ich: 'ich', du: 'du', er_sie_es: 'er/sie/es', wir: 'wir', ihr: 'ihr', sie_Sie: 'sie/Sie' };

function renderVerbs() {
  if (!APP_DATA || !APP_DATA.verbs) return;
  const term = (verbSearch.value || '').toLowerCase().trim();
  const level = verbLevelFilter.value;
  const list = APP_DATA.verbs.filter(v =>
    (level === 'all' || v.level === level) &&
    (!term || v.infinitive.toLowerCase().includes(term) || (v.fa && v.fa.includes(term)) || (v.en && v.en.toLowerCase().includes(term)))
  );

  if (list.length === 0) {
    verbGrid.innerHTML = '<p style="opacity:0.6;text-align:center;padding:2rem;">فعلی پیدا نشد</p>';
    return;
  }

  verbGrid.innerHTML = list.map(v => {
    const hasK2 = v.konjunktivII && typeof v.konjunktivII === 'object';
    return `
    <div class="grammar-card">
      <div class="title" dir="ltr" lang="de">${escHtml(v.infinitive)}
        <button class="audio-btn" data-word="${escHtml(v.infinitive)}" aria-label="پخش تلفظ ${escHtml(v.infinitive)}"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
      </div>
      <span class="level-tag">${escHtml(v.level || '')}</span>
      <span class="level-tag">${escHtml(v.type || '')}</span>${v.separable ? ' <span class="level-tag" style="background-color:rgba(16,185,129,0.15);color:var(--accent-color);">فعل جدایی‌پذیر (پیشوند: ' + escHtml(v.prefix || '') + ')</span>' : ''}
      <div class="grammar-desc">🇮🇷 ${escHtml(v.fa || '')} &nbsp;·&nbsp; 🇬🇧 ${escHtml(v.en || '')}</div>
      <table class="verb-table">
        <tr>
          <th class="pronoun"></th>
          <th>حال<br><span class="verb-th-de">Präsens</span></th>
          ${v.praeteritum ? '<th>گذشته<br><span class="verb-th-de">Präteritum</span></th>' : ''}
          ${hasK2 ? '<th>Konjunktiv<br><span class="verb-th-de">II</span></th>' : ''}
        </tr>
        ${Object.keys(PRONOUN_LABELS).map(p => `
          <tr>
            <td class="pronoun">${PRONOUN_LABELS[p]}</td>
            <td dir="ltr" lang="de">${escHtml((v.present && v.present[p]) || '')}</td>
            ${v.praeteritum ? `<td dir="ltr" lang="de">${escHtml(v.praeteritum[p] || '')}</td>` : ''}
            ${hasK2 ? `<td dir="ltr" lang="de">${escHtml(v.konjunktivII[p] || '')}</td>` : ''}
          </tr>
        `).join('')}
      </table>
      <div class="trans" style="margin-top:0.5rem;" dir="ltr" lang="de">Perfekt: ${escHtml(v.auxiliary || '')} ... ${escHtml(v.partizip || '')}</div>
      ${v.passive ? `<div class="passive-box" dir="ltr" lang="de"><strong>Passiv:</strong> ${escHtml(v.passive)}
        <button class="audio-btn" data-word="${escHtml(v.passive)}" aria-label="پخش مجهول"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
      </div>` : ''}
    </div>
  `;
  }).join('');

  attachSpeaker(verbGrid);
}

verbSearch.addEventListener('input', () => {
  clearTimeout(verbSearchTimeout);
  verbSearchTimeout = setTimeout(renderVerbs, 200);
});
verbLevelFilter.addEventListener('change', renderVerbs);

function runExercise(container, questions, onFinish) {
  let idx = 0,
    score = 0;

  function renderQ() {
    if (idx >= questions.length) { onFinish(score, questions.length); return; }
    const q = questions[idx];
    container.innerHTML = `
      <div class="table-container" style="padding:1.5rem;margin-bottom:1rem;">
        <p style="color:var(--text-muted);margin-bottom:0.5rem;">سوال ${idx + 1} از ${questions.length} &nbsp;·&nbsp; امتیاز: ${score}</p>
        <p style="font-size:1.1rem;margin-bottom:1rem;" dir="ltr" lang="de">${q.prompt}</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${q.options.map(o => `<button class="btn-secondary exercise-option" data-value="${escHtml(o)}" style="text-align:right;" dir="ltr" lang="de">${escHtml(o)}</button>`).join('')}
        </div>
      </div>
    `;
    container.querySelectorAll('.exercise-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const correct = btn.dataset.value === q.answer;
        container.querySelectorAll('.exercise-option').forEach(b => {
          b.disabled = true;
          if (b.dataset.value === q.answer) b.classList.add('btn-accent');
        });
        if (correct) score++;
        else btn.style.outline = '2px solid #ef4444';
        var liveRegion = document.getElementById('ariaLiveRegion');
        if (liveRegion) liveRegion.textContent = 'پاسخ ' + (correct ? 'صحیح' : 'نادرست');
        setTimeout(() => { idx++; renderQ(); }, 700);
      });
    });
  }
  renderQ();
}

function showExerciseResult(container, score, total, onRetry) {
  container.innerHTML = `
    <div class="table-container" style="padding:2rem;text-align:center;">
      <h3>نتیجه تمرین</h3>
      <p style="font-size:1.5rem;margin:1rem 0;">${score} از ${total} پاسخ درست</p>
      <button class="btn-primary exercise-retry-btn">تمرین دوباره</button>
    </div>
  `;
  if (score === total && total > 0) celebrate();
  container.querySelector('.exercise-retry-btn').addEventListener('click', onRetry);
}

function startVerbExercise() {
  if (!APP_DATA || !APP_DATA.verbs) return;
  const level = verbLevelFilter ? verbLevelFilter.value : 'all';
  let verbs = APP_DATA.verbs;
  if (level !== 'all') verbs = verbs.filter(v => v.level === level);
  if (!verbs.length) verbs = APP_DATA.verbs;
  const pool = shuffleArr(verbs).slice(0, Math.min(8, verbs.length));
  const questions = pool.map(v => {
    const pronoun = shuffleArr(Object.keys(PRONOUN_LABELS))[0];
    const tenseChoices = ['present'];
    if (v.praeteritum) tenseChoices.push('praeteritum');
    if (v.konjunktivII) tenseChoices.push('konjunktivII');
    const useTense = shuffleArr(tenseChoices)[0];
    const tenseLabel = useTense === 'praeteritum' ? ' — گذشته‌ی ساده'
      : useTense === 'konjunktivII' ? ' — Konjunktiv II' : '';
    const forms = v[useTense];
    if (!forms || !pronoun) return null;
    const answer = forms[pronoun];
    const distractors = shuffleArr(Object.values(forms).filter(f => f !== answer)).slice(0, 3);
    return {
      prompt: `${PRONOUN_LABELS[pronoun]} ___ (${v.infinitive} — ${v.fa}${tenseLabel})`,
      answer,
      options: shuffleArr([answer, ...distractors])
    };
  });
  runExercise(verbExerciseArea, questions.filter(Boolean), (score, total) => {
    showExerciseResult(verbExerciseArea, score, total, startVerbExercise);
    if (score > 0) addXP(score * 3, 'تمرین صرف');
  });
}
verbExerciseBtn.addEventListener('click', startVerbExercise);

function startCaseExercise() {
  if (!APP_DATA || !APP_DATA.cases) return;
  const genderLabel = { m: 'مذکر (der)', f: 'مؤنث (die)', n: 'خنثی (das)', pl: 'جمع (die)' };
  const nouns = { m: 'Tisch', f: 'Lampe', n: 'Buch', pl: 'Bücher' };
  const defArt = APP_DATA.cases.articles_definite;
  const kasusList = Object.keys(defArt);
  const genderList = Object.keys(defArt.Nominativ);
  const combos = [];
  kasusList.forEach(k => genderList.forEach(g => combos.push({ k, g })));
  const chosen = shuffleArr(combos).slice(0, 8);
  const allArticles = [...new Set(kasusList.flatMap(k => Object.values(defArt[k])))];
  const questions = chosen.map(({ k, g }) => {
    const answer = defArt[k][g];
    const distractors = shuffleArr(allArticles.filter(a => a !== answer)).slice(0, 3);
    return {
      prompt: `___ ${nouns[g]} (${genderLabel[g]}, حالت ${k})`,
      answer,
      options: shuffleArr([answer, ...distractors])
    };
  });
  runExercise(caseExerciseArea, questions, (score, total) => showExerciseResult(caseExerciseArea, score, total, startCaseExercise));
}
caseExerciseBtn.addEventListener('click', startCaseExercise);

function renderCases() {
  if (!APP_DATA || !APP_DATA.cases) return;
  const c = APP_DATA.cases;
  const genderLabel = { m: 'مذکر', f: 'مؤنث', n: 'خنثی', pl: 'جمع' };

  const articleTable = (title, rows) => `
    <h3 style="margin:1.5rem 0 0.75rem;">${title}</h3>
    <div class="table-container">
      <table>
        <thead><tr><th>حالت</th>${Object.keys(rows.Nominativ).map(g => `<th>${genderLabel[g]}</th>`).join('')}</tr></thead>
        <tbody>
          ${Object.keys(rows).map(kase => `
            <tr><td><strong>${kase}</strong></td>${Object.keys(rows[kase]).map(g => `<td dir="ltr" lang="de">${escHtml(rows[kase][g])}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const pronounTable = `
    <h3 style="margin:1.5rem 0 0.75rem;">ضمایر شخصی در حالت‌های صرفی</h3>
    <div class="table-container">
      <table>
        <thead><tr><th>ضمیر (Nominativ)</th><th>Akkusativ</th><th>Dativ</th></tr></thead>
        <tbody>
          ${c.pronouns.map(p => `<tr><td dir="ltr" lang="de">${escHtml(p.person)}</td><td dir="ltr" lang="de">${escHtml(p.akkusativ)}</td><td dir="ltr" lang="de">${escHtml(p.dativ)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  const prepCards = `
    <h3 style="margin:1.5rem 0 0.75rem;">حروف اضافه بر اساس حالت دستوری</h3>
    <div class="grammar-grid">
      ${Object.keys(c.prepositions).map(kase => `
        <div class="grammar-card">
          <div class="title">${kase}</div>
          <div class="grammar-desc" dir="ltr" lang="de">${c.prepositions[kase].join(' · ')}</div>
        </div>
      `).join('')}
    </div>
  `;

  const wechselTip = `
    <div class="wechsel-tip">
      <strong><i class="fas fa-exchange-alt"></i> Wechselpräpositionen (an, auf, in, …)</strong>
      <p style="margin-top:0.35rem;">اگر جمله «به کجا؟ / Wohin?» باشد → <strong>Akkusativ</strong> (حرکت). اگر «کجا؟ / Wo?» باشد → <strong>Dativ</strong> (مکان ثابت). از دکمه «تمرین Wechselpräpositionen» بالا استفاده کن.</p>
    </div>
  `;

  casesContent.innerHTML =
    articleTable('حرف تعریف معین (der/die/das)', c.articles_definite) +
    articleTable('حرف تعریف نامعین (ein/eine)', c.articles_indefinite) +
    pronounTable +
    prepCards +
    wechselTip;
}

function renderReading() {
  if (!APP_DATA || !APP_DATA.readings) return;
  const level = readingLevelFilter.value;
  const passage = APP_DATA.readings.find(r => r.level === level) || APP_DATA.readings[0];
  if (!passage) return;

  readingContent.innerHTML = `
    <div class="table-container" style="padding:1.5rem;margin-bottom:1.5rem;">
      <h3>${escHtml(passage.title)}</h3>
      <p dir="ltr" lang="de" style="line-height:2;font-size:1.1rem;margin:1rem 0;">${escHtml(passage.text)}
        <button class="audio-btn" data-word="${escHtml(passage.text)}" aria-label="پخش تلفظ متن"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
      </p>
    </div>
    <div id="readingQuestions"></div>
  `;
  attachSpeaker(readingContent);

  const qWrap = document.getElementById('readingQuestions');
  qWrap.innerHTML = passage.questions.map((q, i) => `
    <div class="table-container" style="padding:1.25rem;margin-bottom:1rem;">
      <p style="margin-bottom:0.75rem;">${i + 1}. ${escHtml(q.q)}</p>
      <div style="display:flex;flex-direction:column;gap:0.5rem;" data-answer="${escHtml(q.answer)}">
        ${q.options.map(o => `<button class="btn-secondary reading-option" data-value="${escHtml(o)}" style="text-align:right;">${escHtml(o)}</button>`).join('')}
      </div>
    </div>
  `).join('');

  qWrap.querySelectorAll('[data-answer]').forEach(group => {
    const answer = group.dataset.answer;
    group.querySelectorAll('.reading-option').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.reading-option').forEach(b => b.disabled = true);
        if (btn.dataset.value === answer) {
          btn.classList.add('btn-accent');
        } else {
          btn.style.outline = '2px solid #ef4444';
          group.querySelectorAll('.reading-option').forEach(b => { if (b.dataset.value === answer) b.classList.add('btn-accent'); });
        }
      });
    });
  });
}

readingLevelFilter.addEventListener('change', renderReading);

const MAIN_SR_KEY = 'germanMainFlashSR';
let flashDueOnly = false;

function loadMainSR() { try { return JSON.parse(localStorage.getItem(MAIN_SR_KEY)) || {}; } catch (_) { return {}; } }

function saveMainSR(data) { try { localStorage.setItem(MAIN_SR_KEY, JSON.stringify(data)); } catch (_) {} }

function getMainCardState(word) { return loadMainSR()[word] || { interval: 0, ease: 2.5, due: 0, reps: 0 }; }

function setMainCardState(word, state) { const d = loadMainSR();
  d[word] = state;
  saveMainSR(d); }

function initFlashcards() {
  if (!APP_DATA || !APP_DATA.vocabulary) return;
  const level = flashcardLevelFilter.value;
  let pool = level === 'all' ? APP_DATA.vocabulary : APP_DATA.vocabulary.filter(w => w.level === level);
  if (pool.length === 0) pool = APP_DATA.vocabulary;
  if (flashDueOnly) {
    const sr = loadMainSR();
    const now = Date.now();
    const due = pool.filter(w => !sr[wKey(w)] || sr[wKey(w)].due <= now);
    pool = due.length > 0 ? due : pool;
  }
  flashCards = [...pool];
  flashIndexValue = 0;
  flashcardCount.textContent = flashCards.length + ' کلمه';
  showFlashcard();
}

function showFlashcard() {
  if (flashCards.length === 0) {
    flashFront.innerHTML = '<div class="flashcard-word">کلمه‌ی سررسید‌شده‌ای نیست 🎉</div>';
    flashRateRow.style.display = 'none';
    return;
  }
  const w = flashCards[flashIndexValue];

  flashFront.innerHTML = `
    <div class="flashcard-word" lang="de">${escHtml(w.word)}</div>
    <div class="flashcard-ipa" dir="ltr">${escHtml(w.ipa || '')}</div>
    <button class="audio-btn" data-word="${escHtml(w.word)}" aria-label="پخش تلفظ ${escHtml(w.word)}"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span> گوش کن</button>
  `;

  if (flashFa) flashFa.textContent = w.fa || '';
  if (flashEn) flashEn.textContent = w.en || '';
  if (flashLevel) flashLevel.textContent = w.level || '';

  flashIndex.textContent = `${flashIndexValue + 1} از ${flashCards.length}`;
  flashcard.classList.remove('flipped');
  flashcard.setAttribute('aria-label', `کارت ${flashIndexValue + 1} از ${flashCards.length}: ${w.word} - سمت جلو`);
  flashRateRow.style.display = 'none';

  attachSpeaker(flashFront);
  if (flashBack) attachSpeaker(flashBack);
}

flipBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  flashcard.classList.toggle('flipped');
  const isFlipped = flashcard.classList.contains('flipped');
  flashRateRow.style.display = isFlipped ? 'flex' : 'none';
  const w = flashCards[flashIndexValue];
  if (w) {
    flashcard.setAttribute('aria-label', `کارت ${flashIndexValue + 1} از ${flashCards.length}: ${w.word} - سمت ${isFlipped ? 'پشت' : 'جلو'}`);
  }
});

flashcard.addEventListener('click', () => {
  flashcard.classList.toggle('flipped');
  const isFlipped = flashcard.classList.contains('flipped');
  flashRateRow.style.display = isFlipped ? 'flex' : 'none';
  const w = flashCards[flashIndexValue];
  if (w) {
    flashcard.setAttribute('aria-label', `کارت ${flashIndexValue + 1} از ${flashCards.length}: ${w.word} - سمت ${isFlipped ? 'پشت' : 'جلو'}`);
  }
});

flashPrev.addEventListener('click', () => {
  if (flashIndexValue > 0) { flashIndexValue--;
    showFlashcard(); }
});
flashNext.addEventListener('click', () => {
  if (flashIndexValue < flashCards.length - 1) { flashIndexValue++;
    showFlashcard(); }
});
flashcardShuffle.addEventListener('click', () => {
  for (let i = flashCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashCards[i], flashCards[j]] = [flashCards[j], flashCards[i]];
  }
  flashIndexValue = 0;
  showFlashcard();
});
flashcardLevelFilter.addEventListener('change', initFlashcards);

flashcardDueToggle.addEventListener('click', () => {
  flashDueOnly = !flashDueOnly;
  flashcardDueToggle.classList.toggle('learn-toggle-active', flashDueOnly);
  initFlashcards();
});

document.querySelectorAll('.flash-rate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentCard = flashCards[flashIndexValue];
    const key = currentCard && wKey(currentCard);
    if (!key) return;
    const quality = parseInt(btn.dataset.quality, 10);
    const st = getMainCardState(key);
    let { interval, ease, reps } = st;
    if (quality === 0) { reps = 0;
      interval = 0; } else {
      reps++;
      ease = Math.max(1.3, ease + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)));
      interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease) || 1;
    }
    const due = quality === 0 ? Date.now() - 1 : Date.now() + interval * 24 * 60 * 60 * 1000;
    setMainCardState(key, { interval, ease, due, reps });
    if (flashIndexValue < flashCards.length - 1) { flashIndexValue++;
      showFlashcard(); } else { flashIndexValue = 0;
      initFlashcards(); }
  });
});

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;

function buildQuiz() {
  const level = quizLevelFilter.value;
  const vocabPool = level === 'all' ? (APP_DATA.vocabulary || []) : (APP_DATA.vocabulary || []).filter(w => w.level === level);
  if (vocabPool.length < 4) {
    quizArea.innerHTML = '<p style="opacity:0.6;text-align:center;padding:2rem;">برای این سطح واژگان کافی برای آزمون وجود ندارد</p>';
    return;
  }

  const vocabWords = shuffleArr(vocabPool).slice(0, Math.min(6, vocabPool.length));
  const vocabQuestions = vocabWords.map(w => {
    const distractors = shuffleArr(vocabPool.filter(x => x.word !== w.word)).slice(0, 3).map(x => x.fa);
    return {
      type: 'vocab',
      word: w.word,
      ipa: w.ipa,
      promptLabel: 'معنی فارسی این کلمه چیست؟',
      answer: w.fa,
      options: shuffleArr([w.fa, ...distractors])
    };
  });

  let verbQuestions = [];
  const levelOrder = (APP_DATA.levels || []).map(l => l.id);
  const levelRank = levelOrder.indexOf(level);
  const verbPool = (APP_DATA.verbs || []).filter(v => level === 'all' || levelOrder.indexOf(v.level) <= (levelRank === -1 ? levelOrder.length : levelRank));
  if (verbPool.length) {
    const chosenVerbs = shuffleArr(verbPool).slice(0, 2);
    verbQuestions = chosenVerbs.map(v => {
      const pronoun = shuffleArr(Object.keys(PRONOUN_LABELS))[0];
      const answer = v.present[pronoun];
      const distractors = shuffleArr(Object.values(v.present).filter(f => f !== answer)).slice(0, 3);
      return {
        type: 'grammar',
        promptLabel: `صرف صحیح فعل «${v.infinitive}» (${v.fa}) برای «${PRONOUN_LABELS[pronoun]}» چیست؟`,
        answer,
        options: shuffleArr([answer, ...distractors])
      };
    });
  }

  let caseQuestions = [];
  if (level !== 'A0' && APP_DATA.cases) {
    const genderLabel = { m: 'مذکر (der)', f: 'مؤنث (die)', n: 'خنثی (das)', pl: 'جمع (die)' };
    const nouns = { m: 'Tisch', f: 'Lampe', n: 'Buch', pl: 'Bücher' };
    const defArt = APP_DATA.cases.articles_definite;
    const kasusList = Object.keys(defArt);
    const genderList = Object.keys(defArt.Nominativ);
    const k = shuffleArr(kasusList)[0];
    const g = shuffleArr(genderList)[0];
    const answer = defArt[k][g];
    const allArticles = [...new Set(kasusList.flatMap(kk => Object.values(defArt[kk])))];
    const distractors = shuffleArr(allArticles.filter(a => a !== answer)).slice(0, 3);
    caseQuestions = [{
      type: 'grammar',
      promptLabel: `حرف تعریف صحیح: ___ ${nouns[g]} (${genderLabel[g]}, حالت ${k})`,
      answer,
      options: shuffleArr([answer, ...distractors])
    }];
  }

  quizQuestions = shuffleArr([...vocabQuestions, ...verbQuestions, ...caseQuestions]);
  quizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizIndex >= quizQuestions.length) {
    quizArea.innerHTML = `
      <div class="table-container" style="padding:2rem;text-align:center;">
        <h3>نتیجه آزمون</h3>
        <p style="font-size:1.5rem;margin:1rem 0;">${quizScore} از ${quizQuestions.length} پاسخ درست</p>
        <button id="quizRetryBtn" class="btn-primary">آزمون دوباره</button>
      </div>
    `;
    document.getElementById('quizRetryBtn').addEventListener('click', buildQuiz);
    try { localStorage.setItem('germanQuizLast_' + quizLevelFilter.value, JSON.stringify({ score: quizScore, total: quizQuestions.length })); } catch (_) {}
    if (quizScore === quizQuestions.length) celebrate();
    if (quizScore > 0) addXP(quizScore * 4, 'آزمون سطح');
    return;
  }
  const q = quizQuestions[quizIndex];
  const isVocab = q.type === 'vocab';
  quizArea.innerHTML = `
    <div class="table-container" style="padding:1.5rem;">
      <p style="color:var(--text-muted);margin-bottom:0.5rem;">سوال ${quizIndex + 1} از ${quizQuestions.length} &nbsp;·&nbsp; امتیاز: ${quizScore}</p>
      ${isVocab ? `
        <div class="flashcard-word" dir="ltr" lang="de" style="margin-bottom:0.25rem;">${escHtml(q.word)}
          <button class="audio-btn" data-word="${escHtml(q.word)}" aria-label="پخش تلفظ"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
        </div>
        <div class="flashcard-ipa" dir="ltr">${escHtml(q.ipa || '')}</div>
      ` : ''}
      <p style="margin:1rem 0 0.5rem;">${escHtml(q.promptLabel)}</p>
      <div id="quizOptions" style="display:flex;flex-direction:column;gap:0.5rem;">
        ${q.options.map(o => `<button class="btn-secondary quiz-option" data-value="${escHtml(o)}" style="text-align:right;">${escHtml(o)}</button>`).join('')}
      </div>
    </div>
  `;
  attachSpeaker(quizArea);
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.value === q.answer;
      document.querySelectorAll('.quiz-option').forEach(b => {
        b.disabled = true;
        if (b.dataset.value === q.answer) b.classList.add('btn-accent');
      });
      if (correct) quizScore++;
      else btn.style.outline = '2px solid #ef4444';
      var quizLiveRegion = document.getElementById('ariaLiveRegion');
      if (quizLiveRegion) quizLiveRegion.textContent = 'پاسخ ' + (correct ? 'صحیح' : 'نادرست');
      setTimeout(() => { quizIndex++;
        renderQuizQuestion(); }, 700);
    });
  });
}

quizStartBtn.addEventListener('click', buildQuiz);

const XP_KEY = 'germanXP';
const STREAK_KEY = 'germanStreak';
const STUDY_DAY_KEY = 'germanStudyDay';
const PATH_DONE_KEY = 'germanPathDone';

function getXP() {
  try { return parseInt(localStorage.getItem(XP_KEY) || '0', 10) || 0; } catch (_) { return 0; }
}
function addXP(amount, reason) {
  const next = getXP() + (amount || 0);
  try { localStorage.setItem(XP_KEY, String(next)); } catch (_) {}
  touchStreak();
  if (reason && amount >= 5 && typeof showToast === 'function') {
    showToast(`+${amount} XP — ${reason}`);
  }
  renderHomeGamification();
  return next;
}
function getStreakData() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}') || {}; } catch (_) { return {}; }
}
function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const data = getStreakData();
  if (data.last === today) return data.count || 1;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const count = data.last === yesterday ? (data.count || 0) + 1 : 1;
  try { localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, count })); } catch (_) {}
  return count;
}
function getStreak() {
  const data = getStreakData();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (data.last === today || data.last === yesterday) return data.count || 0;
  return 0;
}
function renderHomeGamification() {
  const el = document.getElementById('homeGamification');
  const stats = document.getElementById('gamificationStats');
  const xp = getXP();
  const streak = getStreak();
  const htmlMini = `<span class="xp-pill"><i class="fas fa-bolt"></i> ${xp} XP</span>
    <span class="xp-pill"><i class="fas fa-fire"></i> ${streak} روز متوالی</span>`;
  if (el) el.innerHTML = htmlMini;
  if (stats) {
    stats.innerHTML = `
      <div class="stat-card"><i class="fas fa-bolt"></i><div><span>${xp}</span><p>امتیاز تجربه (XP)</p></div></div>
      <div class="stat-card"><i class="fas fa-fire"></i><div><span>${streak}</span><p>روز متوالی فعالیت</p></div></div>
      <div class="stat-card"><i class="fas fa-trophy"></i><div><span>${Math.floor(xp / 100) + 1}</span><p>سطح بازیکن (هر ۱۰۰ XP)</p></div></div>
    `;
  }
}

let currentPathDay = 0;

function getStudyDayIndex() {
  try {
    const saved = parseInt(localStorage.getItem(STUDY_DAY_KEY) || '0', 10);
    if (!isNaN(saved) && saved >= 0) return saved;
  } catch (_) {}
  return 0;
}
function setStudyDayIndex(i) {
  const plan = (APP_DATA && APP_DATA.studyPlan) || [];
  const max = Math.max(0, plan.length - 1);
  currentPathDay = Math.max(0, Math.min(max, i));
  try { localStorage.setItem(STUDY_DAY_KEY, String(currentPathDay)); } catch (_) {}
}
function getPathDone() {
  try { return JSON.parse(localStorage.getItem(PATH_DONE_KEY) || '{}') || {}; } catch (_) { return {}; }
}
function markPathTaskDone(day, taskIdx) {
  const done = getPathDone();
  const key = String(day);
  if (!done[key]) done[key] = [];
  if (!done[key].includes(taskIdx)) {
    done[key].push(taskIdx);
    try { localStorage.setItem(PATH_DONE_KEY, JSON.stringify(done)); } catch (_) {}
    addXP(10, 'تکلیف مسیر روزانه');
  }
  renderStudyPath();
}
function renderStudyPath() {
  const content = document.getElementById('pathContent');
  const badge = document.getElementById('pathDayBadge');
  if (!content || !APP_DATA || !APP_DATA.studyPlan) return;
  if (currentPathDay === 0 && getStudyDayIndex()) currentPathDay = getStudyDayIndex();
  const plan = APP_DATA.studyPlan;
  const day = plan[currentPathDay] || plan[0];
  if (!day) { content.innerHTML = '<p>برنامه یافت نشد.</p>'; return; }
  if (badge) badge.textContent = `روز ${day.day} از ${plan.length} · ${day.level}`;
  const done = getPathDone()[String(day.day)] || [];
  content.innerHTML = `
    <div class="table-container path-card" style="padding:1.5rem;">
      <h3>${escHtml(day.title)}</h3>
      <p style="color:var(--text-muted);margin:0.5rem 0 1rem;">سطح پیشنهادی: <span class="level-badge">${escHtml(day.level)}</span></p>
      <div class="path-tasks">
        ${(day.tasks || []).map((t, i) => `
          <div class="path-task ${done.includes(i) ? 'done' : ''}">
            <div>
              <strong>${escHtml(t.label)}</strong>
              <div style="color:var(--text-muted);font-size:0.85rem;">${escHtml(t.type || '')}</div>
            </div>
            <div class="path-task-actions">
              <button class="btn-small path-goto" data-section="${escHtml(t.section || '')}" data-level="${escHtml(t.level || day.level)}">برو</button>
              <button class="btn-small path-done-btn" data-day="${day.day}" data-idx="${i}" ${done.includes(i) ? 'disabled' : ''}>
                ${done.includes(i) ? '✓ انجام شد' : 'علامت انجام'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  content.querySelectorAll('.path-goto').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.dataset.section;
      const lvl = btn.dataset.level;
      if (sec === 'vocabulary' && vocabLevelFilter) vocabLevelFilter.value = lvl || 'all';
      if (sec === 'grammar' && grammarLevelFilter) grammarLevelFilter.value = lvl || 'all';
      if (sec === 'quiz' && quizLevelFilter) quizLevelFilter.value = lvl || 'all';
      if (sec === 'reading' && readingLevelFilter) readingLevelFilter.value = lvl || 'A0';
      if (sec === 'flashcards' && flashcardLevelFilter) flashcardLevelFilter.value = lvl || 'all';
      if (sec === 'dialogues') {
        const df = document.getElementById('dialogueLevelFilter');
        if (df) df.value = lvl || 'A0';
      }
      if (sec === 'dictation') {
        const df = document.getElementById('dictationLevelFilter');
        if (df) df.value = lvl || 'all';
      }
      goToSection(sec || 'vocabulary');
    });
  });
  content.querySelectorAll('.path-done-btn').forEach(btn => {
    btn.addEventListener('click', () => markPathTaskDone(parseInt(btn.dataset.day, 10), parseInt(btn.dataset.idx, 10)));
  });
}
document.getElementById('pathTodayBtn')?.addEventListener('click', () => {
  setStudyDayIndex(getStudyDayIndex());
  renderStudyPath();
});
document.getElementById('pathPrevDayBtn')?.addEventListener('click', () => {
  setStudyDayIndex(currentPathDay - 1);
  renderStudyPath();
});
document.getElementById('pathNextDayBtn')?.addEventListener('click', () => {
  setStudyDayIndex(currentPathDay + 1);
  renderStudyPath();
});

function renderDialogues() {
  const wrap = document.getElementById('dialogueContent');
  const filter = document.getElementById('dialogueLevelFilter');
  if (!wrap || !APP_DATA || !APP_DATA.dialogues) return;
  const level = filter ? filter.value : 'A0';
  const d = APP_DATA.dialogues.find(x => x.level === level) || APP_DATA.dialogues[0];
  if (!d) { wrap.innerHTML = '<p>دیالوگی نیست.</p>'; return; }
  wrap.innerHTML = `
    <div class="table-container" style="padding:1.5rem;">
      <h3>${escHtml(d.title)} <span class="level-badge">${escHtml(d.level)}</span></h3>
      <div class="dialogue-lines">
        ${(d.lines || []).map((line, i) => `
          <div class="dialogue-line" data-line-idx="${i}">
            <div class="dialogue-speaker">${escHtml(line.speaker || '')}</div>
            <div class="dialogue-de" dir="ltr" lang="de">
              ${escHtml(line.de || '')}
              <button class="audio-btn" data-word="${escHtml(line.de || '')}" aria-label="پخش"><i class="fas fa-volume-up play-icon"></i><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span><span class="equalizer-bar hidden"></span></button>
            </div>
            <div class="trans">🇮🇷 ${escHtml(line.fa || '')}</div>
            <div class="trans" dir="ltr" lang="en">🇬🇧 ${escHtml(line.en || '')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  attachSpeaker(wrap);
}
document.getElementById('dialogueLevelFilter')?.addEventListener('change', renderDialogues);

async function playDialogueAll() {
  if (!APP_DATA || !APP_DATA.dialogues) return;
  const filter = document.getElementById('dialogueLevelFilter');
  const level = filter ? filter.value : 'A0';
  const d = APP_DATA.dialogues.find(x => x.level === level) || APP_DATA.dialogues[0];
  if (!d || !d.lines) return;
  addXP(5, 'شنیدن دیالوگ');
  for (const line of d.lines) {
    if (line.de) await speakGerman(line.de);
    await new Promise(r => setTimeout(r, 400));
  }
}
document.getElementById('dialoguePlayAllBtn')?.addEventListener('click', () => { playDialogueAll(); });

let dictationPool = [];
let dictationIdx = 0;
let dictationScore = 0;

function normalizeDictation(s) {
  return (s || '')
    .trim()
    .replace(/[?!.,;:"""''«»]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/ß/g, 'ss');
}

function dictationMatch(user, answer) {
  const u = (user || '').trim().replace(/[?!.,;:"""''«»]/g, '').replace(/\s+/g, ' ');
  const a = (answer || '').trim().replace(/[?!.,;:"""''«»]/g, '').replace(/\s+/g, ' ');
  if (u === a) return true;
  // case-insensitive + ß/ss flexibility
  const fold = (x) => x.toLowerCase().replace(/ß/g, 'ss');
  return fold(u) === fold(a);
}

function startDictation() {
  const area = document.getElementById('dictationArea');
  const filter = document.getElementById('dictationLevelFilter');
  if (!area || !APP_DATA || !APP_DATA.dictation) return;
  const level = filter ? filter.value : 'all';
  let pool = APP_DATA.dictation.filter(d => level === 'all' || d.level === level);
  if (!pool.length) pool = APP_DATA.dictation.slice();
  dictationPool = shuffleArr(pool).slice(0, Math.min(8, pool.length));
  dictationIdx = 0;
  dictationScore = 0;
  renderDictationQ();
}

function renderDictationQ() {
  const area = document.getElementById('dictationArea');
  if (!area) return;
  if (dictationIdx >= dictationPool.length) {
    area.innerHTML = `
      <div class="table-container" style="padding:2rem;text-align:center;">
        <h3>نتیجه دیکته</h3>
        <p style="font-size:1.4rem;margin:1rem 0;">${dictationScore} از ${dictationPool.length} درست</p>
        <button class="btn-primary" id="dictationRetryBtn">دوباره</button>
      </div>`;
    if (dictationScore === dictationPool.length && dictationPool.length) {
      celebrate();
      addXP(30, 'دیکته کامل');
    } else {
      addXP(5 * dictationScore, 'دیکته');
    }
    document.getElementById('dictationRetryBtn')?.addEventListener('click', startDictation);
    return;
  }
  const item = dictationPool[dictationIdx];
  area.innerHTML = `
    <div class="table-container" style="padding:1.5rem;">
      <p style="color:var(--text-muted);">عبارت ${dictationIdx + 1} از ${dictationPool.length} · سطح ${escHtml(item.level || '')} · امتیاز: ${dictationScore}</p>
      ${item.hint ? `<p class="dictation-hint">راهنما: ${escHtml(item.hint)}</p>` : ''}
      <div class="dictation-controls">
        <button class="btn-primary" id="dictationPlayBtn"><i class="fas fa-volume-up"></i> پخش صوت</button>
        <button class="btn-secondary" id="dictationReplayBtn">پخش دوباره</button>
      </div>
      <label class="sr-only" for="dictationInput">متن شنیده‌شده</label>
      <input type="text" id="dictationInput" class="dictation-input" dir="ltr" lang="de" autocomplete="off" spellcheck="false" placeholder="آنچه شنیدی را اینجا بنویس...">
      <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn-accent" id="dictationCheckBtn">بررسی پاسخ</button>
        <button class="btn-secondary" id="dictationSkipBtn">رد کردن</button>
      </div>
      <div id="dictationFeedback" style="margin-top:1rem;"></div>
    </div>
  `;
  const play = () => speakGerman(item.text);
  document.getElementById('dictationPlayBtn')?.addEventListener('click', play);
  document.getElementById('dictationReplayBtn')?.addEventListener('click', play);
  document.getElementById('dictationCheckBtn')?.addEventListener('click', () => {
    const input = document.getElementById('dictationInput');
    const fb = document.getElementById('dictationFeedback');
    const ok = dictationMatch(input?.value || '', item.text);
    if (ok) {
      dictationScore++;
      if (fb) fb.innerHTML = `<p style="color:var(--accent-color);font-weight:600;">✓ درست!</p>`;
    } else if (fb) {
      fb.innerHTML = `<p style="color:#ef4444;">✗ نادرست</p>
        <p dir="ltr" lang="de">پاسخ: <strong>${escHtml(item.text)}</strong></p>
        <p>🇮🇷 ${escHtml(item.fa || '')}</p>`;
    }
    setTimeout(() => { dictationIdx++; renderDictationQ(); }, 1100);
  });
  document.getElementById('dictationSkipBtn')?.addEventListener('click', () => {
    dictationIdx++;
    renderDictationQ();
  });
  setTimeout(play, 300);
}
document.getElementById('dictationStartBtn')?.addEventListener('click', startDictation);

document.getElementById('umlautBtns')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.umlaut-insert');
  if (!btn) return;
  const input = document.getElementById('dictationInput');
  if (!input) return;
  const ch = btn.dataset.char || '';
  const start = input.selectionStart || input.value.length;
  const end = input.selectionEnd || input.value.length;
  input.value = input.value.slice(0, start) + ch + input.value.slice(end);
  input.focus();
  const pos = start + ch.length;
  input.setSelectionRange(pos, pos);
});

function startWechselExercise() {
  const area = document.getElementById('wechselExerciseArea');
  if (!area || !APP_DATA || !APP_DATA.wechselExercises) return;
  const items = shuffleArr(APP_DATA.wechselExercises).slice(0, 8);
  const questions = items.map(it => ({
    prompt: `${it.sentence}<br><span style="font-size:0.9rem;color:var(--text-muted);">${escHtml(it.reason || '')} — حالت مورد نیاز: ${escHtml(it.caseNeeded || '')}</span>`,
    answer: it.caseNeeded,
    options: shuffleArr(['Akkusativ', 'Dativ']),
    explain: it.full
  }));
  let idx = 0, score = 0;
  function renderQ() {
    if (idx >= questions.length) {
      showExerciseResult(area, score, questions.length, startWechselExercise);
      if (score > 0) addXP(score * 5, 'تمرین Wechsel');
      return;
    }
    const q = questions[idx];
    area.innerHTML = `
      <div class="table-container" style="padding:1.5rem;margin-bottom:1rem;">
        <p style="color:var(--text-muted);margin-bottom:0.5rem;">سوال ${idx + 1} از ${questions.length} · امتیاز: ${score}</p>
        <p style="font-size:1.1rem;margin-bottom:0.5rem;" dir="ltr" lang="de">${q.prompt}</p>
        <p style="margin-bottom:0.75rem;">حرکت (Wohin؟ → Akk) یا مکان ثابت (Wo؟ → Dat)؟</p>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${q.options.map(o => `<button class="btn-secondary exercise-option" data-value="${escHtml(o)}" style="text-align:right;">${escHtml(o)}</button>`).join('')}
        </div>
        <div id="wechselExplain" style="margin-top:0.75rem;"></div>
      </div>`;
    area.querySelectorAll('.exercise-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const correct = btn.dataset.value === q.answer;
        area.querySelectorAll('.exercise-option').forEach(b => {
          b.disabled = true;
          if (b.dataset.value === q.answer) b.classList.add('btn-accent');
        });
        if (correct) score++;
        else btn.style.outline = '2px solid #ef4444';
        const ex = document.getElementById('wechselExplain');
        if (ex && q.explain) ex.innerHTML = `<p dir="ltr" lang="de">${escHtml(q.explain)}</p>`;
        setTimeout(() => { idx++; renderQ(); }, 900);
      });
    });
  }
  renderQ();
}
document.getElementById('wechselExerciseBtn')?.addEventListener('click', startWechselExercise);

function startPluralPractice() {
  const area = document.getElementById('pluralExerciseArea');
  if (!area || !APP_DATA || !APP_DATA.vocabulary) return;
  let pool = APP_DATA.vocabulary.filter(w => w.plural && (/^(der|die|das)\s/i.test(w.word) || !w.pluralNote));
  if (pool.length < 8) pool = APP_DATA.vocabulary.filter(w => w.plural);
  pool = shuffleArr(pool).slice(0, Math.min(8, pool.length));
  if (!pool.length) {
    area.innerHTML = '<p style="padding:1rem;">هنوز صورت جمع کافی برای تمرین نیست.</p>';
    return;
  }
  const allPlurals = shuffleArr(APP_DATA.vocabulary.filter(w => w.plural).map(w => w.plural));
  const questions = pool.map(w => {
    const answer = w.plural;
    const distractors = shuffleArr(allPlurals.filter(p => p !== answer)).slice(0, 3);
    return {
      prompt: `جمع «${w.word}» (${w.fa || ''}) چیست؟`,
      answer,
      options: shuffleArr([answer, ...distractors])
    };
  });
  runExercise(area, questions, (score, total) => {
    showExerciseResult(area, score, total, startPluralPractice);
    if (score > 0) addXP(score * 4, 'تمرین جمع');
  });
}
document.getElementById('pluralPracticeBtn')?.addEventListener('click', startPluralPractice);

let placementIdx = 0;
let placementScores = { A0: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };

function startPlacementTest() {
  const area = document.getElementById('placementArea');
  if (!area || !APP_DATA || !APP_DATA.placementTest) return;
  placementIdx = 0;
  placementScores = { A0: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  renderPlacementQ();
}
function renderPlacementQ() {
  const area = document.getElementById('placementArea');
  const qs = APP_DATA.placementTest || [];
  if (!area) return;
  if (placementIdx >= qs.length) {
    const order = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];
    let recommended = 'A0';
    let correct = 0;
    for (const lvl of order) {
      if (placementScores[lvl] > 0) recommended = lvl;
      correct += placementScores[lvl];
    }
    if (correct <= 2) recommended = 'A0';
    else if (correct <= 4) recommended = recommended === 'C1' ? 'B1' : recommended;
    area.innerHTML = `
      <div style="text-align:center;padding:0.5rem;">
        <h4>سطح پیشنهادی: <span class="level-badge" style="font-size:1.1rem;">${escHtml(recommended)}</span></h4>
        <p style="color:var(--text-muted);margin:0.75rem 0;">${correct} از ${qs.length} پاسخ درست</p>
        <button class="btn-primary" id="placementGoVocab">شروع واژگان ${escHtml(recommended)}</button>
        <button class="btn-secondary" id="placementGoPath">باز کردن مسیر روزانه</button>
        <button class="btn-secondary" id="placementRetry">آزمون دوباره</button>
      </div>`;
    try { localStorage.setItem('germanPlacementLevel', recommended); } catch (_) {}
    addXP(15, 'آزمون تعیین سطح');
    document.getElementById('placementGoVocab')?.addEventListener('click', () => {
      vocabLevelFilter.value = recommended;
      filterVocab();
      goToSection('vocabulary');
    });
    document.getElementById('placementGoPath')?.addEventListener('click', () => goToSection('path'));
    document.getElementById('placementRetry')?.addEventListener('click', startPlacementTest);
    return;
  }
  const q = qs[placementIdx];
  area.innerHTML = `
    <p style="color:var(--text-muted);margin-bottom:0.5rem;">سؤال ${placementIdx + 1} از ${qs.length}</p>
    <p style="margin-bottom:0.75rem;font-weight:600;">${escHtml(q.q)}</p>
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      ${(q.options || []).map(o => `<button class="btn-secondary placement-opt" data-value="${escHtml(o)}" style="text-align:right;">${escHtml(o)}</button>`).join('')}
    </div>`;
  area.querySelectorAll('.placement-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = btn.dataset.value === q.answer;
      area.querySelectorAll('.placement-opt').forEach(b => {
        b.disabled = true;
        if (b.dataset.value === q.answer) b.classList.add('btn-accent');
      });
      if (ok) {
        placementScores[q.level] = (placementScores[q.level] || 0) + 1;
      } else {
        btn.style.outline = '2px solid #ef4444';
      }
      setTimeout(() => { placementIdx++; renderPlacementQ(); }, 650);
    });
  });
}
document.getElementById('placementStartBtn')?.addEventListener('click', startPlacementTest);

function collectProgressBackup() {
  const keys = [
    'germanLearned', 'germanMainFlashSR', 'germanBadgesUnlocked',
    XP_KEY, STREAK_KEY, STUDY_DAY_KEY, PATH_DONE_KEY, 'germanPlacementLevel',
    'germanPhoneticsProgress', 'theme'
  ];
  const quizKeys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('germanQuizLast_')) quizKeys.push(k);
    }
  } catch (_) {}
  const data = { version: 1, exportedAt: new Date().toISOString(), store: {} };
  [...keys, ...quizKeys].forEach(k => {
    try {
      const v = localStorage.getItem(k);
      if (v !== null) data.store[k] = v;
    } catch (_) {}
  });
  return data;
}
function exportProgress() {
  const data = collectProgressBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deutsch-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast('فایل پیشرفت دانلود شد');
}
function importProgressFromObject(data) {
  if (!data || !data.store || typeof data.store !== 'object') throw new Error('فرمت نامعتبر');
  if (typeof data.store !== 'object' || data.store === null) {
    showToast('فایل وارد شده نامعتبر است.');
    return;
  }
  Object.keys(data.store).forEach(k => {
    try { localStorage.setItem(k, data.store[k]); } catch (_) {}
  });
  loadProgress();
  updateProgress();
  renderVocab();
  renderHomeGamification();
  if (typeof showToast === 'function') showToast('پیشرفت بازیابی شد');
}
document.getElementById('exportProgressBtn')?.addEventListener('click', exportProgress);
document.getElementById('importProgressBtn')?.addEventListener('click', () => {
  document.getElementById('importProgressFile')?.click();
});
document.getElementById('importProgressFile')?.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!confirm('پیشرفت فعلی با فایل وارداتی جایگزین می‌شود. ادامه؟')) return;
      importProgressFromObject(data);
    } catch (err) {
      showToast('خواندن فایل ناموفق بود: ' + (err.message || err));
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('germanLearned') || '[]');
    learnedWords = new Set(saved);
  } catch(e) { learnedWords = new Set(); }
}

function saveProgress() {
  try {
    localStorage.setItem('germanLearned', JSON.stringify([...learnedWords]));
  } catch(e) {
    showToast('فضای ذخیره‌سازی پر شده. لطفاً پیشرفت را export کنید.');
  }
  touchStreak();
}

function updateProgressBar() {
  if (!APP_DATA || !APP_DATA.vocabulary) return;
  const total = APP_DATA.vocabulary.length;
  const learned = learnedWords.size;
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
  if (progressFill) progressFill.style.width = pct + '%';
}

function updateProgress() {
  if (!APP_DATA || !APP_DATA.vocabulary) return;
  const total = APP_DATA.vocabulary.length;
  const learned = learnedWords.size;
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

  if (statWords) statWords.textContent = learned;
  if (statTotal) statTotal.textContent = total;
  if (statPercent) statPercent.textContent = pct + '%';
  updateProgressBar();
  renderHomeGamification();

  if (progressRing) {
    progressRing.style.background = `conic-gradient(var(--accent-color) ${pct * 3.6}deg, var(--border-color) 0deg)`;
  }
  if (progressRingText) progressRingText.textContent = pct + '%';

  const badgeMilestones = [10, 50, 100, 200, 500];
  const badgesArea = document.getElementById('badgesArea');
  if (badgesArea) {
    let unlockedCountBefore = 0;
    try { unlockedCountBefore = JSON.parse(localStorage.getItem('germanBadgesUnlocked') || '[]').length; } catch (_) {}
    const unlocked = badgeMilestones.filter(m => learned >= m);
    badgesArea.innerHTML = badgeMilestones.map(m => `
      <div class="stat-card" style="opacity:${learned >= m ? 1 : 0.4};">
        <i class="fas ${learned >= m ? 'fa-medal' : 'fa-lock'}"></i>
        <div>
          <span>${m}</span>
          <p>${learned >= m ? 'کسب‌شده' : 'کلمه برای باز شدن'}</p>
        </div>
      </div>
    `).join('');
    if (unlocked.length > unlockedCountBefore) celebrate();
    try { localStorage.setItem('germanBadgesUnlocked', JSON.stringify(unlocked)); } catch (_) {}
  }

  const levels = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'];
  progressLevelsDiv.innerHTML = levels.map(lvl => {
    const totalLvl = APP_DATA.vocabulary.filter(w => w.level === lvl).length;
    const learnedLvl = APP_DATA.vocabulary.filter(w => w.level === lvl && learnedWords.has(wKey(w))).length;
    const pctLvl = totalLvl > 0 ? Math.round((learnedLvl / totalLvl) * 100) : 0;
    return `
      <div class="progress-level-item">
        <span class="label">${lvl}</span>
        <div class="bar" role="progressbar" aria-valuenow="${pctLvl}" aria-valuemin="0" aria-valuemax="100" aria-label="${lvl}: ${pctLvl}٪">
          <div class="fill" style="width:${pctLvl}%"></div>
        </div>
        <span class="pct">${pctLvl}٪ (${learnedLvl}/${totalLvl})</span>
        <button class="btn-small" data-level="${lvl}" aria-label="تمرین واژگان سطح ${lvl}">تمرین</button>
      </div>
    `;
  }).join('');

  progressLevelsDiv.querySelectorAll('.btn-small').forEach(btn => {
    btn.addEventListener('click', () => {
      vocabLevelFilter.value = btn.dataset.level;
      document.querySelector('[data-section="vocabulary"]').click();
    });
  });
}

resetProgressBtn && resetProgressBtn.addEventListener('click', function() {
  const modal = document.getElementById('confirmModal');
  const msg = document.getElementById('confirmMessage');
  const yesBtn = document.getElementById('confirmYes');
  const noBtn = document.getElementById('confirmNo');
  if (!modal) return;
  msg.textContent = 'آیا مطمئنید که می‌خواهید تمام پیشرفت یادگیری پاک شود؟ این عمل غیرقابل بازگشت است.';
  modal.hidden = false;
  noBtn.focus();
  function close() { modal.hidden = true; cleanup(); }
  function cleanup() {
    yesBtn.removeEventListener('click', doReset);
    noBtn.removeEventListener('click', close);
  }
  function doReset() {
    close();
    learnedWords.clear();
    saveProgress();
    try {
      localStorage.removeItem(XP_KEY);
      localStorage.removeItem(STREAK_KEY);
      localStorage.removeItem(STUDY_DAY_KEY);
      localStorage.removeItem(PATH_DONE_KEY);
      localStorage.removeItem(MAIN_SR_KEY);
      localStorage.removeItem('germanBadgesUnlocked');
      localStorage.removeItem('germanPlacementLevel');
      ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'all'].forEach(l => {
        localStorage.removeItem('germanQuizLast_' + l);
      });
    } catch (_) {}
    updateProgress();
    renderVocab();
    renderHomeGamification();
    renderStudyPath();
  }
  yesBtn.addEventListener('click', doReset);
  noBtn.addEventListener('click', close);
});

loadProgress();
loadData();

window.speakGerman = speakGerman;
window.playPhoneticsAudio = playPhoneticsAudio;

function showToast(msg, duration) {
  duration = duration || 3000;
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const existing = document.getElementById('ui-toast');
  const toast = existing ? existing.cloneNode(true) : document.createElement('div');
  toast.removeAttribute('id');
  toast.removeAttribute('hidden');
  const msgEl = toast.querySelector('#toast-message') || toast.querySelector('span');
  if (msgEl) msgEl.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  stack.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

const phoneticsRules = [
  { regex: /tsch/gi, color: '#a855f7', hint: '<strong>tsch</strong>: صدای ترکیبی «چ»' },
  { regex: /sch/gi, color: '#ec4899', hint: '<strong>sch</strong>: صدای «ش»' },
  { regex: /chs/gi, color: '#f59e0b', hint: '<strong>chs</strong>: صدای ترکیبی «کْس»' },
  { regex: /tion\b/gi, color: '#6366f1', hint: '<strong>tion</strong>: صدای «تسیون»' },
  { regex: /ig\b/gi, color: '#14b8a6', hint: '<strong>ig</strong>: صدای نرم «ایش»' },
  { regex: /ei/gi, color: '#eab308', hint: '<strong>ei</strong>: صدای «آی»' },
  { regex: /ie/gi, color: '#3b82f6', hint: '<strong>ie</strong>: صدای «ای» کشیده' },
  { regex: /er/gi, color: '#f97316', hint: '<strong>er</strong>: صدای «آ/اَ» کوتاه' },
  { regex: /eu|äu/gi, color: '#84cc16', hint: '<strong>eu / äu</strong>: صدای «اُی»' },
  { regex: /au/gi, color: '#f97316', hint: '<strong>au</strong>: صدای «آئو»' },
  { regex: /ä/gi, color: '#f59e0b', hint: '<strong>ä</strong>: صدای «اِ» باز' },
  { regex: /ö/gi, color: '#d946ef', hint: '<strong>ö</strong>: صدای خاص (گرد + اِ)' },
  { regex: /ü/gi, color: '#8b5cf6', hint: '<strong>ü</strong>: صدای خاص (غنچه + ای)' },
  { regex: /z/gi, color: '#f43f5e', hint: '<strong>z</strong>: صدای «تس»' },
  { regex: /w/gi, color: '#0ea5e9', hint: '<strong>w</strong>: صدای «و»' },
  { regex: /v/gi, color: '#64748b', hint: '<strong>v</strong>: معمولاً صدای «ف»' },
  { regex: /b\b/gi, color: '#94a3b8', hint: '<strong>b</strong> در انتها: تبدیل به «پ»' },
  { regex: /d\b/gi, color: '#94a3b8', hint: '<strong>d</strong> در انتها: تبدیل به «ت»' },
  { regex: /g\b/gi, color: '#94a3b8', hint: '<strong>g</strong> در انتها: تبدیل به «ک»' },
];

const analyzerInput = document.getElementById('analyzer-input');
const emptyState = document.getElementById('analyzer-empty-state');
const resultArea = document.getElementById('analyzer-result-area');
const displayWord = document.getElementById('analyzed-word-display');
const rulesList = document.getElementById('analyzer-rules-list');
const playBtn = document.getElementById('analyzer-play-btn');
const clearBtn = document.getElementById('analyzer-clear-btn');

function analyzeWord(word) {
  let intervals = [];
  let appliedRules = [];
  for (let rule of phoneticsRules) {
    let match;
    rule.regex.lastIndex = 0;
    while ((match = rule.regex.exec(word)) !== null) {
      let start = match.index;
      let end = start + match[0].length;
      let overlap = intervals.some(inv => start < inv.end && end > inv.start);
      if (!overlap) {
        intervals.push({ start, end, text: match[0], rule });
        if (!appliedRules.some(r => r.hint === rule.hint)) appliedRules.push(rule);
      }
      if (rule.regex.lastIndex === match.index) rule.regex.lastIndex++;
    }
  }
  intervals.sort((a, b) => a.start - b.start);
  let parts = [];
  let currentIndex = 0;
  for (let inv of intervals) {
    if (inv.start > currentIndex) parts.push({ text: word.substring(currentIndex, inv.start), matched: false });
    parts.push({ text: inv.text, matched: true, color: inv.rule.color });
    currentIndex = inv.end;
  }
  if (currentIndex < word.length) parts.push({ text: word.substring(currentIndex), matched: false });
  return { parts, rules: appliedRules };
}

if (analyzerInput) {
  const doAnalyze = () => {
    const word = analyzerInput.value.trim();
    if (clearBtn) clearBtn.classList.toggle('hidden', analyzerInput.value.length === 0);
    if (word.length === 0) {
      emptyState.classList.remove('hidden');
      resultArea.classList.add('hidden');
      playBtn.classList.add('hidden');
      return;
    }
    emptyState.classList.add('hidden');
    resultArea.classList.remove('hidden');
    playBtn.classList.remove('hidden');
    const analysis = analyzeWord(word);
    let displayHtml = '';
    analysis.parts.forEach(part => {
      displayHtml += part.matched
        ? `<span class="phonetic-highlight" style="color:${part.color}">${escHtml(part.text)}</span>`
        : `<span>${escHtml(part.text)}</span>`;
    });
    displayWord.innerHTML = displayHtml;
    rulesList.innerHTML = analysis.rules.length === 0
      ? '<li style="justify-content:center;color:var(--text-muted);">کلمه ساده‌ای است، قانون ترکیبی خاصی در آن یافت نشد.</li>'
      : analysis.rules.map(rule => `
          <li><span class="rule-swatch" style="background:${rule.color}"></span><span>${rule.hint}</span></li>
        `).join('');
  };

  analyzerInput.addEventListener('input', doAnalyze);
  analyzerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doAnalyze();
    }
  });

  playBtn.addEventListener('click', () => {
    const word = analyzerInput.value.trim();
    if (word) playPhoneticsAudio(word, null);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      analyzerInput.value = '';
      analyzerInput.dispatchEvent(new Event('input'));
      analyzerInput.focus();
    });
  }
}

const MINIMAL_PAIRS = [
  [{ w: 'Bett', fa: 'تخت', en: 'bed' }, { w: 'Beet', fa: 'باغچه', en: 'flower bed' }],
  [{ w: 'Höhle', fa: 'غار', en: 'cave' }, { w: 'Hölle', fa: 'جهنم', en: 'hell' }],
  [{ w: 'Miete', fa: 'اجاره', en: 'rent' }, { w: 'Mitte', fa: 'وسط', en: 'middle' }],
  [{ w: 'rot', fa: 'قرمز', en: 'red' }, { w: 'tot', fa: 'مرده', en: 'dead' }],
  [{ w: 'ich', fa: 'من', en: 'I' }, { w: 'ach', fa: '(حرف ندا) آخ', en: 'oh / ah' }],
  [{ w: 'Ratte', fa: 'موش صحرایی', en: 'rat' }, { w: 'Rate', fa: 'تخمین / نصیحت', en: 'guess / advice' }],
  [{ w: 'Soll', fa: 'باید (حالت) / حد', en: 'should / limit' }, { w: 'Zoll', fa: 'گمرک / اینچ', en: 'customs / inch' }],
  [{ w: 'Kiste', fa: 'جعبه', en: 'box' }, { w: 'Küsse', fa: 'بوسه‌ها', en: 'kisses' }],
  [{ w: 'Busse', fa: 'اتوبوس‌ها', en: 'buses' }, { w: 'Buße', fa: 'جزا / توبه', en: 'penance / fine' }],
  [{ w: 'Stadt', fa: 'شهر', en: 'city' }, { w: 'Statt', fa: 'به جای', en: 'instead of' }],
  [{ w: 'Rübe', fa: 'چغندر', en: 'beetroot' }, { w: 'Robe', fa: 'عبا / روپوش', en: 'robe / gown' }],
  [{ w: 'Bürger', fa: 'شهروند', en: 'citizen' }, { w: 'Burger', fa: 'همبرگر', en: 'burger' }],
  [{ w: 'Kuchen', fa: 'کیک', en: 'cake' }, { w: 'Küchen', fa: 'آشپزخانه‌ها', en: 'kitchens' }],
  [{ w: 'Hund', fa: 'سگ', en: 'dog' }, { w: 'Hunt', fa: '(نام خانوادگی) هونت', en: 'surname Hunt' }],
  [{ w: 'Tag', fa: 'روز', en: 'day' }, { w: 'Tack', fa: 'میخ (نوک‌تیز)', en: 'tack' }],
  [{ w: 'Weg', fa: 'راه', en: 'way' }, { w: 'Wegg', fa: 'کوکی (شیرینی)', en: 'cookie (Swiss)' }],
  [{ w: 'Berg', fa: 'کوه', en: 'mountain' }, { w: 'Burg', fa: 'قلعه', en: 'castle' }]
];
let currentPair = null;
let pairScore = { correct: 0, total: 0 };

function newPair() {
  const pair = MINIMAL_PAIRS[Math.floor(Math.random() * MINIMAL_PAIRS.length)];
  const shuffled = Math.random() < 0.5 ? pair : [pair[1], pair[0]];
  currentPair = { pair: shuffled, answer: shuffled[Math.random() < 0.5 ? 0 : 1] };
  const wrap = document.getElementById('pair-options');
  const meaningsWrap = document.getElementById('pair-meanings');
  if (!wrap) return;
  wrap.innerHTML = shuffled.map(item => `<button data-word="${escHtml(item.w)}" lang="de">${escHtml(item.w)}</button>`).join('');
  wrap.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => checkPair(btn, btn.dataset.word));
  });
  if (meaningsWrap) meaningsWrap.innerHTML = '';
}

function playCurrentPair() {
  if (!currentPair) newPair();
  playPhoneticsAudio(currentPair.answer.w, document.getElementById('pair-play-btn'));
}

function checkPair(btn, chosenWord) {
  const correct = chosenWord === currentPair.answer.w;
  pairScore.total++;
  if (correct) {
    pairScore.correct++;
    btn.classList.add('pair-correct');
  } else {
    btn.classList.add('pair-wrong');
    [...document.getElementById('pair-options').children].forEach(b => {
      if (b.textContent === currentPair.answer.w) b.classList.add('pair-correct');
    });
  }
  document.getElementById('pair-score').textContent = `امتیاز: ${pairScore.correct} از ${pairScore.total}`;
  const meaningsWrap = document.getElementById('pair-meanings');
  if (meaningsWrap) {
    meaningsWrap.innerHTML = currentPair.pair.map(item =>
      `<span><b class="font-ipa">${escHtml(item.w)}</b>: ${escHtml(item.fa)} · ${escHtml(item.en)}</span>`
    ).join('');
  }
  setTimeout(newPair, 1600);
}
if (document.getElementById('pair-options')) newPair();

let mediaRecorder, recChunks = [], recStream, isRecording = false;
let recAudio = null;

async function toggleRecording() {
  const btn = document.getElementById('rec-toggle-btn');
  const hint = document.getElementById('rec-hint');
  if (!isRecording) {
    try {
      recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      if (hint) hint.textContent = 'دسترسی به میکروفون رد شد یا در دسترس نیست.';
      return;
    }
    recChunks = [];
    mediaRecorder = new MediaRecorder(recStream);
    mediaRecorder.ondataavailable = e => recChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(recChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const playbackDiv = document.getElementById('rec-playback-wrap');
      playbackDiv.innerHTML =
        `<div class="text-muted" style="margin-bottom:0.5rem;font-size:0.8rem;">صدای ضبط‌شده‌ی شما:</div><audio id="rec-audio-player" controls src="${url}" style="width:100%"></audio>`;
      recAudio = document.getElementById('rec-audio-player');
      recAudio.addEventListener('ended', () => URL.revokeObjectURL(url));
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      recStream.getTracks().forEach(t => t.stop());
    };
    mediaRecorder.start();
    isRecording = true;
    btn.classList.add('recording');
    if (hint) hint.textContent = 'در حال ضبط… برای توقف دوباره بزن';
  } else {
    mediaRecorder.stop();
    isRecording = false;
    btn.classList.remove('recording');
    if (hint) hint.textContent = 'ضبط تمام شد. صدای نیتیو و صدای خودت را مقایسه کن.';
  }
}

const DEFAULT_RECORDER_WORDS = [
  { word: 'Hallo', fa: 'سلام' }, { word: 'Danke', fa: 'متشکرم' },
  { word: 'Bitte', fa: 'خواهش می‌کنم' }, { word: 'Tschüs', fa: 'خداحافظ' },
];

function populateRecorderSelect(filter) {
  const recSelect = document.getElementById('rec-word-select');
  if (!recSelect) return;
  const source = (APP_DATA && APP_DATA.vocabulary && APP_DATA.vocabulary.length)
    ? APP_DATA.vocabulary : DEFAULT_RECORDER_WORDS;
  const term = (filter || '').toLowerCase().trim();
  const words = (term
    ? source.filter(w => w.word.toLowerCase().includes(term) || (w.fa && w.fa.includes(term)) || (w.en && w.en.toLowerCase().includes(term)))
    : source
  ).slice(0, 200);
  const prevValue = recSelect.value;
  recSelect.innerHTML = words.length
    ? words.map(w => `<option value="${escHtml(w.word)}">${escHtml(w.word)}${w.fa ? ' — ' + escHtml(w.fa) : ''}</option>`).join('')
    : '<option value="">کلمه‌ای یافت نشد</option>';
  if (words.some(w => w.word === prevValue)) recSelect.value = prevValue;
}

const recWordSearch = document.getElementById('rec-word-search');
if (recWordSearch) recWordSearch.addEventListener('input', () => populateRecorderSelect(recWordSearch.value));
populateRecorderSelect();

document.addEventListener('play', function(e) {
  if (e.target.tagName === 'AUDIO' && e.target.id === 'rec-audio-player') {
    const nativeBtn = document.querySelector('#recorder .audio-btn');
    if (nativeBtn) {
      if (nativeBtn.classList.contains('playing-audio')) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        document.querySelectorAll('audio').forEach(a => a.pause());
        nativeBtn.classList.remove('playing-audio', 'playing-bg');
        const icon = nativeBtn.querySelector('.play-icon, .fa-volume-up');
        if (icon) icon.classList.remove('hidden');
        nativeBtn.querySelectorAll('.equalizer-bar').forEach(b => b.classList.add('hidden'));
      }
    }
  }
}, true);

document.addEventListener('click', function(e) {
  const btn = e.target.closest('.audio-btn:not(.learn-toggle)');
  if (btn && document.getElementById('rec-audio-player')) {
    const recAudioEl = document.getElementById('rec-audio-player');
    if (recAudioEl && !recAudioEl.paused) {
      recAudioEl.pause();
      recAudioEl.currentTime = 0;
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const checkboxes = document.querySelectorAll('.word-check');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('germanPhoneticsProgress')) || {}; } catch (e) {}
  checkboxes.forEach(cb => {
    const word = cb.getAttribute('data-word');
    if (saved[word]) cb.checked = true;
  });
  updatePhoneticsProgressUI();
});

function updatePhoneticsProgressUI() {
  const checkboxes = document.querySelectorAll('.word-check');
  let total = checkboxes.length;
  if (total === 0) return;
  let checked = document.querySelectorAll('.word-check:checked').length;
  let percentage = Math.round((checked / total) * 100);
  let savedState = {};
  checkboxes.forEach(cb => { savedState[cb.getAttribute('data-word')] = cb.checked; });
  try { localStorage.setItem('germanPhoneticsProgress', JSON.stringify(savedState)); } catch (e) {}
  if (percentage === 100 && checked > 0) {
    setTimeout(() => showToast('🎉 تبریک! شما تمام کلمات این مسترکلاس را مسلط شدید!'), 500);
  }
}

document.querySelectorAll('.word-check').forEach(cb => {
  cb.addEventListener('change', updatePhoneticsProgressUI);
});

const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (backToTopBtn) backToTopBtn.classList.toggle('hidden', window.scrollY <= window.innerHeight * 0.8);
});