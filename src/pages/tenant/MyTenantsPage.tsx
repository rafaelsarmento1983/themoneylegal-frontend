import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Building2, Users, User, Check } from 'lucide-react';
import { useTenants } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';

export function MyTenantsPage() {
  const navigate = useNavigate();
  const { data: tenants, isLoading } = useTenants();
  const { tenant: currentTenant, switchTenant } = useAuth();

  const handleApplyTenant = (tenant: any) => {
    const tenantForAuth = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      type: tenant.type,
      plan: tenant.plan,
      role: (tenant.userRole as any) || 'MEMBER',
    };
    switchTenant(tenantForAuth);
    navigate('/dashboard');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSONAL':
        return <User className="w-5 h-5" />;
      case 'FAMILY':
        return <Users className="w-5 h-5" />;
      case 'BUSINESS':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
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
    <div className="min-h-screen p-8 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8"> 
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Workspaces
          </h1>
          <p className="text-gray-600">
            Gerencie todos os seus workspaces em um só lugar
          </p>
        </div>
        {/*}
        <button
          onClick={() => navigate('/dashboard')}
          className="
          flex items-center gap-2
          text-gray-600 hover:text-gray-900
          text-sm font-medium
          "
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Voltar ao Dashboard</span>
        </button>*/}
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Grid de Cards */}
        {!isLoading && tenants && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-gray-100 hover:border-blue-200"
              >
                {/* Badge Atual */}
                {currentTenant?.id === tenant.id && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <Check className="w-3 h-3" />
                      Workspace Atual
                    </span>
                  </div>
                )}

                {/* Ícone e Nome */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(tenant.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {tenant.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getTypeLabel(tenant.type)} · {tenant.userRole || tenant.role}
                    </p>
                  </div>
                </div>

                {/* Plano */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    tenant.plan === 'PREMIUM'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tenant.plan === 'PREMIUM' ? 'Premium' : 'Free'}
                  </span>
                </div>

                {/* Slug */}
                <p className="text-xs text-gray-500 mb-4 font-mono">
                  @{tenant.slug}
                </p>

                {/* Botão Aplicar */}
                {currentTenant?.id !== tenant.id && (
                  <button
                    onClick={() => handleApplyTenant(tenant)}
                    className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aplicar Workspace
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tenants && tenants.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum workspace encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Crie seu primeiro workspace para começar
            </p>
            <button
              onClick={() => navigate('/tenant/new')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Criar Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
