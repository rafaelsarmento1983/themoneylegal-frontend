import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { suggestSlugs, isValidSlug } from "@/lib/slug.utils";
import { toastError, toastDismiss, toastSuccess } from "@/lib/toast/toast";

type Options = {
  count?: number;
  validateSuggestion?: (s: string) => boolean;

  // ✅ global: mensagem ao tentar sugerir sem nome
  emptyNameMessage?: string;
};

export function useSlugSuggest(options?: Options) {
  const count = options?.count ?? 5;

  const emptyNameMessage =
    options?.emptyNameMessage ?? "Por favor, preencha o nome para gerar as sugestões de slug.";

  const validate = options?.validateSuggestion ?? ((s: string) => isValidSlug(s));

  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const close = useCallback(() => setIsOpen(false), []);

  const refresh = useCallback(
    (nome: string) => {
      const base = String(nome ?? "").trim();

      // ✅ Correção global: impede abrir modal sem nome
      if (!base) {
        toastError({
          id: "welcome-back",
          title: "Ooops! 👀",
          description: emptyNameMessage,
          duration: 10_000,
        });
        return;
      }

      const list = (suggestSlugs(base, { count }) ?? []).filter(validate);

      setSuggestions(list);
      setIsOpen(true);
    },
    [count, emptyNameMessage, validate]
  );

  return useMemo(
    () => ({
      isOpen,
      suggestions,
      refresh,
      close,
    }),
    [isOpen, suggestions, refresh, close]
  );
}
