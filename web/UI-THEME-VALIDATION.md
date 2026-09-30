# Green theme validation

Validated locally on 2026-09-29 using headless Chrome.

## Changes

- Emerald actions, forest backgrounds, mint surfaces, and green-tinted neutrals across public pages and portal components.
- Migrated hard-coded blue hex/RGB colors and blue-family utility classes, including gradients, shadows, borders, charts, and interaction states.
- Shared palette in `tailwind.config.js`; finishing, focus, dialog, and reduced-motion rules in `src/green-theme.css`.
- Scoped generic sticky header/sidebar rules to the workspace so public section headers and cards keep their intended layout.
- Responsive shared navigation: shrinkable search, compact tablet/laptop actions, centered desktop dropdowns, keyboard focus/Escape handling, and expanded-state semantics for the mobile menu.
- Consistent card radii, restrained shadows, responsive service heroes, and viewport-constrained dialog panels.

## Checks

- `npm run build`: passed. Vite still reports a JavaScript chunk larger than 500 kB; code splitting was outside this styling change.
- `git diff --check`: passed.
- Source scan: no remaining blue-hue hex literals in application JS/JSX/CSS.
- 72 rendered layout checks: 18 routes at 360, 768, 1024, and 1440 CSS pixels; none had document-level horizontal overflow.
- Routes: `/`, `/services`, `/data-center`, `/amc`, `/solutions`, `/industries`, `/shop`, `/rent`, `/rent/dell-latitude-5550`, `/cart`, `/book-support`, `/login`, `/register`, `/contact`, `/about`, `/privacy-policy`, `/careers`, `/become-a-vendor`.
- Mobile navigation and quotation modal opened at 360 and 768 pixels. Quotation modal also opened at 1440 pixels. Panels remained within the viewport at 800 pixels height.
- Desktop dropdown opened by keyboard focus and remained inside the viewport.
- Visually reviewed desktop/mobile homepage and services screenshots.

## Scope limits

Authenticated portal components received the source palette migration, but signed-in workflows and tables were not browser-tested without a session. Backend submissions were not exercised. Existing photography and product images retain their original colors. Browser checks used Chrome; physical-device and Safari testing remain separate release checks.
