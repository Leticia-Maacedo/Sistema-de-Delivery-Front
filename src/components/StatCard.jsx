import React from "react";

export default function StatCard({ label, value, delta, Icon }) {
  return (
    <div className="ef-card" style={{ padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--accent2-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={19} color="var(--accent2)" />
      </div>
      <div>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", letterSpacing: 0.3 }}>{label}</span>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#fff", margin: "6px 0 4px" }}>{value}</div>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--good)" }}>↑ {delta}</span>
      </div>
    </div>
  );
}
