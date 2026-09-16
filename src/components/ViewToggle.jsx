import React from "react";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle({ view, onChange }) {
  const opt = (key, Icon) => (
    <button
      onClick={() => onChange(key)}
      className="ef-icon-btn"
      style={{
        color: view === key ? "var(--accent)" : "var(--muted)",
        borderColor: view === key ? "var(--accent)" : "var(--border)",
      }}
      aria-label={key === "grid" ? "Ver em grade" : "Ver em lista"}
    >
      <Icon size={15} />
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {opt("grid", LayoutGrid)}
      {opt("list", List)}
    </div>
  );
}
