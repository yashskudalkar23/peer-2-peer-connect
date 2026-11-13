# Connect — peer-to-peer student mentoring (prototype)

A clickable front-end prototype of **Connect**, an app where college students learn from other students. A mentee says what they want to learn; a mentor says what they can teach; Connect matches them on **subject, confidence, language, format and shared free days**, then supports requests, chat, sessions, a shared library, project feedback and a transparent credits system.

Built as a plain web app — **HTML, CSS and vanilla JavaScript, no frameworks, no back end.** Everything runs in the browser and state resets on reload. It is responsive, so it works as a mobile web app today and can be wrapped as a native app later.

**Live demo:** https://peer-2-peer-connect.netlify.app

---

## Files

```
peerTuPeer/
├── index.html            # app shell (phone frame + reviewer screen index)
├── style.css             # design system: tokens, components, light + dark themes
├── script.js             # state, navigation, all screens, the matching engine
├── make_qr.py            # regenerate the demo QR for your own hosted URL
├── qr.png                # QR for the live demo link
├── HOSTING.md            # free hosting steps + how to make/update the QR
├── presentation/
│   ├── slides.html       # 3-slide pitch deck (arrow keys; "P" to print/PDF)
│   ├── slides.pptx       # same deck as editable PowerPoint
│   └── qr.png            # QR used on the deck (swap for your URL)
└── marketing/
    ├── promo_vertical_instagram.png   (1080×1350)
    ├── promo_vertical_poster.png      (1080×1527, print)
    ├── promo_horizontal_banner.png    (1920×1080)
    └── promo_horizontal_card.png      (1200×675)
```

## Run it locally

Open `index.html` in a browser. If local JS is blocked, serve it:
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## How the matching engine works (it's real, not hard-coded)

For the chosen subject, candidates are mentors whose proficiency is **≥ 60** (≥ 50 after "Broaden filters"). Each is scored:

```
score = min(98, round(
    proficiency × 0.65
  + (min(shared_days, 3) / 3) × 20
  + 8  if any shared language
  + 7  if any shared format
))
```

Results are sorted by score, top 4 shown. **If fewer than 3 mentors qualify, Connect shows a notice and refuses to pad the list with weak matches** — try picking *Public Speaking* in the questionnaire to see this.

## What's in the prototype

Onboarding · learner questionnaire (5 steps + review) · live matching · mentor profiles · request → status flow · mentor questionnaire, verification & dashboard · received requests · home · chat (with auto-reply) · sessions & outcomes · library (search/upload) · projects & versions · Connect Credits ledger · achievements · calendar · notifications · profile, reviews, settings, help · and an **Open Decisions** screen listing the 6 product questions for the team. Admin/faculty tooling is marked **Phase 3**.

## Design

- Fonts: **Bricolage Grotesque** (headings/numbers/logo), **Figtree** (body).
- Calm, trustworthy palette with a deep-teal accent and amber signal; full **light and dark** themes via `prefers-color-scheme`.
- Every colour is a CSS variable; components never hard-code colour.
- Accessible: keyboard focus, aria labels, `aria-pressed` on toggles/chips, reduced-motion support.

## Credits are not marks

Connect Credits are a transparent record of activity. Pending points are never counted as approved and are **never presented as official marks** — the college decides what, if anything, they are worth.

## Out of scope (prototype)

Real accounts, real chat, real file storage, real video calls, and the faculty/admin dashboard (Phase 3).
