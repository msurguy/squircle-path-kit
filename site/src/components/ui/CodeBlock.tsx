import { useId, type ReactNode } from "react";
import { useCopy } from "../../hooks/useCopy";
import { CopyButton } from "./CopyButton";

const TOKEN =
  /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|from|export|const|let|var|function|return|type|interface|new)\b|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_$][\w$]*(?=\())/g;

function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(code.slice(last, index));
    const text = match[0];
    const cls = text.startsWith("//")
      ? "tok-cm"
      : /^["'`]/.test(text)
        ? "tok-str"
        : /^\d/.test(text)
          ? "tok-num"
          : /^(?:import|from|export|const|let|var|function|return|type|interface|new)$/.test(text)
            ? "tok-kw"
            : "tok-fn";
    nodes.push(
      <span key={key++} className={cls}>
        {text}
      </span>
    );
    last = index + text.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

export function CodeBlock({
  code,
  lang = "TS",
  sketchClass = "sketch--b",
  plain = false,
}: {
  code: string;
  lang?: string;
  sketchClass?: string;
  plain?: boolean;
}) {
  const { copied, copy } = useCopy();
  const id = useId();

  return (
    <div className={`code-card ${sketchClass}`}>
      <div className="code-card-head">
        <span className="chip-lang">{lang}</span>
        <CopyButton copied={copied === id} onCopy={() => copy(id, code)} />
      </div>
      <pre>
        <code>{plain ? code : highlight(code)}</code>
      </pre>
    </div>
  );
}
