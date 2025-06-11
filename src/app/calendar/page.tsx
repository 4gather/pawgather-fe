'use client';

import { useState } from 'react';

import { CalendarView } from '@/components/calendar/CalendarView';
import { EventList } from '@/components/calendar/EventList';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-lg font-bold">펫페어 일정</h1>
      <CalendarView
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <EventList selectedDate={selectedDate} />
    </div>
  );
}
