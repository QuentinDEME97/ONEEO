import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: ["@nuxt/eslint", "nuxt-auth-utils", "@nuxt/fonts"],
  devtools: { enabled: true },
  fonts: {
    families: [
      { name: "Urbanist", provider: "google", weights: ["100 900"] },
      { name: "Inter", provider: "google", weights: ["100 900"] },
    ],
  },
  typescript: {
    strict: true,
  },
  vite: {
    plugins: [tailwindcss() as any],
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    // NUXT_APP_SECRET — clé de chiffrement au repos des secrets applicatifs
    // (connecteurs JIRA/LLM, phase 4). N'est pas utilisée par `nuxt-auth-utils`.
    appSecret: "",
  },
});
