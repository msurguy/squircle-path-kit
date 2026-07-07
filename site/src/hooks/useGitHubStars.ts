import { useEffect, useState } from "react";

const REPO = "msurguy/squircle-path-kit";
const FALLBACK = "★";
const CACHE_KEY = "sqk-stars";

function format(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

export function useGitHubStars() {
  const [stars, setStars] = useState<string>(() => {
    try {
      return sessionStorage.getItem(CACHE_KEY) ?? FALLBACK;
    } catch {
      return FALLBACK;
    }
  });

  useEffect(() => {
    if (stars !== FALLBACK) return;
    let cancelled = false;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { stargazers_count?: number }) => {
        if (cancelled || typeof data.stargazers_count !== "number") return;
        const value = format(data.stargazers_count);
        setStars(value);
        try {
          sessionStorage.setItem(CACHE_KEY, value);
        } catch {
          /* private mode */
        }
      })
      .catch(() => {
        /* rate-limited or offline — keep fallback */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return stars;
}
