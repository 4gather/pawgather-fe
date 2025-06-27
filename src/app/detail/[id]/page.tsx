import Image from 'next/image';

import { NaverStaticMap } from '@/components/detail/naver-static-map';

interface DetailPageProps {
  params: { id: string };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  return (
    <div className="p-1">
      <div>이벤트 ID: {id}</div>
      <Image
        src={`/posters/poster1.webp`}
        alt="poster"
        width={290}
        height={395}
        priority={true}
      />
      <NaverStaticMap
        longitude="127.063287"
        latitude="37.514575"
        address="경기도 고양시 일산서구 킨텍스로 271-59"
      />
    </div>
  );
}
