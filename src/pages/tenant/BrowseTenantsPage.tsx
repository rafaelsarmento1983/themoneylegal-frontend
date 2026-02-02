import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Loader2,
  Building2,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../../services/tenantService';
import { AccessRequestModal } from '../../components/tenant/AccessRequestModal';
import { Input } from '../../components/ui/Input';

export function BrowseTenantsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tenants-public', page, search],
    queryFn: () => tenantService.getAllPublic(page, 10, search || undefined),
    staleTime: 2 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleRequestAccess = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSONAL':
        return <User className="w-4 h-4" />;
      case 'FAMILY':
        return <Users className="w-4 h-4" />;
      case 'BUSINESS':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERSONAL':
        return 'Pessoal';
      case 'FAMILY':
        return 'Familiar';
      case 'BUSINESS':
        return 'Empresarial';
      default:
        return type;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white">
      <div className="w-full max-w-[520px] rounded-[28px] bg-white shadow-2xl border border-neutral-200/70">
        <div className="px-8 sm:px-12 pb-10">
          {/* Header */}
          <div className="pt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-center sm:text-left text-3xl sm:text-[34px] font-extrabold text-neutral-900">
                  Explorar Workspaces
                </h1>
                <p className="mt-2 text-center sm:text-left text-[15px] font-medium text-neutral-500">
                  Encontre workspaces para se juntar e colaborar.
                </p>
              </div>

            </div>

          </div>

          {/* Barra de busca */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Procure por nome ou slug (ex: familia-silva)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Search className="w-5 h-5" />}
                  className="h-12"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Lista Instagram dentro do card */}
          {!isLoading && data && data.content.length > 0 && (
            <>
              <div className="mt-6 rounded-2xl border border-neutral-200/70 overflow-hidden bg-white">
                <div className="divide-y divide-neutral-200/60">
                  {data.content.map((tenant: any) => (
                    <button
                      key={tenant.id}
                      type="button"
                      onClick={() => handleRequestAccess(tenant)}
                      className="
                        w-full text-left
                        px-4 sm:px-6 py-4
                        hover:bg-neutral-50
                        active:bg-neutral-100
                        transition-colors
                        flex items-center gap-4
                      "
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white">
                        {getTypeIcon(tenant.type)}
                      </div>

                      {/* Texto */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-neutral-900 truncate">
                          @{tenant.slug}
                        </div>

                        <div className="text-sm text-neutral-600 truncate mt-0.5">
                          {tenant.name}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                          <span className="inline-flex items-center gap-1">
                            {getTypeIcon(tenant.type)}
                            <span>{getTypeLabel(tenant.type)}</span>
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Paginação (no estilo do card) */}
              {data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    Página {page + 1} de {data.totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      className="px-3 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.totalPages - 1}
                      className="px-3 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && data && data.content.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Nenhum workspace encontrado
              </h3>
              <p className="text-neutral-500">
                {search ? 'Tente buscar por outro termo' : 'Não há workspaces disponíveis no momento'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedTenant && (
        <AccessRequestModal
          tenant={selectedTenant}
          onClose={() => {
            setShowModal(false);
            setSelectedTenant(null);
          }}
        />
      )}
    </div>
  );
}
