
        function showToast(message) {
            const toast = document.getElementById('ui-toast');
            document.getElementById('toast-message').innerText = message;
            toast.classList.remove('opacity-0', 'pointer-events-none');
            toast.classList.add('opacity-100');
            setTimeout(() => {
                toast.classList.remove('opacity-100');
                toast.classList.add('opacity-0', 'pointer-events-none');
            }, 3000);
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
                const workerUrl = `${TTS_WORKER_URL}?word=${encodeURIComponent(word)}`;
                const response = await fetch(workerUrl);
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
                    resetBtn();
                    return;
                }
            } catch (e) { /* fallback */ }

            try {
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=de&client=tw-ob&q=${encodeURIComponent(word)}`;
                const audio = new Audio(url);
                await new Promise((resolve, reject) => {
                    audio.onended = resolve;
                    audio.onerror = reject;
                    audio.play().catch(reject);
                });
                resetBtn();
                return;
            } catch (e) { /* fallback to device TTS */ }

            try {
                if (!window.speechSynthesis) throw new Error('No speechSynthesis');
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(word);
                let voices = window.speechSynthesis.getVoices();
                let germanVoices = voices.filter(v => v.lang === 'de-DE' || v.lang === 'de_DE' || v.lang.toLowerCase().startsWith('de'));
                if (germanVoices.length > 0) {
                    utterance.voice = germanVoices[0];
                    utterance.lang = germanVoices[0].lang;
                } else {
                    utterance.lang = 'de-DE';
                    const banner = document.getElementById('no-german-voice-banner');
                    if (banner) banner.classList.remove('hidden');
                }
                utterance.rate = 0.85;
                utterance.pitch = 1.0;
                await new Promise((resolve, reject) => {
                    utterance.onend = resolve;
                    utterance.onerror = reject;
                    window.speechSynthesis.speak(utterance);
                });
                resetBtn();
            } catch (e) {
                showToast("پخش صدا با هیچ منبعی ممکن نشد. اتصال اینترنت را بررسی کن.");
                resetBtn();
            }
        }

        const phoneticsRules = [
            { regex: /tsch/gi, class: 'text-purple-400', classBg: 'bg-purple-100', hint: '<strong>tsch</strong>: صدای ترکیبی "چ"' },
            { regex: /sch/gi, class: 'text-pink-400', classBg: 'bg-pink-100', hint: '<strong>sch</strong>: صدای "ش"' },
            { regex: /chs/gi, class: 'text-amber-400', classBg: 'bg-amber-100', hint: '<strong>chs</strong>: صدای ترکیبی "کْس"' },
            { regex: /tion\b/gi, class: 'text-indigo-400', classBg: 'bg-indigo-100', hint: '<strong>tion</strong>: صدای "تسیون"' },
            { regex: /ig\b/gi, class: 'text-teal-400', classBg: 'bg-teal-100', hint: '<strong>ig</strong>: صدای "یش نرم"' },
            { regex: /er/gi, class: 'text-orange-500', classBg: 'bg-orange-100', hint: '<strong>er</strong>: صدای "آ/اَ کوتاه"' },
            { regex: /ei/gi, class: 'text-yellow-500', classBg: 'bg-yellow-100', hint: '<strong>ei</strong>: صدای "آی"' },
            { regex: /ie/gi, class: 'text-blue-400', classBg: 'bg-blue-100', hint: '<strong>ie</strong>: صدای "ای کشیده"' },
            { regex: /eu|äu/gi, class: 'text-lime-500', classBg: 'bg-lime-100', hint: '<strong>eu / äu</strong>: صدای "اُی"' },
            { regex: /au/gi, class: 'text-orange-500', classBg: 'bg-orange-100', hint: '<strong>au</strong>: صدای "آو"' },
            { regex: /ä/gi, class: 'text-amber-500', classBg: 'bg-amber-100', hint: '<strong>ä</strong>: صدای "اِ" باز' },
            { regex: /ö/gi, class: 'text-fuchsia-500', classBg: 'bg-fuchsia-100', hint: '<strong>ö</strong>: صدای خاص' },
            { regex: /ü/gi, class: 'text-violet-500', classBg: 'bg-violet-100', hint: '<strong>ü</strong>: صدای خاص' },
            { regex: /z/gi, class: 'text-rose-500', classBg: 'bg-rose-100', hint: '<strong>z</strong>: صدای "تس"' },
            { regex: /w/gi, class: 'text-sky-500', classBg: 'bg-sky-100', hint: '<strong>w</strong>: صدای "و"' },
            { regex: /v/gi, class: 'text-slate-500', classBg: 'bg-slate-200', hint: '<strong>v</strong>: صدای "ف"' },
            { regex: /b\b/gi, class: 'text-slate-400', classBg: 'bg-slate-100', hint: '<strong>b</strong>: تبدیل به "پ"' },
            { regex: /d\b/gi, class: 'text-slate-400', classBg: 'bg-slate-100', hint: '<strong>d</strong>: تبدیل به "ت"' },
            { regex: /g\b/gi, class: 'text-slate-400', classBg: 'bg-slate-100', hint: '<strong>g</strong>: تبدیل به "ک"' },
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
                        intervals.push({ start, end, text: match[0], rule: rule });
                        if (!appliedRules.some(r => r.hint === rule.hint)) {
                            appliedRules.push(rule);
                        }
                    }
                }
            }
            intervals.sort((a, b) => a.start - b.start);
            let parts = [];
            let currentIndex = 0;
            for (let inv of intervals) {
                if (inv.start > currentIndex) {
                    parts.push({ text: word.substring(currentIndex, inv.start), matched: false });
                }
                parts.push({ text: inv.text, matched: true, class: inv.rule.class, classBg: inv.rule.classBg });
                currentIndex = inv.end;
            }
            if (currentIndex < word.length) {
                parts.push({ text: word.substring(currentIndex), matched: false });
            }
            return { parts, rules: appliedRules };
        }

        analyzerInput.addEventListener('input', function(e) {
            const word = e.target.value.trim();
            if (clearBtn) {
                if (e.target.value.length > 0) {
                    clearBtn.classList.remove('hidden');
                    clearBtn.classList.add('flex');
                } else {
                    clearBtn.classList.add('hidden');
                    clearBtn.classList.remove('flex');
                }
            }
            if(word.length === 0) {
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
                if(part.matched) {
                    displayHtml += `<span class="${part.class} font-black drop-shadow-[0_0_8px_currentColor] transition-all hover:scale-110 inline-block">${part.text}</span>`;
                } else {
                    displayHtml += `<span>${part.text}</span>`;
                }
            });
            displayWord.innerHTML = displayHtml;
            let rulesHtml = '';
            if(analysis.rules.length === 0) {
                rulesHtml = '<li class="col-span-2 text-slate-400 text-sm text-center py-2">کلمه ساده‌ای است، قانون ترکیبی خاصی در آن یافت نشد.</li>';
            } else {
                analysis.rules.forEach(rule => {
                    rulesHtml += `
                        <li class="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 animate-fade-in shadow-sm">
                            <div class="w-4 h-4 rounded-full ${rule.classBg} border border-slate-200 shrink-0"></div>
                            <span class="text-sm text-slate-700 font-medium">${rule.hint}</span>
                        </li>
                    `;
                });
            }
            rulesList.innerHTML = rulesHtml;
        });

        playBtn.addEventListener('click', () => {
            const word = analyzerInput.value.trim();
            if(word) playPhoneticsAudio(word, null);
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                analyzerInput.value = '';
                analyzerInput.dispatchEvent(new Event('input'));
                analyzerInput.focus();
            });
        }

        // جفت‌های کمینه
        const MINIMAL_PAIRS = [
            [{ w: 'Bett', fa: 'تخت', en: 'bed' }, { w: 'Beet', fa: 'باغچه', en: 'flower bed' }],
            [{ w: 'Höhle', fa: 'غار', en: 'cave' }, { w: 'Hölle', fa: 'جهنم', en: 'hell' }],
            [{ w: 'Miete', fa: 'اجاره', en: 'rent' }, { w: 'Mitte', fa: 'وسط', en: 'middle' }],
            [{ w: 'rot', fa: 'قرمز', en: 'red' }, { w: 'tot', fa: 'مرده', en: 'dead' }],
            [{ w: 'ich', fa: 'من', en: 'I' }, { w: 'ach', fa: '(حرف ندا) آخ', en: 'oh / ah' }],
        ];
        let currentPair = null;
        let pairScore = { correct: 0, total: 0 };

        function newPair() {
            const pair = MINIMAL_PAIRS[Math.floor(Math.random() * MINIMAL_PAIRS.length)];
            const shuffled = Math.random() < 0.5 ? pair : [pair[1], pair[0]];
            currentPair = { pair: shuffled, answer: shuffled[Math.round(Math.random())] };
            const wrap = document.getElementById('pair-options');
            const meaningsWrap = document.getElementById('pair-meanings');
            if (!wrap) return;
            wrap.innerHTML = shuffled.map(item =>
                `<button onclick='checkPair(this, ${JSON.stringify(item.w)})' class="font-ipa text-lg sm:text-xl px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-brand-400 transition-all min-w-[120px]">${item.w}</button>`
            ).join('');
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
                btn.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
            } else {
                btn.classList.add('border-rose-400', 'text-rose-500', 'bg-rose-50');
                [...document.getElementById('pair-options').children].forEach(b => {
                    if (b.textContent === currentPair.answer.w) b.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
                });
            }
            document.getElementById('pair-score').textContent = `امتیاز: ${pairScore.correct} از ${pairScore.total}`;
            const meaningsWrap = document.getElementById('pair-meanings');
            if (meaningsWrap) {
                meaningsWrap.innerHTML = currentPair.pair.map(item =>
                    `<span class="bg-slate-100 rounded-lg px-3 py-1.5"><b class="font-ipa">${item.w}</b>: ${item.fa} · ${item.en}</span>`
                ).join('');
            }
            setTimeout(newPair, 1600);
        }
        if (document.getElementById('pair-options')) newPair();

        // ضبط صدا
        let mediaRecorder, recChunks = [], recStream, isRecording = false;
        async function toggleRecording() {
            const btn = document.getElementById('rec-toggle-btn');
            const hint = document.getElementById('rec-hint');
            if (!isRecording) {
                try {
                    recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (e) {
                    hint.textContent = 'دسترسی به میکروفون رد شد یا در دسترس نیست.';
                    return;
                }
                recChunks = [];
                mediaRecorder = new MediaRecorder(recStream);
                mediaRecorder.ondataavailable = e => recChunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(recChunks, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    document.getElementById('rec-playback-wrap').innerHTML =
                        `<div class="text-xs text-slate-500 mb-2">صدای ضبط‌شده‌ی شما:</div><audio controls src="${url}" class="w-full"></audio>`;
                    recStream.getTracks().forEach(t => t.stop());
                };
                mediaRecorder.start();
                isRecording = true;
                btn.classList.add('bg-rose-500', 'text-white');
                hint.textContent = 'در حال ضبط… برای توقف دوباره بزن';
            } else {
                mediaRecorder.stop();
                isRecording = false;
                btn.classList.remove('bg-rose-500', 'text-white');
                hint.textContent = 'ضبط تمام شد. صدای نیتیو و صدای خودت را مقایسه کن.';
            }
        }

        // کلمات سفارشی
        const CUSTOM_WORDS_KEY = 'germanCustomWords';
        const HIDDEN_WORDS_KEY = 'germanHiddenWords';
        function loadCustomWords() {
            try { return JSON.parse(localStorage.getItem(CUSTOM_WORDS_KEY)) || []; } catch (e) { return []; }
        }
        function saveCustomWords(list) { localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(list)); }
        function loadHiddenWords() {
            try { return JSON.parse(localStorage.getItem(HIDDEN_WORDS_KEY)) || []; } catch (e) { return []; }
        }
        function saveHiddenWords(list) { localStorage.setItem(HIDDEN_WORDS_KEY, JSON.stringify(list)); }

        const DEFAULT_WORD_BANK = [
            { word: 'Hallo', ipa: '[haˈloː]', faPhonetic: 'هالو', fa: 'سلام', en: 'hello' },
            { word: 'Danke', ipa: '[ˈdaŋkə]', faPhonetic: 'دانکِه', fa: 'متشکرم', en: 'thanks' },
            { word: 'Bitte', ipa: '[ˈbɪtə]', faPhonetic: 'بیتِه', fa: 'خواهش می‌کنم', en: 'please' },
            { word: 'Tschüs', ipa: '[tʃʏs]', faPhonetic: 'چوس', fa: 'خداحافظ', en: 'bye' },
        ];

        function getActiveWordBank() {
            const hidden = new Set(loadHiddenWords());
            const defaults = DEFAULT_WORD_BANK.filter(w => !hidden.has(w.word));
            const customs = loadCustomWords().map(w => ({ ...w, custom: true }));
            return [...defaults, ...customs];
        }

        function populateRecorderSelect() {
            const recSelect = document.getElementById('rec-word-select');
            if (!recSelect) return;
            const bank = getActiveWordBank();
            const words = bank.length ? bank : [{ word: 'Hallo' }, { word: 'Danke' }];
            const prevValue = recSelect.value;
            recSelect.innerHTML = words.map(w =>
                `<option value="${w.word}">${w.word}${w.custom ? ' ★' : ''}</option>`
            ).join('');
            if (words.some(w => w.word === prevValue)) recSelect.value = prevValue;
        }
        populateRecorderSelect();

        function toggleAddWordForm() {
            const form = document.getElementById('word-add-form');
            if (!form) return;
            form.classList.toggle('hidden');
        }
        function addCustomWord() {
            const deInput = document.getElementById('new-word-de');
            const faInput = document.getElementById('new-word-fa');
            const enInput = document.getElementById('new-word-en');
            const word = deInput.value.trim();
            if (!word) { deInput.focus(); return; }
            const list = loadCustomWords();
            if (list.some(w => w.word.toLowerCase() === word.toLowerCase())) {
                showToast('این کلمه قبلاً در لیست شما هست.');
                return;
            }
            list.push({
                word,
                ipa: '',
                faPhonetic: '',
                fa: faInput.value.trim(),
                en: enInput.value.trim()
            });
            saveCustomWords(list);
            deInput.value = ''; faInput.value = ''; enInput.value = '';
            document.getElementById('word-add-form').classList.add('hidden');
            showToast(`«${word}» به لیست کلمات شما اضافه شد.`);
            populateRecorderSelect();
        }
        function deleteCurrentWord() {
            const sel = document.getElementById('rec-word-select');
            if (!sel || !sel.value) return;
            const word = sel.value;
            const customs = loadCustomWords();
            const isCustom = customs.some(w => w.word === word);
            if (isCustom) {
                saveCustomWords(customs.filter(w => w.word !== word));
            } else {
                const hidden = loadHiddenWords();
                if (!hidden.includes(word)) hidden.push(word);
                saveHiddenWords(hidden);
            }
            showToast(`«${word}» از لیست حذف شد.`);
            populateRecorderSelect();
        }

        const SR_KEY = 'germanFlashSR';
        function loadSR() { try { return JSON.parse(localStorage.getItem(SR_KEY)) || {}; } catch (e) { return {}; } }
        function saveSR(data) { localStorage.setItem(SR_KEY, JSON.stringify(data)); }
        function getCardState(word) { return loadSR()[word] || { interval: 0, ease: 2.5, due: 0, reps: 0 }; }
        function setCardState(word, state) { const d = loadSR(); d[word] = state; saveSR(d); }

        let currentFlash = null, flashFlipped = false;
        function dueWords() {
            const now = Date.now();
            const data = loadSR();
            const bank = getActiveWordBank();
            const due = bank.filter(w => !data[w.word] || data[w.word].due <= now);
            return due.length ? due : bank;
        }
        function pickFlash() {
            const pool = dueWords();
            if (!pool.length) return;
            currentFlash = pool[Math.floor(Math.random() * pool.length)];
            flashFlipped = false;
            document.getElementById('flash-front').textContent = currentFlash.word;
            document.getElementById('flash-hint').textContent = 'روی کارت بزن تا تلفظ و معنی را ببینی';
            document.getElementById('flash-rate-row').classList.add('hidden');
            document.getElementById('flash-rate-row').classList.remove('flex');
            updateFlashStats();
        }
        function flipFlash() {
            if (!currentFlash || flashFlipped) return;
            flashFlipped = true;
            const ipaHtml = currentFlash.ipa ? ` <span class="ipa-text text-brand-600">${currentFlash.ipa}</span>` : '';
            document.getElementById('flash-front').innerHTML = `${currentFlash.word}${ipaHtml}`;
            const faLine = currentFlash.fa ? `🇮🇷 ${currentFlash.fa}` : '';
            const enLine = currentFlash.en ? `🇬🇧 ${currentFlash.en}` : '';
            const meaning = [faLine, enLine].filter(Boolean).join('   ·   ') || currentFlash.faPhonetic || 'معنی ثبت نشده';
            document.getElementById('flash-hint').textContent = meaning;
            document.getElementById('flash-rate-row').classList.remove('hidden');
            document.getElementById('flash-rate-row').classList.add('flex');
            playPhoneticsAudio(currentFlash.word, null);
        }
        function rateFlash(quality) {
            const st = getCardState(currentFlash.word);
            let { interval, ease, reps } = st;
            if (quality === 0) {
                interval = 0; reps = 0; ease = Math.max(1.3, ease - 0.2);
            } else {
                reps += 1;
                ease = Math.max(1.3, ease + (quality === 3 ? 0.15 : quality === 1 ? -0.15 : 0));
                if (reps === 1) interval = 1;
                else if (reps === 2) interval = 3;
                else interval = Math.round(interval * ease) || 1;
            }
            const due = quality === 0 ? Date.now() - 1 : Date.now() + interval * 24 * 60 * 60 * 1000;
            setCardState(currentFlash.word, { interval, ease, due, reps });
            pickFlash();
        }
        function updateFlashStats() {
            const data = loadSR();
            const bank = getActiveWordBank();
            const total = bank.length;
            const learned = bank.filter(w => data[w.word] && data[w.word].reps >= 2).length;
            const statsEl = document.getElementById('flash-stats');
            if (statsEl) statsEl.textContent = total ? `${learned} از ${total} کلمه به‌خوبی یاد گرفته شده` : '';
        }
        if (document.getElementById('flash-card')) pickFlash();

        let deferredInstallPrompt;
        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            deferredInstallPrompt = e;
            const btn = document.getElementById('install-app-btn');
            if (btn) btn.style.display = 'inline-flex';
        });
        function installApp() {
            if (!deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            deferredInstallPrompt = null;
            const btn = document.getElementById('install-app-btn');
            if (btn) btn.style.display = 'none';
        }
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.word-check');
            let saved = {};
            try { saved = JSON.parse(localStorage.getItem('germanPhoneticsProgress')) || {}; } catch(e) {}
            checkboxes.forEach(cb => {
                const word = cb.getAttribute('data-word');
                if (saved[word]) cb.checked = true;
            });
            updateProgressUI();
            if (typeof populateRecorderSelect === 'function') populateRecorderSelect();
            if (typeof updateFlashStats === 'function') updateFlashStats();
        });

        function updateProgressUI() {
            const checkboxes = document.querySelectorAll('.word-check');
            let total = checkboxes.length;
            if(total === 0) return;
            let checked = document.querySelectorAll('.word-check:checked').length;
            let percentage = Math.round((checked / total) * 100);
            const bar = document.getElementById('main-progress-bar');
            const text = document.getElementById('progress-text');
            if (bar) bar.style.width = percentage + '%';
            if (text) text.innerText = percentage + '%';
            let savedState = {};
            checkboxes.forEach(cb => {
                savedState[cb.getAttribute('data-word')] = cb.checked;
            });
            try { localStorage.setItem('germanPhoneticsProgress', JSON.stringify(savedState)); } catch(e) {}
            if(percentage === 100 && checked > 0) {
                setTimeout(() => showToast("🎉 تبریک! شما تمام کلمات این مسترکلاس را مسلط شدید!"), 500);
            }
        }

        document.querySelectorAll('.word-check').forEach(cb => {
            cb.addEventListener('change', updateProgressUI);
        });

        const sections = document.querySelectorAll("#content-start section[id]");
        const navLinks = document.querySelectorAll("aside nav a.nav-link");
        const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
        const backToTopBtn = document.getElementById("back-to-top");

        window.addEventListener("scroll", () => {
            let current = "";
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute("id");
                }
            });
            navLinks.forEach((a) => {
                a.classList.remove("border-brand-500", "text-brand-600", "bg-slate-50");
                a.classList.add("border-transparent", "text-slate-600");
                if (a.getAttribute("href").includes(current) && current !== "") {
                    a.classList.remove("border-transparent", "text-slate-600");
                    a.classList.add("border-brand-500", "text-brand-600", "bg-slate-50");
                }
            });
            mobileNavLinks.forEach((a) => {
                a.classList.remove("active-link");
                if (a.getAttribute("href").includes(current) && current !== "") {
                    a.classList.add("active-link");
                }
            });
            if (backToTopBtn) {
                if (window.scrollY > window.innerHeight * 0.8) {
                    backToTopBtn.classList.remove("hidden");
                    backToTopBtn.classList.add("flex");
                } else {
                    backToTopBtn.classList.add("hidden");
                    backToTopBtn.classList.remove("flex");
                }
            }
        });

        console.log('مسترکلاس فونتیک آلمانی بارگذاری شد!');
