import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/dev.db",
      "public/uploads/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["error", "warn", "info"] }],
    },
  },
);
