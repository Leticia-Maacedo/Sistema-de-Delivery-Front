import { ListChecks } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { FEATURES } from "../../data/features";

export default function FuncionalidadesView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader Icon={ListChecks} title="FUNCIONALIDADES" subtitle="Principais funcionalidades identificadas no fluxo do sistema" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {FEATURES.map((f) => (
          <div key={f.titulo} className="ef-card" style={{ padding: 16 }}>
            <f.Icon size={18} color="var(--accent)" />
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#fff", marginTop: 10 }}>{f.titulo}</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
