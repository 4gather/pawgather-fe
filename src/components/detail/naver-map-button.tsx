'use client';

import { Button } from '@/shared/components/ui/button';

interface NaverMapButtonProps {
  linkUrl: string;
}

export function NaverMapButton({ linkUrl }: NaverMapButtonProps) {
  const handleClick = () => {
    /* '_blank': 새 탭/창에서 열기
    'noopener,noreferrer': 보안을 위한 옵션 - 부모 창 접근 차단 및 referrer 정보 제거 */
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="w-75 self-center rounded-full"
    >
      네이버 지도에서 보기
    </Button>
  );
}
