'use client';

import 'react-day-picker/dist/style.css';

import { eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';

import { fetchCalendarEvents } from '@/lib/api/mock-calendar';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const events = await fetchCalendarEvents();

const getEventDates = () => {
  const allDates: Date[] = [];
  events.forEach((event) => {
    const dates = eachDayOfInterval({ start: event.from, end: event.to });
    allDates.push(...dates);
  });
  return allDates;
};

export function CalendarView({ selectedDate, onSelectDate }: Props) {
  const eventDates = getEventDates();

  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && onSelectDate(date)}
      locale={ko}
      modifiers={{
        today: new Date(),
        event: eventDates,
      }}
      modifiersClassNames={{
        today: 'border border-primary rounded-full',
        selected: '!bg-primary text-white font-bold (700) rounded-full',
        event: 'bg-yellow-200 text-black rounded-md',
      }}
      className="mx-auto"
    />
  );
}
