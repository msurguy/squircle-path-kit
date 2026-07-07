import { Check, Copy } from "lucide-react";

export function CopyButton({
  copied,
  onCopy,
  label = "Copy",
}: {
  copied: boolean;
  onCopy: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="copy-btn" onClick={onCopy}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
}
