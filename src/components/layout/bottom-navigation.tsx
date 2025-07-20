import { CalendarDays, Heart, Home, List, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { cn } from '@/shared/lib/utils';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

interface BottomNavigationProps {
  items?: NavItem[];
  className?: string;
}

const defaultItems: NavItem[] = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/calendar', icon: CalendarDays, label: '일정' },
  { href: '/petfairs', icon: List, label: '목록' },
  { href: '/favorites', icon: Heart, label: '관심' },
  { href: '/mypage', icon: User, label: '마이' },
];

export function BottomNavigation({
  items = defaultItems,
  className,
}: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-40 border-t backdrop-blur sm:hidden',
        className
      )}
    >
      <div className="grid grid-cols-5 gap-1 px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 text-xs transition-colors',
                'min-h-[60px] rounded-lg', // 터치 영역 확보
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span
                className={cn(
                  'mt-1 text-[10px] font-medium transition-colors',
                  isActive && 'text-primary'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
