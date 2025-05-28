export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0], // 제목 규칙 비활성화
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새로운 기능 추가
        'fix', // 버그 수정
        'docs', // 문서 변경 (README 등)
        'style', // 코드 스타일 변경 (포맷팅, 세미콜론 등)
        'design', // 사용자 UI 디자인 변경 (CSS 등)
        'test', // 테스트 코드 추가/수정
        'refactor', // 리팩토링 (기능 변경 X)
        'build', // 빌드 관련 변경
        'ci', // CI/CD 관련 변경
        'chore', // 기타 변경 사항 (패키지 업데이트 등)
        'rename', // 파일 혹은 폴더명을 수정만 한 경우
        'remove', // 파일을 삭제만 한 경우
      ],
    ],
  },
};
