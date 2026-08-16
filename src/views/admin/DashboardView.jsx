import React from "react";
import { BarChart3, Users, Store, ClipboardList, Truck, DollarSign, ChevronRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { ORDERS, INTEGRATIONS, ACTIVITIES, fmt } from "../../data/mockData";
import { FLOW } from "../../data/navigation";

export default function DashboardView({ onOpenOrder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PageHeader Icon={BarChart3} title="DASHBOARD" subtitle="Visão geral do sistema" />
        <div className="ef-card" style={{ padding: "8px 14px", fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "var(--accent)" }}>10/08/2026 · 14:35</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <StatCard label="USUÁRIOS" value="1.248" delta="+12 este mês" Icon={Users} />
        <StatCard label="RESTAURANTES" value="321" delta="+8 este mês" Icon={Store} />
        <StatCard label="PEDIDOS" value="2.563" delta="+18% este mês" Icon={ClipboardList} />
        <StatCard label="ENTREGAS" value="1.987" delta="+15% este mês" Icon={Truck} />
        <StatCard label="FATURAMENTO" value="R$45,9k" delta="+22% este mês" Icon={DollarSign} />
      </div>

      <div className="ef-card" style={{ padding: 18 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", letterSpacing: 1 }}>PEDIDOS RECENTES</span>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Exo 2', sans-serif", marginTop: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "var(--muted)" }}>
              <th style={{ padding: "6px 8px" }}>ID</th><th style={{ padding: "6px 8px" }}>CLIENTE</th>
              <th style={{ padding: "6px 8px" }}>RESTAURANTE</th><th style={{ padding: "6px 8px" }}>STATUS</th><th style={{ padding: "6px 8px" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id} onClick={() => onOpenOrder(o.id)} style={{ cursor: "pointer", fontSize: 13, color: "#e8e8e8", borderTop: "1px solid var(--border)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 8px", color: "var(--accent)" }}>#{o.id}</td>
                <td style={{ padding: "10px 8px" }}>{o.cliente}</td>
                <td style={{ padding: "10px 8px" }}>{o.restaurante}</td>
                <td style={{ padding: "10px 8px" }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: "10px 8px" }}>{fmt(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ef-card" style={{ padding: 18, overflowX: "auto" }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", letterSpacing: 1 }}>FLUXO DO SISTEMA</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, minWidth: 720 }}>
          {FLOW.map((f, i) => (
            <React.Fragment key={f.label}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 68 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--panel)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.Icon size={18} color="var(--accent)" />
                </div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10, color: "var(--muted)", textAlign: "center", whiteSpace: "pre-line" }}>{f.label}</span>
              </div>
              {i < FLOW.length - 1 && <ChevronRight size={16} color="var(--border)" style={{ flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="ef-card" style={{ padding: 18 }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", letterSpacing: 1 }}>INTEGRAÇÕES</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {INTEGRATIONS.map((it) => (
              <div key={it.nome} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--panel)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <it.Icon size={16} color="var(--accent)" />
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff" }}>{it.nome}</span>
                </div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--good)" }}>● {it.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ef-card" style={{ padding: 18 }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff", letterSpacing: 1 }}>ATIVIDADES RECENTES</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {ACTIVITIES.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>
                <span style={{ color: "var(--accent)", fontFamily: "'Orbitron', sans-serif", fontSize: 10, flexShrink: 0 }}>{a.hora}</span>
                <span style={{ color: "#d8d8d8" }}>{a.texto} {a.ref && <span style={{ color: "var(--accent)" }}>{a.ref}</span>}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
