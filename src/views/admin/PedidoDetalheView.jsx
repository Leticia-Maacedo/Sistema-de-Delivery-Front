import React, { useEffect, useState } from "react";
import { ArrowLeft, Users, Store, MapPin, CreditCard, Truck } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import DetailRow from "../../components/DetailRow";
import EmptyState from "../../components/EmptyState";
import { pedidos, ApiError } from "../../api/client";
import { fmt, dataHora } from "./PedidosView";

const PAGAMENTO = { cartao: "Cartão de crédito", pix: "PIX", dinheiro: "Dinheiro na entrega" };

/** Detalhe de um pedido para o admin — GET /pedidos/{id}. */
export default function PedidoDetalheView({ orderId, onBack }) {
  const [o, setO] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    pedidos
      .obter(orderId)
      .then(setO)
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o pedido."));
  }, [orderId]);

  const voltar = (
    <button onClick={onBack} className="ef-btn-outline" style={{ alignSelf: "flex-start" }}>
      <ArrowLeft size={14} /> VOLTAR
    </button>
  );
  if (erro) return <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{voltar}<EmptyState title="PEDIDO NÃO ENCONTRADO" subtitle={erro} /></div>;
  if (!o) return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando pedido...</div>;

  const linha = { display: "flex", justifyContent: "space-between", color: "var(--muted)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}>
      {voltar}
      <div className="ef-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 15, color: "#fff" }}>#{o.id}</span>
          <StatusBadge status={o.status_rotulo} />
        </div>
        <DetailRow icon={Users} label="Cliente" value={o.cliente_nome || "—"} />
        <DetailRow icon={Store} label="Restaurante" value={o.restaurante_nome || "—"} />
        <DetailRow icon={Truck} label="Entrega" value={o.tipo_entrega === "retirada" ? "Retirada no balcão" : "Delivery"} />
        {o.tipo_entrega === "delivery" && <DetailRow icon={MapPin} label="Endereço de entrega" value={o.endereco_entrega || "—"} />}
        <DetailRow icon={CreditCard} label="Pagamento" value={`${PAGAMENTO[o.forma_pagamento] || o.forma_pagamento}${o.pagamento_status ? ` · ${o.pagamento_status}` : ""}`} />
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)" }}>ITENS DO PEDIDO</span>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {o.itens.map((it) => (
              <div key={it.produto_id} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
                <span>{it.quantidade}x {it.nome}</span>
                <span>{fmt(it.subtotal)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--border)", paddingTop: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
            <div style={linha}><span>Subtotal dos itens</span><span>{fmt(o.subtotal)}</span></div>
            <div style={linha}><span>Taxa de entrega</span><span>{Number(o.taxa_entrega) ? fmt(o.taxa_entrega) : "Grátis"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14, color: "#fff", marginTop: 4 }}>
              <span>Total</span><span>{fmt(o.valor_total)}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--muted)" }}>LINHA DO TEMPO</span>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {o.etapas.map((e) => (
              <div key={e.status} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: e.concluida ? "#d8d8d8" : "var(--muted)" }}>
                <span>{e.concluida ? "●" : "○"} {e.rotulo}</span>
                <span>{e.data ? dataHora(e.data) : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
