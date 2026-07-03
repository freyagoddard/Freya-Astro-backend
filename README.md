# FREYASTYLE Astrology Quiz — Backend Setup

This is the secure backend that powers real Sun/Moon/Rising calculations for
your quiz. It exists because your API key can NEVER live inside the quiz's
HTML file — anyone could view the page source and steal it. Instead, this
small backend holds your key privately and the quiz talks to this backend
instead of talking to astrologyapi.com directly.

## What you need to do (one-time setup, ~10 minutes)

### Step 1 — Create a free Vercel account
Go to https://vercel.com and sign up (you can use your GitHub account or email).

### Step 2 — Get this code onto Vercel
The easiest way:
1. Create a free GitHub account if you don't have one (https://github.com)
2. Create a new repository, e.g. "freya-astro-backend"
3. Upload these two files into it, keeping the same folder structure:
   - `api/get-chart.js`
   - `package.json`
4. In Vercel, click "Add New Project" → "Import" your GitHub repo → Deploy

Vercel will give you a live URL like:
`https://freya-astro-backend.vercel.app`

### Step 3 — Add your API credentials (THIS is where your key goes — privately)
1. In your new Vercel project, go to **Settings → Environment Variables**
2. Add two variables:
   - `ASTROLOGY_USER_ID` → your astrologyapi.com User ID
   - `ASTROLOGY_API_KEY` → your astrologyapi.com API Key (the NEW one you
     regenerate — never reuse the one that was pasted in chat)
3. Redeploy the project (Vercel does this automatically after saving env vars,
   or click "Redeploy" in the Deployments tab)

Your key is now stored securely on Vercel's servers only. It never appears in
your website's code, and I (Claude) never see it either.

### Step 4 — Tell me your Vercel URL
Once deployed, send me the URL (e.g. `https://freya-astro-backend.vercel.app`)
and I'll update the quiz's JavaScript to call:
`https://freya-astro-backend.vercel.app/api/get-chart`
instead of using the placeholder calculation logic.

## What this backend does
Your quiz sends birth date, time, latitude, and longitude to this endpoint.
This endpoint adds your private API key, calls astrologyapi.com's
`western_horoscope` service (real ephemeris-based astronomy), and sends back
just the Sun sign, Moon sign, and Rising sign — nothing else, and no key ever
touches the browser.

## Cost
Vercel's free tier comfortably covers a quiz like this unless you get very
high volume. astrologyapi.com has its own free tier and paid tiers — check
their pricing once you're past the free quota.
