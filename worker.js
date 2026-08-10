const MAX_WORD_LENGTH = 60;
const ALLOWED_CHARS = /^[a-zA-ZäöüÄÖÜß0-9 .,!?'’„"()-]+$/;

export default {
  async fetch(request, env, ctx) {
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

    const ttsRes = await fetch(
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

    if (!ttsRes.ok) {
      return new Response('خطا در سرویس TTS', { status: 502 });
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