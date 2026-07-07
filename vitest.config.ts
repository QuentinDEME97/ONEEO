import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["server/**/__tests__/**/*.test.ts"],
    // Les tests *.e2e.test.ts démarrent un vrai serveur Nuxt (nuxt-auth-utils) : plus lents à booter.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
