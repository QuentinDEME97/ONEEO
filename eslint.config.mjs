// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import configPrettier from "eslint-config-prettier";

export default withNuxt(configPrettier, {
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
});
