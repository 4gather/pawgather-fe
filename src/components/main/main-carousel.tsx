import { CarouselContainer } from '@/components/main/carousel-container';
import { CarouselErrorFallback } from '@/components/main/carousel-error-fallback';
import { PetFairCarousel } from '@/lib/types/petfair-types';

export async function MainCarousel() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/main/carousel`,
      {
        method: 'GET',
        // next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const apiErrorMessage =
        errorData?.error || `HTTP ${response.status} 오류가 발생했습니다.`;

      switch (response.status) {
        case 404:
          // route.ts에서 EMPTY_DATA 또는 NOT_FOUND로 404 반환
          return (
            <CarouselErrorFallback
              title="캐러셀 데이터를 찾을 수 없습니다"
              message="현재 표시할 데이터가 없거나 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."
              statusCode={404}
            />
          );

        case 422:
          // route.ts에서 INVALID_FORMAT으로 422 반환 (JSON 파싱 실패)
          return (
            <CarouselErrorFallback
              title="데이터 형식 오류"
              message="캐러셀 데이터에 문제가 발생했습니다. 관리자에게 문의해주세요."
              statusCode={422}
              showRetry={false} // 데이터 형식 오류는 재시도로 해결되지 않음
            />
          );

        case 500:
          // route.ts에서 SERVER_ERROR로 500 반환
          return (
            <CarouselErrorFallback
              title="서버 오류"
              message="일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요."
              statusCode={500}
            />
          );

        default:
          // 기타 예상하지 못한 HTTP 상태 코드
          return (
            <CarouselErrorFallback
              title="캐러셀을 불러올 수 없습니다"
              message={apiErrorMessage}
              statusCode={response.status}
            />
          );
      }
    }

    const carouselData = (await response.json()) as PetFairCarousel[];

    return <CarouselContainer carouselData={carouselData} />;
  } catch (error) {
    console.error('[컴포넌트 Error] 캐러셀 데이터 로드 실패:', {
      error: error instanceof Error ? error.message : String(error),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/main/carousel`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    // 네트워크 에러
    // TypeError는 주로 fetch 실패 시 발생 (네트워크 연결 문제)
    const isNetworkError =
      error instanceof TypeError &&
      (error.message.includes('fetch') || error.message.includes('network'));

    if (isNetworkError) {
      return (
        <CarouselErrorFallback
          title="네트워크 연결 오류"
          message="인터넷 연결을 확인하고 다시 시도해주세요."
        />
      );
    }

    // 기타 예상치 못한 에러
    return (
      <CarouselErrorFallback
        title="알 수 없는 오류"
        message="예상치 못한 문제가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
      />
    );
  }
}
