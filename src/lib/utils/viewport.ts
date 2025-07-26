/**
 * - 특정 인덱스의 이미지가 priority=true를 가져야 하는지 결정
 * - 루프 캐러셀을 위해 시작 그룹과 끝 그룹에 우선순위를 부여하여 LCP를 최적화
 * @param index - 현재 이미지의 인덱스
 * @param totalItems - 캐러셀의 전체 이미지 개수
 * @returns 우선순위 부여 여부 (boolean)
 */
export const getImagePriority = (
  index: number,
  totalItems: number
): boolean => {
  // 화면에 최대로 보일 수 있는 이미지 개수 (데스크톱 기준)
  const priorityCount = 3;

  const isFirstGroup = index < priorityCount;

  const isLastGroup = index >= totalItems - priorityCount;

  return isFirstGroup || isLastGroup;
};
