export interface PetFairDetail {
  petFairId: number;
  title: string;
  posterImageUrl: string;
  startDate: string;
  endDate: string;
  simpleAddress: string;
  detailAddress: string;
  petFairUrl: string;
  content: string;
  latitude: string;
  longitude: string;
  telNumber: string;
  status: 'ACTIVE' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
  images: string[];
}

export type PetFairList = Pick<
  PetFairDetail,
  | 'petFairId'
  | 'title'
  | 'posterImageUrl'
  | 'startDate'
  | 'endDate'
  | 'simpleAddress'
>;

export type PetFairCalendar = PetFairList;

export type PetFairCarousel = Pick<
  PetFairDetail,
  'petFairId' | 'posterImageUrl'
>;

export type PetFairSummaryData = Pick<
  PetFairDetail,
  | 'title'
  | 'startDate'
  | 'endDate'
  | 'simpleAddress'
  | 'telNumber'
  | 'petFairUrl'
>;
