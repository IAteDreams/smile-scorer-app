import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // tests/ holds Playwright e2e specs; run those with `pnpm test:e2e`.
    exclude: [...configDefaults.exclude, 'tests/**'],
  },
});
