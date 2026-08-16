export default function StatCard({ label, value, delta, Icon }) {
  return (
    <div className="ef-card" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "var(--muted)", letterSpacing: 1 }}>{label}</span>
        <Icon size={16} color="var(--accent)" />
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: "#fff", margin: "10px 0 6px" }}>{value}</div>
      <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--good)" }}>{delta}</span>
    </div>
  );
}
