"use strict";

// ============================================================
// CONFIGURATION – کاربر باید این آدرس را با Worker خود جایگزین کند
// این تنها جایی است که باید این مقدار را عوض کنید؛ script.js قبل از
// phonetics.js لود می‌شود و phonetics.js همین متغیر را به اشتراک می‌گذارد.
// ============================================================
const TTS_WORKER_URL = 'https://tts-proxy.YOUR-SUBDOMAIN.workers.dev/';
// مثال: const TTS_WORKER_URL = 'https://tts-proxy.mon-domain.workers.dev/';

// ============================================================
// GLOBALS
// ============================================================

let APP_DATA = null;
let learnedWords = new Set();
let vocabPage = 1;
const PAGE_SIZE = 20;
let currentVocab = [];
let flashCards = [];
let flashIndexValue = 0;
let searchTimeout = null;

// ============================================================
// DOM REFS
// ============================================================

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const vocabBody          = document.getElementById('vocabBody');
const vocabSearch        = document.getElementById('vocabSearch');
const vocabLevelFilter   = document.getElementById('vocabLevelFilter');
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

// ============================================================
// SPEECH (TTS)
// ============================================================

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
    } catch (_) { /* fallback to Web Speech API */ }

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

// ============================================================
// THEME
// ============================================================

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

// ============================================================
// NAVIGATION
// ============================================================

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

document.querySelectorAll('.nav-list a').forEach(a => {
    a.addEventListener('click', (e) => {
        const section = a.dataset.section;

        if (!section) {
            navList.classList.remove('open');
            return; 
        }

        e.preventDefault();
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(section);
        if (target) target.classList.add('active');
        document.querySelectorAll('.nav-list a').forEach(l => l.classList.remove('active'));
        a.classList.add('active');
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (section === 'vocabulary') filterVocab();
        if (section === 'grammar')    renderGrammar();
        if (section === 'levels')     renderLevels();
        if (section === 'flashcards') initFlashcards();
        if (section === 'progress')   updateProgress();
    });
});

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

// ============================================================
// LOAD DATA
// ============================================================

async function loadData() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error('Failed to load data.json');
        APP_DATA   = await res.json();
        currentVocab = APP_DATA.vocabulary || [];
        renderHome();
        renderLevels();
        renderVocab();
        renderGrammar();
        initFlashcards();
        updateProgress();
    } catch (err) {
        console.error('Error loading data:', err);
        document.querySelector('main').innerHTML = `
            <div style="text-align:center;padding:3rem;direction:rtl;">
                <h2 style="color:#d32f2f;">خطا در بارگذاری داده‌ها</h2>
                <p>لطفاً فایل data.json را در کنار این صفحه قرار دهید.</p>
                <p style="font-size:0.8rem;opacity:0.7;">${err.message}</p>
            </div>
        `;
    }
}

// ============================================================
// HOME
// ============================================================

function renderHome() {
    if (!APP_DATA) return;
    const features = [
        { icon: 'fa-graduation-cap', title: 'از A1 تا C1',      desc: 'مسیر گام‌به‌گام بر اساس استاندارد روز' },
        { icon: 'fa-volume-up',      title: 'تلفظ دقیق IPA',    desc: 'فونتیک استاندارد بین‌المللی' },
        { icon: 'fa-language',       title: 'ترجمهٔ دوزبانه',   desc: 'فارسی و انگلیسی برای هر کلمه' },
        { icon: 'fa-infinity',       title: 'واژگان جامع',      desc: 'پوشش کامل تمام سطوح یادگیری' },
        { icon: 'fa-headphones',     title: 'تلفظ صوتی',        desc: 'پشتیبانی از صوت کلمات و جملات' },
        { icon: 'fa-chart-simple',   title: 'پیگیری پیشرفت',    desc: 'آمار دقیق روند یادگیری شما' },
    ];
    homeFeatures.innerHTML = features.map(f => `
        <div class="feature">
            <i class="fas ${f.icon}" aria-hidden="true"></i>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
        </div>
    `).join('');
}

// ============================================================
// LEVELS
// ============================================================

function renderLevels() {
    if (!APP_DATA || !APP_DATA.levels) return;
    levelsGrid.innerHTML = APP_DATA.levels.map(l => `
        <div class="level-card">
            <div class="level" aria-label="سطح ${escHtml(l.label || l.id)}">${escHtml(l.label || l.id)}</div>
            <div class="level-desc">${escHtml(l.desc || '')}</div>
            <button class="btn-small" data-level="${escHtml(l.id)}"
                    aria-label="مشاهده واژگان سطح ${escHtml(l.label || l.id)}">مشاهده واژگان</button>
        </div>
    `).join('');

    levelsGrid.querySelectorAll('.btn-small').forEach(btn => {
        btn.addEventListener('click', () => {
            vocabLevelFilter.value = btn.dataset.level;
            filterVocab();

            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById('vocabulary').classList.add('active');
            document.querySelectorAll('.nav-list a').forEach(l => l.classList.remove('active'));
            const navLink = document.querySelector(`.nav-list a[data-section="vocabulary"]`);
            if (navLink) navLink.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ============================================================
// VOCABULARY
// ============================================================

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
    currentVocab = (APP_DATA.vocabulary || []).filter(w => {
        const matchSearch = w.word.toLowerCase().includes(search) ||
                            (w.fa && w.fa.includes(search)) ||
                            (w.en && w.en.toLowerCase().includes(search));
        const matchLevel  = level === 'all' || w.level === level;
        return matchSearch && matchLevel;
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
            <td><strong>${escHtml(w.word)}</strong></td>
            <td class="ipa" dir="ltr">${escHtml(w.ipa || '')}</td>
            <td>${escHtml(w.fa || '')}</td>
            <td dir="ltr">${escHtml(w.en || '')}</td>
            <td><span class="level-badge">${escHtml(w.level || '')}</span></td>
            <td class="vocab-actions">
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

    // دکمه‌های پخش صدا
    vocabBody.querySelectorAll('.audio-btn:not(.learn-toggle)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            speakGerman(btn.dataset.word);
        });
    });

    // دکمه‌های یادگیری
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
vocabRandomBtn.addEventListener('click', () => {
    if (!APP_DATA || !APP_DATA.vocabulary || APP_DATA.vocabulary.length === 0) return;
    const random = APP_DATA.vocabulary[Math.floor(Math.random() * APP_DATA.vocabulary.length)];
    vocabSearch.value = random.word;
    filterVocab();
});

// ============================================================
// GRAMMAR
// ============================================================

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

// ============================================================
// FLASHCARDS
// ============================================================

function initFlashcards() {
    if (!APP_DATA || !APP_DATA.vocabulary) return;
    const level = flashcardLevelFilter.value;
    let pool = level === 'all' ? APP_DATA.vocabulary : APP_DATA.vocabulary.filter(w => w.level === level);
    if (pool.length === 0) pool = APP_DATA.vocabulary;
    flashCards = [...pool];
    flashIndexValue = 0;
    flashcardCount.textContent = flashCards.length + ' کلمه';
    showFlashcard();
}

function showFlashcard() {
    if (flashCards.length === 0) return;
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

    // اتصال دکمه‌های پخش صدا در front و back
    attachSpeaker(flashFront);
    if (flashBack) attachSpeaker(flashBack);
}

flipBtn.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
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

// ============================================================
// PROGRESS
// ============================================================

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

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
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

// ============================================================
// INIT
// ============================================================

loadProgress();
loadData();

window.speakGerman = speakGerman;
window.playAudio   = speakGerman;
