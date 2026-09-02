End-to-end tests (Playwright). They boot the Vite dev server on port 3100 and drive the app in Chromium in guest mode, so no Supabase configuration is needed.

```bash
pnpm --filter @printai/web exec playwright install chromium   # once
pnpm --filter @printai/web test:e2e
pnpm --filter @printai/web test:e2e -- --ui                   # interactive
```
