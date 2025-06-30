import Link from 'next/link';

export function EventSummary() {
  return (
    <div className="flex w-xs flex-col gap-1 text-base text-gray-600">
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
        className="cursor-pointer pl-3 text-blue-600 underline transition-colors duration-200 hover:text-blue-800 hover:no-underline"
        href="https://k-pet.co.kr/information/scheduled-list/2025_megazoo_spring/"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://k-pet.co.kr/information/scheduled-list/2025_megazoo_spring/
      </Link>
    </div>
  );
}
