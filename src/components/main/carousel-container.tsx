import { PosterImageCard } from '@/components/main/poster-image-card';
import { PetFairCarousel } from '@/lib/types/petfair-types';
import { getImagePriority } from '@/lib/utils/viewport';
import {
  Carousel,
  CarouselAutoplayButton,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  SlidePagination,
} from '@/shared/components/ui/carousel';

interface CarouselContainerProps {
  carouselData: PetFairCarousel[];
}

export function CarouselContainer({ carouselData }: CarouselContainerProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <Carousel
        className="flex flex-col gap-2 max-sm:min-w-xs sm:min-w-2xl lg:min-w-5xl"
        opts={{
          loop: true,
          align: 'start',
        }}
        delay={4000}
      >
        <CarouselContent className="items-start">
          {carouselData.map((item, index) => (
            <CarouselItem
              key={item.petFairId}
              className="sm:basis-1/2 lg:basis-1/3"
            >
              <PosterImageCard
                petFairId={item.petFairId}
                posterUrl={item.posterImageUrl}
                priority={getImagePriority(index, carouselData.length)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center gap-4">
          <CarouselAutoplayButton />
          <SlidePagination />
        </div>
        <CarouselPrevious className="-left-0.5 size-12" />
        <CarouselNext className="-right-0.5 size-12" />
      </Carousel>
    </div>
  );
}
