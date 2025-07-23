import Image from 'next/image';

interface DetailedInformationProps {
  images: string[];
}

export function DetailedInformation({ images }: DetailedInformationProps) {
  return (
    <div className="flex w-xs flex-col gap-6">
      <h3 className="rounded-xs bg-neutral-300/25 p-2 pl-4 text-lg font-semibold text-gray-600">
        상세 정보
      </h3>
      {images.map((image, index) => (
        <div key={image} className="w-full">
          <Image
            src={image}
            alt={`상세 내용 ${index + 1}`}
            width={800}
            height={0}
            sizes="(max-width: 320px) 100vw, 320px"
            className="h-auto max-w-full object-cover"
            priority
          />
        </div>
      ))}
    </div>
  );
}
