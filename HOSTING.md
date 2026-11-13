# Hosting Connect + making the QR code

Connect is three static files (`index.html`, `style.css`, `script.js`) with **no build step and no back end**. Any static host works. Below are free options, easiest first, all fine for a 10–15 person demo.

A live copy is already published here (zero setup, shareable right now):
**https://peer-2-peer-connect.netlify.app**
That link is the quickest way to share today. For a public demo that opens for anyone with no sign-in, use one of the hosts below and regenerate the QR to point at your new URL.

---

## Option A — Netlify Drop (fastest, ~1 minute, no account needed to start)

Best when you just want a public link for the demo.

1. Open **https://app.netlify.com/drop**
2. Drag the **whole `peerTuPeer` folder** (the one containing `index.html`) onto the page.
   - Or drag just `index.html`, `style.css`, `script.js` if you don't want the slides/marketing folders uploaded.
3. Wait a few seconds — Netlify gives you a public URL like `https://zippy-otter-1234.netlify.app`.
4. (Optional) Create a free Netlify account to rename the site and keep it permanent, and to re-deploy by dragging again.

**Your demo URL = that netlify.app link.** Put it in the QR (below).

---

## Option B — GitHub Pages (good "proper" home, since this is already a git repo)

1. Create a repo on GitHub (e.g. `connect-demo`) and push this folder:
   ```bash
   cd peerTuPeer
   git init
   git add .
   git commit -m "Connect prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/connect-demo.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages**.
3. Under "Build and deployment", set **Source = Deploy from a branch**, **Branch = main**, **Folder = / (root)**, then **Save**.
4. Wait ~1 minute. Your site is at:
   `https://<your-username>.github.io/connect-demo/`

If you keep the files inside a subfolder, point Pages at that folder or move `index.html` to the repo root.

---

## Option C — Cloudflare Pages / Vercel (also free)

- **Cloudflare Pages:** https://pages.cloudflare.com → "Upload assets" (drag the folder) **or** connect your GitHub repo. Framework preset: **None**. Build command: **(leave blank)**. Output dir: **/**.
- **Vercel:** https://vercel.com → "Add New → Project" → import the repo → Framework preset **Other** → Deploy. No build settings needed.

---

## Making / updating the QR code

The QR in the slides and posters currently points at the Claude artifact link. **Once you pick a host above, regenerate the QR for that URL.**

### Easiest: an online generator
1. Go to any free QR generator (e.g. qr-code-generator.com, qrcode-monkey.com).
2. Paste your final URL.
3. Download as **PNG** (pick high resolution / SVG for print).
4. Save it as `qr.png` and drop it into `presentation/` (replaces the one used by the slides).

### Or use the included script (matches the brand style)
Requires Python with `qrcode`:
```bash
pip install "qrcode[pil]"
python3 make_qr.py "https://your-final-url"            # writes qr.png
python3 make_qr.py "https://your-final-url" qr_teal.png # a teal version
```
Then copy the new `qr.png` into `presentation/` and over the one used by the marketing images (re-render if you regenerate those).

### Putting the QR into the deliverables
- **HTML slides** (`presentation/slides.html`): it already loads `qr.png` from that folder — just replace the file. Also update the URL text on slide 3 (search for `claude.ai/artifact`).
- **PowerPoint** (`presentation/slides.pptx`): open slide 3, delete the old QR image, **Insert → Picture** your new `qr.png`, and edit the URL text box.
- **Posters / social images** (`marketing/*.png`): these are flattened images. Either (a) drop the new QR on top in Canva / any image editor over the existing QR area, or (b) ask me to re-render them with your final URL and I'll regenerate all four.

---

## Quick local preview (optional)

Just open `index.html` in a browser. If your browser blocks the local JS file, run a tiny server:
```bash
cd peerTuPeer
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Which should you use?

| Need | Use |
|---|---|
| Share something in the next 2 minutes | The Claude artifact link, or **Netlify Drop** |
| A clean public link for the QR demo | **Netlify Drop** or **GitHub Pages** |
| Keep it alongside your code long-term | **GitHub Pages** (this is already a repo) |

Traffic of 10–15 people is far below every free tier's limits, so you won't pay anything on any of these.
