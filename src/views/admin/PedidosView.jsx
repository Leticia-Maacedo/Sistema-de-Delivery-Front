import React, { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { pedidos, ApiError } from "../../api/client";

export const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
export const dataHora = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Tabela de pedidos do admin (também usada no Dashboard com `limite`). */
export function TabelaPedidos({ lista, onOpenOrder }) {
  const th = { padding: "8px" };
  const td = { padding: "10px 8px" };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Exo 2', sans-serif" }}>
      <thead>
        <tr style={{ textAlign: "left", fontSize: 10, color: "var(--muted)" }}>
          <th style={th}>ID</th>
          <th style={th}>CLIENTE</th>
          <th style={th}>RESTAURANTE</th>
          <th style={th}>STATUS</th>
          <th style={th}>TOTAL</th>
          <th style={th}>DATA</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((o) => (
          <tr
            key={o.id}
            onClick={() => onOpenOrder(o.id)}
            style={{ cursor: "pointer", fontSize: 13, color: "#e8e8e8", borderTop: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <td style={{ ...td, color: "var(--accent2)" }}>#{o.id}</td>
            <td style={td}>{o.cliente_nome || "—"}</td>
            <td style={td}>{o.restaurante_nome || "—"}</td>
            <td style={td}><StatusBadge status={o.status_rotulo} /></td>
            <td style={td}>{fmt(o.valor_total)}</td>
            <td style={{ ...td, color: "var(--muted)" }}>{dataHora(o.criado_em)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Todos os pedidos do sistema — GET /pedidos/painel?incluir_finalizados=true (admin vê todos). */
export default function PedidosView({ onOpenOrder }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    pedidos
      .painel(true)
      .then(setLista)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar os pedidos."));
  }, []);

  if (erro) return <EmptyState title="ERRO AO CARREGAR" subtitle={erro} />;
  if (lista === null) return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando pedidos...</div>;
  if (lista.length === 0) return <EmptyState title="NENHUM PEDIDO" subtitle="Os pedidos aparecem aqui assim que os clientes fecharem a cesta." />;

  return (
    <div className="ef-card" style={{ padding: 18 }}>
      <TabelaPedidos lista={lista} onOpenOrder={onOpenOrder} />
    </div>
  );
}
