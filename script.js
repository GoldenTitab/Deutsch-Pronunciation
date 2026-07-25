"use strict";


const TTS_WORKER_URL = 'https://tts-proxy.YOUR-SUBDOMAIN.workers.dev/';


let APP_DATA = null;
let learnedWords = new Set();
let vocabPage = 1;
const PAGE_SIZE = 20;
let currentVocab = [];
let flashCards = [];
let flashIndexValue = 0;
let searchTimeout = null;


const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const vocabBody          = document.getElementById('vocabBody');
const vocabSearch        = document.getElementById('vocabSearch');
const vocabLevelFilter   = document.getElementById('vocabLevelFilter');
const vocabCategoryFilter = document.getElementById('vocabCategoryFilter');
const vocabPagination    = document.getElementById('vocabPagination');
const vocabRandomBtn     = document.getElementById('vocabRandomBtn');
const grammarGrid        = document.getElementById('grammarGrid');
const grammarLevelFilter = document.getElementById('grammarLevelFilter');
const levelsGrid         = document.getElementById('levelsGrid');
const flashcardLevelFilter = document.getElementById('flashcardLevelFilter');
const flashcardCount     = document.getElementById('flashcardCount');
const flashcardShuffle   = document.getElementById('flashcardShuffle');
const flashcard          = document.getElementById('flashcard');
const flashFront         = document.getElementById('flashFront');
const flashBack          = document.getElementById('flashBack');  
const flashFa            = document.getElementById('flashFa');
const flashEn            = document.getElementById('flashEn');
const flashLevel         = document.getElementById('flashLevel');
const flipBtn            = document.getElementById('flipBtn');
const flashPrev          = document.getElementById('flashPrev');
const flashNext          = document.getElementById('flashNext');
const flashIndex         = document.getElementById('flashIndex');
const progressFill       = document.getElementById('progressFill');
const statWords          = document.getElementById('statWords');
const statTotal          = document.getElementById('statTotal');
const statPercent        = document.getElementById('statPercent');
const progressLevelsDiv  = document.getElementById('progressLevels');
const resetProgressBtn   = document.getElementById('resetProgressBtn');
const themeToggle        = document.getElementById('themeToggle');
const navToggle          = document.getElementById('navToggle');
const navList            = document.getElementById('navList');
const homeFeatures       = document.getElementById('homeFeatures');
const verbSearch         = document.getElementById('verbSearch');
const verbLevelFilter    = document.getElementById('verbLevelFilter');
const verbGrid           = document.getElementById('verbGrid');
const casesContent       = document.getElementById('casesContent');
const quizLevelFilter    = document.getElementById('quizLevelFilter');
const quizStartBtn       = document.getElementById('quizStartBtn');
const quizArea           = document.getElementById('quizArea');
const globalSearchForm   = document.getElementById('globalSearchForm');
const globalSearchInput  = document.getElementById('globalSearchInput');
const readingLevelFilter = document.getElementById('readingLevelFilter');
const readingContent     = document.getElementById('readingContent');
const verbExerciseBtn    = document.getElementById('verbExerciseBtn');
const verbExerciseArea   = document.getElementById('verbExerciseArea');
const caseExerciseBtn    = document.getElementById('caseExerciseBtn');
const caseExerciseArea   = document.getElementById('caseExerciseArea');
const flashcardDueToggle = document.getElementById('flashcardDueToggle');
const flashRateRow       = document.getElementById('flashRateRow');
const progressRing       = document.getElementById('progressRing');
const progressRingText   = document.getElementById('progressRingText');
const ariaLiveRegion     = document.getElementById('ariaLiveRegion');

