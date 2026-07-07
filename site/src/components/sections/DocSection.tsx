import type { ReactNode } from "react";

export function DocSection({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="doc-section">
      {kicker ? <p className="doc-kicker">{kicker.toUpperCase()}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
