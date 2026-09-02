# Matbaa — custom print studio

A web app (mobile-ready) for designing and ordering custom prints: business cards, invitations (wedding, tahour, graduation…), greeting cards, certificates, flyers, stickers, t-shirts, tote bags and favour sachets. Customers start from a template, edit in a Canva-style editor, and order; the shop hands print-ready files to third-party printers.

Modern front desk, old-press soul: paper tones, letterpress buttons, Fraunces + IBM Plex.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, file routes, server functions, SSR) | Type-safe routing, server functions without an API layer, deploys to Cloudflare |
| Styling | Tailwind CSS v4 with a paper/ink theme in `apps/web/src/styles.css` | Fast for humans and agents; design tokens live in one `@theme` block |
| Editor | [Konva](https://konvajs.org) via `react-konva` | Drag/resize/rotate, text wrapping, 300 dpi rasterisation |
| Data & auth | Supabase (Google OAuth, Postgres, Storage) | Guest mode works with no backend; sign in to sync |
| Shared logic | `packages/core` (framework-free TypeScript) | Same document model, catalog, templates and pricing for a future Expo/React Native app |

## Repository layout

```
apps/web/                TanStack Start app
  src/routes/            file-based routes (_site = marketing/shop layout, editor = full-screen)
  src/editor/            canvas, store (undo/redo), panels, print export
  src/components/        header/footer, SVG preview renderer, garment mockups
  src/lib/               auth context, guest cookie, local+remote design/order repositories
  src/server/            server functions (orders), Supabase admin client, print-provider interface
packages/core/           domain: types, products & pricing, templates, fonts, palettes, AI contract
supabase/migrations/     database schema, RLS policies, storage bucket
```

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (apps/web/dist)
pnpm typecheck    # both packages
```

No environment variables are needed to run: without Supabase the app runs in **guest mode** (designs and orders are stored in the browser's IndexedDB, keyed by a `matbaa_guest` cookie).

### Enabling Supabase (sync + Google sign-in + persisted orders)

1. Create a Supabase project and run `supabase/migrations/0001_init.sql`.
2. Enable the Google provider in Authentication → Providers and add `https://<your-site>/auth/callback` (and `http://localhost:3000/auth/callback`) to the redirect allow-list.
3. Copy `apps/web/.env.example` to `apps/web/.env` and fill in:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (public)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only; used by the `placeOrder` server function to write orders and upload print files for guests)
   - `VITE_SITE_URL` (used for the OAuth redirect)

When a guest signs in, their local designs are claimed for the account and uploaded.

## How it works

- **Documents** are JSON (`DesignDocument` in `packages/core/src/types.ts`): sides → elements (text, rect, ellipse, line, image). Geometry is in millimetres, font sizes in points, so a document maps 1:1 to the physical print. Textile products carry a `garmentColor` and are rendered on a mockup; only the print area is exported.
- **Templates** (`packages/core/src/templates.ts`) are functions of the product size, so one template adapts to A6 / 5×7 / square. Add one by pushing to `TEMPLATES`.
- **Products & pricing** (`products.ts`, `pricing.ts`): sizes, bleed, option groups with price factors, quantity tiers in TND, flat delivery with free threshold.
- **Editor**: `apps/web/src/editor`. Zustand store with history; Konva canvas with a Transformer; double-click to edit text inline; keyboard shortcuts (⌘Z/⌘⇧Z, ⌘D, Delete, arrows). Autosaves 800 ms after a change.
- **Print files**: `editor/export.tsx` renders each side off-screen at 1 unit = 1 mm and rasterises at 300 dpi (bleed included). Checkout shows the proof, then `placeOrder` uploads files to the `print-files` bucket and inserts the order.
- **Printer handoff**: `apps/web/src/server/printers.ts` defines `PrintProvider`. The `manual` provider leaves orders in `received` for the shop to forward; implement `submit()` for an API-based partner.
- **AI (later)**: `packages/core/src/ai.ts` defines `DesignAssistant`. The editor's Assist panel uses `staticAssistant` (curated ideas) today; a model-backed provider can replace it without touching the UI.

## Deploying to Cloudflare

TanStack Start builds to a fetch handler, so it runs on Cloudflare Workers/Pages. Add the Cloudflare Vite plugin and a `wrangler.jsonc` in `apps/web` when you're ready:

```bash
pnpm --filter @printai/web add -D @cloudflare/vite-plugin wrangler
```

```ts
// apps/web/vite.config.ts
import { cloudflare } from '@cloudflare/vite-plugin'
plugins: [cloudflare({ viteEnvironment: { name: 'ssr' } }), tailwindcss(), tanstackStart(), viteReact()]
```

Set the env vars above as Worker secrets (`wrangler secret put SUPABASE_SERVICE_ROLE_KEY`) and variables. Print files stay in Supabase Storage; Cloudflare serves the app and static assets from its CDN. See https://tanstack.com/start/latest/docs/framework/react/hosting.

## Mobile later

`packages/core` has no React or DOM dependency beyond `crypto`/`structuredClone`, so an Expo app can import the same catalog, templates and pricing. The SVG preview in `components/DesignSvg.tsx` maps directly onto `react-native-svg`; the Konva editor would be swapped for a Skia-based canvas.
