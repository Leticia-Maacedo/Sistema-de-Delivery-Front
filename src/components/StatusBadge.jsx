import { Circle } from "lucide-react";
import { STATUS_STYLE } from "../data/mockData";

export default function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Confirmado;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.fg, border: `1px solid ${s.fg}55`,
      padding: "4px 10px", borderRadius: 4, fontFamily: "'Orbitron', sans-serif",
      fontSize: 10, letterSpacing: 0.5, whiteSpace: "nowrap",
    }}>
      <Circle size={6} fill={s.dot} color={s.dot} /> {status}
    </span>
  );
}
