'use client';

/**
 * 캐러셀 에러 상태를 위한 컴포넌트
 *
 * @param title - 에러 제목
 * @param message - 에러 상세 메시지
 * @param statusCode - HTTP 상태 코드 (선택적)
 * @param showRetry - 재시도 버튼 표시 여부
 */
export function CarouselErrorFallback({
  title,
  message,
  statusCode,
  showRetry = true,
}: {
  title: string;
  message: string;
  statusCode?: number;
  showRetry?: boolean;
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center space-y-4">
      <div className="max-w-md text-center">
        {/* 에러 아이콘 */}
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 에러 메시지 */}
        <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500">{message}</p>

        {/* 상태 코드 표시 (개발/디버그 목적) */}
        {statusCode && process.env.NODE_ENV === 'development' && (
          <p className="mt-2 text-xs text-gray-400">오류 코드: {statusCode}</p>
        )}
      </div>

      {/* 재시도 버튼 */}
      {showRetry && (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          다시 시도
        </button>
      )}
    </div>
  );
}
