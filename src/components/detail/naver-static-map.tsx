import Image from 'next/image';

import { NaverMapProps } from '@/types/types';

export async function NaverStaticMap({
  longitude,
  latitude,
  address,
  width = 300,
  height = 300,
}: NaverMapProps) {
  try {
    // 1. 환경변수에서 네이버 API 키들을 가져옵니다 (서버에서만 접근 가능)
    const clientId = process.env.NAVER_MAPS_CLIENT_ID;
    const clientSecret = process.env.NAVER_MAPS_CLIENT_SECRET;

    // 2. API 키가 설정되지 않았다면 에러를 발생시킵니다
    if (!clientId || !clientSecret) {
      throw new Error('네이버 지도 API 키가 설정되지 않았습니다');
    }

    // 3. 좌표가 올바른 형식인지 검증합니다 ("경도, 위도" 형식이어야 함)
    const coordinatePattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordinatePattern.test(`${longitude},${latitude}`)) {
      throw new Error('잘못된 좌표 형식입니다');
    }

    // 4. 좌표 - 경도,위도 형식으로 변환
    const coordinates = `${longitude},${latitude}`; // 경도,위도
    const markerPosition = `${longitude} ${latitude}`; // 마커는 공백으로 구분

    // 5. 네이버 Static Map API 엔드포인트 URL을 설정합니다
    const NAVER_API_URL = 'https://maps.apigw.ntruss.com/map-static/v2/raster';

    // 6. 수동으로 쿼리 스트링 생성
    const queryParams = [
      `w=${width}`,
      `h=${height}`,
      `center=${coordinates}`, // 경도,위도 순서
      `level=15`,
      `format=png`,
      `markers=type:d|size:mid|pos:${markerPosition}`, // 공백으로 구분된 좌표
    ].join('&');

    // 7. API 요청
    const response = await fetch(`${NAVER_API_URL}?${queryParams}`, {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
      next: { revalidate: 3600 },
    });

    // naver-static-map.tsx에 디버깅 로그 추가
    console.log('요청 URL:', `${NAVER_API_URL}?${queryParams}`);

    // 환경변수 확인 로그 추가 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('Client ID 존재:', !!clientId);
      console.log('Client Secret 존재:', !!clientSecret);
    }

    // 9. API 응답이 성공적이지 않으면 에러를 발생시킵니다
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 에러 상세:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });

      throw new Error(
        `네이버 지도 API 에러: ${response.status} - ${errorText}`
      );
    }

    // 10. 응답받은 이미지 데이터를 바이너리로 변환합니다
    const imageBuffer = await response.arrayBuffer();

    // 11. 바이너리 데이터를 Base64 문자열로 인코딩합니다
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // 12. 브라우저에서 사용할 수 있는 Data URL 형식으로 만듭니다
    const dataUrl = `data:image/png;base64,${base64Image}`;

    const SIMPLE_BLUR_DATA_URL =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4K';

    // 13. Next.js Image 컴포넌트로 최적화된 이미지를 렌더링합니다
    return (
      <div className="relative w-full">
        {/* 14. 지도 제목을 표시합니다 */}
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          "행사장 위치"
        </h3>

        {/* 15. 최적화된 이미지 컴포넌트로 지도를 표시합니다 */}
        <Image
          src={dataUrl} // Base64 데이터 URL
          alt={`행사장 위치 안내 지도`} // 접근성을 위한 대체 텍스트
          width={width} // 이미지 가로 크기
          height={height} // 이미지 세로 크기
          priority // 중요한 이미지이므로 우선 로딩
          className="rounded-lg border border-gray-200 shadow-lg" // 스타일링
          placeholder="blur" // 로딩 중 블러 효과
          blurDataURL={SIMPLE_BLUR_DATA_URL} // 간단한 회색 블러
        />

        {/* 16. 지도 하단에 주소 정보를 표시합니다 */}
        <div className="mt-2 text-sm font-semibold text-gray-600">
          <p>주소: {address}</p>
        </div>
      </div>
    );
  } catch (error) {
    // 17. 에러가 발생했을 때 사용자 친화적인 에러 메시지를 표시합니다
    console.error('네이버 지도 로딩 실패:', error);

    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        {/* 18. 에러 아이콘과 메시지를 표시합니다 */}
        <div className="mb-2 text-red-500">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-red-800">
          지도를 불러올 수 없습니다
        </h3>
        <p className="text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다'}
        </p>
      </div>
    );
  }
}
