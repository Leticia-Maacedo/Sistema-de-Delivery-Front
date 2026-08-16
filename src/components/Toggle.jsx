export default function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      width: 40, height: 22, borderRadius: 11, border: "1px solid var(--border)",
      background: on ? "var(--accent2)" : "var(--panel)", position: "relative", cursor: "pointer", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 20 : 2, width: 16, height: 16, borderRadius: "50%",
        background: on ? "#0D0D0D" : "var(--muted)", transition: "left 0.15s",
      }} />
    </button>
  );
}
