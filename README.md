# MineGuard — Digital Safety Mesh

Public-facing marketing landing page for the **MineGuard** mining safety platform, developed by **Vertex**. Presents the Digital Safety Mesh value proposition to open-pit mining operators, fleet supervisors, and light-vehicle drivers.

Static site — no build step, no backend dependency.

---

## Pages

| File | Description |
|---|---|
| `index.html` | Main landing page |
| `terms.html` | Terms & Conditions (full visual parity with main page) |

---

## Sections (`index.html`)

| Section | ID | Description |
|---|---|---|
| Hero | `#banner` | Looping background video, animated title, 4 live KPI metrics |
| Data Strip | — | Scrolling ticker with real-time system status indicators |
| Solution | `#solution` | Problem statement, live alert simulation, mission & vision cards |
| Profiles | `#profiles` | Three stakeholder cards: Management, Fleet Supervision, Light Vehicle Drivers |
| Edge Technology | `#edge` | Edge Computing, V2X Protocol, Digital Safety Mesh — sticky scroll panels |
| How It Works | `#how-it-works` | 4-step process: Signal Detection → Edge Processing → Multi-Layer Alert → Resolution |
| Product | `#about-the-product` | Lazy-loaded product demo video in chrome frame |
| Pricing | `#subscription` | Enterprise Full Safety Suite plan card |
| Team | `#about-the-team` | 7-member team grid + lazy-loaded team presentation video |
| FAQ | `#faq` | 4 native `<details>`/`<summary>` accordions with exclusive-open logic |
| Footer | — | Brand, platform links, company links, contact info |

---

## Project Structure

```
mineguard-website/
├── index.html          # Main landing page
├── terms.html          # Terms & Conditions
├── style.css           # Design system + all component styles
├── main.js             # Runtime: GSAP, i18n, theme, facade, FAQ, counters
├── i18n/
│   ├── en.json         # English strings (13 sections)
│   └── es.json         # Spanish strings (13 sections)
└── assets/
    ├── truck.mp4       # Hero background video
    ├── mineguard3.png  # Logo & favicon
    └── img/team/       # Team member photos
```

---

## Technology Stack

| Technology | Version / Notes |
|---|---|
| HTML5 | Semantic markup, `<details>/<summary>` accordions |
| CSS3 | Custom properties (design tokens), grid, flexbox, `clip-path`, `aspect-ratio`, animations |
| JavaScript | Vanilla ES6+, no framework |
| GSAP | 3.12.2 — scroll-triggered fade-up animations |
| ScrollTrigger | GSAP plugin — `.fade-up` elements animate on viewport entry |
| Google Fonts | Bebas Neue, Barlow, Barlow Condensed |

---

## Key Features

### Dark / Light Theme
- Toggle button in the nav bar (sun/moon icon)
- Theme stored in `localStorage` key `mg-theme`
- CSS custom properties (`--bg`, `--white`, `--yellow`, etc.) swap via `[data-theme="light"]`
- **Nav always stays dark** regardless of theme, preserving logo visibility
- WCAG contrast fix: yellow `#FCB502` replaced by dark amber `#9B5000` for text on light backgrounds

### Internationalization (EN / ES)
- Language toggle in the nav bar, persisted to `localStorage` key `mg-lang`
- Every translatable element carries `data-section` and `data-value` attributes
- **Pattern — "HTML as English default"**: the hardcoded text in `index.html` and `terms.html` is the English content. No fetch occurs for English on first load. When the user switches to ES, `es.json` is fetched and `innerHTML` is replaced for all `[data-section][data-value]` elements. Switching back to EN fetches `en.json` to restore without a page reload
- To add a translatable string: add `data-section`/`data-value` to the HTML element and add the matching key to both `i18n/en.json` and `i18n/es.json`

**i18n sections in both JSON files:**

```
nav · banner · strip · solution · profiles · edge
how-it-works · product · subscription · team · faq · footer · terms
```

### Video Facade (Lazy Load)
Both the product demo and team presentation videos use the **Facade pattern**:
- On load: a YouTube thumbnail image is shown with a yellow `#FCB502` play button and a pulsing ring animation
- On click: the thumbnail is replaced with an autoplay `<iframe>` — no YouTube resources are fetched until the user explicitly plays the video
- Reduces initial page weight and avoids unwanted autoplay

### GSAP Scroll Animations
- All `.fade-up` elements start at `opacity: 0; translateY(48px)`
- GSAP + ScrollTrigger animates them to visible as they enter the viewport (trigger at `top 88%`)

### Dashboard Alert Feed
- Live rotating alert feed in the Solution section
- Cycles through 8 alert types (critical, warning, info, resolved) every 3.8 s with smooth fade/slide transitions

### Live Metrics Counter
- KPI numbers in the pricing and profile cards animate from 0 to their target value on first viewport intersection
- Ease-out cubic easing over 1.8 s

---

## Running Locally

Open `index.html` directly in a browser, or use a static server so that `fetch` calls for i18n JSON files work correctly:

```bash
# Node.js
npx serve .

# Python
python -m http.server 8080
```

Then open `http://localhost:8080`.

> **Note:** Opening `index.html` via `file://` protocol will block the `fetch` calls for translation files in most browsers. A local HTTP server is recommended for full i18n functionality.

---

## Design Tokens (CSS Custom Properties)

| Token | Dark value | Light value |
|---|---|---|
| `--bg` | `#141414` | `#F4F5F7` |
| `--yellow` | `#FCB502` | `#FCB502` |
| `--blue` | `#2578F4` | `#2578F4` |
| `--white` | `#F4F4F5` | `#1C1C2E` |
| `--text` | `#C8D8E8` | `#344054` |
| `--muted` | `#6B7280` | `#667085` |

---

## Legal

Terms & Conditions are available at [`terms.html`](terms.html). Footer legal links point to this page.

Product brand: **MineGuard** — Company brand: **Vertex**
