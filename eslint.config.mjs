// ESLint 기본 및 TypeScript 확장 설정 관련
import js from "@eslint/js";
import parser from "@typescript-eslint/parser";

// 글로벌 변수 설정 (Node.js, Browser 환경 지원)
import globals from "globals";

export default [
  // JavaScript 기본 설정
  js.configs.recommended,

  // 글로벌 환경 설정
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    files: ["**/*.{ts,tsx}"], // TS/TSX 파일 대상
  },

  // 기본 ignore 설정
  {
    ignores: ["**/.next/**", "dist", "node_modules"],
  },
];
