import React, { useState } from "react";
import { MapPin, Truck, Clock } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import DetailRow from "../../components/DetailRow";
import { DELIVERIES } from "../../data/mockData";

export default function EntregasView() {
  const [sel, setSel] = useState(DELIVERIES[0].id);
  const d = DELIVERIES.find((x) => x.id === sel);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DELIVERIES.map((del) => (
          <div
            key={del.id}
            onClick={() => setSel(del.id)}
            className="ef-card"
            style={{ padding: 12, cursor: "pointer", border: sel === del.id ? "1px solid var(--accent)" : "1px solid var(--border)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--accent2)" }}>#{del.id}</span>
              <StatusBadge status={del.status} />
            </div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8", marginTop: 6 }}>{del.entregador}</div>
          </div>
        ))}
      </div>
      <div className="ef-card" style={{ padding: 20 }}>
        <div style={{ height: 220, borderRadius: 8, background: "var(--panel)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <MapPin size={28} color="var(--accent)" />
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>Rota de {d.entregador}</span>
        </div>
        <DetailRow icon={Truck} label="Entregador" value={d.entregador} />
        <DetailRow icon={Clock} label="Janela de entrega" value={d.janela} />
        <DetailRow icon={MapPin} label="Endereço" value={d.endereco} />
        <button className="ef-btn-solid" style={{ marginTop: 10 }}>ACOMPANHAR NO MAPA</button>
      </div>
    </div>
  );
}
