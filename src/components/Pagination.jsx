import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
      <button
        className="ef-icon-btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        style={{ opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            width: 30, height: 30, borderRadius: 6, cursor: "pointer",
            fontFamily: "'Exo 2', sans-serif", fontSize: 12, fontWeight: 700,
            border: `1px solid ${p === page ? "var(--accent)" : "var(--border)"}`,
            background: p === page ? "var(--hover)" : "var(--panel)",
            color: p === page ? "var(--accent)" : "var(--muted)",
          }}
        >
          {p}
        </button>
      ))}
      <button
        className="ef-icon-btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        style={{ opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
