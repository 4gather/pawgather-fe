// detail page - response
export interface PetFairDetails {
  petFairId: number; // 펫페어 고유 ID
  title: string; // 펫페어 제목
  posterImageUrl: string; // 포스터 이미지 경로
  startDate: string; // 시작일시 (ISO 형식)
  endDate: string; // 종료일시 (ISO 형식)
  simpleAddress: string; // 간단한 주소 (예: "킨텍스 2전시장")
  detailAddress: string; // 상세 주소
  petFairUrl: string; // 펫페어 공식 웹사이트 URL
  content: string; // 펫페어 설명 내용
  latitude: string; // 위도
  longitude: string; // 경도
  telNumber: string; // 연락처 번호
  status: 'ACTIVE' | 'REMOVED'; // 게시글 삭제됐는지 여부
  createdAt: string; // 생성일시
  updatedAt: string; // 수정일시
  images: string[]; // 상세 이미지들의 경로 배열
}

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
