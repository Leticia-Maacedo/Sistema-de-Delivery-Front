import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Stars from "../../components/Stars";
import { REVIEWS } from "../../data/mockData";

export default function AvaliacoesView() {
  const [aberto, setAberto] = useState(null);
  const [resp, setResp] = useState({});
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <PageHeader Icon={Star} title="AVALIAÇÕES" subtitle="Feedback dos clientes · Cantinho do Chef" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
        {REVIEWS.map((r) => (
          <div key={r.id} className="ef-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff" }}>{r.cliente}</span>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{r.data}</span>
            </div>
            <div style={{ marginTop: 6 }}><Stars n={r.nota} /></div>
            <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#d8d8d8", marginTop: 8 }}>{r.comentario}</p>
            {r.resposta ? (
              <div style={{ marginTop: 10, padding: 10, background: "var(--panel)", borderRadius: 6, borderLeft: "2px solid var(--accent)" }}>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--accent)" }}>Resposta do restaurante: </span>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#d8d8d8" }}>{r.resposta}</span>
              </div>
            ) : aberto === r.id ? (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input className="ef-input" style={{ flex: 1 }} placeholder="Escreva uma resposta..."
                  value={resp[r.id] || ""} onChange={(e) => setResp({ ...resp, [r.id]: e.target.value })} />
                <button className="ef-icon-btn"><Send size={14} /></button>
              </div>
            ) : (
              <button onClick={() => setAberto(r.id)} className="ef-btn-outline" style={{ marginTop: 10, padding: "6px 10px", fontSize: 10 }}>
                <MessageSquare size={12} /> RESPONDER
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
