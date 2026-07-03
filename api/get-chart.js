// /api/get-chart.js
//
// This is a Vercel Serverless Function. It runs on Vercel's servers, NOT in
// the browser — so the ASTROLOGY_USER_ID and ASTROLOGY_API_KEY environment
// variables stay private and are never exposed to anyone visiting the quiz.
//
// The frontend (freya-astrology-quiz.html) calls THIS endpoint instead of
// calling astrologyapi.com directly.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow requests from your Shopify store (update this to your real domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { day, month, year, hour, min, lat, lon, tzone, system } = req.body;

    // Basic validation
    if (
      day == null || month == null || year == null ||
      hour == null || min == null || lat == null || lon == null
    ) {
      return res.status(400).json({ error: 'Missing required birth data fields.' });
    }

    const userId = process.env.ASTROLOGY_USER_ID;
    const apiKey = process.env.ASTROLOGY_API_KEY;

    if (!userId || !apiKey) {
      return res.status(500).json({ error: 'Server is not configured with API credentials yet.' });
    }

    const auth = 'Basic ' + Buffer.from(`${userId}:${apiKey}`).toString('base64');

    // system: 'tropical' (default) or 'sidereal'
    // astrologyapi.com's western_horoscope endpoint returns tropical by default.
    // For sidereal, we use the western/sun_moon_ascendant endpoint with ayanamsha,
    // but the simplest reliable approach is the western_horoscope endpoint which
    // gives sun_sign, moon_sign, and ascendant directly.
    const endpoint = 'https://json.astrologyapi.com/v1/western_horoscope';

    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
      },
      body: JSON.stringify({
        day: Number(day),
        month: Number(month),
        year: Number(year),
        hour: Number(hour),
        min: Number(min),
        lat: Number(lat),
        lon: Number(lon),
        tzone: Number(tzone),
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: 'Astrology API error', details: errText });
    }

    const data = await apiResponse.json();

    // Normalize the response into exactly what the quiz frontend needs
    const sunPlanet = (data.planets || []).find(p => p.name === 'Sun');
    const moonPlanet = (data.planets || []).find(p => p.name === 'Moon');
    const ascendant = data.ascendant; // astrologyapi returns this as a sign name or object depending on endpoint

    return res.status(200).json({
      sun: sunPlanet ? sunPlanet.sign : null,
      moon: moonPlanet ? moonPlanet.sign : null,
      rising: typeof ascendant === 'string' ? ascendant : (ascendant && ascendant.sign) || null,
      raw: data, // included for debugging; remove in production if you want a smaller payload
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
}
