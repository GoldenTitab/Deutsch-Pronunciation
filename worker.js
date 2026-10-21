const MAX_WORD_LENGTH = 60;
const ALLOWED_CHARS = /^[a-zA-ZäöüÄÖÜß0-9 .,!?'’„"()-]+$/;

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const url = new URL(request.url);
    const word = url.searchParams.get('word');

    if (!word) {
      return new Response('پارامتر word لازم است', { status: 400 });
    }
    if (word.length > MAX_WORD_LENGTH) {
      return new Response('کلمه/جمله بیش از حد طولانی است', { status: 400 });
    }
    if (!ALLOWED_CHARS.test(word)) {
      return new Response('کاراکترهای غیرمجاز', { status: 400 });
    }

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    if (!env.TTS_API_KEY) {
      return new Response('TTS_API_KEY تنظیم نشده است', { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    let ttsRes;
    try {
      ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.TTS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: word },
          voice: { languageCode: 'de-DE', name: 'de-DE-Wavenet-B' },
          audioConfig: { audioEncoding: 'MP3' }
        })
      }
    );

    } catch (err) {
      return new Response('خطا در دسترسی به سرویس TTS', { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (!ttsRes.ok) {
      return new Response('خطا در سرویس TTS', { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const data = await ttsRes.json();
    const audioBytes = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));

    const response = new Response(audioBytes, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=2592000',
        'Access-Control-Allow-Origin': '*'
      }
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }
};