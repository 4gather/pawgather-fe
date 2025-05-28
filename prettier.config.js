module.exports = {
  semi: true, // 세미콜론 사용
  singleQuote: true, // 작은 따옴표 사용
  tabWidth: 2, // 들여쓰기 2칸
  trailingComma: "es5", // ES5에서 허용하는 후행 쉼표 사용
  printWidth: 80, // 한 줄 최대 80자
  bracketSpacing: true, // 중괄호 내부 공백 추가
  arrowParens: "always", // 화살표 함수의 매개변수가 하나여도 괄호 유지
  endOfLine: "auto", // 운영체제에 맞게 줄바꿈 처리
  plugins: ["prettier-plugin-tailwindcss"], // Tailwind 정렬 플러그인 추가
};
