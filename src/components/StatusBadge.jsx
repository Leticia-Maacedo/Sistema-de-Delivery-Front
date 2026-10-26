import React from "react";
import { Circle } from "lucide-react";

/* Cores por rótulo de status do pedido (app/core/status_pedido.py — ROTULOS). */
const CINZA = { bg: "rgba(138,138,138,0.14)", fg: "#B5B5B5", dot: "#B5B5B5" };
const AZUL = { bg: "rgba(122,140,255,0.14)", fg: "#8C9BFF", dot: "#8C9BFF" };
const AMARELO = { bg: "rgba(230,180,60,0.14)", fg: "#E6B43C", dot: "#E6B43C" };
const VERDE_LIMAO = { bg: "rgba(166,255,0,0.12)", fg: "#A6FF00", dot: "#A6FF00" };

const STATUS_STYLE = {
  "Aguardando o restaurante": CINZA,
  "Pedido aceito": AZUL,
  "Em preparação": AMARELO,
  "Pronto para entrega": VERDE_LIMAO,
  "Pronto para retirada": VERDE_LIMAO,
  "Saiu para entrega": VERDE_LIMAO,
  Entregue: { bg: "rgba(29,185,84,0.14)", fg: "#3DDC72", dot: "#3DDC72" },
  Cancelado: { bg: "rgba(230,83,76,0.14)", fg: "#E6534C", dot: "#E6534C" },
};

export default function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || CINZA;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: s.bg, color: s.fg, border: `1px solid ${s.fg}55`,
        padding: "4px 10px", borderRadius: 20, fontFamily: "'Exo 2', sans-serif",
        fontWeight: 600, fontSize: 11, whiteSpace: "nowrap",
      }}
    >
      <Circle size={6} fill={s.dot} color={s.dot} /> {status}
    </span>
  );
}
