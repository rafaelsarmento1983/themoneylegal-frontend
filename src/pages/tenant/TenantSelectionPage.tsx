import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * TenantSelectionPage - Página de escolha
 * 
 * Duas opções:
 * 1. Criar meu Workspace → /tenant/new
 * 2. Ingressar em Workspace → /tenant/browse
 */
export function TenantSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl ">
        {/* Cards de Escolha */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Criar Workspace */}
          <button
            onClick={() => navigate('/tenant/new')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center text-center">
              {/* Ícone */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 text-white" />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Criar meu Workspace
              </h3>

              {/* Descrição */}
              <p className="text-gray-600 mb-6">
                Configure um novo workspace do zero para sua família, empresa ou uso pessoal
              </p>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Plus className="w-4 h-4" />
                Começar do zero
              </div>
            </div>
          </button>

          {/* Card 2: Ingressar em Workspace */}
          <button
            onClick={() => navigate('/tenant/browse')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-cyan-500"
          >
            <div className="flex flex-col items-center text-center">
              {/* Ícone */}
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ingressar em Workspace
              </h3>

              {/* Descrição */}
              <p className="text-gray-600 mb-6">
                Solicite acesso a workspaces existentes e explore nossa plataforma
              </p>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                Explorar workspaces
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
