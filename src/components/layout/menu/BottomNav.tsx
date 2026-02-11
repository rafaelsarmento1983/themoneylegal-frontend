import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/utils/utils';
import {
  Home,
  ArrowUpDown,
  CalendarClock,
  MoreHorizontal,
} from 'lucide-react';

type BottomNavProps = {
  onOpenMore: () => void;
};

const tabs = [
  { label: 'Início', to: '/dashboard', icon: Home, end: true },
  { label: 'Lançamentos', to: '/transactions', icon: ArrowUpDown },
  { label: 'Cronograma', to: '/accounts', icon: CalendarClock },
];

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMore }) => {
  const linkClass = (isActive: boolean) =>
    cn(
      'group w-full flex flex-col items-center justify-center gap-1', // ✅ w-full
      'rounded-xl py-2 transition-all duration-150 select-none',
      !isActive && [
        'hover:bg-[var(--color-primary-blue-10)]',
        'hover:text-primary',
        'hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]',
      ],
      isActive ? 'bg-primary text-white' : 'text-neutral-700'
    );

  const iconClass = (isActive: boolean) =>
    cn(
      'w-5 h-5 transition-colors duration-150',
      isActive ? 'text-white' : 'text-neutral-500 group-hover:text-primary'
    );

  const labelClass = (isActive: boolean) =>
    cn(
      'text-[11px] font-semibold leading-none transition-colors duration-150',
      isActive ? 'text-white' : 'group-hover:text-primary'
    );

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1300]">
      <div
        className={cn(
          'border-t border-neutral-200 bg-white/95 backdrop-blur',
          'px-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2'
        )}
      >
        {/* ✅ 4 itens => 4 colunas */}
        <div className="grid grid-cols-4 gap-1">
          {tabs.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => linkClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <Icon className={iconClass(isActive)} />
                  <span className={labelClass(isActive)}>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={onOpenMore}
            className={cn(
              'group w-full flex flex-col items-center justify-center gap-1', // ✅ w-full
              'rounded-xl py-2 transition-all duration-150 select-none',
              'text-neutral-700',
              'hover:bg-[var(--color-primary-blue-10)] hover:text-primary',
              'hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]',
              'active:scale-[0.98]'
            )}
            aria-label="Abrir menu completo"
          >
            <MoreHorizontal className="w-5 h-5 text-neutral-500 group-hover:text-primary transition-colors duration-150" />
            <span className="text-[11px] font-semibold leading-none group-hover:text-primary transition-colors duration-150">
              Mais
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
