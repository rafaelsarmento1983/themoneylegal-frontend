import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils/utils';
import logoMain from '../../../assets/logo.png';
import { X, Search } from 'lucide-react';
import { GROUP_ORDER, type MenuItem } from './menu';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0';

type MobileMenuGridProps = {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
};

export const MobileMenuGrid: React.FC<MobileMenuGridProps> = ({
  open,
  onClose,
  items,
}) => {
  const [q, setQ] = useState('');
  const location = useLocation();

  // trava o scroll do body quando abrir
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((i) => {
      const label = i.label.toLowerCase();
      const group = (i.group ?? 'PRINCIPAL').toLowerCase();
      return label.includes(term) || group.includes(term);
    });
  }, [items, q]);

  /**
   * ✅ Agrupa + ordena (grupos e itens)
   */
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();

    for (const item of filtered) {
      const g = item.group ?? 'PRINCIPAL';
      map.set(g, [...(map.get(g) ?? []), item]);
    }

    const orderIndex = (g: string) => {
      const idx = GROUP_ORDER.indexOf(g as any);
      return idx === -1 ? 999 : idx;
    };

    const entries = Array.from(map.entries())
      .map(([g, list]) => {
        const sorted = [...list].sort(
          (a, b) => (a.order ?? 9999) - (b.order ?? 9999)
        );
        return [g, sorted] as const;
      })
      .sort(
        (a, b) => orderIndex(a[0]) - orderIndex(b[0]) || a[0].localeCompare(b[0])
      );

    return entries;
  }, [filtered]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[1400]">
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Fechar menu"
      />

      {/* painel full screen */}
      <div className="absolute inset-0 bg-white">
        {/* topo */}
        <div className="h-16 border-b border-neutral-200 px-4 flex items-center justify-between">
          <div className="font-bold tracking-tight text-lg text-neutral-900">
            Mais Opções
          </div>

          <button
            onClick={onClose}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'hover:bg-neutral-100 active:scale-[0.98]'
            )}
            aria-label="Fechar"
            type="button"
          >
            <X className="w-5 h-5 text-neutral-700" />
          </button>
        </div>

        {/* busca */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar Opções..."
              className={cn(
                'w-full h-12 rounded-xl border border-neutral-200',
                'pl-10 pr-4 font-light text-neutral-900 placeholder:text-neutral-400',
                'focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-blue-10)] focus:border-primary'
              )}
            />
          </div>
        </div>

        {/* conteúdo scrollável */}
        <div className="px-4 pt-5 pb-6 overflow-y-auto h-[calc(100vh-64px-140px)]">
          {grouped.map(([groupName, groupItems]) => (
            <section key={groupName} className="mb-8">
              {/* título do grupo */}
              <div className="text-xs font-medium tracking-widest text-neutral-400">
                {groupName}
              </div>

              {/* grid */}
              <div className="mt-4 grid grid-cols-3 gap-6">
                {groupItems.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    location.pathname.startsWith(item.href + '/');

                  return (
                    <NavLink
                      key={item.id}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex flex-col items-center justify-center select-none',
                        'transition-all duration-150 active:scale-[0.98]'
                      )}
                    >
                      {isActive ? (
                        <div
                          className={cn(
                            'w-full h-20 rounded-2xl bg-primary text-white',
                            'flex flex-col items-center justify-center gap-1',
                            'shadow-sm'
                          )}
                        >
                          <div className="text-white">{item.icon}</div>
                          <div className="text-xs font-medium leading-none">
                            {item.label}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-neutral-700">{item.icon}</div>
                          <div className="mt-2 text-xs font-medium text-neutral-700 text-center">
                            {item.label}
                          </div>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <div className="text-neutral-500 font-medium py-10 text-center">
              Nenhum item encontrado.
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="border-t border-neutral-200 px-6 py-4 flex items-center gap-3">
          <img
            src={logoMain}
            alt="Money Legal"
            className="w-11 h-11 rounded-lg object-contain"
          />

          <div className="leading-tight">
            <div className="text-sm font-bold text-neutral-900">
              Money Legal
            </div>
            <div className="text-xs font-light text-neutral-400">
              Versão {APP_VERSION}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
