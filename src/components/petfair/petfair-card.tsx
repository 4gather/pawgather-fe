'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';

import { PetFairList } from '@/lib/types/petfair-types';

interface Props {
  petfair: PetFairList;
}

export function PetfairCard({ petfair }: Props) {
  const startDate = format(petfair.startDate, 'M월 d일 (E)', { locale: ko });
  const endDate = format(petfair.endDate, 'M월 d일 (E)', { locale: ko });

  const eventLocation = petfair.simpleAddress;

  // 같은 날인지 확인
  const isSameDay =
    format(petfair.startDate, 'yyyy-MM-dd') ===
    format(petfair.endDate, 'yyyy-MM-dd');

  return (
    <div className="group bg-card hover:bg-accent/50 active:bg-accent/70 border-border/50 hover:border-border rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* 헤더 */}
      <div className="mb-3">
        <h2 className="text-foreground group-hover:text-accent-foreground mb-1 text-base leading-tight font-semibold">
          {petfair.title}
        </h2>

        {/* 상태 배지 (예: 진행중/예정/종료) */}
        {/* <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
            {new Date() < petfair.startDate
              ? '예정'
              : new Date() > petfair.to
                ? '종료'
                : '진행중'}
          </span>
        </div> */}
      </div>

      {/* 날짜 및 시간 정보 */}
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {isSameDay ? (
              <span>{startDate}</span>
            ) : (
              <span>
                {startDate} ~ {endDate}
              </span>
            )}
          </span>
        </div>

        {/* 시간 정보 (추후 추가될 수 있는 필드) */}
        {/* <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {startTime} ~ {endTime}
          </span>
        </div> */}

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="flex-1">{eventLocation}</span>
        </div>
      </div>

      {/* 액션 영역 */}
      <div className="border-border/30 mt-4 border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>참가 가능</span>
          </div>

          <span className="text-primary hover:text-primary/80 text-sm font-medium transition-colors hover:underline">
            자세히 보기
          </span>
        </div>
      </div>
    </div>
  );
}
