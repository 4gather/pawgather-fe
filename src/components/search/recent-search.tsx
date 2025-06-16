export function RecentSearch() {
  return (
    <div className="bg-background border-border absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border p-3 shadow-lg">
      <div className="text-muted-foreground mb-2 text-xs">최근 검색어</div>
      <div className="space-y-1">
        <button className="hover:bg-muted w-full rounded-lg px-3 py-2 text-left text-sm transition-colors">
          강아지
        </button>
        <button className="hover:bg-muted w-full rounded-lg px-3 py-2 text-left text-sm transition-colors">
          고양이
        </button>
      </div>
    </div>
  );
}