async function speakGerman(text) {
    if (!text) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const workerUrl = `${TTS_WORKER_URL}?word=${encodeURIComponent(text)}`;
        const response = await fetch(workerUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            await new Promise((resolve, reject) => {
                audio.onended = resolve;
                audio.onerror = reject;
                audio.play().catch(reject);
            });
            URL.revokeObjectURL(audioUrl);
            return;
        }
    } catch (_) {}

    return new Promise((resolve) => {
        if (!window.speechSynthesis) { resolve(); return; }
        const utterance = new SpeechSynthesisUtterance(String(text));
        const voices = window.speechSynthesis.getVoices();
        const deVoice = voices.find(v => v.lang.startsWith('de'));
        if (deVoice) utterance.voice = deVoice;
        utterance.lang  = 'de-DE';
        utterance.rate  = 0.9;
        utterance.pitch = 1.0;
        utterance.onend   = resolve;
        utterance.onerror = resolve;
        window.speechSynthesis.speak(utterance);
    });
}

function attachSpeaker(container) {
    container.querySelectorAll('.audio-btn').forEach(btn => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = clone.dataset.word;
            if (word) speakGerman(word);
        });
    });
}


function loadTheme() {
    const dark = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark', dark);
    themeToggle.innerHTML = dark ? '<i class="fas fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    themeToggle.setAttribute('aria-label', dark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک');
}

themeToggle.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    themeToggle.innerHTML = dark ? '<i class="fas fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    themeToggle.setAttribute('aria-label', dark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک');
});

loadTheme();


navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (e) => {
    if (!navList.contains(e.target) && !navToggle.contains(e.target)) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }
});

const SECTION_LABELS = {
    home: 'خانه', vocabulary: 'واژگان', grammar: 'گرامر', conjugation: 'صرف افعال',
    cases: 'حالت‌های دستوری', levels: 'سطوح', quiz: 'آزمون سطح', reading: 'متن‌خوانی',
    flashcards: 'فلش‌کارت', progress: 'پیشرفت من', phonetics: 'مسترکلاس فونتیک'
};

function runSectionInit(section) {
    if (section === 'vocabulary') filterVocab();
    if (section === 'grammar')    { renderGrammar(); renderCultureNotes(); }
    if (section === 'conjugation') renderVerbs();
    if (section === 'cases')     renderCases();
    if (section === 'reading')   renderReading();
    if (section === 'levels')     renderLevels();
    if (section === 'flashcards') initFlashcards();
    if (section === 'progress')   updateProgress();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (opts.updateHash !== false && location.hash.slice(1) !== id) {
        history.pushState(null, '', '#' + id);
    }
    if (ariaLiveRegion) ariaLiveRegion.textContent = 'بخش ' + (SECTION_LABELS[id] || id) + ' نمایش داده شد';
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', function clearTabindex() {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', clearTabindex);
    }, { once: true });

    runSectionInit(id);
}

function goToSection(id) {
    activateSection(id);
}

document.querySelectorAll('.nav-list a').forEach(a => {
    a.addEventListener('click', (e) => {
        const section = a.dataset.section;
        if (!section) {
            navList.classList.remove('open');
            return;
        }
        e.preventDefault();
        activateSection(section);
    });
});

window.addEventListener('popstate', () => {
    const id = location.hash.slice(1);
    if (id && document.getElementById(id)) activateSection(id, { updateHash: false });
});

function initFromHash() {
    const id = location.hash.slice(1);
    if (id && document.getElementById(id) && id !== 'home') {
        activateSection(id, { updateHash: false });
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }
    const flashSection = document.getElementById('flashcards');
    if (flashSection && flashSection.classList.contains('active')) {
        if (e.key === 'ArrowRight') flashPrev.click();
        if (e.key === 'ArrowLeft')  flashNext.click();
        if (e.key === ' ' || e.key === 'Enter') {
            if (document.activeElement === document.body || document.activeElement === flashcard) {
                e.preventDefault();
                flipBtn.click();
            }
        }
    }
});


globalSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = globalSearchInput.value.trim();
    if (!term || !APP_DATA) return;
    const lower = term.toLowerCase();
    const isVerb = (APP_DATA.verbs || []).some(v => v.infinitive.toLowerCase().includes(lower));
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
    setTimeout(() => wrap.remove(), 3200);
}


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
        renderHome();
        renderLevels();
        renderVocab();
        renderGrammar();
        renderCultureNotes();
        renderVerbs();
        renderCases();
        renderReading();
        initFlashcards();
        updateProgress();
        initFromHash();
    } catch (err) {
        console.error('Error loading data:', err);
        document.querySelector('main').innerHTML = `
            <div style="text-align:center;padding:3rem;direction:rtl;">
                <h2 style="color:#d32f2f;">خطا در بارگذاری داده‌ها</h2>
                <p>لطفاً پوشه‌ی data را در کنار این صفحه قرار دهید.</p>
                <p style="font-size:0.8rem;opacity:0.7;">${err.message}</p>
            </div>
        `;
    } finally {
        const overlay = document.getElementById('appLoadingOverlay');
        if (overlay) overlay.classList.add('hidden');
    }
}

function renderHome() {
    if (!APP_DATA) return;
    const features = [
        { icon: 'fa-graduation-cap', title: 'از A0 تا C1',      desc: 'مسیر گام‌به‌گام از الفبا تا سطح پیشرفته' },
        { icon: 'fa-volume-up',      title: 'تلفظ دقیق IPA',    desc: 'فونتیک استاندارد بین‌المللی' },
        { icon: 'fa-language',       title: 'ترجمهٔ دوزبانه',   desc: 'فارسی و انگلیسی برای هر کلمه' },
        { icon: 'fa-diagram-project',title: 'صرف افعال و حالت‌های دستوری', desc: 'مرجع کامل Konjugation و Kasus' },
        { icon: 'fa-headphones',     title: 'تلفظ صوتی و مسترکلاس فونتیک', desc: 'آنالیزور، جفت‌های کمینه و ضبط صدا' },
        { icon: 'fa-list-check',     title: 'آزمون سطح و پیگیری پیشرفت', desc: 'قبل از سطح بعد، دانشت را بسنج' },
    ];
    homeFeatures.innerHTML = features.map(f => `
        <div class="feature">
            <i class="fas ${f.icon}" aria-hidden="true"></i>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
        </div>
    `).join('');

    const path = [
        { section: 'vocabulary', label: '۱. الفبا و اعداد را در بخش واژگان (سطح A0) مرور کن' },
        { section: 'vocabulary',  label: '۲. واژگان سطح فعلی‌ات را در بخش واژگان تمرین کن' },
        { section: 'grammar',     label: '۳. قواعد گرامری هم‌سطح را در بخش گرامر بخوان' },
        { section: 'cases',       label: '۴. حالت‌های دستوری (der/die/das و حروف اضافه) را مرور کن' },
        { section: 'flashcards',  label: '۵. با فلش‌کارت واژگان را مرور و تثبیت کن' },
        { section: 'quiz',        label: '۶. با آزمون سطح، آمادگی رفتن به سطح بعد را بسنج' },
    ];
    const pathHtml = `
        <div class="progress-levels" style="margin-top:2rem;">
            <h3 style="margin-bottom:0.5rem;">مسیر یادگیری پیشنهادی</h3>
            ${path.map(p => `<button class="btn-secondary home-path-btn" data-goto="${p.section}" style="text-align:right;justify-content:flex-start;">${p.label}</button>`).join('')}
        </div>
    `;
    homeFeatures.insertAdjacentHTML('afterend', pathHtml);
    document.querySelectorAll('.home-path-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const navLink = document.querySelector(`.nav-list a[data-section="${btn.dataset.goto}"]`);
            if (navLink) navLink.click();
        });
    });
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
            <div class="level" aria-label="سطح ${escHtml(l.label || l.id)}"><i class="fas ${LEVEL_ICONS[l.id] || 'fa-graduation-cap'}" aria-hidden="true"></i> ${escHtml(l.label || l.id)}</div>
            <div class="level-desc">${escHtml(l.desc || '')}</div>
            ${getQuizReadyBadge(l.id)}
            <button class="btn-small" data-level="${escHtml(l.id)}"
                    aria-label="مشاهده واژگان سطح ${escHtml(l.label || l.id)}">مشاهده واژگان</button>
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


function escHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function filterVocab() {
    if (!APP_DATA) return;
    const search = vocabSearch.value.toLowerCase().trim();
    const level  = vocabLevelFilter.value;
    const category = vocabCategoryFilter.value;
    currentVocab = (APP_DATA.vocabulary || []).filter(w => {
        const matchSearch = w.word.toLowerCase().includes(search) ||
                            (w.fa && w.fa.includes(search)) ||
                            (w.en && w.en.toLowerCase().includes(search));
        const matchLevel  = level === 'all' || w.level === level;
        const matchCategory = category === 'all' || w.category === category;
        return matchSearch && matchLevel && matchCategory;
    });
    vocabPage = 1;
    renderVocab();
}

function renderVocab() {
    if (!APP_DATA) return;
    const start = (vocabPage - 1) * PAGE_SIZE;
    const page  = currentVocab.slice(start, start + PAGE_SIZE);

    if (page.length === 0) {
        vocabBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;opacity:0.6;">کلمه‌ای یافت نشد</td></tr>`;
        vocabPagination.innerHTML = '';
        return;
    }

    vocabBody.innerHTML = page.map(w => {
        const isLearned = learnedWords.has(w.word);
        return `
        <tr data-word="${escHtml(w.word)}">
            <td data-label="کلمه"><strong>${escHtml(w.word)}</strong></td>
            <td class="ipa" data-label="تلفظ" dir="ltr">${escHtml(w.ipa || '')}</td>
            <td data-label="فارسی">${escHtml(w.fa || '')}</td>
            <td data-label="English" dir="ltr">${escHtml(w.en || '')}</td>
            <td data-label="سطح"><span class="level-badge">${escHtml(w.level || '')}</span>${w.category ? ` <span class="level-badge category-badge">${escHtml(w.category)}</span>` : ''}</td>
            <td class="vocab-actions" data-label="عملیات">
                <button class="audio-btn" data-word="${escHtml(w.word)}"
                        aria-label="پخش تلفظ ${escHtml(w.word)}">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
                <button class="audio-btn learn-toggle ${isLearned ? 'learned' : ''}"
                        data-word="${escHtml(w.word)}"
                        aria-label="${isLearned ? 'حذف از یادگرفته‌ها' : 'علامت‌گذاری به‌عنوان یادگرفته'}"
                        aria-pressed="${isLearned}">
                    <i class="fas ${isLearned ? 'fa-check-circle' : 'fa-circle'}" aria-hidden="true"></i>
                </button>
            </td>
        </tr>`;
    }).join('');

    vocabBody.querySelectorAll('.audio-btn:not(.learn-toggle)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            speakGerman(btn.dataset.word);
        });
    });

    vocabBody.querySelectorAll('.learn-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = btn.dataset.word;
            if (!word) return;
            if (learnedWords.has(word)) {
                learnedWords.delete(word);
                btn.classList.remove('learned');
                btn.querySelector('i').className = 'fas fa-circle';
                btn.setAttribute('aria-pressed', 'false');
                btn.setAttribute('aria-label', 'علامت‌گذاری به‌عنوان یادگرفته');
            } else {
                learnedWords.add(word);
                btn.classList.add('learned');
                btn.querySelector('i').className = 'fas fa-check-circle';
                btn.setAttribute('aria-pressed', 'true');
                btn.setAttribute('aria-label', 'حذف از یادگرفته‌ها');
            }
            saveProgress();
            updateProgressBar();
        });
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(currentVocab.length / PAGE_SIZE) || 1;
    vocabPagination.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
    prevBtn.setAttribute('aria-label', 'صفحه قبل');
    prevBtn.disabled = vocabPage === 1;
    prevBtn.addEventListener('click', () => { if (vocabPage > 1) { vocabPage--; renderVocab(); } });
    vocabPagination.appendChild(prevBtn);

    const maxVisible = 5;
    let startPage = Math.max(1, vocabPage - Math.floor(maxVisible / 2));
    let endPage   = Math.min(totalPages, startPage + maxVisible - 1);
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
    nextBtn.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
    nextBtn.setAttribute('aria-label', 'صفحه بعد');
    nextBtn.disabled = vocabPage === totalPages;
    nextBtn.addEventListener('click', () => { if (vocabPage < totalPages) { vocabPage++; renderVocab(); } });
    vocabPagination.appendChild(nextBtn);
}

vocabSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterVocab, 250);
});

vocabLevelFilter.addEventListener('change', filterVocab);
vocabCategoryFilter.addEventListener('change', filterVocab);
vocabRandomBtn.addEventListener('click', () => {
    if (!APP_DATA || !APP_DATA.vocabulary || APP_DATA.vocabulary.length === 0) return;
    const random = APP_DATA.vocabulary[Math.floor(Math.random() * APP_DATA.vocabulary.length)];
    vocabSearch.value = random.word;
    filterVocab();
});


function renderGrammar() {
    if (!APP_DATA || !APP_DATA.grammar) return;
    const level    = grammarLevelFilter.value;
    const filtered = level === 'all' ? APP_DATA.grammar : APP_DATA.grammar.filter(g => g.level === level);

    if (filtered.length === 0) {
        grammarGrid.innerHTML = '<p style="opacity:0.6;text-align:center;padding:2rem;">درسی برای این سطح یافت نشد</p>';
        return;
    }

    grammarGrid.innerHTML = filtered.map(g => {
        let extraContent = '';
        if (g.description) {
            extraContent += `<div class="grammar-desc">${escHtml(g.description)}</div>`;
        }
        if (g.examples && Array.isArray(g.examples)) {
            extraContent += g.examples.map(ex => `
                <div class="example" dir="ltr">
                    <span>${escHtml(ex)}</span>
                    <button class="audio-btn" data-word="${escHtml(ex)}" aria-label="پخش تلفظ جمله">
                        <i class="fas fa-volume-up" aria-hidden="true"></i>
                    </button>
                </div>
            `).join('');
        } else if (g.example) {
            extraContent += `
                <div class="example" dir="ltr">
                    <span>${escHtml(g.example)}</span>
                    <button class="audio-btn" data-word="${escHtml(g.example)}" aria-label="پخش تلفظ جمله">
                        <i class="fas fa-volume-up" aria-hidden="true"></i>
                    </button>
                </div>
            `;
        }

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
    const notes = level === 'all'
        ? APP_DATA.cultureNotes
        : APP_DATA.cultureNotes.filter(n => n.level === level);

    if (wrap) wrap.style.display = notes.length ? '' : 'none';

    grid.innerHTML = notes.map(n => `
        <div class="grammar-card">
            <div class="title">${escHtml(n.title || '')}</div>
            <span class="level-tag">${escHtml(n.level || '')}</span>
            <div class="example" dir="ltr">
                <span>${escHtml(n.text || '')}</span>
                ${n.text ? `<button class="audio-btn" data-word="${escHtml(n.text)}" aria-label="پخش تلفظ متن"><i class="fas fa-volume-up" aria-hidden="true"></i></button>` : ''}
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

    verbGrid.innerHTML = list.map(v => `
        <div class="grammar-card">
            <div class="title" dir="ltr">${escHtml(v.infinitive)}
                <button class="audio-btn" data-word="${escHtml(v.infinitive)}" aria-label="پخش تلفظ ${escHtml(v.infinitive)}">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
            </div>
            <span class="level-tag">${escHtml(v.level || '')}</span>
            <span class="level-tag">${escHtml(v.type || '')}</span>${v.separable ? ' <span class="level-tag" style="background-color:rgba(16,185,129,0.15);color:var(--accent-color);">فعل جدایی‌پذیر (پیشوند: ' + escHtml(v.prefix || '') + ')</span>' : ''}
            <div class="grammar-desc">🇮🇷 ${escHtml(v.fa || '')} &nbsp;·&nbsp; 🇬🇧 ${escHtml(v.en || '')}</div>
            <table class="verb-table">
                <tr><th class="pronoun"></th><th>حال (Präsens)</th>${v.praeteritum ? '<th>گذشته‌ی ساده (Präteritum)</th>' : ''}</tr>
                ${Object.keys(PRONOUN_LABELS).map(p => `
                    <tr>
                        <td class="pronoun">${PRONOUN_LABELS[p]}</td>
                        <td dir="ltr">${escHtml(v.present[p] || '')}</td>
                        ${v.praeteritum ? `<td dir="ltr">${escHtml(v.praeteritum[p] || '')}</td>` : ''}
                    </tr>
                `).join('')}
            </table>
            <div class="trans" style="margin-top:0.5rem;" dir="ltr">Perfekt: ${escHtml(v.auxiliary)} ... ${escHtml(v.partizip)}</div>
        </div>
    `).join('');

    attachSpeaker(verbGrid);
}

verbSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderVerbs, 200);
});
verbLevelFilter.addEventListener('change', renderVerbs);


function runExercise(container, questions, onFinish) {
    let idx = 0, score = 0;
    function renderQ() {
        if (idx >= questions.length) { onFinish(score, questions.length); return; }
        const q = questions[idx];
        container.innerHTML = `
            <div class="table-container" style="padding:1.5rem;margin-bottom:1rem;">
                <p style="color:var(--text-muted);margin-bottom:0.5rem;">سوال ${idx + 1} از ${questions.length} &nbsp;·&nbsp; امتیاز: ${score}</p>
                <p style="font-size:1.1rem;margin-bottom:1rem;" dir="ltr">${q.prompt}</p>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
                    ${q.options.map(o => `<button class="btn-secondary exercise-option" data-value="${escHtml(o)}" style="text-align:right;" dir="ltr">${escHtml(o)}</button>`).join('')}
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
    const pool = shuffleArr(APP_DATA.verbs).slice(0, Math.min(8, APP_DATA.verbs.length));
    const questions = pool.map(v => {
        const pronoun = shuffleArr(Object.keys(PRONOUN_LABELS))[0];
        const useTense = (v.praeteritum && Math.random() < 0.35) ? 'praeteritum' : 'present';
        const tenseLabel = useTense === 'praeteritum' ? ' — گذشته‌ی ساده' : '';
        const forms = v[useTense];
        const answer = forms[pronoun];
        const distractors = shuffleArr(Object.values(forms).filter(f => f !== answer)).slice(0, 3);
        return {
            prompt: `${PRONOUN_LABELS[pronoun]} ___ (${v.infinitive} — ${v.fa}${tenseLabel})`,
            answer,
            options: shuffleArr([answer, ...distractors])
        };
    });
    runExercise(verbExerciseArea, questions, (score, total) => showExerciseResult(verbExerciseArea, score, total, startVerbExercise));
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
                        <tr><td><strong>${kase}</strong></td>${Object.keys(rows[kase]).map(g => `<td dir="ltr">${escHtml(rows[kase][g])}</td>`).join('')}</tr>
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
                    ${c.pronouns.map(p => `<tr><td dir="ltr">${escHtml(p.person)}</td><td dir="ltr">${escHtml(p.akkusativ)}</td><td dir="ltr">${escHtml(p.dativ)}</td></tr>`).join('')}
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
                    <div class="grammar-desc" dir="ltr">${c.prepositions[kase].join(' · ')}</div>
                </div>
            `).join('')}
        </div>
    `;

    casesContent.innerHTML =
        articleTable('حرف تعریف معین (der/die/das)', c.articles_definite) +
        articleTable('حرف تعریف نامعین (ein/eine)', c.articles_indefinite) +
        pronounTable +
        prepCards;
}

function renderReading() {
    if (!APP_DATA || !APP_DATA.readings) return;
    const level = readingLevelFilter.value;
    const passage = APP_DATA.readings.find(r => r.level === level) || APP_DATA.readings[0];
    if (!passage) return;

    readingContent.innerHTML = `
        <div class="table-container" style="padding:1.5rem;margin-bottom:1.5rem;">
            <h3>${escHtml(passage.title)}</h3>
            <p dir="ltr" style="line-height:2;font-size:1.1rem;margin:1rem 0;">${escHtml(passage.text)}
                <button class="audio-btn" data-word="${escHtml(passage.text)}" aria-label="پخش تلفظ متن">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
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
function setMainCardState(word, state) { const d = loadMainSR(); d[word] = state; saveMainSR(d); }

function initFlashcards() {
    if (!APP_DATA || !APP_DATA.vocabulary) return;
    const level = flashcardLevelFilter.value;
    let pool = level === 'all' ? APP_DATA.vocabulary : APP_DATA.vocabulary.filter(w => w.level === level);
    if (pool.length === 0) pool = APP_DATA.vocabulary;
    if (flashDueOnly) {
        const sr = loadMainSR();
        const now = Date.now();
        const due = pool.filter(w => !sr[w.word] || sr[w.word].due <= now);
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
        <div class="flashcard-word">${escHtml(w.word)}</div>
        <div class="flashcard-ipa" dir="ltr">${escHtml(w.ipa || '')}</div>
        <button class="audio-btn" data-word="${escHtml(w.word)}"
                aria-label="پخش تلفظ ${escHtml(w.word)}">
            <i class="fas fa-volume-up" aria-hidden="true"></i> گوش کن
        </button>
    `;

    if (flashFa)    flashFa.textContent    = w.fa || '';
    if (flashEn)    flashEn.textContent    = w.en || '';
    if (flashLevel) flashLevel.textContent = w.level || '';

    flashIndex.textContent = `${flashIndexValue + 1} از ${flashCards.length}`;
    flashcard.classList.remove('flipped');
    flashcard.setAttribute('aria-label', `کارت ${flashIndexValue + 1} از ${flashCards.length}: ${w.word}`);
    flashRateRow.style.display = 'none';

    // اتصال دکمه‌های پخش صدا در front و back
    attachSpeaker(flashFront);
    if (flashBack) attachSpeaker(flashBack);
}

flipBtn.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
    if (flashcard.classList.contains('flipped')) flashRateRow.style.display = 'flex';
});

flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
    if (flashcard.classList.contains('flipped')) flashRateRow.style.display = 'flex';
});

