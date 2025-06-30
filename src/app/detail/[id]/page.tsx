import Image from 'next/image';

import { EventSummary } from '@/components/detail/event-summary';
import { NaverStaticMap } from '@/components/detail/naver-static-map';

interface DetailPageProps {
  params: { id: string };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  // public/contents/1 디렉토리의 이미지 파일들
  const contents = ['content1-1', 'content1-2', 'content1-3'];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-xs flex-col">
        <Image
          src={`/posters/poster1.webp`}
          alt="poster"
          width={290}
          height={395}
          priority={true}
          className="h-auto w-full self-center"
        />
      </div>
      <EventSummary />
      <div className="w-xs">
        <h3 className="rounded-xs bg-neutral-300/25 p-2 pl-4 text-lg font-semibold text-gray-600">
          상세 정보
        </h3>
      </div>
      {contents.map((content, index) => (
        <div key={content} className="w-full max-w-[320px]">
          <Image
            src={`/contents/${id}/${content}.webp`}
            alt={`상세 내용 ${index + 1}`}
            width={800}
            height={0}
            sizes="(max-width: 320px) 100vw, 320px"
            className="h-auto max-w-full object-cover"
            priority
          />
        </div>
      ))}
      <NaverStaticMap
        longitude="127.063287"
        latitude="37.514575"
        address="경기도 고양시 일산서구 킨텍스로 271-59"
      />
    </div>
  );
}
