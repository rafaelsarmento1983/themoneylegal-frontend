// frontend/src/pages/profile/ChooseTypePage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Rocket, XCircle, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { chooseType } from '../../services/profileService';
import { TipoCadastro } from '../../types/profile.types';
import { useRequireIncompleteProfile } from '@/hooks/useAuth';
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";
import { AnimatePresence, motion } from "framer-motion";

const ChooseTypePage: React.FC = () => {
  // ← ADICIONAR HOOK
  const { user } = useRequireIncompleteProfile();

  const ease = [0.16, 1, 0.3, 1] as const;

  const pageSwap = {
    initial: { opacity: 0, scale: 0.985, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease } },
    exit: { opacity: 0, scale: 0.99, filter: "blur(6px)", transition: { duration: 0.28, ease } },
  };

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChooseType = async (tipo: TipoCadastro) => {
    setLoading(true);
    setError(null);

    try {
      await chooseType({ tipo });

      // Redirecionar para a página apropriada
      if (tipo === 'PESSOA_FISICA') {
        navigate('/complete-profile/pessoa-fisica');
      } else {
        navigate('/complete-profile/pessoa-juridica');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao escolher tipo de cadastro');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key="login" {...pageSwap} className="min-h-screen w-full">
          <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />
            <HeaderCardsAuth
              variant="centered"
              title="Money Legal"
              subTitle="Qual perfil melhor se adapta à sua necessidade?"
              maxWidth="max-w-[680px]"
              showLogout
            >
              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-0 border-red-200 rounded-lg text-[15px] font-medium text-red-700 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid md:grid-cols-1 gap-6">
                {/* Pessoa Física */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleChooseType("PESSOA_FISICA")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleChooseType("PESSOA_FISICA");
                    }
                  }}
                  aria-disabled={loading}
                  className={`group relative w-full text-left ${loading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <div
                    className="
                      rounded-2xl
                      border-2 border-[var(--color-primary-blue-100)]
                      bg-white
                      px-6 py-5
                      transition-all duration-200 ease-in-out
                      hover:border-[var(--color-primary-blue-100)]
                      hover:bg-[var(--color-primary-blue-10)]
                      hover:scale-105
                      cursor-pointer
                    "
                  >
                    {/* LINHA SUPERIOR (ícone + texto) */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <User className="h-6 w-6 text-[var(--color-primary-blue-100)]" />
                      </div>

                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-neutral-900">Pessoa Física</h3>
                        <p className="mt-1 text-sm text-neutral-600 max-w-[520px]">
                          Ideal para gerenciar suas finanças pessoais e familiares, seja em grupo compartilhado ou privado.
                        </p>
                      </div>
                    </div>

                    {/* BOTÃO — CENTRALIZADO NO CARD */}
                    <div className="mt-8 flex w-full justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        tone="filledLight"
                        className="min-w-[220px]"
                        rightIcon={<User />}
                        disabled={loading}
                        onClick={(e) => {
                          e.stopPropagation(); // evita duplicar click (card + botão)
                          handleChooseType("PESSOA_FISICA");
                        }}
                      >
                        Escolher
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Pessoa Jurídica */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleChooseType("PESSOA_JURIDICA")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleChooseType("PESSOA_JURIDICA");
                    }
                  }}
                  aria-disabled={loading}
                  className={`group relative w-full text-left ${loading ? "pointer-events-none opacity-60" : ""
                    }`}
                >
                  <div
                    className="
                      rounded-2xl
                      border-2 border-[var(--color-primary-blue-100)]
                      bg-white
                      px-6 py-5
                      transition-all duration-200 ease-in-out
                      hover:border-[var(--color-primary-blue-100)]
                      hover:bg-[var(--color-primary-blue-10)]
                      hover:scale-105
                      cursor-pointer
                    "
                  >
                    {/* LINHA SUPERIOR (ícone + texto) */}
                    <div className="flex items-start gap-4">
                      {/* ÍCONE */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <Building2 className="h-6 w-6 text-[var(--color-primary-blue-100)]" />
                      </div>

                      {/* TEXTO */}
                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Pessoa Jurídica
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600 max-w-[520px]">
                          Ideal para negócios de todos os portes que querem ter controle do fluxo
                          de caixa, obter relatórios detalhados e gerenciar seus usuários ou grupos
                          de trabalho.
                        </p>
                      </div>
                    </div>

                    {/* BOTÃO — CENTRALIZADO NO CARD */}
                    <div className="mt-8 flex w-full justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        tone="filledLight"
                        className="min-w-[220px]"
                        rightIcon={<Building2 />}
                        disabled={loading}
                        onClick={(e) => {
                          e.stopPropagation(); // evita duplo disparo
                          handleChooseType("PESSOA_JURIDICA");
                        }}
                      >
                        Escolher
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Loading Overlay */}
              {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--color-primary-blue-100)] mx-auto mb-4" />
                    <p className="text-gray-700">Salvando...</p>
                  </div>
                </div>
              )}
            </HeaderCardsAuth>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChooseTypePage;
