import Image from 'next/image';

import { DetailedInformation } from '@/components/detail/detailed-information';
import { EventSummary } from '@/components/detail/event-summary';
import { NaverStaticMap } from '@/components/detail/naver-static-map';
import { PetFairDetail, PetFairSummaryData } from '@/lib/types/petfair-types';

interface DetailPageProps {
  params: Promise<{ petfairId: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { petfairId } = await params;
  let details: PetFairDetail;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/petfairs/${petfairId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      return <div>해당 펫페어를 찾을 수 없습니다</div>;
    }

    details = await response.json();
    // console.log(details);
  } catch (error) {
    console.error('API 호출 실패:', error);
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        데이터를 불러오는 중 오류가 발생했습니다
      </div>
    );
  }

  const { posterImageUrl, images, longitude, latitude, detailAddress } =
    details;

  const eventSummaryProps: PetFairSummaryData = {
    title: details.title,
    startDate: details.startDate,
    endDate: details.endDate,
    simpleAddress: details.simpleAddress,
    telNumber: details.telNumber,
    petFairUrl: details.petFairUrl,
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-xs flex-col">
        <Image
          src={posterImageUrl}
          alt="poster"
          width={290}
          height={0}
          priority={true}
          className="h-auto w-full self-center"
        />
      </div>
      <EventSummary {...eventSummaryProps} />
      <DetailedInformation images={images} />
      <NaverStaticMap
        longitude={longitude}
        latitude={latitude}
        address={detailAddress}
      />
    </div>
  );
}
