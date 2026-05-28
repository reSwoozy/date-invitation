# Date Invitation

Multi-step date invitation (Dutch / English). All invitation data lives in **Firestore** — nothing personal is stored in this repo.

## Flow

1. **Gate** — Guest name must match `settings/main.expectedName`.
2. **Ask** — Yes / runaway No.
3. **Celebrate** — Confetti and continue.
4. **Plan** — City → date → activity (per city, from Firestore).
5. **Done** — Summary and add to calendar.

## Local setup

```bash
npm install
cp .env.example .env
# Firebase Console → Project settings → Your apps (Web) → copy into .env
npm run dev
```

Open `http://localhost:5173/date-invitation/`.

## Firestore

### Document `settings/main`

Create in [Firebase Console](https://console.firebase.google.com/) → Firestore:

```json
{
  "expectedName": "GuestName",
  "blockedDates": ["2026-06-01"],
  "surpriseEnabled": true,
  "cities": [
    {
      "id": "city_id",
      "labels": { "nl": "…", "en": "…", "ru": "…" },
      "activities": [
        { "id": "plan_id", "labels": { "nl": "…", "en": "…", "ru": "…" } }
      ]
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `expectedName` | Name on the gate screen |
| `blockedDates` | `YYYY-MM-DD`, not selectable |
| `cities[].activities` | Plans shown only for that city |
| `surpriseEnabled` | Random picker among city activities |
| `labels.ru` | Optional, for Telegram text |

Document `booking/current` is created when the guest confirms.

### Rules

Deploy [`firestore.rules`](firestore.rules) from Firebase Console or:

```bash
npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID
```

## Telegram (optional)

Use [Google Apps Script](https://script.google.com): new project → paste the `doPost` handler below → **Script properties**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` → **Deploy** web app (Me / Anyone) → URL into `VITE_TELEGRAM_WEBHOOK_URL` in `.env`.

```javascript
function doPost(e) {
  const props = PropertiesService.getScriptProperties()
  const body = JSON.parse(e.postData.contents)
  if (!body.text) return jsonResponse({ ok: false })
  UrlFetchApp.fetch('https://api.telegram.org/bot' + props.getProperty('TELEGRAM_BOT_TOKEN') + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: props.getProperty('TELEGRAM_CHAT_ID'), text: body.text }),
  })
  return jsonResponse({ ok: true })
}
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
```

## Deploy (GitHub Pages)

```bash
npm run deploy:pages
```

GitHub → **Settings → Pages** → branch **`gh-pages`**, folder **`/ (root)`**.

Site: **https://reswoozy.github.io/date-invitation/**

Build needs the same `VITE_*` values as `.env` (local build) or GitHub Actions secrets.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run deploy:pages` | Build and push to `gh-pages` |
