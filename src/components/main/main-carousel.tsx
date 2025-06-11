import Image from 'next/image';

import {
  Carousel,
  CarouselAutoplayButton,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  SlidePagination,
} from '@/shared/components/ui/carousel';

// posters: an array of poster image file names in the public/posters directory.
const posters = ['poster1', 'poster2', 'poster3'];

export function MainCarousel() {
  return (
    <div className="flex h-full items-center justify-center">
      <Carousel
        className="flex w-full max-w-xs flex-col gap-2"
        opts={{
          loop: true,
        }}
        delay={2000}
      >
        <CarouselContent>
          {posters.map((poster, index) => (
            <CarouselItem key={poster}>
              <div className="p-1">
                <Image
                  src={`/posters/${poster}.webp`}
                  alt={poster}
                  width={290}
                  height={395}
                  priority={index === 0} // set priority to true for the first image
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center gap-4">
          <CarouselAutoplayButton />
          <SlidePagination />
        </div>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
