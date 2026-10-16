# AVATR Bangladesh — Website Design Recreation

## Workflow

When the user provides a reference screenshot from the official AVATR Global website, recreate that section/page as accurately as possible using the current project stack.

### 1. Build
- Use **Next.js + TypeScript + Tailwind CSS**.
- Use **GSAP only when the reference requires advanced animation or scroll interaction**.
- Keep components reusable and clean.
- Do not fall back to a single static HTML file.

### 2. Screenshot
- Render the page locally and capture a screenshot using Puppeteer or an equivalent browser automation tool.
- Use the same viewport size as the supplied reference screenshot for comparison.

### 3. Compare
Compare the rendered screenshot against the reference and check for visible differences in:
- spacing and padding
- typography size, weight, line-height and alignment
- image/video crop and positioning
- section heights
- element sizing and placement
- colors
- borders, shadows and overlays
- navigation positioning
- button styling
- animation starting/ending states

### 4. Fix
Correct every visible mismatch found in the comparison.

### 5. Re-screenshot
Capture the page again and compare it with the reference.

### 6. Repeat
Repeat the compare-and-fix process until the result is visually very close to the supplied reference.

Do not stop after the first pass. Perform at least 2 comparison rounds unless the user explicitly asks you not to.

---

## Responsive Behaviour

The user may provide only **one desktop reference screenshot**.

Do **not** ask the user to provide separate tablet or mobile screenshots unless absolutely necessary.

From the desktop reference, intelligently create a fully responsive implementation for:
- large desktop
- laptop
- tablet
- mobile

Use modern responsive design principles and Tailwind breakpoints.

The desktop screenshot is the main visual reference. For smaller screens:
- preserve the same AVATR design language
- preserve content hierarchy
- keep imagery cinematic and correctly cropped
- prevent text overlap
- reduce spacing and typography proportionally
- stack layouts naturally when needed
- convert desktop navigation into an appropriate mobile menu
- keep buttons and interactive elements touch-friendly
- avoid horizontal overflow
- do not simply shrink the desktop layout

Responsiveness should feel intentionally designed, not automatically compressed.

---

## AVATR Visual Direction

The implementation must stay visually close to the official AVATR Global website.

Reference:
https://www.avatr.com/en

The visual character should feel:
- premium
- futuristic
- minimal
- architectural
- clean
- refined
- cinematic

Prefer:
- large full-width imagery/video
- generous negative space
- restrained typography
- minimal UI
- clean transitions
- carefully controlled spacing

Avoid:
- generic template styling
- excessive cards
- unnecessary gradients
- loud colors
- excessive animation
- mass-market automotive styling
- adding elements that do not exist in the reference

Do not redesign a supplied reference section unless the user explicitly asks for a redesign.

Do not default to small web typography. AVATR uses relatively large, spacious premium typography; once a reference-matched scale is established, preserve that scale consistently throughout the remaining pages and sections.

---

## Technical Defaults

- Framework: **Next.js**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- Animation: **GSAP + ScrollTrigger only when required**
- Deployment target: **Vercel**
- Prefer reusable React components
- Use semantic HTML
- Use `next/image` for normal image content where appropriate
- Use optimized video for cinematic sections
- Avoid unnecessary dependencies
- Keep the project lightweight and suitable for low-cost/free-tier development

---

## Asset Rules

When official AVATR assets are provided:
- use them exactly
- do not alter vehicle proportions
- do not replace them with unrelated or AI-generated vehicles
- do not distort logos
- preserve supplied brand imagery

If an asset is missing, use a clearly temporary placeholder and do not invent final production content.

---

## Animation Rules

First match the static layout.

Only after the layout is visually accurate should animation be added.

Use:
- subtle fades
- smooth reveals
- restrained parallax
- controlled image scaling
- refined menu transitions

Avoid:
- bouncing
- spinning
- exaggerated movement
- unnecessary animation libraries
- effects that make the site feel less premium

Animations should remain smooth and restrained.

---

## Important Rules

- Do not invent AVATR specifications, prices, warranties or Bangladesh-market information.
- Do not add models other than **AVATR 07** and **AVATR 11** unless requested.
- Do not copy China-market commercial information into the Bangladesh website unless explicitly approved.
- Preserve working sections when editing another section.
- Make the smallest necessary code changes.
- Ensure the project builds successfully after changes.
- Do not claim a section matches the reference before visually comparing it.

---

## Primary Goal

The final result should:

1. Look as close as possible to the supplied AVATR Global reference screenshot on desktop.
2. Automatically adapt into a polished, premium and usable experience across laptop, tablet and mobile.
3. Remain lightweight, reusable and easy to continue building with Claude and Antigravity.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
