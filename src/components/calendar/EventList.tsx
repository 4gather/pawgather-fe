'use client';

import { endOfDay, format, isWithinInterval, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

import { fetchCalendarEvents } from '@/lib/api/mock-calendar';

interface Props {
  selectedDate: Date;
}

const events = await fetchCalendarEvents();

export function EventList({ selectedDate }: Props) {
  const normalizedDate = startOfDay(selectedDate);
  const dayEvents = events.filter((event) =>
    isWithinInterval(normalizedDate, {
      start: startOfDay(event.from),
      end: endOfDay(event.to),
    })
  );

  if (dayEvents.length === 0) {
    return (
      <div className="text-muted-foreground mt-6 text-center text-sm">
        선택한 날짜에 행사가 없습니다.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {dayEvents.map((event) => (
        <Link
          key={event.id}
          href={`/detail/${event.id}`}
          className="bg-background hover:bg-accent block rounded-xl border p-4 shadow-sm transition-colors"
        >
          <h2 className="text-base font-semibold">{event.title}</h2>
          <p className="text-muted-foreground text-sm">
            {format(event.from, 'yyyy년 M월 d일 (E)', { locale: ko })} ~{' '}
            {format(event.to, 'M월 d일 (E)', { locale: ko })}
          </p>
        </Link>
      ))}
    </div>
  );
}
