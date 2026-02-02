import React, { useRef } from "react";

interface Props {
  value: string;
  length?: number;
  onChange: (value: string) => void;
}

export const OtpInput: React.FC<Props> = ({
  value,
  length = 6,
  onChange,
}) => {
  const inputs = useRef<HTMLInputElement[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;

    const chars = value.split("");
    chars[i] = v;
    const next = chars.join("");
    onChange(next);

    if (v && inputs.current[i + 1]) {
      inputs.current[i + 1].focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && inputs.current[i - 1]) {
      inputs.current[i - 1].focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el!)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 outline-none"
        />
      ))}
    </div>
  );
};
