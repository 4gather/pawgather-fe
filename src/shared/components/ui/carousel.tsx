'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
  delay?: number; // Autoplay delay in milliseconds
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  currentSlide: number; // current slide index (1-based) for slide pagination
  totalSlides: number; // total number of slides (=posters) for slide pagination
  autoplayIsPlaying: boolean; // for CarouselAutoplayButton
  toggleAutoplay: () => void; // for CarouselAutoplayButton
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  delay,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  // If delay property is provided in Carousel component, add Autoplay plugin with the specified delay
  if (delay) {
    plugins = plugins ?? [];
    plugins.push(Autoplay({ delay: delay }));
  }

  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(0);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setCurrentSlide(api.selectedScrollSnap() + 1);
    setTotalSlides(api.scrollSnapList().length);
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  const [autoplayIsPlaying, setAutoplayIsPlaying] = React.useState(false);
  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  // autoplay state related event listeners for CarouselAutoplayButton
  React.useEffect(() => {
    if (!api) return;
    const autoplay = api.plugins()?.autoplay;
    if (!autoplay) return;

    setAutoplayIsPlaying(autoplay.isPlaying());
    api
      .on('autoplay:play', () => setAutoplayIsPlaying(true))
      .on('autoplay:stop', () => setAutoplayIsPlaying(false))
      .on('reInit', () => setAutoplayIsPlaying(autoplay.isPlaying()));

    return () => {
      api
        .off('autoplay:play', () => setAutoplayIsPlaying(true))
        .off('autoplay:stop', () => setAutoplayIsPlaying(false))
        .off('reInit', () => setAutoplayIsPlaying(autoplay.isPlaying()));
    };
  }, [api]);

  // Function to toggle autoplay on and off
  const toggleAutoplay = React.useCallback(() => {
    if (!api) return;
    const autoplay = api.plugins().autoplay;
    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
    playOrStop();
  }, [api]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        currentSlide,
        totalSlides,
        autoplayIsPlaying,
        toggleAutoplay,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          'flex',
          orientation === 'horizontal' ? '' : '-mt-4 flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? '' : 'pt-4',
        className
      )}
      {...props}
    />
  );
}

// previous button for navigating through the carousel
function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        'absolute z-10 size-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 left-0 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

// next button for navigating through the carousel
function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        'absolute z-10 size-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 right-0 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

// Pagination component to show the current slide and total slides
function SlidePagination() {
  const { currentSlide, totalSlides } = useCarousel();

  return (
    <span className="rounded-full border border-neutral-300 px-4 py-1 text-sm font-semibold text-neutral-700">
      {currentSlide} / {totalSlides}
    </span>
  );
}

// Autoplay button to toggle autoplay on and off
function CarouselAutoplayButton({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleAutoplay, autoplayIsPlaying } = useCarousel();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleAutoplay}
      className={cn(
        'rounded-full border border-neutral-300 px-4 py-1 text-sm font-semibold text-neutral-700',
        className
      )}
      {...props}
    >
      {autoplayIsPlaying ? <Pause fill="#404040" /> : <Play fill="#404040" />}
    </Button>
  );
}

export {
  Carousel,
  CarouselAutoplayButton,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  SlidePagination,
};
