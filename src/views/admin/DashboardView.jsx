import React from "react";
import { Users, Store, ClipboardList, Truck, DollarSign, ChevronRight } from "lucide-react";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { ORDERS, DELIVERIES, ACTIVITIES, INTEGRATIONS, REVENUE, fmt } from "../../data/mockData";
import { FLOW } from "../../data/features";

/* Gráfico de faturamento em SVG puro, sem dependência externa */
function RevenueChart() {
  const w = 620, h = 220, pad = 40;
  const max = Math.max(...REVENUE.map((r) => r.v)) * 1.15;
  const pts = REVENUE.map((r, i) => {
    const x = pad + (i * (w - pad * 2)) / (REVENUE.length - 1);
    const y = h - pad - (r.v / max) * (h - pad * 1.5);
    return { x, y, ...r };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${path} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A6FF00" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A6FF00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((f, i) => (
        <line
          key={i} x1={pad} x2={w - pad}
          y1={h - pad - f * (h - pad * 1.5)} y2={h - pad - f * (h - pad * 1.5)}
          stroke="#2A2A2A" strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#rev-grad)" />
      <path d={path} fill="none" stroke="#A6FF00" strokeWidth="2.5" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill="#A6FF00" stroke="#0D0D0D" strokeWidth="2" />
          <text x={p.x} y={h - 12} fontSize="10" fill="#8A8A8A" textAnchor="middle" fontFamily="Exo 2, sans-serif">{p.d}</text>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardView({ onOpenOrder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <StatCard label="USUÁRIOS" value="1.248" delta="12 este mês" Icon={Users} />
        <StatCard label="RESTAURANTES" value="321" delta="8 este mês" Icon={Store} />
        <StatCard label="PEDIDOS" value="2.563" delta="18% este mês" Icon={ClipboardList} />
        <StatCard label="ENTREGAS" value="1.987" delta="15% este mês" Icon={Truck} />
        <StatCard label="FATURAMENTO" value="R$45,9k" delta="22% este mês" Icon={DollarSign} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="ef-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Pedidos Recentes</span>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--accent)", cursor: "pointer" }}>Ver todos</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Exo 2', sans-serif", marginTop: 8 }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 10, color: "var(--muted)" }}>
                <th style={{ padding: "6px 8px" }}>ID</th>
                <th style={{ padding: "6px 8px" }}>CLIENTE</th>
                <th style={{ padding: "6px 8px" }}>RESTAURANTE</th>
                <th style={{ padding: "6px 8px" }}>STATUS</th>
                <th style={{ padding: "6px 8px" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => onOpenOrder(o.id)}
                  style={{ cursor: "pointer", fontSize: 13, color: "#e8e8e8", borderTop: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 8px", color: "var(--accent2)" }}>#{o.id}</td>
                  <td style={{ padding: "10px 8px" }}>{o.cliente}</td>
                  <td style={{ padding: "10px 8px" }}>{o.restaurante}</td>
                  <td style={{ padding: "10px 8px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "10px 8px" }}>{fmt(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ef-card" style={{ padding: 18 }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Entregas em Andamento</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {DELIVERIES.map((d) => (
              <div key={d.id} style={{ padding: 10, background: "var(--panel)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--accent2)" }}>Entrega #{d.id}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#fff", marginTop: 4 }}>{d.entregador}</div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{d.endereco} · {d.janela}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ef-card" style={{ padding: 18 }}>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Faturamento (últimos 7 dias)</span>
        <div style={{ marginTop: 10 }}><RevenueChart /></div>
      </div>

      <div className="ef-card" style={{ padding: 18, overflowX: "auto" }}>
        <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Fluxo do Sistema</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, minWidth: 720 }}>
          {FLOW.map((f, i) => (
            <React.Fragment key={f.label}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 68 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent2-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.Icon size={18} color="var(--accent2)" />
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
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Integrações</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {INTEGRATIONS.map((it) => (
              <div key={it.nome} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--panel)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <it.Icon size={16} color="var(--accent2)" />
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "#fff" }}>{it.nome}</span>
                </div>
                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--good)" }}>● {it.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ef-card" style={{ padding: 18 }}>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Atividades Recentes</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {ACTIVITIES.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontFamily: "'Exo 2', sans-serif", fontSize: 12 }}>
                <span style={{ color: "var(--accent2)", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{a.hora}</span>
                <span style={{ color: "#d8d8d8" }}>{a.texto} {a.ref && <span style={{ color: "var(--accent)" }}>{a.ref}</span>}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
