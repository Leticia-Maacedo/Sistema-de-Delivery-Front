export default function EmptyState({ title, subtitle }) {
  return (
    <div className="ef-card" style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: "var(--accent)", marginBottom: 12 }}>{title}</div>
      <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "var(--muted)" }}>{subtitle}</div>
    </div>
  );
}
