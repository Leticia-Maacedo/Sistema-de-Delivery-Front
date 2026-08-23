import React from "react";
import StatusBadge from "../../components/StatusBadge";
import { ORDERS, fmt } from "../../data/mockData";

export default function PedidosView({ onOpenOrder }) {
  return (
    <div className="ef-card" style={{ padding: 18 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Exo 2', sans-serif" }}>
        <thead>
          <tr style={{ textAlign: "left", fontSize: 10, color: "var(--muted)" }}>
            <th style={{ padding: "8px" }}>ID</th>
            <th style={{ padding: "8px" }}>CLIENTE</th>
            <th style={{ padding: "8px" }}>RESTAURANTE</th>
            <th style={{ padding: "8px" }}>STATUS</th>
            <th style={{ padding: "8px" }}>TOTAL</th>
            <th style={{ padding: "8px" }}>DATA</th>
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
              <td style={{ padding: "10px 8px", color: "var(--muted)" }}>{o.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
