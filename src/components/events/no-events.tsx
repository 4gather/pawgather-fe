export function NoEvents() {
  return (
    <div className="py-12 text-center">
      <div className="mb-4">
        <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-2xl">🐾</span>
        </div>
      </div>
      <h3 className="text-foreground mb-2 text-lg font-medium">
        아직 이벤트가 없어요
      </h3>
      <p className="text-muted-foreground text-sm">
        새로운 펫페어가 곧 추가될 예정입니다
      </p>
    </div>
  );
}
