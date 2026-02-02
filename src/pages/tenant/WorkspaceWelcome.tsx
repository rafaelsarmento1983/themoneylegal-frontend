// ==================== WORKSPACE WELCOME PAGE ====================

// src/pages/complete-registration/WorkspaceWelcome.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Briefcase, 
  Users, 
  Target, 
  Lock, 
  ArrowRight,
  Check,
  X
} from 'lucide-react';

const WorkspaceWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const {
    workspaceName,
    setWorkspaceName,
    description,
    setDescription,
    isCreating,
    error,
    createWorkspace,
  } = useCreateWorkspace();

  // Carrega nome do usuário
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const profile = await profileService.getMyProfile();
        
        if (profile.pessoaFisica) {
          setUserName(profile.pessoaFisica.nomeCompleto.split(' ')[0]);
        } else if (profile.pessoaJuridica) {
          setUserName(profile.pessoaJuridica.nomeFantasia || profile.pessoaJuridica.razaoSocial);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserName();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await createWorkspace();
    
    if (success) {
      // Mostra tutorial ou vai direto pro dashboard
      setShowTutorial(true);
    }
  };

  const handleSkipToBoard = () => {
    navigate('/dashboard');
  };

  const handleFinishTutorial = () => {
    navigate('/dashboard');
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header com animação */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full 
                              flex items-center justify-center shadow-lg shadow-blue-200
                              animate-bounce">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full 
                              border-4 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Bem-vindo ao Money Legal, {userName}! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Seu cadastro foi concluído com sucesso
            </p>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {/* Título da seção */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vamos criar seu primeiro Workspace
              </h2>
              <p className="text-gray-600">
                Workspaces são espaços personalizados onde você organiza suas finanças
              </p>
            </div>

            {/* Benefícios em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg 
                              flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Organize por Contexto
                  </h3>
                  <p className="text-sm text-gray-600">
                    Separe finanças pessoais, empresariais, projetos e mais
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg 
                              flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Convide Membros
                  </h3>
                  <p className="text-sm text-gray-600">
                    Colabore com familiares ou equipe em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg 
                              flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Mantenha Tudo Separado
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cada workspace tem suas próprias transações e metas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg 
                              flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Controle Total
                  </h3>
                  <p className="text-sm text-gray-600">
                    Você decide quem tem acesso a cada workspace
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de criação */}
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Workspace *
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Ex: Finanças Pessoais, Empresa XYZ, Projeto Alpha..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               text-lg"
                      required
                      minLength={3}
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escolha um nome que identifique facilmente este workspace
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição (opcional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva brevemente o propósito deste workspace..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               resize-none"
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 
                              rounded-lg text-red-700">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={handleSkipToBoard}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 
                           font-medium transition-colors duration-200"
                >
                  Pular por enquanto
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !workspaceName.trim()}
                  className="inline-flex items-center gap-2 px-8 py-3 
                           bg-blue-600 text-white rounded-lg font-medium text-lg 
                           hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-lg shadow-blue-200
                           hover:shadow-xl hover:shadow-blue-300"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar Workspace
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info adicional */}
          <div className="text-center text-sm text-gray-500">
            <p>Você poderá criar mais workspaces depois no dashboard</p>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <WorkspaceTutorial
          onClose={handleFinishTutorial}
          onSkip={handleFinishTutorial}
        />
      )}

      {/* Animações CSS */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
};

export default WorkspaceWelcome;
