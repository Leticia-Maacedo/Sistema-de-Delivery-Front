export default function DetailRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
      <Icon size={15} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)" }}>{label}</div>
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff" }}>{value}</div>
      </div>
    </div>
  );
}
