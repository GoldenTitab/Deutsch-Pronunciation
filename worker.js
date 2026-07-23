/**
 * Cloudflare Worker برای پروکسی امن به سرویس Google Cloud TTS.
 * 
 * نحوه راه‌اندازی:
 * 1. یک حساب Cloudflare Workers رایگان بسازید (workers.cloudflare.com)
 * 2. با دستور: npx wrangler init tts-proxy یک پروژه بسازید و این فایل را جای worker.js بگذارید
 * 3. کلید Google Cloud TTS را به‌عنوان secret تنظیم کنید:
 *    npx wrangler secret put TTS_API_KEY
 * 4. دیپلوی کنید: npx wrangler deploy
 * 5. در index.html، script.js و phonetics.html، متغیر TTS_WORKER_URL را با آدرس Worker خود جایگزین کنید:
 *    مثلاً: const TTS_WORKER_URL = 'https://tts-proxy.YOUR-SUBDOMAIN.workers.dev/';
 *    (YOUR-SUBDOMAIN را با ساب‌دامین واقعی خود عوض کنید)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const word = url.searchParams.get('word');
    if (!word) {
      return new Response('پارامتر word لازم است', { status: 400 });
    }

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

    return new Response(audioBytes, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=2592000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
