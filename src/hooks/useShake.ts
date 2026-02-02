// src/hooks/useShake.ts
import { useEffect, useState } from "react";

// useShake(emailExists || emailAvailable) // para mais de uma const
// useShake(emailExists) // para uma const

export function useShake(
  trigger: boolean,
  duration = 400
) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setShake(true);
    const t = setTimeout(() => setShake(false), duration);

    return () => clearTimeout(t);
  }, [trigger, duration]);

  return shake;
}
