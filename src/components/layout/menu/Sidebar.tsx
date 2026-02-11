import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/utils/utils';
import logoMain from '../../../assets/logo.png';
import { ChevronRight, ChevronLeft } from "lucide-react";
import { GROUP_ORDER, type MenuItem } from './menu';

/**
 * 🎯 Sidebar Component v3.1
 * Sidebar moderna com navegação, collapse, animações e GRUPOS
 */

type NavItem = MenuItem;

interface SidebarProps {
  logo?: React.ReactNode;
  navigation: NavItem[];
  footer?: React.ReactNode;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  logo,
  navigation,
  footer,
  collapsed = false,
  onCollapse,
  className,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  /**
   * ✅ Agrupa e ordena itens por group + order
   */
  const groupedNavigation = useMemo(() => {
    const map = new Map<string, NavItem[]>();

    for (const item of navigation) {
      const g = item.group ?? 'PRINCIPAL';
      map.set(g, [...(map.get(g) ?? []), item]);
    }

    const orderIndex = (g: string) => {
      const idx = GROUP_ORDER.indexOf(g as any);
      return idx === -1 ? 999 : idx;
    };

    const entries = Array.from(map.entries())
      .map(([groupName, items]) => {
        const sorted = [...items].sort(
          (a, b) => (a.order ?? 9999) - (b.order ?? 9999)
        );
        return [groupName, sorted] as const;
      })
      .sort(
        (a, b) =>
          orderIndex(a[0]) - orderIndex(b[0]) || a[0].localeCompare(b[0])
      );

    return entries;
  }, [navigation]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-neutral-200',
        'flex flex-col transition-all duration-300 ease-in-out z-[1200]',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Logo & Toggle */}
      <div
        className={cn(
          'h-20 relative flex items-center border-b border-neutral-200',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        {/* Logo - aparece também quando collapsed */}
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          {logo ?? (
            <img
              src={logoMain}
              alt="Logo"
              className={cn(
                'object-contain transition-all duration-200',
                collapsed ? 'w-10 h-10' : 'w-14 h-14'
              )}
            />
          )}

          {!collapsed && (
            <span className="font-extrabold tracking-tight text-lg text-neutral-900">
              Money Legal
            </span>
          )}
        </div>

        {/* Toggle - menor e na borda */}
        <button
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
            'flex items-center justify-center',
            'w-6 h-6 rounded-full',
            'border border-neutral-200',
            'bg-white text-neutral-700',
            'transition-all duration-200',
            'hover:bg-neutral-100 hover:text-primary',
            'active:scale-95',
            'z-20 shadow-sm'
          )}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          type="button"
        >
          <ChevronLeft
            className={cn('w-3.5 h-3.5 transition-transform duration-200', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {groupedNavigation.map(([groupName, items]) => (
            <section key={groupName}>
              {/* ✅ Título do grupo (some quando collapsed) */}
              {!collapsed && (
                <div className="px-2 text-[11px] font-semibold tracking-widest text-neutral-400">
                  {groupName}
                </div>
              )}

              {/* Itens do grupo */}
              <div className={cn('mt-2', 'space-y-1')}>
                {items.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    expanded={expandedItems.includes(item.id)}
                    onToggle={() => toggleExpand(item.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {footer && <div className="p-4 border-t border-neutral-200">{footer}</div>}
    </aside>
  );
};

// Nav Item Component
const NavItemComponent: React.FC<{
  item: NavItem;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  depth?: number;
}> = ({ item, collapsed, expanded, onToggle, depth = 0 }) => {
  const hasChildren = !!(item.children && item.children.length > 0);

  const linkClass = (isActive: boolean) =>
    cn(
      'group flex items-center gap-3 px-3 py-2.5 rounded-lg',
      'text-sm font-medium transition-all duration-200 select-none',
      !isActive && [
        'hover:bg-[var(--color-primary-blue-10)]',
        'hover:text-primary',
        'hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]',
      ],
      isActive ? 'bg-primary text-white' : 'text-neutral-700',
      depth > 0 && 'ml-4',
      collapsed && 'justify-center'
    );

  const iconClass = (isActive: boolean) =>
    cn(
      'flex-shrink-0 transition-colors duration-200',
      isActive ? 'text-white' : 'text-neutral-500 group-hover:text-primary'
    );

  const labelClass = (isActive: boolean) =>
    cn(
      'flex-1 truncate transition-colors duration-200',
      isActive ? 'text-white' : 'group-hover:text-primary'
    );

  const chevronClass = (isActive: boolean) =>
    cn(
      'w-4 h-4 transition-transform duration-200',
      isActive ? 'text-white' : 'text-neutral-500 group-hover:text-primary',
      expanded && 'rotate-90'
    );

  if (hasChildren) {
    const isActive = !!item.active;

    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          className={linkClass(isActive)}
          aria-expanded={expanded}
          aria-controls={`sidebar-children-${item.id}`}
        >
          <span className={iconClass(isActive)}>{item.icon}</span>

          {!collapsed && (
            <>
              <span className={labelClass(isActive)}>{item.label}</span>

              {item.badge != null && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200',
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-primary-100 text-brand-primary-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
              <ChevronRight className={chevronClass(isActive)} />
            </>
          )}
        </button>

        {expanded && !collapsed && (
          <div id={`sidebar-children-${item.id}`} className="mt-1 space-y-1 animate-slide-in-down">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.id}
                item={child}
                collapsed={collapsed}
                expanded={false}
                onToggle={() => {}}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <NavLink
        to={item.href}
        className={({ isActive }) => linkClass(item.active ?? isActive)}
        end={item.href === '/dashboard'}
      >
        {({ isActive }) => {
          const active = item.active ?? isActive;

          return (
            <>
              <span className={iconClass(active)}>{item.icon}</span>

              {!collapsed && (
                <>
                  <span className={labelClass(active)}>{item.label}</span>

                  {item.badge != null && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200',
                        active ? 'bg-white/20 text-white' : 'bg-brand-primary-100 text-brand-primary-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </>
          );
        }}
      </NavLink>
    </div>
  );
};
