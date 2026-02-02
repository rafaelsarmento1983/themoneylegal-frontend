import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Check, Search, Grid3x3, Compass, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTenants } from '../../hooks/queries';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../../services/tenantService';
import { Input } from '../../components/ui/Input';
import { truncateMiddle } from '../../lib/utils/';

export function TenantSwitcher() {
  const navigate = useNavigate();
  const { tenant: currentTenant, switchTenant } = useAuth();
  const { data: allTenants, isLoading } = useTenants();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['tenants-search', searchQuery],
    queryFn: () => tenantService.searchMyTenants(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const displayTenants = useMemo(() => {
    return searchQuery.length >= 2 ? (searchResults || []) : (allTenants?.slice(0, 5) || []);
  }, [searchQuery, searchResults, allTenants]);

  useEffect(() => {
    if (!isLoading && !currentTenant && allTenants?.length) {
      const t = allTenants[0];
      switchTenant({
        id: t.id,
        name: t.name,
        slug: t.slug,
        type: t.type,
        plan: t.plan,
        role: (t.userRole as any) || 'MEMBER',
      });
    }
  }, [isLoading, currentTenant, allTenants, switchTenant]);

  const handleSwitchTenant = (tenant: any) => {
    if (tenant.id === currentTenant?.id) {
      setIsOpen(false);
      return;
    }

    switchTenant({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      type: tenant.type,
      plan: tenant.plan,
      role: (tenant.userRole as any) || 'MEMBER',
    });

    setIsOpen(false);
    window.location.reload();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSONAL':
        return '👤';
      case 'FAMILY':
        return '👥';
      case 'BUSINESS':
        return '🏢';
      default:
        return '📁';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'PERSONAL' ? 'Pessoal' : type === 'FAMILY' ? 'Familiar' : 'Empresarial';
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Carregando...</span>
      </div>
    );
  }

  if (!currentTenant) {
    if (!allTenants?.length) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <span className="text-sm text-gray-500">Nenhum workspace disponível</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Inicializando workspace...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botão Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={[
          'flex items-center gap-3 bg-white/20 border-0 rounded-lg hover:bg-white/30 transition-colors',
          // ✅ desktop mantém largura mínima; mobile fica compacto
          'lg:min-w-[240px] px-3 lg:px-4 py-2',
        ].join(' ')}
        aria-label="Trocar workspace"
      >
        {/* ✅ MOBILE: só ícone + chevron */}
{/*<div className="flex items-center gap-2 lg:hidden">
  <div
    className="
      w-9 h-9 rounded-full
      bg-white/20
      flex items-center justify-center
      text-lg
      shadow-sm
    "
  >
    {getTypeIcon(currentTenant.type)}
  </div>
</div> */}
<div className="flex items-center gap-2 lg:hidden">
  <span className="text-xl">{getTypeIcon(currentTenant.type)}</span>

          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-white truncate">{truncateMiddle(currentTenant.name, { start: 6, end: 4, maxLength: 15 })}
</div>
            <div className="text-xs text-white/80 truncate">
              {getTypeLabel(currentTenant.type)} · {currentTenant.plan}
            </div>
          </div>
</div>
        {/* ✅ DESKTOP: layout completo */}
        <div className="hidden lg:flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{getTypeIcon(currentTenant.type)}</span>

          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-white truncate">{currentTenant.name}</div>
            <div className="text-xs text-white/80 truncate">
              {getTypeLabel(currentTenant.type)} · {currentTenant.plan}
            </div>
          </div>
        </div>

        <ChevronDown
          className={[
            'w-5 h-5 text-white transition-transform',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                SEUS WORKSPACES
              </h3>
            </div>

            <div className="p-3 border-b border-gray-200">
              <Input
                type="text"
                placeholder="Buscar por nome ou slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                customRounded="rounded-xl"
                customBorder="border-0"
                customBg="bg-white"
                leftIcon={<Search className="w-5 h-5" strokeWidth={2} />}
                leftIconClassName="text-gray-400"
              />
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isSearching && searchQuery.length >= 2 ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                </div>
              ) : displayTenants.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchQuery ? 'Nenhum workspace encontrado' : 'Nenhum workspace disponível'}
                </div>
              ) : (
                displayTenants.map((tenant: any) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleSwitchTenant(tenant)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    type="button"
                  >
                    <span className="text-2xl">{getTypeIcon(tenant.type)}</span>

                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{tenant.name}</div>
                      <div className="text-xs text-gray-500">
                        {getTypeLabel(tenant.type)} · {tenant.userRole || tenant.role}
                      </div>
                    </div>

                    {tenant.id === currentTenant?.id && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-200 bg-gray-50 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/tenant/my-workspaces');
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-colors"
                type="button"
              >
                <Grid3x3 className="w-4 h-4" />
                Meus Workspaces
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/tenant/select');
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                type="button"
              >
                <Compass className="w-4 h-4" />
                Gerenciar Workspaces
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
