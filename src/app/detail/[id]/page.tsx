import Image from 'next/image';

import { EventSummary } from '@/components/detail/event-summary';
import { NaverStaticMap } from '@/components/detail/naver-static-map';

interface DetailPageProps {
  params: { id: string };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  console.log(`이벤트 ID: ${id}`);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-xs flex-col">
        <Image
          src={`/posters/poster1.webp`}
          alt="poster"
          width={290}
          height={395}
          priority={true}
          className="self-center"
        />
      </div>
      <EventSummary />
      <NaverStaticMap
        longitude="127.063287"
        latitude="37.514575"
        address="경기도 고양시 일산서구 킨텍스로 271-59"
      />
    </div>
  );
}
