# MineGuard Landing Page (`mineguard-website`)

## Overview
`mineguard-website` is the public-facing marketing landing page for the MineGuard mining safety platform, developed by Vertex. The site introduces the product to open-pit mining companies and light-vehicle operators, presenting the Digital Safety Mesh, the value proposition, target audience, team, pricing, frequently asked questions, and legal information.

The site is a static, multi-section single-page experience built with plain HTML, CSS, and JavaScript. It is intended to be served as a static asset and does not depend on any backend services.

## Features
- Hero banner with looping background video and animated SVG accent shapes
- Solution section highlighting collision-prevention warnings, mission and vision
- "How it works" section describing the two target sectors of the mining industry
- About the team and About the product placeholder sections
- FAQ section using native `<details>`/`<summary>` accordions
- Subscription / pricing section with a Digital Safety Mesh visualization
- Terms and Conditions page (`terms.html`) reachable from the footer
- Internationalization with English and Spanish JSON resources
- Client-side language switcher driven by `data-section` / `data-value` attributes
- Responsive layout adapted to desktop and mobile breakpoints

## Current Scope
The currently published pages expose:
- `index.html` — main landing page (hero, solution, how it works, team, product, FAQ, subscription, footer)
- `terms.html` — Terms and Conditions

The team and product sections currently show "Coming soon" placeholders and will be populated in upcoming iterations.

## Project Structure
The repository is organized as a flat static site:

- `index.html`
- `terms.html`
- `style.css`
- `main.js`
- `i18n/`
  - `en.json`
  - `es.json`
- `assets/`
  - images, logos, and the hero background video

This structure keeps content, styling, scripting, translations, and media clearly separated.

## Technologies
- HTML5
- CSS3 (custom properties, grid, flexbox, clip-path)
- JavaScript (ES6, `fetch`)
- Google Fonts (`Bebas Neue`, `Barlow`, `Barlow Condensed`)
- JSON-based i18n resources

## Documentation
### Sections
The landing page sections and their content keys are defined in:
- [`i18n/en.json`](i18n/en.json)
- [`i18n/es.json`](i18n/es.json)

### Legal
The Terms and Conditions page is available in [`terms.html`](terms.html).

## Prerequisites
Before running the project, make sure the environment includes:
- A modern web browser
- Optionally, Node.js or any static HTTP server to serve the files locally

## Installation
No installation step is required. The project is composed of static files and can be opened directly in a browser.

## Running the Application
### Option 1: Open directly
Open `index.html` in any modern web browser.

### Option 2: Use a local static server
From the project root, run any static server, for example:

```bash
npx serve .
```

Or with Python:

```bash
python -m http.server 8080
```

This serves the application at:

- `http://localhost:8080/`

A static server is recommended so that the `fetch` calls used by the language switcher can load the i18n JSON files correctly.

## Development Workflow
For local development, edit the HTML, CSS, JavaScript, or i18n files and refresh the browser. There is no build step.

## Internationalization Notes
- Translation files are located in `i18n/`.
- The language switcher in `main.js` reads `data-section` and `data-value` attributes on each translatable element and replaces `innerHTML` with the matching entry from the selected locale.
- To add a new translatable string, add the element to the HTML with `data-section` and `data-value`, and add the corresponding key to both `i18n/en.json` and `i18n/es.json`.

## Project Notes
- The hero background video is located in `assets/truck.mp4`.
- The favicon and logo image is `assets/JtLogoMG.jpeg`.
- Footer legal links (Terms of Service, Cookies Policy, Privacy Policy) point to `terms.html`.
- The product brand is MineGuard; the company brand is Vertex.
