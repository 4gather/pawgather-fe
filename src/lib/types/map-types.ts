// 네이버 지도 컴포넌트에서 사용할 props 타입
export interface NaverMapProps {
  longitude: string; // 경도
  latitude: string; // 위도
  address: string; // 상세 주소
  width?: number; // 지도 가로 크기 (픽셀)
  height?: number; // 지도 세로 크기 (픽셀)
}

// 좌표 체계 변환을 위한 타입
export const EPSG_CODES = {
  WGS84: 'EPSG:4326', // 위경도 좌표계
  WEB_MERCATOR: 'EPSG:3857', // 웹 메르카토르
} as const;

export type EpsgCode = (typeof EPSG_CODES)[keyof typeof EPSG_CODES];
