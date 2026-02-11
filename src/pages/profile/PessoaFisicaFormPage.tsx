// frontend/src/pages/profile/PessoaFisicaFormPage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Phone,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Mail,
  Hash,
  RefreshCcw, XCircle
} from 'lucide-react';
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  completePessoaFisica,
  formatCpf,
  formatTelefone
} from '../../services/profileService';
import { CompletePessoaFisicaRequest } from '../../types/profile.types';
import { useRequireIncompleteProfile } from '@/hooks/useAuth';
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";
import { AnimatePresence, motion } from "framer-motion";
import { useShake } from "@/hooks/useShake";

import { useSlugSuggest } from "@/hooks/useSlugSuggest";
import { SlugSuggestionsModal } from "@/components/ui/SlugSuggestionsModal";
import { generateSlugFromNameStyle, isValidSlug } from "@/lib/slug.utils";

type FormDataState = CompletePessoaFisicaRequest & {
  email?: string;
  slug?: string;
};

const PessoaFisicaFormPage: React.FC = () => {
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

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // ✅ Hook global de sugestão
  const slugSuggest = useSlugSuggest({
    count: 5,
    validateSuggestion: (s) => isValidSlug(s), // garante consistência global
  });

  const initialNome = (user as any)?.name ?? (user as any)?.nomeCompleto ?? '';
  const initialEmail = (user as any)?.email ?? '';
  const initialSlug = generateSlugFromNameStyle(initialNome);

  const [formData, setFormData] = useState<FormDataState>({
    nomeCompleto: initialNome,
    email: initialEmail,
    slug: initialSlug,
    cpf: '',
    dataNascimento: '',
    telefone: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    nomeCompleto: false,
    slug: false,
    email: false,
    cpf: false,
    dataNascimento: false,
    telefone: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [fieldSuccess, setFieldSuccess] = useState<Partial<Record<string, string>>>({});

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

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const validateField = (name: string, value: string) => {
    const v = (value ?? "").trim();

    let err: string | null = null;
    let ok: string | null = null;

    if (name === "nomeCompleto") {
      if (!v) err = "Informe seu nome completo.";
      else if (v.length < 5) err = "Nome muito curto.";
      else ok = "Nome";
    }

    if (name === "slug") {
      if (!v) err = "Informe um slug.";
      else if (v.length < 3) err = "Slug muito curto.";
      else if (!isValidSlug(v)) err = "Slug inválido (use letras, números, '-' e '_').";
      else ok = "Slug";
    }

    if (name === "email") {
      if (!v) err = "E-mail não encontrado no seu cadastro.";
      else if (!isValidEmail(v)) err = "E-mail inválido no cadastro.";
      else ok = "E-mail";
    }

    if (name === "cpf") {
      const digits = v.replace(/\D/g, "");
      if (!digits) err = "Informe seu CPF.";
      else if (digits.length !== 11) err = "CPF incompleto (11 dígitos).";
      else ok = "CPF";
    }

    if (name === "dataNascimento") {
      if (!v) err = "Informe sua data de nascimento.";
      else if (!isValidDateBR(v)) err = "Data inválida (use dd/mm/aaaa).";
      else ok = "Data";
    }

    if (name === "telefone") {
      if (!v) {
        err = null;
        ok = null;
      } else {
        const digits = v.replace(/\D/g, "");
        if (digits.length < 10) err = "Telefone incompleto.";
        else if (digits.length > 11) err = "Telefone";
        else ok = "Telefone";
      }
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];
      return next;
    });

    setFieldSuccess((prev) => {
      const next = { ...prev };
      if (ok && !err) next[name] = ok;
      else delete next[name];
      return next;
    });

    return { err, ok };
  };

  const validateAll = () => {
    const requiredFields = ["nomeCompleto", "slug", "cpf", "dataNascimento"] as const;
    let hasError = false;

    setTouched((prev) => ({
      ...prev,
      nomeCompleto: true,
      slug: true,
      cpf: true,
      dataNascimento: true,
      telefone: prev.telefone,
      email: prev.email,
    }));

    (Object.keys(formData) as string[]).forEach((k) => {
      if (k === "email") return;
      const { err } = validateField(k, (formData as any)[k] ?? "");
      if (err && (requiredFields.includes(k as any) || k === "telefone")) hasError = true;
    });

    const emailValue = String((formData as any).email ?? "").trim();
    const { err: emailErr } = validateField("email", emailValue);
    if (emailErr) hasError = true;

    for (const f of requiredFields) {
      const v = String((formData as any)[f] ?? "").trim();
      if (!v) hasError = true;
    }

    return !hasError;
  };

  const applySuggestion = (s: string) => {
    setFormData((prev) => ({ ...prev, slug: s }));
    setSlugManuallyEdited(true);
    setTouched((prev) => ({ ...prev, slug: true }));
    validateField("slug", s);
    slugSuggest.close();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: string; value: string };

    if (name === "email") return;

    if (name === "nomeCompleto") {
      const newName = value;

      setFormData((prev) => ({
        ...prev,
        nomeCompleto: newName,
      }));

      if (touched.nomeCompleto) validateField("nomeCompleto", newName);

      // ✅ Opcional: se quiser, ao digitar nome, apenas destrava o "manually edited"
      // (mas não mexe no valor do slug)
      // setSlugManuallyEdited(false);

      return;
    }

    if (name === "slug") {
      setSlugManuallyEdited(true);
      setFormData((prev) => ({ ...prev, slug: value }));
      if (touched.slug) validateField("slug", value);
      return;
    }

    let formattedValue = value;

    if (name === "cpf") formattedValue = formatCpf(value);
    else if (name === "telefone") formattedValue = formatTelefone(value);
    else if (name === "dataNascimento") formattedValue = formatDateBR(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (touched[name]) validateField(name, formattedValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: string; value: string };
    if (name === "email") return;

    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const hasVisibleFieldError = useMemo(() => {
    return Object.keys(fieldErrors).some((field) => touched[field] && fieldErrors[field]);
  }, [fieldErrors, touched]);

  const shake = useShake(Boolean(error) || hasVisibleFieldError);

  const inputError = (field: string) => (touched[field] ? fieldErrors[field] : undefined);
  const inputSuccess = (field: string) => (touched[field] ? fieldSuccess[field] : undefined);

  const openSlugSuggest = () => slugSuggest.refresh(formData.nomeCompleto ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const ok = validateAll();
    if (!ok) {
      setLoading(false);
      return;
    }

    try {
      await completePessoaFisica(formData as any);
      navigate('/complete-profile/address');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar dados');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const userNome = (user as any)?.name ?? (user as any)?.nomeCompleto ?? '';
    const userEmail = (user as any)?.email ?? '';

    setFormData((prev) => {
      const nextNome = (!touched.nomeCompleto && !prev.nomeCompleto) ? userNome : prev.nomeCompleto;
      const nextEmail = (!touched.email && !(prev.email ?? "")) ? userEmail : prev.email;

      const shouldAutoSlug =
        !slugManuallyEdited &&
        (!touched.slug && !(prev.slug ?? ""));

      const nextSlug = shouldAutoSlug ? generateSlugFromNameStyle(nextNome) : prev.slug;

      return { ...prev, nomeCompleto: nextNome, email: nextEmail, slug: nextSlug };
    });

    if (userEmail) validateField("email", userEmail);
  }, [user, touched.nomeCompleto, touched.email, touched.slug, slugManuallyEdited]);

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key="login" {...pageSwap} className="min-h-screen w-full">
          <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

            <HeaderCardsAuth
              variant="centered"
              title="Money Legal"
              subTitle="Complete o cadastro com suas informações."
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
                <div className="relative">
                  <Input
                    type="text"
                    name="nomeCompleto"
                    placeholder="Nome Completo"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<User className="w-5 h-5" />}
                    error={inputError("nomeCompleto")}
                    success={inputSuccess("nomeCompleto")}
                  />
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    name="slug"
                    placeholder="Slug"
                    value={formData.slug ?? ""}
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
                    // ✅ alinhamento vertical do rightIcon (baseline fix)
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
                    error={inputError("slug")}
                    success={inputSuccess("slug")}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Este é o nome de perfil para outros usuários te encontrarem. Digite um nome ou clique no botão para ver sugestões.
                  </p>
                </div>

                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={formData.email ?? ""}
                    required
                    readOnly
                    disabled
                    aria-readonly="true"
                    autoComplete="email"
                    inputMode="email"
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<Mail className="w-5 h-5" />}
                    error={fieldErrors["email"]}
                    success={!fieldErrors["email"] ? fieldSuccess["email"] : undefined}
                  />
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<BadgeCheck className="w-5 h-5" />}
                    error={inputError("cpf")}
                    success={inputSuccess("cpf")}
                  />
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    name="dataNascimento"
                    placeholder="dd/mm/aaaa"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    inputMode="numeric"
                    maxLength={10}
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<Calendar className="w-5 h-5" />}
                    error={inputError("dataNascimento")}
                    success={inputSuccess("dataNascimento")}
                  />
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    name="telefone"
                    placeholder="Celular"
                    value={formData.telefone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={15}
                    customRounded="rounded-xl"
                    customBorder="border-2 border-gray-200"
                    customBg="bg-white"
                    leftIcon={<Phone className="w-5 h-5" />}
                    error={inputError("telefone")}
                    success={inputSuccess("telefone")}
                  />
                </div>

                <div className="mt-от-8 space-y-3 md:flex md:flex-col md:items-center">
                  <Button
                    variant="outline"
                    tone="filledLight"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    disabled={loading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {loading ? "Salvando..." : "Endereço"}
                  </Button>

                  <Button
                    variant="outline"
                    tone="plain"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    onClick={() => navigate(-1)}
                    rightIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Voltar
                  </Button>
                </div>
              </form>

              <SlugSuggestionsModal
                open={slugSuggest.isOpen}
                suggestions={slugSuggest.suggestions}
                onClose={slugSuggest.close}
                onPick={applySuggestion}
                onRefresh={() => slugSuggest.refresh(formData.nomeCompleto ?? "")}
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
    "w-3 h-3 rounded-full transition-all",
    done ? "bg-success-500" : active ? "bg-neutral-900" : "bg-neutral-300",
  ].join(" ");

  return <div className={className} />;
}

export default PessoaFisicaFormPage;
