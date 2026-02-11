// frontend/src/hooks/useLookupOptions.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import api from '@/services/api';

import type { SelectOption } from "@/components/ui/SelectPopover";

type LookupItem = {
  id: string;
  label: string;
  icon?: string; // emoji no backend
};

type UseLookupOptionsParams = {
  endpoint: string;                 // ex: "/lookups/pessoa-juridica/portes"
  placeholderLabel?: string;        // ex: "Selecione"
  includePlaceholder?: boolean;     // default true
  mapItem?: (item: LookupItem) => SelectOption; // override opcional
};

export function useLookupOptions({
  endpoint,
  placeholderLabel = "Selecione",
  includePlaceholder = true,
  mapItem,
}: UseLookupOptionsParams) {
  const [data, setData] = useState<LookupItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<LookupItem[]>(endpoint);
      setData(res.data ?? []);
    } catch (e) {
      setError("Não foi possível carregar as opções.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    reload();
  }, [reload]);

  const options: SelectOption[] = useMemo(() => {
    const base = (data ?? []).map((item) =>
      mapItem
        ? mapItem(item)
        : {
            value: item.id,
            label: item.label,
            icon: item.icon, // emoji
          }
    );

    if (!includePlaceholder) return base;

    return [
      { value: "", label: placeholderLabel },
      ...(loading && !data
        ? [{ value: "__loading__", label: "Carregando...", disabled: true }]
        : base),
    ];
  }, [data, loading, includePlaceholder, placeholderLabel, mapItem]);

  return { options, loading, error, reload };
}
