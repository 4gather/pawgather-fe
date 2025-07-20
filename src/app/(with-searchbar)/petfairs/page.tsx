import Link from 'next/link';

import { NoEvents } from '@/components/petfair/no-events';
import { PetfairCard } from '@/components/petfair/petfair-card';

export default async function PetfairListPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/petfairs`, {
    cache: 'no-store',
  });
  const petfairs = await res.json();

  return (
    <div className="space-y-2">
      {/* 목록 정보 */}
      <div className="space-y-2 px-4">
        <h2 className="text-foreground text-lg font-semibold">모든 펫페어</h2>
        <p className="text-muted-foreground text-sm">
          총 {petfairs.length}개의 이벤트가 있습니다
        </p>
      </div>

      {/* TODO: 필터 옵션 (향후 확장 예정) */}
      <div className="- flex gap-2 overflow-x-auto px-2 pb-2">
        <button className="bg-primary text-primary-foreground shrink-0 rounded-full px-4 py-2 text-sm font-medium">
          전체
        </button>
        <button className="bg-muted text-muted-foreground hover:bg-muted/80 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors">
          진행중
        </button>
        <button className="bg-muted text-muted-foreground hover:bg-muted/80 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors">
          예정
        </button>
        <button className="bg-muted text-muted-foreground hover:bg-muted/80 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors">
          종료
        </button>
      </div>

      {/* 이벤트 리스트 */}
      <div className="space-y-3">
        {petfairs.length > 0 ? (
          petfairs.map((event: any) => (
            <Link
              key={event.petFairId}
              href={`/detail/${event.petFairId}`}
              className="block"
            >
              <PetfairCard key={event.petFairId} petfair={event} />
            </Link>
          ))
        ) : (
          <NoEvents />
        )}
      </div>
    </div>
  );
}
