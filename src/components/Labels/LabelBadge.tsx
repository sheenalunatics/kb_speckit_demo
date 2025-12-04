import type { Label } from "@/types";

interface LabelBadgeProps {
  label: Label;
}

export default function LabelBadge({ label }: LabelBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  );
}
