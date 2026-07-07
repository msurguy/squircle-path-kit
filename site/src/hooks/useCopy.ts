import { useCallback, useState } from "react";

export function useCopy(timeout = 1400) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(
    async (id: string, value: string) => {
      try {
        await navigator.clipboard?.writeText(value);
      } catch {
        return;
      }
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), timeout);
    },
    [timeout]
  );

  return { copied, copy };
}
