import Link from 'next/link';

import { PetFairSummaryData } from '@/lib/types/petfair-types';

export function EventSummary({
  title,
  startDate,
  endDate,
  simpleAddress,
  telNumber,
  petFairUrl,
}: PetFairSummaryData) {
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="flex w-xs flex-col gap-1 text-base text-gray-600">
      <h5 className="pl-3 text-xl font-bold">{title}</h5>
      <hr className="my-1 rounded-sm border-3" />
      <p className="pl-3 font-semibold">일자</p>
      <p className="pl-3">
        {formatDate(startDate)} ~ {formatDate(endDate)}
      </p>
      <hr className="my-1 rounded-sm" />
      <p className="pl-3 font-semibold">장소</p>
      <p className="pl-3">{simpleAddress}</p>
      <hr className="my-1 rounded-sm" />
      <p className="pl-3 font-semibold">전화번호</p>
      <p className="pl-3">{telNumber}</p>
      <hr className="my-1 rounded-sm" />
      <p className="pl-3 font-semibold">홈페이지</p>
      <Link
        className="cursor-pointer pl-3 text-blue-600 underline transition-colors duration-200 hover:text-blue-800 hover:no-underline"
        href={petFairUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {petFairUrl}
      </Link>
    </div>
  );
}
