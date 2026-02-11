// frontend/src/utils/slug.utils.ts

export type SlugSuggestOptions = {
  count?: number;              // default: 5
  includeNumbers?: boolean;    // default: true
  minNum?: number;             // default: 10
  maxNum?: number;             // default: 9999
};

export const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const toAsciiWords = (fullName: string) => {
  const normalized = (fullName ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .trim();

  return normalized.split(/\s+/).filter(Boolean);
};

export const lower = (s: string) => (s ?? "").toLowerCase();

export const upperFirst = (s: string) => {
  const x = (s ?? "").toLowerCase();
  if (!x) return x;
  return x.charAt(0).toUpperCase() + x.slice(1);
};

export const pascalWords = (words: string[]) => words.map(upperFirst).join("");

export const camelWords = (words: string[]) => {
  if (!words.length) return "";
  return lower(words[0]) + words.slice(1).map(upperFirst).join("");
};

export const sanitizeSlug = (s: string) => {
  return (s ?? "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/[-_]{2,}/g, (m) => m[0])
    .replace(/^[-_]+|[-_]+$/g, "");
};

// ✅ mesmo regex que você já usa no formulário
export const isValidSlug = (value: string) => {
  const v = (value ?? "").trim();
  return /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/.test(v);
};

// garante "_" e "-" e upper/lower e (opcional) número
export const ensureMixed = (
  s: string,
  fallbackA: string,
  fallbackB: string,
  options?: SlugSuggestOptions
) => {
  const includeNumbers = options?.includeNumbers ?? true;
  const minNum = options?.minNum ?? 10;
  const maxNum = options?.maxNum ?? 9999;

  const hasUnderscore = /_/.test(s);
  const hasHyphen = /-/.test(s);
  const hasUpper = /[A-Z]/.test(s);
  const hasLower = /[a-z]/.test(s);
  const hasNumber = /\d/.test(s);

  const okNumbers = includeNumbers ? hasNumber : true;

  if (hasUnderscore && hasHyphen && hasUpper && hasLower && okNumbers) return s;

  const num = includeNumbers ? String(randInt(minNum, maxNum)) : "";
  const a = upperFirst(fallbackA || "User");
  const b = lower(fallbackB || "name");

  const fallback = includeNumbers ? `${a}_${b}-${num}` : `${a}_${b}-${upperFirst(b)}`;
  return sanitizeSlug(fallback);
};

/**
 * Sugere N slugs (novos a cada chamada)
 * - Sem alternância letra a letra (maiúscula/minúscula é por palavra)
 * - Mistura "-" + "_" + upper/lower + número (quando includeNumbers=true)
 */
export const suggestSlugs = (fullName: string, opts?: SlugSuggestOptions) => {
  const count = opts?.count ?? 5;

  const parts = toAsciiWords(fullName);
  if (!parts.length) return [];

  const first = parts[0] ?? "User";
  const last = parts.length > 1 ? parts[parts.length - 1] : "Name";
  const middle = parts.length > 2 ? parts[1] : "";

  const num2 = () => String(randInt(10, 99));
  const num3 = () => String(randInt(100, 999));
  const num4 = () => String(randInt(1000, 9999));

  const patternGenerators: Array<() => string> = [
    () => `${upperFirst(first)}_${upperFirst(last)}-${num3()}`,
    () => `${lower(first)}_${upperFirst(last)}-${num2()}`,
    () => `${upperFirst(first)}_${upperFirst(last)}-${num4()}`,
    () => `${lower(first)}-${lower(last)}_${num3()}`,
    () => `${upperFirst(first)}-${upperFirst(last)}_${num2()}`,
    () => `${camelWords([first, last])}_${lower(middle || "dev")}-${num3()}`,
    () => `${pascalWords([first, last])}_${upperFirst(middle || "app")}-${num2()}`,
    () => `${(first[0] || "U").toUpperCase()}${(last[0] || "N").toUpperCase()}_${lower(first)}-${num3()}`,
  ];

  const set = new Set<string>();
  const order = shuffle(patternGenerators);
  let guard = 0;

  while (set.size < count && guard < 120) {
    const gen = order[guard % order.length];
    let candidate = sanitizeSlug(gen());
    candidate = ensureMixed(candidate, first, last, { ...opts, count });
    set.add(candidate);
    guard++;
  }

  return Array.from(set).slice(0, count);
};

/**
 * Gera um slug "auto" a partir do nome, com estilo semelhante às sugestões
 * (por padrão: sem números).
 * Determinístico (não muda a cada tecla).
 */
export const generateSlugFromNameStyle = (fullName: string, opts?: { includeNumbers?: boolean }) => {
  const parts = toAsciiWords(fullName);
  if (!parts.length) return "";

  const first = parts[0] ?? "User";
  const last = parts.length > 1 ? parts[parts.length - 1] : "Name";
  const middle = parts.length > 2 ? parts[1] : "";

  const includeNumbers = opts?.includeNumbers ?? false;

  const seed = (fullName ?? "").length;
  const variant = seed % 3;

  let base = "";
  if (variant === 0) {
    base = `${upperFirst(first)}_${upperFirst(last)}-${upperFirst(middle || last)}`;
  } else if (variant === 1) {
    base = `${camelWords([first, last])}_${lower(middle || "dev")}-${upperFirst(last)}`;
  } else {
    base = `${upperFirst(first)}-${upperFirst(last)}_${camelWords([first, last])}`;
  }

  base = sanitizeSlug(base);

  return ensureMixed(
    includeNumbers ? `${base}-${randInt(10, 9999)}` : base,
    first,
    last,
    { includeNumbers }
  );
};
