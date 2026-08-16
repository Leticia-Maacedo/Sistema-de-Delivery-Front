import { Store, Package, Star, DollarSign, ClipboardList, Wallet } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { ORDERS, fmt } from "../../data/mockData";

export default function AreaParceiroView({ onGo }) {
  const meusPedidos = ORDERS.filter((o) => o.restaurante === "Cantinho do Chef");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader Icon={Store} title="ÁREA DO PARCEIRO" subtitle="Cantinho do Chef · painel do restaurante" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard label="VENDAS HOJE" value="R$ 842" delta="+9% vs ontem" Icon={DollarSign} />
        <StatCard label="PEDIDOS PENDENTES" value="3" delta="2 em preparo" Icon={ClipboardList} />
        <StatCard label="TICKET MÉDIO" value="R$ 47" delta="+R$4 este mês" Icon={Wallet} />
        <StatCard label="AVALIAÇÃO" value="4.8" delta="2.345 avaliações" Icon={Star} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div onClick={() => onGo("cardapios")} className="ef-card" style={{ padding: 18, cursor: "pointer" }}>
          <Package size={20} color="var(--accent)" />
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", marginTop: 10 }}>GERENCIAR CARDÁPIO</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Edite pratos, preços e disponibilidade.</div>
        </div>
        <div onClick={() => onGo("avaliacoes")} className="ef-card" style={{ padding: 18, cursor: "pointer" }}>
          <Star size={20} color="var(--accent)" />
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", marginTop: 10 }}>AVALIAÇÕES</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Veja e responda o feedback dos clientes.</div>
        </div>
      </div>
      <div className="ef-card" style={{ padding: 18 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", letterSpacing: 1 }}>PEDIDOS DO RESTAURANTE</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {meusPedidos.map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderTop: "1px solid var(--border)", fontFamily: "'Exo 2', sans-serif", fontSize: 13 }}>
              <span style={{ color: "var(--accent)" }}>#{o.id}</span>
              <span style={{ color: "#d8d8d8" }}>{o.cliente}</span>
              <StatusBadge status={o.status} />
              <span style={{ color: "#fff" }}>{fmt(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