flashPrev.addEventListener('click', () => {
    if (flashIndexValue > 0) { flashIndexValue--; showFlashcard(); }
});
flashNext.addEventListener('click', () => {
    if (flashIndexValue < flashCards.length - 1) { flashIndexValue++; showFlashcard(); }
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
        const word = flashCards[flashIndexValue] && flashCards[flashIndexValue].word;
        if (!word) return;
        const quality = parseInt(btn.dataset.quality, 10);
        const st = getMainCardState(word);
        let { interval, ease, reps } = st;
        if (quality === 0) { reps = 0; interval = 0; }
        else {
            reps++;
            ease = Math.max(1.3, ease + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)));
            interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease) || 1;
        }
        const due = quality === 0 ? Date.now() - 1 : Date.now() + interval * 24 * 60 * 60 * 1000;
        setMainCardState(word, { interval, ease, due, reps });
        if (flashIndexValue < flashCards.length - 1) { flashIndexValue++; showFlashcard(); }
        else { flashIndexValue = 0; initFlashcards(); }
    });
});


let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;

function shuffleArr(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildQuiz() {
    const level = quizLevelFilter.value;
    const vocabPool = level === 'all' ? (APP_DATA.vocabulary || []) : (APP_DATA.vocabulary || []).filter(w => w.level === level);
    if (vocabPool.length < 4) {
        quizArea.innerHTML = '<p style="opacity:0.6;text-align:center;padding:2rem;">برای این سطح واژگان کافی برای آزمون وجود ندارد</p>';
        return;
    }

    // Vocabulary questions (meaning of a word)
    const vocabWords = shuffleArr(vocabPool).slice(0, Math.min(6, vocabPool.length));
    const vocabQuestions = vocabWords.map(w => {
        const distractors = shuffleArr(vocabPool.filter(x => x.word !== w.word)).slice(0, 3).map(x => x.fa);
        return {
            type: 'vocab', word: w.word, ipa: w.ipa,
            promptLabel: 'معنی فارسی این کلمه چیست؟',
            answer: w.fa, options: shuffleArr([w.fa, ...distractors])
        };
    });

    // Verb conjugation questions, scoped to verbs at or below the chosen level
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
                answer, options: shuffleArr([answer, ...distractors])
            };
        });
    }

    // Article/case question, skipped for the absolute-beginner A0 level
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
            answer, options: shuffleArr([answer, ...distractors])
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
        return;
    }
    const q = quizQuestions[quizIndex];
    const isVocab = q.type === 'vocab';
    quizArea.innerHTML = `
        <div class="table-container" style="padding:1.5rem;">
            <p style="color:var(--text-muted);margin-bottom:0.5rem;">سوال ${quizIndex + 1} از ${quizQuestions.length} &nbsp;·&nbsp; امتیاز: ${quizScore}</p>
            ${isVocab ? `
                <div class="flashcard-word" dir="ltr" style="margin-bottom:0.25rem;">${escHtml(q.word)}
                    <button class="audio-btn" data-word="${escHtml(q.word)}" aria-label="پخش تلفظ"><i class="fas fa-volume-up" aria-hidden="true"></i></button>
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
            setTimeout(() => { quizIndex++; renderQuizQuestion(); }, 700);
        });
    });
}

