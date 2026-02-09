import path from "path";
import { fileURLToPath } from "url";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ignores: ["dist/"],
  },
);
