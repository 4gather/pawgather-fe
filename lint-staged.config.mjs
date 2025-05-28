export default {
  // JavaScript/TypeScript 파일들 (js 포함 - Next.js config 파일들)
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // 스타일 파일들
  '*.{css,scss,sass}': ['prettier --write'],

  // 설정 및 데이터 파일들
  '*.json': ['prettier --write'],

  // 문서 파일들 (MDX도 포함 - Next.js 지원)
  '*.{md,mdx}': ['prettier --write'],
};