quizStartBtn.addEventListener('click', buildQuiz);


function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem('germanLearned') || '[]');
        learnedWords = new Set(saved);
    } catch { learnedWords = new Set(); }
}

function saveProgress() {
    localStorage.setItem('germanLearned', JSON.stringify([...learnedWords]));
}

function updateProgressBar() {
    if (!APP_DATA || !APP_DATA.vocabulary) return;
    const total   = APP_DATA.vocabulary.length;
    const learned = learnedWords.size;
    const pct     = total > 0 ? Math.round((learned / total) * 100) : 0;
    if (progressFill) progressFill.style.width = pct + '%';
}

function updateProgress() {
    if (!APP_DATA || !APP_DATA.vocabulary) return;
    const total   = APP_DATA.vocabulary.length;
    const learned = learnedWords.size;
    const pct     = total > 0 ? Math.round((learned / total) * 100) : 0;

    if (statWords)   statWords.textContent   = learned;
    if (statTotal)   statTotal.textContent   = total;
    if (statPercent) statPercent.textContent = pct + '%';
    updateProgressBar();

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
        const totalLvl   = APP_DATA.vocabulary.filter(w => w.level === lvl).length;
        const learnedLvl = APP_DATA.vocabulary.filter(w => w.level === lvl && learnedWords.has(w.word)).length;
        const pctLvl     = totalLvl > 0 ? Math.round((learnedLvl / totalLvl) * 100) : 0;
        return `
            <div class="progress-level-item">
                <span class="label">${lvl}</span>
                <div class="bar"
                     role="progressbar"
                     aria-valuenow="${pctLvl}"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     aria-label="${lvl}: ${pctLvl}٪">
                    <div class="fill" style="width:${pctLvl}%"></div>
                </div>
                <span class="pct">${pctLvl}٪ (${learnedLvl}/${totalLvl})</span>
                <button class="btn-small" data-level="${lvl}"
                        aria-label="تمرین واژگان سطح ${lvl}">تمرین</button>
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

resetProgressBtn.addEventListener('click', () => {
    if (confirm('همهٔ پیشرفت پاک می‌شود. ادامه می‌دهی؟')) {
        learnedWords.clear();
        saveProgress();
        updateProgress();
        renderVocab();
    }
});


loadProgress();
loadData();

window.speakGerman = speakGerman;
window.playAudio   = speakGerman;
