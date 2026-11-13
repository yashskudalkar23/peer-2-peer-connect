# Connect — peer-to-peer student mentoring (prototype)

A clickable front-end prototype of **Connect**, an app where college students learn from other students. A mentee says what they want to learn; a mentor says what they can teach; Connect matches them on **subject, confidence, language, format and shared free days**, then supports requests, chat, sessions, a shared library, project feedback and a transparent credits system.

Built as a plain web app — **HTML, CSS and vanilla JavaScript, no frameworks, no back end.** Everything runs in the browser and state resets on reload. It is responsive, so it works as a mobile web app today and can be wrapped as a native app later. The design is a calm, light **cream + green** theme (light only).

## Live demos

- **Netlify:** https://peer-2-peer-connect.netlify.app
- **GitHub Pages:** https://yashskudalkar23.github.io/peer-2-peer-connect/

> After any change to `index.html` / `style.css` / `script.js`, **redeploy** so the live sites update: push to GitHub (Pages rebuilds automatically) and drag the folder onto your Netlify site's **Deploys** tab.

---

## Files

```
peerTuPeer/
├── index.html            # app shell (sidebar + main layout)
├── style.css             # design system: tokens, components (light cream + green)
├── script.js             # state, navigation, all screens, the matching engine
├── make_qr.py            # regenerate a QR for any URL (brand-styled)
├── README.md
├── HOSTING.md            # free hosting steps + how to make/update the QR
│
├── netlify/              # everything pointed at the Netlify URL
│   ├── qr.png            # QR → peer-2-peer-connect.netlify.app
│   ├── qr_teal.png
│   ├── presentation/
│   │   ├── slides.html   # 3-slide deck (arrow keys; "P" to print/PDF)
│   │   ├── slides.pptx   # same deck, editable PowerPoint
│   │   └── qr.png, shot_matches.png, shot_home.png
│   └── marketing/        # 4 promo images (Netlify QR + URL)
│
└── github/               # same set, pointed at the GitHub Pages URL
    ├── qr.png            # QR → yashskudalkar23.github.io/peer-2-peer-connect
    ├── qr_teal.png
    ├── presentation/ (slides.html, slides.pptx, qr.png, shots)
    └── marketing/ (4 promo images, GitHub QR + URL)
```

The **app itself** (`index.html`, `style.css`, `script.js`) is the same for both hosts — only the QR codes, slide links and promo images differ per folder.

## Marketing image sizes (in each folder)

| File | Size | Use |
|---|---|---|
| `promo_vertical_instagram.png` | 1080×1350 | Instagram portrait |
| `promo_vertical_poster.png` | 1080×1527 | Print poster |
| `promo_horizontal_banner.png` | 1920×1080 | Landscape banner |
| `promo_horizontal_card.png` | 1200×675 | Link / card |

## Run it locally

Open `index.html` in a browser. If local JS is blocked, serve it:
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Regenerate a QR for a different URL

```bash
pip install "qrcode[pil]"
python3 make_qr.py "https://your-url"   # writes qr.png
```
Then drop the new `qr.png` into the relevant `*/presentation/` folder and over that host's `marketing` QR (or re-render the promos).

## How the matching engine works (real, not hard-coded)

For the chosen subject, candidates are mentors whose proficiency is **≥ 60** (≥ 50 after "Broaden filters"). Each is scored:

```
score = min(98, round(
    proficiency × 0.65
  + (min(shared_days, 3) / 3) × 20
  + 8  if any shared language
  + 7  if any shared format
))
```

Top 4 by score are shown. **If fewer than 3 mentors qualify, Connect shows a notice and refuses to pad the list** — pick *Public Speaking* in the questionnaire to see it.

## What's in the prototype

Onboarding · learner questionnaire (5 steps + review) · live matching · mentor profiles · request → status flow · mentor questionnaire, verification & dashboard · received requests · home · chat (with auto-reply) · sessions & outcomes · library (search/upload) · projects & versions · Connect Credits ledger · achievements · calendar · notifications · profile, reviews, settings, help · and an **Open Decisions** screen with the 6 product questions. Admin/faculty tooling is marked **Phase 3**.

## Credits are not marks

Connect Credits are a transparent record of activity. Pending points are never counted as approved and are **never presented as official marks** — the college decides what, if anything, they are worth.

## Out of scope (prototype)

Real accounts, real chat, real file storage, real video calls, and the faculty/admin dashboard (Phase 3).
