export function NoSearchResult() {
  return (
    <div className="py-12 text-center">
      <div className="mb-4">
        <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-2xl">🔍</span>
        </div>
      </div>
      <h3 className="text-foreground mb-2 text-lg font-medium">
        검색 결과가 없어요
      </h3>
      <p className="text-muted-foreground mb-4 text-sm">
        다른 키워드로 검색해보시거나
        <br />
        전체 이벤트 목록을 확인해보세요
      </p>

      {/* 추천 검색어(향후 확장 예정) */}
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs">추천 검색어</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-sm transition-colors">
            강아지
          </button>
          <button className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-sm transition-colors">
            고양이
          </button>
          <button className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-sm transition-colors">
            훈련
          </button>
          <button className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-full px-3 py-1 text-sm transition-colors">
            건강
          </button>
        </div>
      </div>
    </div>
  );
}
