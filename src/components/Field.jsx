export default function Field({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Exo 2', sans-serif" }}>
      <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 0.4 }}>{label}</span>
      <input {...props} className="ef-input" />
    </label>
  );
}
