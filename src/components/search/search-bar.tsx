'use client';

import { Loader2, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { RecentSearch } from './recent-search';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const currentQuery = useMemo(
    () => searchParams.get('q') || '',
    [searchParams]
  );

  useEffect(() => {
    setSearch(currentQuery);
  }, [currentQuery]);

  const executeSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        startTransition(() => {
          router.push('/list');
        });
        return;
      }

      if (currentQuery === trimmedQuery) return;

      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      });
    },
    [router, currentQuery]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      executeSearch(search);
    },
    [search, executeSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setSearch('');
        setIsFocused(false);
      }
    },
    [handleSubmit]
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative" role="search">
        <div
          className={`bg-background relative flex items-center rounded-xl border shadow-sm transition-all duration-200 ${
            isFocused
              ? 'border-primary ring-primary/20 shadow-lg ring-2'
              : 'border-border hover:border-border/80'
          } ${isPending ? 'opacity-75' : ''} `}
        >
          <div className="pr-2 pl-4">
            {isPending ? (
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            ) : (
              <Search className="text-muted-foreground h-5 w-5" />
            )}
          </div>

          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="펫페어를 검색해보세요"
            className="placeholder:text-muted-foreground flex-1 bg-transparent py-3 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed"
            disabled={isPending}
            aria-label="검색어 입력"
            autoComplete="off"
          />

          <Button
            type="submit"
            disabled={isPending || !search.trim()}
            className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground mr-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed"
            aria-label="검색 실행"
          >
            {isPending ? '검색중' : '검색'}
          </Button>
        </div>

        {/* 최근 검색어 (향후 확장 가능) */}
        {isFocused && !search && <RecentSearch />}
      </form>
    </div>
  );
}
