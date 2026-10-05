import React from "react";
import { CheckCircle2 } from "lucide-react";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

export default function PedidoConfirmadoView({ pedido, onVoltarInicio }) {
  return (
    <div style={{ maxWidth: 420, margin: "60px auto 0", textAlign: "center" }}>
      <CheckCircle2 size={56} color="var(--accent)" />
      <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: "#fff", marginTop: 20 }}>
        PEDIDO CONFIRMADO!
      </h1>
      {pedido && (
        <div className="ef-card" style={{ padding: 18, marginTop: 20, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
            <span>Pedido</span><span style={{ color: "var(--accent)" }}>#{pedido.id}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8", marginTop: 8 }}>
            <span>Total</span><span style={{ fontWeight: 700, color: "#fff" }}>{fmt(pedido.valor_total)}</span>
          </div>
        </div>
      )}
      <p style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)", fontSize: 13, marginTop: 16 }}>
        Acompanhe o andamento na tela de Pedidos.
      </p>
      <button className="ef-btn-solid" style={{ marginTop: 20 }} onClick={onVoltarInicio}>
        VOLTAR AO INÍCIO
      </button>
    </div>
  );
}