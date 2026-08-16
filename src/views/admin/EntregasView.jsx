import { useState } from "react";
import { Truck, MapPin, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import DetailRow from "../../components/DetailRow";
import { DELIVERIES } from "../../data/mockData";

export default function EntregasView() {
  const [sel, setSel] = useState(DELIVERIES[0].id);
  const d = DELIVERIES.find((x) => x.id === sel);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader Icon={Truck} title="ENTREGAS EM ANDAMENTO" />
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DELIVERIES.map((del) => (
            <div key={del.id} onClick={() => setSel(del.id)} className="ef-card"
              style={{ padding: 12, cursor: "pointer", border: sel === del.id ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "var(--accent)" }}>#{del.id}</span>
                <StatusBadge status={del.status} />
              </div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8", marginTop: 6 }}>{del.entregador}</div>
            </div>
          ))}
        </div>
        <div className="ef-card" style={{ padding: 20 }}>
          <div style={{ height: 220, borderRadius: 8, background: "repeating-linear-gradient(45deg, var(--panel), var(--panel) 10px, #1a1a1a 10px, #1a1a1a 20px)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <MapPin size={28} color="var(--accent)" />
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>Rota de {d.entregador}</span>
          </div>
          <DetailRow icon={Truck} label="Entregador" value={`${d.entregador} · ★ ${d.rating}`} />
          <DetailRow icon={Clock} label="Previsão de entrega" value={d.previsao} />
          <DetailRow icon={MapPin} label="Endereço" value={d.endereco} />
          <button className="ef-btn-solid" style={{ marginTop: 10 }}>ACOMPANHAR NO MAPA</button>
        </div>
      </div>
    </div>
  );
}
