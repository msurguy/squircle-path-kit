import { Download } from "lucide-react";
import { useState } from "react";
import { outTabs, type OutTab } from "../../snippets";
import { useCopy } from "../../hooks/useCopy";
import { CopyButton } from "../ui/CopyButton";

export function OutputTabs({
  snippets,
  svgMarkup,
}: {
  snippets: Record<OutTab, string>;
  svgMarkup: string;
}) {
  const [active, setActive] = useState<OutTab>("path");
  const { copied, copy } = useCopy();

  const download = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "squircle.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="out-tabs" role="tablist" aria-label="Code output">
        {outTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`out-tab ${active === tab.id ? "active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="out-code">
        <code>{snippets[active]}</code>
      </pre>
      <div className="pg-actions">
        <CopyButton copied={copied === "out"} onCopy={() => copy("out", snippets[active])} />
        <button type="button" className="copy-btn" onClick={download}>
          <Download size={13} />
          Download SVG
        </button>
      </div>
    </div>
  );
}
