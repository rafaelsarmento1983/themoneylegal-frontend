// frontend/src/pages/profile/PessoaJuridicaFormPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  Phone,
  User,
  Users,
  Mail,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Landmark,
  XCircle,
  Hash,
  RefreshCcw,
  Store, Factory, Globe,
} from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HeaderCardsAuth } from '@/components/ui/HeaderCardsAuth';
import { useRequireIncompleteProfile } from '@/hooks/useAuth';
import { useShake } from '@/hooks/useShake';
import { Select } from "@/components/ui/Select";
import { SelectPopover } from "@/components/ui/SelectPopover";
import { SelectPopoverGrouped } from "@/components/ui/SelectPopoverGrouped";
import { atividadeCategorias } from "@/components/atividadeCategorias";
import { useAuthStore } from "@/store/authStore";

import { AnimatePresence, motion } from 'framer-motion';

import { completePessoaJuridica, formatCnpj, formatTelefone } from '../../services/profileService';
import { CompletePessoaJuridicaRequest } from '../../types/profile.types';
import { API_BASE_URL } from "@/config/api.config";

// ✅ Mesma stack do PF
import { useSlugSuggest } from '@/hooks/useSlugSuggest';
import { SlugSuggestionsModal } from '@/components/ui/SlugSuggestionsModal';
import { generateSlugFromNameStyle, isValidSlug } from '@/lib/slug.utils';
import { useLookupOptions } from "@/hooks/useLookupOptions";
import { useLookupOptionsGrouped } from "@/hooks/useLookupOptionsGrouped";

type FormDataState = CompletePessoaJuridicaRequest & {
  slug?: string;
};

const formatDateBR = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);

  if (digits.length <= 2) return d;
  if (digits.length <= 4) return `${d}/${m}`;
  return `${d}/${m}/${y}`;
};

