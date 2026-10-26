import React, { useEffect, useState } from "react";
import { Users, Store, ClipboardList, Truck, DollarSign } from "lucide-react";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { pedidos, restaurantes, usuarios, ApiError } from "../../api/client";
import { TabelaPedidos, fmt } from "./PedidosView";

const EM_ANDAMENTO = ["aguardando_aceite", "aceito", "em_preparacao", "pronto_para_entrega", "pronto_para_retirada", "em_transito"];
const dia = (d) => d.toISOString().slice(0, 10);

/** Faturamento dos últimos 7 dias (pedidos não cancelados), em SVG puro. */
function GraficoFaturamento({ lista }) {
  const hoje = new Date();
  const dias = [...Array(7)].map((_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - (6 - i));
    return d;
  });
  const valores = dias.map((d) =>
    lista
      .filter((p) => p.status !== "cancelado" && dia(new Date(p.criado_em)) === dia(d))
      .reduce((s, p) => s + Number(p.valor_total), 0)
  );
  const w = 620, h = 220, pad = 40;
  const max = Math.max(...valores, 1) * 1.15;
  const pts = valores.map((v, i) => ({
    x: pad + (i * (w - pad * 2)) / (valores.length - 1),
    y: h - pad - (v / max) * (h - pad * 1.5),
    v,
    rotulo: dias[i].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Faturamento dos últimos 7 dias">
      <defs>
        <linearGradient id="fat-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A6FF00" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A6FF00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 1.5)} y2={h - pad - f * (h - pad * 1.5)} stroke="#2A2A2A" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#fat-grad)" />
      <path d={path} fill="none" stroke="#A6FF00" strokeWidth="2.5" />
      {pts.map((p) => (
        <g key={p.rotulo}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="#A6FF00" stroke="#0D0D0D" strokeWidth="2" />
          {p.v > 0 && <text x={p.x} y={p.y - 10} fontSize="10" fill="#d8d8d8" textAnchor="middle" fontFamily="Exo 2, sans-serif">{fmt(p.v)}</text>}
          <text x={p.x} y={h - 12} fontSize="10" fill="#8A8A8A" textAnchor="middle" fontFamily="Exo 2, sans-serif">{p.rotulo}</text>
        </g>
      ))}
    </svg>
  );
}

/**
 * Visão geral do admin com os dados reais da API:
 * GET /usuarios, GET /restaurantes e GET /pedidos/painel?incluir_finalizados=true.
 */
export default function DashboardView({ onOpenOrder }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([usuarios.listar(), restaurantes.listar(), pedidos.painel(true)])
      .then(([listaUsuarios, listaRestaurantes, listaPedidos]) =>
        setDados({ usuarios: listaUsuarios, restaurantes: listaRestaurantes, pedidos: listaPedidos }))
      .catch((e) => setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o painel."));
  }, []);

  if (erro) return <EmptyState title="ERRO AO CARREGAR" subtitle={erro} />;
  if (!dados) return <div style={{ fontFamily: "'Exo 2', sans-serif", color: "var(--muted)" }}>Carregando painel...</div>;

  const clientes = dados.usuarios.filter((u) => u.tipo === "cliente").length;
  const aprovados = dados.restaurantes.filter((r) => r.status_aprovacao === "aprovado").length;
  const pendentes = dados.restaurantes.filter((r) => r.status_aprovacao === "pendente").length;
  const andamento = dados.pedidos.filter((p) => EM_ANDAMENTO.includes(p.status));
  const entregues = dados.pedidos.filter((p) => p.status === "entregue");
  const faturamento = entregues.reduce((s, p) => s + Number(p.valor_total), 0);
  const emRota = dados.pedidos.filter((p) => p.status === "em_transito");
  const titulo = { fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        <StatCard label="USUÁRIOS" value={String(dados.usuarios.length)} delta={`${clientes} clientes`} Icon={Users} />
        <StatCard label="RESTAURANTES" value={String(aprovados)} delta={`${pendentes} aguardando aprovação`} Icon={Store} />
        <StatCard label="PEDIDOS" value={String(dados.pedidos.length)} delta={`${andamento.length} em andamento`} Icon={ClipboardList} />
        <StatCard label="ENTREGUES" value={String(entregues.length)} delta={`${emRota.length} saíram para entrega`} Icon={Truck} />
        <StatCard label="FATURAMENTO" value={fmt(faturamento)} delta="pedidos entregues" Icon={DollarSign} />
      </div>

      <div className="ef-card" style={{ padding: 18 }}>
        <span style={titulo}>Pedidos recentes</span>
        <div style={{ marginTop: 8 }}>
          {dados.pedidos.length === 0 ? (
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>Nenhum pedido ainda.</span>
          ) : (
            <TabelaPedidos lista={dados.pedidos.slice(0, 8)} onOpenOrder={onOpenOrder} />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="ef-card" style={{ padding: 18 }}>
          <span style={titulo}>Faturamento (últimos 7 dias)</span>
          <div style={{ marginTop: 10 }}><GraficoFaturamento lista={dados.pedidos} /></div>
        </div>
        <div className="ef-card" style={{ padding: 18 }}>
          <span style={titulo}>Pedidos em andamento</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {andamento.length === 0 && (
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>Nenhum pedido em andamento.</span>
            )}
            {andamento.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenOrder(p.id)}
                style={{ padding: 10, background: "var(--panel)", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 12, color: "var(--accent2)" }}>Pedido #{p.id}</span>
                  <StatusBadge status={p.status_rotulo} />
                </div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "#fff", marginTop: 4 }}>{p.restaurante_nome}</div>
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>
                  {p.tipo_entrega === "retirada" ? "Retirada no balcão" : p.endereco_entrega}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
