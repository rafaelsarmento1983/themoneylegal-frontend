// frontend/src/pages/profile/AddressFormPage.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Home, Building, ArrowLeft, XCircle, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";
import { useShake } from "@/hooks/useShake";

import { completeAddress, consultarCep, formatCep } from "../../services/profileService";
import { CompleteAddressRequest } from "../../types/profile.types";
import { useRequireIncompleteProfile } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const AddressFormPage: React.FC = () => {
  // mantém: proteção de rota / perfil incompleto
  useRequireIncompleteProfile();

  const navigate = useNavigate();

  const ease = [0.16, 1, 0.3, 1] as const;
  const pageSwap = {
    initial: { opacity: 0, scale: 0.985, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease } },
    exit: { opacity: 0, scale: 0.99, filter: "blur(6px)", transition: { duration: 0.45, ease } },
  };

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({
    cep: false,
    logradouro: false,
    numero: false,
    complemento: false,
    bairro: false,
    cidade: false,
    estado: false,
    pais: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [fieldSuccess, setFieldSuccess] = useState<Partial<Record<string, string>>>({});

  const [formData, setFormData] = useState<CompleteAddressRequest>({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
  });

  const [cepEncontrado, setCepEncontrado] = useState(false);

  const validateField = (name: string, value: string) => {
    const v = (value ?? "").trim();

    let err: string | null = null;
    let ok: string | null = null;

    if (name === "cep") {
      const digits = v.replace(/\D/g, "");
      if (!digits) err = "Informe o CEP.";
      else if (digits.length !== 8) err = "CEP deve ter 8 dígitos.";
      else ok = "CEP";
    }

    if (name === "logradouro") {
      if (!v) err = "Informe o logradouro.";
      else if (v.length < 3) err = "Logradouro muito curto.";
      else ok = "Logradouro";
    }

    if (name === "numero") {
      if (!v) err = "Informe o número.";
      else ok = "Número";
    }

    if (name === "bairro") {
      if (!v) err = "Informe o bairro.";
      else if (v.length < 2) err = "Bairro muito curto.";
      else ok = "Bairro";
    }

    if (name === "cidade") {
      if (!v) err = "Informe a cidade.";
      else if (v.length < 2) err = "Cidade muito curta.";
      else ok = "Cidade";
    }

    if (name === "estado") {
      const uf = v.toUpperCase();
      if (!uf) err = "Informe o estado (UF).";
      else if (!/^[A-Z]{2}$/.test(uf)) err = "UF inválida (use 2 letras).";
      else ok = "UF";
    }

    if (name === "pais") {
      if (!v) err = "Informe o país.";
      else ok = "País";
    }

    // complemento é opcional → sem validação

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
    const requiredFields = ["cep", "logradouro", "numero", "bairro", "cidade", "estado", "pais"] as const;
    let hasError = false;

    setTouched((prev) => {
      const next = { ...prev };
      for (const f of requiredFields) next[f] = true;
      return next;
    });

    for (const f of requiredFields) {
      const { err } = validateField(f, String((formData as any)[f] ?? ""));
      if (err) hasError = true;
    }

    return !hasError;
  };

  const hasVisibleFieldError = useMemo(() => {
    return Object.keys(fieldErrors).some((field) => touched[field] && fieldErrors[field]);
  }, [fieldErrors, touched]);

  const shake = useShake(Boolean(error) || hasVisibleFieldError);

  const inputError = (field: string) => (touched[field] ? fieldErrors[field] : undefined);
  const inputSuccess = (field: string) => (touched[field] ? fieldSuccess[field] : undefined);

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setFormData((prev) => ({ ...prev, cep: formatted }));
    setCepEncontrado(false);

    if (touched.cep) validateField("cep", formatted);
  };

  const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, cep: true }));
    validateField("cep", e.target.value);
  };

  const handleBuscarCep = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setError("CEP deve ter 8 dígitos");
      return;
    }

    setLoadingCep(true);
    setError(null);

    try {
      const result = await consultarCep(formData.cep);

      setFormData((prev) => ({
        ...prev,
        logradouro: result.logradouro || "",
        bairro: result.bairro || "",
        cidade: result.localidade || "",
        estado: result.uf || "",
        complemento: result.complemento || prev.complemento,
      }));

      setCepEncontrado(true);

      // se o usuário já tocou nos campos, revalida ao autopreencher
      if (touched.logradouro) validateField("logradouro", result.logradouro || "");
      if (touched.bairro) validateField("bairro", result.bairro || "");
      if (touched.cidade) validateField("cidade", result.localidade || "");
      if (touched.estado) validateField("estado", result.uf || "");
    } catch (err: any) {
      setError("CEP não encontrado. Verifique e tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBuscarCep();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === "estado" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (touched[name]) validateField(name, nextValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

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
      await completeAddress(formData);

      // ← mantém: atualiza Zustand que perfil está completo
      const { updateUser } = useAuthStore.getState();
      updateUser({ profileCompleted: true });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao salvar endereço");
      setLoading(false);
    }
  };

  const canBuscarCep = formData.cep.replace(/\D/g, "").length === 8;

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key="address" {...pageSwap} className="min-h-screen w-full">
          <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

            <HeaderCardsAuth
              variant="centered"
              title="Money Legal"
              subTitle="Complete seu endereço para finalizar o cadastro."
              shake={shake}
              showLogout
            >
              {/* Stepper (mesma linguagem visual do PessoaFisicaFormPage) */}
              <div className="mt-6 flex items-center justify-center gap-2 mb-8">
                <StepDot active={false} done={true} />
                <div className="w-10 h-[2px] bg-neutral-200" />
                <StepDot active={false} done={true} />
                <div className="w-10 h-[2px] bg-neutral-200" />
                <StepDot active={true} done={false} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-0 border-red-200 rounded-lg text-[15px] font-medium text-red-700 flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {cepEncontrado && (
                <div className="mb-6 p-4 bg-[var(--success-50)] border-0 border-[var(--success-200)] rounded-lg text-center text-[15px] font-medium text-[var(--success-700)] flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  CEP encontrado! Endereço preenchido automaticamente.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* CEP + Buscar (lado a lado) */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        name="cep"
                        placeholder="CEP (12345-678)"
                        value={formData.cep}
                        onChange={handleCepChange}
                        onBlur={handleCepBlur}
                        onKeyDown={handleCepKeyPress}
                        required
                        maxLength={9}
                        customRounded="rounded-xl"
                        customBorder="border-2 border-gray-200"
                        customBg="bg-white"
                        leftIcon={<MapPin className="w-5 h-5" />}
                        error={inputError("cep")}
                        success={inputSuccess("cep")}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      tone="filledLight"
                      className="w-full sm:!w-auto sm:!px-6"
                      onClick={handleBuscarCep}
                      disabled={loadingCep || !canBuscarCep}
                      leftIcon={loadingCep ? undefined : <Search className="w-4 h-4" />}
                    >
                      {loadingCep ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                {/* Logradouro */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                    {/* Logradouro ocupa o resto */}
                    <Input
                      type="text"
                      name="logradouro"
                      placeholder="Logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<Home className="w-5 h-5" />}
                      error={inputError("logradouro")}
                      success={inputSuccess("logradouro")}
                    />

                    {/* Número (coluna pequena) */}
                    <Input
                      type="text"
                      name="numero"
                      placeholder="Número"
                      value={formData.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className="w-28 md:w-32"
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<HashIcon />}
                      error={inputError("numero")}
                      success={inputSuccess("numero")}
                    />
                  </div>
                </div>

                {/* Complemento abaixo do Logradouro */}
                <Input
                  type="text"
                  name="complemento"
                  placeholder="Complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Building className="w-5 h-5" />}
                />

                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                    <Input
                      type="text"
                      name="cidade"
                      placeholder="Cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<MapPin className="w-5 h-5" />}
                      error={inputError("cidade")}
                      success={inputSuccess("cidade")}
                    />
                    <Input
                      type="text"
                      name="estado"
                      placeholder="Estado (UF)"
                      value={formData.estado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={2}
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<MapPin className="w-5 h-5" />}
                      error={inputError("estado")}
                      success={inputSuccess("estado")}
                    />
                  </div>
                </div>

                {/* Bairro + País lado a lado */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                    <Input
                      type="text"
                      name="bairro"
                      placeholder="Bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<Building className="w-5 h-5" />}
                      error={inputError("bairro")}
                      success={inputSuccess("bairro")}
                    />
                    <Input
                      type="text"
                      name="pais"
                      placeholder="País"
                      value={formData.pais}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      customRounded="rounded-xl"
                      customBorder="border-2 border-gray-200"
                      customBg="bg-white"
                      leftIcon={<MapPin className="w-5 h-5" />}
                      error={inputError("pais")}
                      success={inputSuccess("pais")}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3 md:flex md:flex-col md:items-center">
                  <Button
                    type="submit"
                    variant="outline"
                    tone="filledLight"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    disabled={loading}
                    rightIcon={<MapPin className="w-4 h-4" />}
                  >
                    {loading ? "Salvando..." : "Finalizar"}
                  </Button>

                  <Button
                    type="button"
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

function HashIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-neutral-500 font-semibold">
      #
    </span>
  );
}

export default AddressFormPage;
