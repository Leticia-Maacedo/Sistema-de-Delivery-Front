import React from "react";
import { Clock } from "lucide-react";

const hora = (h) => (h ? h.slice(0, 5) : "");

/** Texto do funcionamento do restaurante para o cliente. */
export function textoFuncionamento(r) {
  if (!r) return "";
  if (r.aberto !== false) return r.horario_abertura ? `Aberto · até ${hora(r.horario_fechamento)}` : "Aberto";
  if (r.ativo === false) return "Fechado · não está recebendo pedidos agora";
  return `Fechado · abre às ${hora(r.horario_abertura)}`;
}

/**
 * Selo "Aberto" / "Fechado" (consultas do cliente). Restaurante fechado
 * ou pausado continua aparecendo, mas não aceita pedido (o back confere).
 */
export default function SeloFuncionamento({ restaurante, compacto = false }) {
  const aberto = restaurante?.aberto !== false;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Exo 2', sans-serif",
        fontSize: compacto ? 10 : 11, fontWeight: 700, padding: compacto ? "2px 8px" : "3px 10px", borderRadius: 20,
        color: aberto ? "var(--accent)" : "#E6534C",
        border: `1px solid ${aberto ? "var(--accent)" : "#E6534C"}`,
      }}
    >
      <Clock size={compacto ? 10 : 12} /> {textoFuncionamento(restaurante)}
    </span>
  );
}
