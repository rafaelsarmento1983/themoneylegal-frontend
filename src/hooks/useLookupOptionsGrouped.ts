// frontend/src/hooks/useGroupedLookup.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import api from '@/services/api';
import type { GroupedCategory, GroupedItem, IconLike } from "@/components/ui/SelectPopoverGrouped";

type ApiGroupedItem = {
  id: string;
  label: string;
  icon?: string; // emoji
};

type ApiGroupedCategory = {
  id: string;
  label: string;
  icon?: string; // emoji
  items: ApiGroupedItem[];
};

type UseGroupedLookupParams = {
  endpoint: string; // ex: "/lookups/pessoa-juridica/atividades"
  mapCategory?: (cat: ApiGroupedCategory) => GroupedCategory;
  mapItem?: (item: ApiGroupedItem) => GroupedItem;
};

export function useLookupOptionsGrouped({ endpoint, mapCategory, mapItem }: UseGroupedLookupParams) {
  const [data, setData] = useState<ApiGroupedCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<ApiGroupedCategory[]>(endpoint);
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

  const categories: GroupedCategory[] = useMemo(() => {
    if (loading && data === null) {
      return [
        {
          id: "__loading__",
          label: "Carregando...",
          icon: "⏳" as IconLike,
          items: [
            { value: "__loading_item__", label: "Aguarde...", disabled: true, icon: "…" as IconLike },
          ],
        },
      ];
    }

    const base = (data ?? []).map((cat) => {
      if (mapCategory) return mapCategory(cat);

      return {
        id: cat.id,
        label: cat.label,
        icon: cat.icon,
        items: (cat.items ?? []).map((it) =>
          mapItem
            ? mapItem(it)
            : ({
                value: it.id,     // ✅ value = UUID do item
                label: it.label,
                icon: it.icon,    // ✅ emoji
              } as GroupedItem)
        ),
      } as GroupedCategory;
    });

    return base;
  }, [data, loading, mapCategory, mapItem]);

  return { categories, loading, error, reload };
}
