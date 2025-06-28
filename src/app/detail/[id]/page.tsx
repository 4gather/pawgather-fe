import Image from 'next/image';
import Link from 'next/link';

import { NaverStaticMap } from '@/components/detail/naver-static-map';

interface DetailPageProps {
  params: { id: string };
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  console.log(`이벤트 ID: ${id}`);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-xs flex-col">
        <Image
          src={`/posters/poster1.webp`}
          alt="poster"
          width={290}
          height={395}
          priority={true}
          className="self-center"
        />
      </div>
      <div className="flex w-xs flex-col gap-1 p-3 text-gray-600">
        <h5 className="pl-3 font-bold">2025 메가주 일산</h5>
        <hr className="my-1 rounded-sm border-3" />
        <p className="pl-3 font-semibold">일자</p>
        <p className="pl-3">2025.05.15 ~ 2025.05.17</p>
        <hr className="my-1 rounded-sm" />
        <p className="pl-3 font-semibold">장소</p>
        <p className="pl-3">킨텍스 2전시장</p>
        <hr className="my-1 rounded-sm" />
        <p className="pl-3 font-semibold">홈페이지</p>
        <Link
          className="pl-3"
          href="https://k-pet.co.kr/information/scheduled-list/2025_megazoo_spring/"
        >
          https://k-pet.co.kr/information/scheduled-list/2025_megazoo_spring/
        </Link>
      </div>
      {/* <Link href="https://naver.me/FHlgGx5e"> */}
      <NaverStaticMap
        longitude="127.063287"
        latitude="37.514575"
        address="경기도 고양시 일산서구 킨텍스로 271-59"
      />
      {/* </Link> */}
    </div>
  );
}
