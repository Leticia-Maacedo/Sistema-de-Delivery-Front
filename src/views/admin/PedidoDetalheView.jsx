import { ArrowLeft, Users, Store, MapPin, CreditCard, Clock } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import DetailRow from "../../components/DetailRow";
import EmptyState from "../../components/EmptyState";
import { ORDERS, fmt } from "../../data/mockData";

export default function PedidoDetalheView({ orderId, onBack }) {
  const o = ORDERS.find((x) => x.id === orderId);
  if (!o) return <EmptyState title="PEDIDO NÃO ENCONTRADO" subtitle="Volte e selecione um pedido válido." />;
  const subtotal = o.itens.reduce((s, it) => s + it.preco * it.qtd, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}>
      <button onClick={onBack} className="ef-btn-outline" style={{ alignSelf: "flex-start" }}><ArrowLeft size={14} /> VOLTAR</button>
      <div className="ef-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 15, color: "#fff" }}>#{o.id}</span>
          <StatusBadge status={o.status} />
        </div>
        <DetailRow icon={Users} label="Cliente" value={o.cliente} />
        <DetailRow icon={Store} label="Restaurante" value={o.restaurante} />
        <DetailRow icon={MapPin} label="Endereço de entrega" value={o.endereco} />
        <DetailRow icon={CreditCard} label="Pagamento" value={o.pagamento} />
        <DetailRow icon={Clock} label="Data do pedido" value={o.data} />
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "var(--muted)", letterSpacing: 1 }}>ITENS DO PEDIDO</span>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {o.itens.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8" }}>
                <span>{it.qtd}x {it.nome}</span><span>{fmt(it.preco * it.qtd)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--border)", paddingTop: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}><span>Taxa de entrega</span><span>{o.taxa ? fmt(o.taxa) : "Grátis"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: "#fff", marginTop: 4 }}><span>Total</span><span>{fmt(o.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
