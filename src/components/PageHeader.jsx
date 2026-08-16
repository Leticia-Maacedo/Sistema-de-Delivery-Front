export default function PageHeader({ Icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 17, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={19} color="var(--accent)" /> {title}
      </h1>
      {subtitle && <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{subtitle}</p>}
    </div>
  );
}
