import React from 'react';

import { SearchBar } from '@/components/search/search-bar';

export default function WithSearchbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* 헤더 영역 */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border/40 sticky top-0 z-40 border-b backdrop-blur">
        <div className="sticky container mx-auto max-w-md px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-foreground text-xl font-bold">펫페어 🐾</h1>
          </div>
          <SearchBar />
        </div>
      </div>

      <div className="container mx-auto max-w-md pb-20">
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
}
