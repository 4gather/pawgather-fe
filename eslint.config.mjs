// ESLint 기본 및 TypeScript 확장 설정 관련
import js from "@eslint/js"; // ESLint의 기본 JavaScript 룰 세트
import parser from "@typescript-eslint/parser"; // TypeScript 문법 파싱용 파서
import tsPlugin from "@typescript-eslint/eslint-plugin"; // TypeScript 전용 룰 제공

// 글로벌 변수 설정 (Node.js, Browser 환경 지원)
import globals from "globals";

// 코드 품질 및 유지보수 향상 관련 플러그인
import importPlugin from "eslint-plugin-import"; // import 구문 분석 및 오류 감지
import simpleImportSort from "eslint-plugin-simple-import-sort"; // import 자동 정렬
import unusedImports from "eslint-plugin-unused-imports"; // 미사용 import/변수 제거
import onlyWarn from "eslint-plugin-only-warn"; // 모든 룰을 warning 수준으로 설정

// 코드 스타일 및 포맷팅 관련
import prettierPlugin from "eslint-plugin-prettier"; // Prettier를 ESLint 룰로 연동

// React 및 관련 기술 스택용 플러그인
import reactPlugin from "eslint-plugin-react"; // React 전용 룰
import reactHooks from "eslint-plugin-react-hooks"; // React Hooks 규칙

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
    },
  },

  // TypeScript + React + TailwindCSS
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      // 유틸
      "only-warn": onlyWarn,
      prettier: prettierPlugin,

      // 코드 품질
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,

      // UI
      react: reactPlugin,
      "react-hooks": reactHooks,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Import
      "import/no-unresolved": "off",
      "import/no-named-default": "error",
      "import/no-default-export": "error",

      // 정렬
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // 미사용 import 제거
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",

      // Prettier
      "prettier/prettier": ["warn", {}, { usePrettierrc: true }],
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
      react: {
        version: "detect",
      },
    },
  },

  // config 파일 예외
  {
    files: [
      "**/*.config.{js,cjs,mjs,ts}",
      "**/next.config.*",
      "**/postcss.config.*",
      "**/tailwind.config.*",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },

  // 기본 ignore 설정
  {
    ignores: ["**/.next/**", "dist", "node_modules"],
  },

  // app 디렉토리 내부의 default export는 허용
  {
    files: ["app/**", "src/app/**"], // 경로는 실제 구조에 맞게 조정
    rules: {
      "import/no-default-export": "off",
    },
  },
];
