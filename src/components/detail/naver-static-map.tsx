import Image from 'next/image';
import proj4 from 'proj4';

import { NaverMapButton } from '@/components/detail/naver-map-button';
import { EPSG_CODES, NaverMapProps } from '@/lib/types/map-types';

export async function NaverStaticMap({
  longitude,
  latitude,
  address,
  width = 300,
  height = 300,
}: NaverMapProps) {
  try {
    // 환경변수에서 네이버 API 키 불러옴 (서버에서만 접근 가능)
    const clientId = process.env.NAVER_MAPS_CLIENT_ID;
    const clientSecret = process.env.NAVER_MAPS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('네이버 지도 API 키가 설정되지 않았습니다');
    }

    // 좌표가 올바른 형식인지 검증 ("경도, 위도" 형식이어야 함)
    const coordinatePattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordinatePattern.test(`${longitude},${latitude}`)) {
      throw new Error('잘못된 좌표 형식입니다');
    }

    // 좌표 - 경도,위도 형식으로 변환
    const coordinates = `${longitude},${latitude}`;
    const markerPosition = `${longitude} ${latitude}`;

    // 네이버 Static Map API 엔드포인트 URL
    const NAVER_API_URL = 'https://maps.apigw.ntruss.com/map-static/v2/raster';

    // 쿼리 스트링 생성
    const queryParams = [
      `w=${width}`,
      `h=${height}`,
      `center=${coordinates}`,
      `level=14`,
      `format=png`,
      `markers=type:d|size:mid|pos:${markerPosition}`,
    ].join('&');

    const response = await fetch(`${NAVER_API_URL}?${queryParams}`, {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
    });

    // // naver-static-map.tsx에 디버깅 로그 추가
    // console.log('요청 URL:', `${NAVER_API_URL}?${queryParams}`);

    // // 환경변수 확인 로그 추가 (개발 환경에서만)
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('Client ID 존재:', !!clientId);
    //   console.log('Client Secret 존재:', !!clientSecret);
    // }

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

    // 응답받은 이미지 데이터를 바이너리로 변환
    const imageBuffer = await response.arrayBuffer();

    // 바이너리 데이터를 Base64 문자열로 인코딩
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // 브라우저에서 사용할 수 있는 Data URL 형식으로 변환
    const dataUrl = `data:image/png;base64,${base64Image}`;

    // 간단한 회색 블러 URL
    const SIMPLE_BLUR_DATA_URL =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4K';

    const lon = Number(longitude);
    const lat = Number(latitude);

    // 좌표 체계 변환 - EPSG:4326 -> EPSG:3857
    const result = proj4(
      EPSG_CODES.WGS84, // 원본 좌표계
      EPSG_CODES.WEB_MERCATOR, // 변환 좌표계
      [lon, lat] // 변환할 좌표 배열
    ) as [number, number];

    const [x, y] = result;

    // NaverMapButton 클릭 시 이동할 URL
    const linkUrl = `https://map.naver.com/p/entry/address/${x},${y},${address}?c=15.00,0,0,0,dh`;

    return (
      <div className="flex w-xs flex-col gap-3">
        <h3 className="rounded-xs bg-neutral-300/25 p-2 pl-4 text-lg font-semibold text-gray-600">
          오시는 길
        </h3>

        <Image
          src={dataUrl} // Base64 데이터 URL
          alt={`행사장 위치 안내 지도`}
          width={width}
          height={height}
          priority // 중요한 이미지이므로 우선 로딩
          className="self-center rounded-lg border border-gray-200 shadow-lg"
          placeholder="blur" // 로딩 중 블러 효과
          blurDataURL={SIMPLE_BLUR_DATA_URL}
        />
        <div className="p-1 text-sm text-gray-500">
          <p>
            <span className="pl-1 font-bold">주소</span>
            <span className="font-medium"> : {address}</span>
          </p>
        </div>
        <NaverMapButton linkUrl={linkUrl} />
      </div>
    );
  } catch (error) {
    console.error('네이버 지도 로딩 실패:', error);

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
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