const isValidDateBR = (value: string) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [dd, mm, yyyy] = value.split('/').map(Number);
  if (yyyy < 1900 || yyyy > 2100) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy) return false;
  if (date.getMonth() !== mm - 1) return false;
  if (date.getDate() !== dd) return false;

  const today = new Date();
  if (date.getTime() > today.getTime()) return false;

  return true;
};

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isCnpjValid = (cnpj: string) => {
  const cleaned = (cnpj || '').replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split('')
      .reduce((acc, n, i) => acc + Number(n) * weights[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const base12 = cleaned.slice(0, 12);
  const d1 = calcDigit(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit(base12 + String(d1), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cleaned === base12 + String(d1) + String(d2);
};

const PessoaJuridicaFormPage: React.FC = () => {
  const { user } = useRequireIncompleteProfile();

  const ease = [0.16, 1, 0.3, 1] as const;
  const pageSwap = {
    initial: { opacity: 0, scale: 0.985, filter: 'blur(6px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.55, ease } },
    exit: { opacity: 0, scale: 0.99, filter: 'blur(6px)', transition: { duration: 0.28, ease } },
  };

  const navigate = useNavigate();

  /* Carregando lista de SelectPopover */
  const { options: porteOptions, error: porteLookupError } = useLookupOptions({
    endpoint: "/lookups/pessoa-juridica/portes",
  });

  const { options: naturezaOptions, error: naturezaLookupError } = useLookupOptions({
    endpoint: "/lookups/pessoa-juridica/naturezas",
  });

  const {
    categories: atividadeCategorias,
    error: atividadesLookupError,
  } = useLookupOptionsGrouped({
    endpoint: "/lookups/pessoa-juridica/atividades",
  });


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Slug: mesma lógica do PF
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const slugSuggest = useSlugSuggest({
    count: 5,
    validateSuggestion: (s) => isValidSlug(s),
  });

  const initialNome = (user as any)?.name ?? '';
  const initialEmail = (user as any)?.email ?? '';

  const [formData, setFormData] = useState<FormDataState>({
    razaoSocial: '',
    nomeFantasia: '',
    slug: '', // ✅ novo
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    dataFundacao: '',
    porteEmpresa: '',
    naturezaJuridica: '',
    atividadePrincipal: '',
    telefone: '',
    nomeResponsavel: initialNome,
    emailResponsavel: initialEmail,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nextNome = (user as any)?.name ?? '';
    const nextEmail = (user as any)?.email ?? '';

    setFormData((prev) => {
      const shouldFillNome = !touched.nomeResponsavel && !prev.nomeResponsavel;
      const shouldFillEmail = !touched.emailResponsavel && !prev.emailResponsavel;

      return {
        ...prev,
        nomeResponsavel: shouldFillNome ? nextNome : prev.nomeResponsavel,
        emailResponsavel: shouldFillEmail ? nextEmail : prev.emailResponsavel,
      };
    });
  }, [user, touched.nomeResponsavel, touched.emailResponsavel]);

  const validateRequiredField = (field: string): string | null => {
    switch (field) {
      case 'razaoSocial':
        if (!formData.razaoSocial?.trim()) return 'Razão social';
        if (formData.razaoSocial.trim().length < 3) return 'Razão social muito curta';
        return null;

      // ✅ slug igual PF: required + isValidSlug
      case 'slug': {
        const v = String(formData.slug ?? '').trim();
        if (!v) return 'Slug';
        if (v.length < 3) return 'Slug muito curto';
        if (!isValidSlug(v)) return "Slug inválido (use letras, números, '-' e '_').";
        return null;
      }

      case 'nomeFantasia':
        if (!formData.nomeFantasia?.trim()) return 'Nome fantasia';
        if (formData.nomeFantasia.trim().length < 2) return 'Nome fantasia muito curto';
        return null;

      case 'cnpj':
        if (!formData.cnpj?.trim()) return 'CNPJ';
        if (!isCnpjValid(formData.cnpj)) return 'CNPJ';
        return null;

      case 'inscricaoEstadual':
        if (!formData.inscricaoEstadual?.trim()) return 'Inscrição estadual';
        return null;

      case 'dataFundacao':
        if (!formData.dataFundacao?.trim()) return 'Data de fundação';
        return null;

      case 'porteEmpresa':
        if (!formData.porteEmpresa?.trim()) return 'Porte da empresa';
        return null;

      case 'naturezaJuridica':
        if (!formData.naturezaJuridica?.trim()) return 'Natureza jurídica';
        return null;

      case 'atividadePrincipal':
        if (!formData.atividadePrincipal?.trim()) return 'Atividade principal';
        return null;

      case 'nomeResponsavel':
        if (!formData.nomeResponsavel?.trim()) return 'Nome do responsável';
        if (formData.nomeResponsavel.trim().length < 3) return 'Nome muito curto';
        return null;

      case 'emailResponsavel':
        if (!formData.emailResponsavel?.trim()) return 'E-mail do responsável';
        if (!isEmailValid(formData.emailResponsavel)) return 'E-mail inválido';
        return null;

      default:
        return null;
    }
  };

  const inputError = (field: string): string | undefined => {
    if (!touched[field]) return undefined;
    const message = validateRequiredField(field);
    return message ?? undefined;
  };

  const inputSuccess = (field: string): string | undefined => {
    if (!touched[field]) return undefined;
    const message = validateRequiredField(field);
    if (message) return undefined;

    switch (field) {
      case 'cnpj':
        return 'CNPJ';
      case 'emailResponsavel':
        return 'E-mail';
      case 'slug':
        return 'Slug';
      default:
        return 'Ok';
    }
  };

  const applySuggestion = (s: string) => {
    setFormData((prev) => ({ ...prev, slug: s }));
    setSlugManuallyEdited(true);
    setTouched((prev) => ({ ...prev, slug: true }));
    slugSuggest.close();
  };

  const openSlugSuggest = () => slugSuggest.refresh(formData.razaoSocial ?? '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === 'cnpj') {
      formattedValue = formatCnpj(value);
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    }

    // ✅ slug auto a partir da razão social (igual PF)
    if (name === 'razaoSocial') {
      const newRazao = formattedValue;

      setFormData((prev) => {
        const shouldAutoSlug =
          !slugManuallyEdited &&
          (!touched.slug && !(prev.slug ?? '').trim());

        const nextSlug = shouldAutoSlug ? generateSlugFromNameStyle(newRazao) : prev.slug;

        return { ...prev, razaoSocial: newRazao, slug: nextSlug };
      });

      return;
    }

    // ✅ slug manual
    if (name === 'slug') {
      setSlugManuallyEdited(true);
      setFormData((prev) => ({ ...prev, slug: formattedValue }));
      return;
    }

    if (name === 'dataFundacao') {
      formattedValue = formatDateBR(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue } as any));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const hasVisibleFieldError = useMemo(() => {
    const requiredFields = [
      'razaoSocial',
      'slug', // ✅ novo required
      'nomeFantasia',
      'cnpj',
      'inscricaoEstadual',
      'dataFundacao',
      'porteEmpresa',
      'naturezaJuridica',
      'atividadePrincipal',
      'nomeResponsavel',
      'emailResponsavel',
    ];

    return requiredFields.some((f) => touched[f] && Boolean(validateRequiredField(f)));
  }, [touched, formData, slugManuallyEdited]);

  const shake = useShake(Boolean(error) || hasVisibleFieldError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      'razaoSocial',
      'slug', // ✅ novo required
      'nomeFantasia',
      'cnpj',
      'inscricaoEstadual',
      'dataFundacao',
      'porteEmpresa',
      'naturezaJuridica',
      'atividadePrincipal',
      'nomeResponsavel',
      'emailResponsavel',
    ];

    setTouched((prev) => {
      const next = { ...prev };
      requiredFields.forEach((f) => (next[f] = true));
      return next;
    });

    const firstError = requiredFields.map(validateRequiredField).find(Boolean);
    if (firstError) {
      setError(firstError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await completePessoaJuridica(formData);
      navigate('/complete-profile/address');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar dados');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key="pj" {...pageSwap} className="min-h-screen w-full">
          <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

            <HeaderCardsAuth
              variant="centered"
              title="Money Legal"
              subTitle="Complete o cadastro com as informações da sua empresa."
              shake={shake}
              showLogout
            >
              <div className="mt-6 flex items-center justify-center gap-2 mb-8">
                <StepDot active={false} done={true} />
                <div className="w-10 h-[2px] bg-neutral-200" />
                <StepDot active={true} done={false} />
                <div className="w-10 h-[2px] bg-neutral-200" />
                <StepDot active={false} done={false} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-0 border-red-200 rounded-lg text-[15px] font-medium text-red-700 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="pt-0">
                  <p className="text-[16px] font-medium text-neutral-700">Dados da Empresa</p>
                </div>

                <Input
                  type="text"
                  name="razaoSocial"
                  placeholder="Razão Social"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={inputError('razaoSocial')}
                  success={inputSuccess('razaoSocial')}
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Building2 className="w-5 h-5" />}
                />

                {/* ✅ Slug igual PF */}
                <div className="relative">
                  <Input
                    type="text"
                    name="slug"
                    placeholder="Slug"
                    value={formData.slug ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                    inputMode="text"
                    spellCheck={false}
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<Hash className="w-5 h-5" />}
                    rightIcon={
                      <div className="flex items-center leading-none">
                        <button
                          type="button"
                          onClick={openSlugSuggest}
                          className="inline-flex items-center justify-center"
                          aria-label="Sugerir slug"
                        >
                          <RefreshCcw className="w-5 h-5" />
                        </button>
                      </div>
                    }
                    error={inputError('slug')}
                    success={inputSuccess('slug')}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Este é o nome de perfil para outros usuários te encontrarem. Digite um nome ou clique no botão para ver sugestões.
                  </p>
                </div>

                <Input
                  type="text"
                  name="nomeFantasia"
                  placeholder="Nome Fantasia "
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={inputError('nomeFantasia')}
                  success={inputSuccess('nomeFantasia')}
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Briefcase className="w-5 h-5" />}
                />

                <Input
                  type="text"
                  name="cnpj"
                  placeholder="CNPJ"
                  value={formData.cnpj}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  maxLength={18}
                  error={inputError('cnpj')}
                  success={inputSuccess('cnpj')}
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<CreditCard className="w-5 h-5" />}
                />






                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="inscricaoEstadual"
                    placeholder="Inscrição Estadual "
                    value={formData.inscricaoEstadual}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={inputError('inscricaoEstadual')}
                    success={inputSuccess('inscricaoEstadual')}
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<Landmark className="w-5 h-5" />}
                  />

                  <Input
                    type="text"
                    name="inscricaoMunicipal"
                    placeholder="Inscrição Municipal "
                    value={formData.inscricaoMunicipal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<Landmark className="w-5 h-5" />}
                  />
                </div>

                <div className="space-y-2">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="dataFundacao"
                      placeholder="dd/mm/aaaa"
                      value={formData.dataFundacao}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      inputMode="numeric"
                      maxLength={10}
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<Calendar className="w-5 h-5" />}
                      error={inputError('dataFundacao')}
                      success={inputSuccess('dataFundacao')}
                    />

                    <Input
                      type="text"
                      name="telefone"
                      placeholder="Telefone "
                      value={formData.telefone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={15}
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<Phone className="w-5 h-5" />}
                    />

                  </div>
                </div>
                <div className="pt-0">
                  <label className="text-[16px] font-medium text-neutral-700">Porte da Empresa</label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <SelectPopover
                      name="porteEmpresa"
                      label=""
                      value={formData.porteEmpresa}
                      onChange={(v) => setFormData((p) => ({ ...p, porteEmpresa: v }))}
                      onBlur={() => handleBlur({ target: { name: "porteEmpresa" } } as any)}
                      required
                      error={inputError("porteEmpresa")}
                      success={inputSuccess("porteEmpresa")}
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      options={porteOptions}
                    />
                  </div>

                  <SelectPopover
                    name="naturezaJuridica"
                    label=""
                    value={formData.naturezaJuridica}
                    required
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    error={inputError("naturezaJuridica")}
                    success={inputSuccess("naturezaJuridica")}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, naturezaJuridica: value }))
                    }
                    onBlur={() =>
                      handleBlur({
                        target: { name: "naturezaJuridica" },
                      } as any)
                    }
                    options={naturezaOptions}
                  />
                </div>

                <SelectPopoverGrouped
                  name="atividadePrincipal"
                  label="Atividade principal"
                  value={formData.atividadePrincipal}
                  required
                  leftIcon={<ArrowRight className="w-4 h-4" />}
                  categories={atividadeCategorias}
                  placeholder="Selecione uma atividade"
                  error={inputError("atividadePrincipal") || atividadesLookupError || undefined}
                  success={inputSuccess("atividadePrincipal")}
                  hint={!inputError("atividadePrincipal") ? atividadesLookupError ?? undefined : undefined}
                  onChange={(v) => setFormData((p) => ({ ...p, atividadePrincipal: v }))}
                  onBlur={() => handleBlur({ target: { name: "atividadePrincipal" } } as any)}
                />

                <div className="pt-0">
                  <p className="text-[16px] font-medium text-neutral-700">Dados do Responsável</p>
                </div>

                <Input
                  type="text"
                  name="nomeResponsavel"
                  placeholder="Nome Completo do Responsável"
                  value={formData.nomeResponsavel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<User className="w-5 h-5" />}
                  error={inputError('nomeResponsavel')}
                  success={inputSuccess('nomeResponsavel')}
                />

                <Input
                  type="email"
                  name="emailResponsavel"
                  placeholder="E-mail do Responsável"
                  value={formData.emailResponsavel ?? ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-readonly="true"
                  autoComplete="email"
                  inputMode="email"
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={inputError('emailResponsavel')}
                  success={inputSuccess('emailResponsavel')}
                />

                <div className="mt-8 space-y-3 md:flex md:flex-col md:items-center">
                  <Button
                    variant="outline"
                    tone="filledLight"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    disabled={loading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    type="submit"
                  >
                    {loading ? 'Salvando...' : 'Endereço'}
                  </Button>

                  <Button
                    variant="outline"
                    tone="plain"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    onClick={() => navigate(-1)}
                    rightIcon={<ArrowLeft className="w-4 h-4" />}
                    type="button"
                  >
                    Voltar
                  </Button>
                </div>
              </form>

              {/* ✅ Modal de sugestões igual PF */}
              <SlugSuggestionsModal
                open={slugSuggest.isOpen}
                suggestions={slugSuggest.suggestions}
                onClose={slugSuggest.close}
                onPick={applySuggestion}
                onRefresh={() => slugSuggest.refresh(formData.razaoSocial ?? '')}
                refreshing={loading}
              />
            </HeaderCardsAuth>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  const className = [
    'w-3 h-3 rounded-full transition-all',
    done ? 'bg-success-500' : active ? 'bg-neutral-900' : 'bg-neutral-300',
  ].join(' ');

  return <div className={className} />;
}

export default PessoaJuridicaFormPage;
