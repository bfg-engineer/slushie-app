# Slush Club

A slushie recipe book. Snap a photo of a recipe card, some bottle labels or a finished slushie,
and Claude reads it and fills in the ingredients and steps for you. Check them, fix anything,
save. Flip the **Pass the cup** switch on any recipe to get a link you can send to friends.

- **You** log in with a password you choose (`APP_PASSWORD`).
- **Friends** don't need an account: they open the share link and see that one recipe, read-only.
  Turn sharing off (or make a new link) and the old link stops working.
- Photos are shrunk in the browser and stored in the database, so there's no separate file storage to set up.
- The photo reading uses Claude (`claude-opus-5-5`) through the Anthropic API.

## Putting it on Vercel (one-time, about 15 minutes)

Think of it like commissioning a PLC panel: the code is the program, Vercel is the hardware it
runs on, and the environment variables are the site-specific config you key in once.

### 1. Get an Anthropic API key
1. Go to https://console.anthropic.com and sign in (or sign up).
2. **Billing**: add a card and a small credit (US$5 is plenty to start; each photo scan costs a few cents).
3. **API Keys** > **Create Key**. Name it `slush-club`. Copy the key (starts with `sk-ant-`).
   You only see it once, so paste it somewhere safe for the next step. Never put it in the code or GitHub.

### 2. Create the Vercel project
1. Go to https://vercel.com and sign in with GitHub.
2. **Add New...** > **Project** > find `slushie-app` > **Import**.
   (If it isn't listed, click "Adjust GitHub App Permissions" and give Vercel access to the repo.)
3. Leave the build settings as they are (Vercel detects Next.js).
4. Open **Environment Variables** on the same screen and add:
   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | the key from step 1 |
   | `APP_PASSWORD` | any password you'll remember, this is how you log in |
5. Click **Deploy**. The first deploy will work but show an error page until the database exists. That's expected.

### 3. Add the database
1. In your Vercel project, open the **Storage** tab > **Create Database** > choose **Neon** (Postgres) > free plan.
2. Pick a region near you (e.g. Sydney), click through, and **connect it to the slushie-app project**.
   Vercel adds `DATABASE_URL` to your environment variables automatically.
3. Go to **Deployments**, click the `...` on the latest one > **Redeploy**.

The app creates its own tables the first time it runs, so there's nothing else to do.

### 4. Use it
Open the `.vercel.app` address Vercel shows you, log in with your `APP_PASSWORD`, and pour your first one.
On a phone, use the browser's "Add to Home Screen" so it opens like an app.

Changing a setting later (e.g. a new password): **Settings** > **Environment Variables**, edit, then **Redeploy**.

## Running it on your own computer (optional)

Needs Node.js 20+ and a Postgres database (the Neon one from above works: copy its `DATABASE_URL`).

```bash
npm install
cp .env.example .env.local   # then fill in the three values
npm run dev                  # open http://localhost:3000
```

## How it's built
- Next.js (App Router), TypeScript, plain CSS (`app/globals.css`)
- Postgres via `postgres` (`lib/db.ts`), tables made on first run
- Claude vision with structured JSON output (`lib/ai.ts`), with server-side fallback if a request is declined
- Login: a signed cookie checked against `APP_PASSWORD` (`lib/auth.ts`)
