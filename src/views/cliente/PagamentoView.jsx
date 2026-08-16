import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { PAYMENT_METHODS } from "../../data/mockData";

export default function PagamentoView() {
  const [metodos, setMetodos] = useState(PAYMENT_METHODS);
  const setPadrao = (id) => setMetodos((m) => m.map((x) => ({ ...x, padrao: x.id === id })));
  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <PageHeader Icon={CreditCard} title="PAGAMENTO" subtitle="Suas formas de pagamento salvas" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {metodos.map((m) => (
          <div key={m.id} className="ef-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", border: m.padrao ? "1px solid var(--accent)" : "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <m.Icon size={18} color="var(--accent)" />
              <div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff" }}>{m.tipo}</div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{m.info}</div>
              </div>
            </div>
            {m.padrao ? (
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "var(--accent)" }}>PADRÃO</span>
            ) : (
              <button onClick={() => setPadrao(m.id)} className="ef-btn-outline" style={{ padding: "6px 10px", fontSize: 10 }}>USAR</button>
            )}
          </div>
        ))}
      </div>
      <button className="ef-btn-outline" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}><Plus size={14} /> ADICIONAR NOVO CARTÃO</button>
    </div>
  );
}
