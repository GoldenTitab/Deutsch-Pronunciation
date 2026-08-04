export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const word = url.searchParams.get('word');
    if (!word || word.length > 200) {
      return new Response(JSON.stringify({ error: 'Missing or invalid word parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const ttsRes = await fetch(
        'https://texttospeech.googleapis.com/v1/text:synthesize',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.TTS_API_KEY}`,
          },
          body: JSON.stringify({
            input: { text: word },
            voice: { languageCode: 'de-DE', name: 'de-DE-Wavenet-B' },
            audioConfig: { audioEncoding: 'MP3' },
          }),
        }
      );

      if (!ttsRes.ok) {
        return new Response(JSON.stringify({ error: 'TTS API error' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const data = await ttsRes.json();

      if (!data.audioContent) {
        return new Response(JSON.stringify({ error: 'No audio content in TTS response' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const audioBuffer = Buffer.from(data.audioContent, 'base64');

      return new Response(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audioBuffer.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
