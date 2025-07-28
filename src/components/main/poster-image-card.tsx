'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PosterImageCardProps {
  petFairId: number;
  posterUrl: string;
  priority?: boolean;
}

export function PosterImageCard({
  petFairId,
  posterUrl,
  priority = false,
}: PosterImageCardProps) {
  return (
    <div className="px-4">
      <Link href={`/detail/${petFairId}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-200">
          <Image
            src={posterUrl}
            alt={`Poster ${petFairId}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
    </div>
  );
}
