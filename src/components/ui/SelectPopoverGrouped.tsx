import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Input } from '@/components/ui/Input';

export type IconLike = ReactNode | string;

export type GroupedItem = {
    value: string;
    label: string;
    icon?: IconLike;
    disabled?: boolean;
    keywords?: string[]; // opcional pra melhorar busca
};

export type GroupedCategory = {
    id: string;
    label: string;
    icon?: IconLike;
    items: GroupedItem[];
};

export type SelectPopoverGroupedProps = {
    name?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;

    label?: string;
    placeholder?: string;

    categories: GroupedCategory[];

    // busca
    searchable?: boolean;
    searchPlaceholder?: string;

    error?: string;
    success?: string;
    hint?: string;

    leftIcon?: ReactNode;
    rightIcon?: ReactNode; // se não passar, usa ChevronDown
    leftIconClassName?: string;
    rightIconClassName?: string;

    customBg?: string;
    customBorder?: string;
    customRounded?: string;

    containerClassName?: string;
    labelClassName?: string;
    dropdownClassName?: string;
};

const renderIcon = (ic?: IconLike) => {
    if (!ic) return null;
    if (typeof ic === "string") return <span className="text-base leading-none">{ic}</span>;
    return ic;
};

export const SelectPopoverGrouped: React.FC<SelectPopoverGroupedProps> = ({
    name,
    value,
    onChange,
    onBlur,
    disabled,
    required,

    label,
    placeholder = "Selecione",

    categories,

    searchable = true,
    searchPlaceholder = "Buscar...",

    error,
    success,
    hint,

    leftIcon,
    rightIcon,
    leftIconClassName,
    rightIconClassName,

    customBg = "bg-white",
    customBorder = "border-2 border-gray-200",
    customRounded = "rounded-xl",

    containerClassName,
    labelClassName,
    dropdownClassName,
}) => {
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeFlatIndex, setActiveFlatIndex] = useState(-1);

    const rootRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);

    const close = () => {
        setOpen(false);
        setActiveFlatIndex(-1);
        setQuery("");
        onBlur?.();
    };

    const toggle = () => {
        if (disabled) return;
        setOpen((v) => !v);
    };

    // click fora
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            const el = rootRef.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) close();
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [open]);

    // filtra itens por busca
    const filteredCategories = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return categories;

        return categories
            .map((cat) => {
                const items = cat.items.filter((it) => {
                    const hay = [
                        it.label,
                        it.value,
                        ...(it.keywords ?? []),
                        cat.label,
                    ]
                        .join(" ")
                        .toLowerCase();
                    return hay.includes(q);
                });
                return { ...cat, items };
            })
            .filter((cat) => cat.items.length > 0);
    }, [categories, query]);

    // lista “flat” para navegação por teclado
    const flatItems = useMemo(() => {
        const list: Array<{ catId: string; item: GroupedItem }> = [];
        for (const cat of filteredCategories) {
            for (const item of cat.items) {
                if (!item.disabled) list.push({ catId: cat.id, item });
            }
        }
        return list;
    }, [filteredCategories]);

    const selected = useMemo(() => {
        for (const cat of categories) {
            const found = cat.items.find((i) => i.value === value);
            if (found) return { cat, item: found };
        }
        return null;
    }, [categories, value]);

    // teclado
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                close();
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveFlatIndex((prev) => {
                    const max = flatItems.length - 1;
                    if (max < 0) return -1;
                    const next = prev < 0 ? 0 : Math.min(prev + 1, max);
                    return next;
                });
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveFlatIndex((prev) => {
                    const max = flatItems.length - 1;
                    if (max < 0) return -1;
                    const next = prev <= 0 ? 0 : Math.max(prev - 1, 0);
                    return next;
                });
                return;
            }

            if (e.key === "Enter") {
                if (activeFlatIndex < 0) return;
                e.preventDefault();
                const pick = flatItems[activeFlatIndex]?.item;
                if (pick) {
                    onChange?.(pick.value);
                    close();
                    queueMicrotask(() => buttonRef.current?.focus());
                }
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, activeFlatIndex, flatItems, onChange]);

    // ao abrir: foca busca e posiciona índice no selecionado
    useEffect(() => {
        if (!open) return;
        queueMicrotask(() => searchRef.current?.focus());

        const idx = flatItems.findIndex((x) => x.item.value === value);
        setActiveFlatIndex(idx >= 0 ? idx : flatItems.length ? 0 : -1);
    }, [open, flatItems, value]);

    const modalSwap = {
        initial: { opacity: 0, y: 6, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16 } },
        exit: { opacity: 0, y: 6, scale: 0.99, transition: { duration: 0.12 } },
    };

    const displayLabel = selected?.item.label ?? "";
    const displayIcon = selected?.item.icon;

    return (
        <div className={cn("w-full", containerClassName)} ref={rootRef}>
            {label && (
                <label className={cn("block text-sm font-semibold text-neutral-700 mb-2", labelClassName)}>
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Left icon */}
                {leftIcon && (
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                        <span className={cn("text-neutral-400", leftIconClassName)}>{leftIcon}</span>
                    </div>
                )}

                {/* Button styled like Input */}
                <button
                    ref={buttonRef}
                    type="button"
                    name={name}
                    disabled={disabled}
                    onClick={toggle}
                    className={cn(
                        "w-full h-12 px-4 font-medium text-neutral-900 transition-all duration-200 text-left",
                        "border-2 border-gray-200",
                        "focus:outline-none",
                        "focus:border-brand-primary-500",
                        "focus:ring-4 focus:ring-brand-primary-100",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "flex items-center gap-2 whitespace-nowrap",
                        leftIcon ? "pl-10" : "",
                        "pr-10",
                        customBg,
                        customRounded
                    )}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >          {/* ícone selecionado (opcional) */}
                    {displayIcon ? <span className="text-neutral-500 flex-shrink-0">{renderIcon(displayIcon)}</span> : null}

                    {/* label com truncate */}
                    <span
                        className={cn(
                            "min-w-0 flex-1 truncate font-medium",
                            displayLabel
                                ? "text-neutral-900 dark:text-white"
                                : "text-neutral-900 dark:text-neutral-500"
                        )}
                    >
                        {displayLabel || placeholder}
                    </span>
                </button>

                {/* Right icon */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
                    <span className={cn("text-neutral-400", rightIconClassName)}>
                        {rightIcon ?? <ChevronDown className="w-4 h-4" />}
                    </span>
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            {...modalSwap}
                            className={cn(
                                "absolute z-[60] mt-2 w-full rounded-xl bg-white shadow-xl border border-neutral-200 overflow-hidden",
                                dropdownClassName
                            )}
                            role="listbox"
                        >
                            {searchable && (
                                <div className="h-16 px-3 py-2 border-b border-neutral-100">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            ref={searchRef}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder={searchPlaceholder}
                                            customRounded="rounded-xl"
                                            customBorder="border-2 border-gray-200"
                                            customBg="bg-white"
                                            customFocusRing="focus:ring-0 focus:outline-none focus:rounded-xl"
                                            leftIcon={<Search className="w-5 h-5" />}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="max-h-80 overflow-auto">
                                {filteredCategories.length === 0 ? (
                                    <div className="p-4 text-sm text-neutral-600">Nenhum resultado.</div>
                                ) : (
                                    filteredCategories.map((cat) => (
                                        <div key={cat.id} className="py-2">
                                            {/* Categoria */}
                                            <div className="px-4 py-2 text-xs font-semibold text-neutral-600 uppercase flex items-center gap-2">
                                                {cat.icon ? <span className="text-neutral-500">{renderIcon(cat.icon)}</span> : null}
                                                <span>{cat.label}</span>
                                            </div>

                                            {/* Itens */}
                                            <div className="grid grid-cols-1">
                                                {cat.items.map((opt) => {
                                                    const isSelected = opt.value === value;

                                                    const flatIndex = flatItems.findIndex((x) => x.item.value === opt.value);
                                                    const isActive = flatIndex >= 0 && flatIndex === activeFlatIndex;

                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            disabled={opt.disabled}
                                                            onMouseEnter={() => {
                                                                if (opt.disabled) return;
                                                                setActiveFlatIndex(flatIndex);
                                                            }}
                                                            onClick={() => {
                                                                if (opt.disabled) return;
                                                                onChange?.(opt.value);
                                                                close();
                                                                queueMicrotask(() => buttonRef.current?.focus());
                                                            }}
                                                            className={cn(
                                                                "w-full px-4 py-3 text-left text-sm flex items-center gap-2",
                                                                opt.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-100",
                                                                isActive && !opt.disabled ? "bg-neutral-100" : "",
                                                                isSelected ? "font-semibold text-neutral-900" : "text-neutral-700"
                                                            )}
                                                        >
                                                            {opt.icon ? <span className="text-neutral-500">{renderIcon(opt.icon)}</span> : null}
                                                            <span className="flex-1">{opt.label}</span>
                                                            {isSelected && <Check className="w-4 h-4 text-neutral-500" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-1.5 min-h-[20px]">
                {hasError && (
                    <p className="text-sm text-danger-600 flex items-center gap-1.5 animate-slide-in-down">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </p>
                )}

                {!hasError && hasSuccess && (
                    <p className="text-sm text-success-600 flex items-center gap-1.5 animate-slide-in-down">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        {success}
                    </p>
                )}

                {!hasError && !hasSuccess && hint && <p className="text-sm text-neutral-500">{hint}</p>}
            </div>
        </div>
    );
};
