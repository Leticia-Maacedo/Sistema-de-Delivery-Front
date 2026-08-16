import { ClipboardList } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { ORDERS, fmt } from "../../data/mockData";

export default function HistoricoView({ onOpenOrder }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <PageHeader Icon={ClipboardList} title="HISTÓRICO" subtitle="Seus pedidos anteriores" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {ORDERS.map((o) => (
          <div key={o.id} className="ef-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff" }}>{o.restaurante}</span>
              <StatusBadge status={o.status} />
            </div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              {o.itens.length} {o.itens.length > 1 ? "itens" : "item"} · {o.data}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff" }}>{fmt(o.total)}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onOpenOrder(o.id)} className="ef-btn-outline" style={{ padding: "6px 10px", fontSize: 10 }}>DETALHES</button>
                <button className="ef-btn-solid" style={{ padding: "6px 10px", fontSize: 10, width: "auto" }}>PEDIR DE NOVO</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
