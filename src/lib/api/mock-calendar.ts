export interface CalendarEvent {
  id: number;
  title: string;
  from: Date;
  to: Date;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await fetch('http://localhost:4000/calendarEvents', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('이벤트 불러오기 실패');
  }

  const raw = await res.json();
  const dateEvents = raw.map((event: any) => ({
    ...event,
    from: new Date(event.from),
    to: new Date(event.to),
  }));

  return dateEvents;
}
