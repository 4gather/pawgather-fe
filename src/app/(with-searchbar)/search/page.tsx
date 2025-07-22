import { PetfairCard } from '@/components/petfair/petfair-card';
import { NoSearchResult } from '@/components/search/no-search-result';
import { PetFairList } from '@/lib/types/petfair-types';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.toLowerCase() || '';

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/petfairs`, {
    cache: 'no-store',
  });
  const petfairs = await res.json();

  const filtered = petfairs.filter((petfair: PetFairList) =>
    petfair.title.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      {/* 검색 결과 정보 */}
      <div className="space-y-2 px-4">
        <h2 className="text-foreground text-lg font-semibold">검색 결과</h2>
        {q && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">검색어:</span>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              "{params.q}"
            </span>
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          {filtered.length > 0
            ? `${filtered.length}개의 결과를 찾았습니다`
            : '검색 결과가 없습니다'}
        </p>
      </div>

      {/* 검색 결과 */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((petfair: PetFairList) => (
            <PetfairCard key={petfair.petFairId} petfair={petfair} />
          ))
        ) : (
          <NoSearchResult />
        )}
      </div>
    </div>
  );
}
