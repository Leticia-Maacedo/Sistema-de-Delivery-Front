import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import { pedidos, ApiError } from "../../api/client";
import {
  moeda, percentual, filtrarPedidos, resumoPorRestaurante, totalGeral, ordenar, porFormaPagamento,
} from "../../data/relatorios";

const texto = { fontFamily: "'Exo 2', sans-serif" };
const CORES = ["#A6FF00", "#8B7CF6", "#1DB954", "#E6B43C", "#9A9A9A"];

const COLUNAS = [
  { chave: "nome", rotulo: "Restaurante", alinhar: "left" },
  { chave: "pedidos", rotulo: "Qtd. de pedidos", alinhar: "right" },
  { chave: "faturamento", rotulo: "Faturamento", alinhar: "right" },
  { chave: "ticketMedio", rotulo: "Ticket médio", alinhar: "right" },
];

const celulaCabecalho = { padding: "8px 10px", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 };
const celula = { padding: "11px 10px", fontSize: 13, color: "#e8e8e8", borderTop: "1px solid var(--border)" };
const celulaTotal = { ...celula, fontWeight: 700, color: "#fff", borderTop: "2px solid var(--border)" };

/** Gráfico de rosca em SVG puro (sem biblioteca). `fatias` = [{ chave, valor }]. */
function Rosca({ fatias, valorTotal, legendaCentro, rotulo }) {
  const total = fatias.reduce((soma, f) => soma + f.valor, 0);
  let acumulado = 0;
  return (
    <svg viewBox="0 0 42 42" style={{ width: 170, height: 170, flexShrink: 0 }} role="img" aria-label={rotulo}>
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--border)" strokeWidth="5" />
      {total > 0 &&
        fatias.map((f, i) => {
          const pct = (f.valor / total) * 100;
          const fatia = (
            <circle
              key={f.chave}
              cx="21" cy="21" r="15.9155" fill="none"
              stroke={CORES[i % CORES.length]} strokeWidth="5"
              strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={25 - acumulado}
            />
          );
          acumulado += pct;
          return fatia;
        })}
      <text x="21" y="21" textAnchor="middle" fill="#fff" fontSize="4" fontWeight="700" fontFamily="Exo 2, sans-serif">{valorTotal}</text>
      <text x="21" y="26" textAnchor="middle" fill="#8A8A8A" fontSize="2.6" fontFamily="Exo 2, sans-serif">{legendaCentro}</text>
    </svg>
  );
}

function GraficoPagamento({ titulo, formas, valorDe, formatar, centro }) {
  const fatias = formas.map((f) => ({ chave: f.chave, valor: valorDe(f) }));
  const total = fatias.reduce((soma, f) => soma + f.valor, 0);
  return (
    <div style={{ flex: "1 1 280px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <Rosca fatias={fatias} valorTotal={formatar(total)} legendaCentro={centro} rotulo={titulo} />
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ ...texto, fontWeight: 700, fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{titulo}</div>
        {formas.map((f, i) => (
          <div key={f.chave} style={{ ...texto, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#d8d8d8", marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: CORES[i % CORES.length], flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{f.rotulo}</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{formatar(valorDe(f))}</span>
            <span style={{ color: "var(--muted)", minWidth: 48, textAlign: "right" }}>{percentual(valorDe(f), total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Relatórios — receita bruta por restaurante, tabela ordenável de pedidos /
 * faturamento / ticket médio e gráfico por forma de pagamento.
 *
 * Dados: GET /pedidos/painel?incluir_finalizados=true (o admin vê todos; o
 * restaurante só os dos próprios restaurantes). Cálculo em data/relatorios.js.
 * Pedidos cancelados não entram nas somas (mesma regra do painel do parceiro).
 */
export default function RelatoriosView({ papel }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [ordem, setOrdem] = useState({ chave: "pedidos", direcao: "desc" });

  useEffect(() => {
    let ativo = true;
    pedidos
      .painel(true)
      .then((dados) => ativo && setLista(dados))
      .catch((e) => {
        if (!ativo) return;
        setErro(e instanceof ApiError ? e.message : "Não foi possível carregar os relatórios.");
        setLista([]);
      });
    return () => { ativo = false; };
  }, []);

  const periodoInvalido = Boolean(dataInicial && dataFinal && dataInicial > dataFinal);
  const filtrados = useMemo(
    () => (periodoInvalido ? [] : filtrarPedidos(lista || [], { busca, dataInicial, dataFinal })),
    [lista, busca, dataInicial, dataFinal, periodoInvalido]
  );
  const resumo = useMemo(() => resumoPorRestaurante(filtrados), [filtrados]);
  const total = useMemo(() => totalGeral(resumo), [resumo]);
  const receita = useMemo(() => ordenar(resumo, "faturamento", "desc"), [resumo]);
  const tabela = useMemo(() => ordenar(resumo, ordem.chave, ordem.direcao), [resumo, ordem]);
  const formas = useMemo(() => porFormaPagamento(filtrados), [filtrados]);

  const alternarOrdem = (chave) =>
    setOrdem((atual) =>
      atual.chave === chave
        ? { chave, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { chave, direcao: chave === "nome" ? "asc" : "desc" }
    );

  const temFiltro = Boolean(busca || dataInicial || dataFinal);
  const limparFiltros = () => { setBusca(""); setDataInicial(""); setDataFinal(""); };

  if (lista === null) {
    return <div style={{ ...texto, color: "var(--muted)" }}>Carregando relatórios...</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      {papel !== "admin" && (
        <PageHeader Icon={BarChart3} title="RELATÓRIOS" subtitle="Receita, pedidos e formas de pagamento" />
      )}

      {erro && <div style={{ ...texto, fontSize: 12, color: "#E6534C" }}>{erro}</div>}

      <div className="ef-card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ ...texto, flex: "2 1 220px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>RESTAURANTE</span>
          <span style={{ position: "relative", display: "block" }}>
            <Search size={14} color="var(--muted)" style={{ position: "absolute", left: 12, top: 13 }} />
            <input
              className="ef-input" style={{ width: "100%", paddingLeft: 34 }}
              placeholder="Buscar restaurante" value={busca} onChange={(e) => setBusca(e.target.value)}
            />
          </span>
        </label>
        <label style={{ ...texto, flex: "1 1 150px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>DATA INICIAL</span>
          <input type="date" className="ef-input" style={{ colorScheme: "dark" }} value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
        </label>
        <label style={{ ...texto, flex: "1 1 150px", display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>DATA FINAL</span>
          <input type="date" className="ef-input" style={{ colorScheme: "dark" }} value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
        </label>
        {temFiltro && (
          <button className="ef-btn-outline" onClick={limparFiltros} style={{ padding: "11px 14px" }}>LIMPAR</button>
        )}
      </div>

      {periodoInvalido && (
        <div style={{ ...texto, fontSize: 12, color: "#E6534C" }}>A data inicial não pode ser depois da data final.</div>
      )}

      {filtrados.length === 0 ? (
        <EmptyState
          title="SEM PEDIDOS NO PERÍODO"
          subtitle={lista.length === 0 ? "Ainda não há pedidos para mostrar." : "Ajuste os filtros para ver resultados."}
        />
      ) : (
        <>
          <div className="ef-card" style={{ padding: 18 }}>
            <div style={{ ...texto, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 8 }}>Receita bruta por restaurante</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ ...texto, width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...celulaCabecalho, textAlign: "left" }}>Restaurante</th>
                    <th style={{ ...celulaCabecalho, textAlign: "right" }}>Receita bruta</th>
                    <th style={{ ...celulaCabecalho, textAlign: "right" }}>Representatividade</th>
                  </tr>
                </thead>
                <tbody>
                  {receita.map((r) => (
                    <tr key={r.id}>
                      <td style={celula}>{r.nome}</td>
                      <td style={{ ...celula, textAlign: "right" }}>{moeda(r.faturamento)}</td>
                      <td style={{ ...celula, textAlign: "right", color: "var(--accent)" }}>{percentual(r.faturamento, total.faturamento)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={celulaTotal}>TOTAL</td>
                    <td style={{ ...celulaTotal, textAlign: "right" }}>{moeda(total.faturamento)}</td>
                    <td style={{ ...celulaTotal, textAlign: "right" }}>{percentual(total.faturamento, total.faturamento)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="ef-card" style={{ padding: 18 }}>
            <div style={{ ...texto, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>Pedidos, faturamento e ticket médio</div>
            <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Clique no título de uma coluna para ordenar.</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ ...texto, width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {COLUNAS.map((c) => {
                      const ativa = ordem.chave === c.chave;
                      const Icone = !ativa ? ArrowUpDown : ordem.direcao === "asc" ? ChevronUp : ChevronDown;
                      return (
                        <th
                          key={c.chave}
                          aria-sort={ativa ? (ordem.direcao === "asc" ? "ascending" : "descending") : "none"}
                          style={{ ...celulaCabecalho, textAlign: c.alinhar }}
                        >
                          <button
                            onClick={() => alternarOrdem(c.chave)}
                            style={{
                              ...texto, background: "none", border: "none", cursor: "pointer", padding: 0,
                              display: "inline-flex", alignItems: "center", gap: 4, textTransform: "uppercase",
                              fontSize: 10, letterSpacing: 0.5, color: ativa ? "var(--accent)" : "var(--muted)",
                            }}
                          >
                            {c.rotulo} <Icone size={12} />
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {tabela.map((r) => (
                    <tr key={r.id}>
                      <td style={celula}>{r.nome}</td>
                      <td style={{ ...celula, textAlign: "right" }}>{r.pedidos}</td>
                      <td style={{ ...celula, textAlign: "right" }}>{moeda(r.faturamento)}</td>
                      <td style={{ ...celula, textAlign: "right" }}>{moeda(r.ticketMedio)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={celulaTotal}>TOTAL</td>
                    <td style={{ ...celulaTotal, textAlign: "right" }}>{total.pedidos}</td>
                    <td style={{ ...celulaTotal, textAlign: "right" }}>{moeda(total.faturamento)}</td>
                    <td style={{ ...celulaTotal, textAlign: "right" }}>{moeda(total.ticketMedio)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="ef-card" style={{ padding: 18 }}>
            <div style={{ ...texto, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>Formas de pagamento</div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              <GraficoPagamento
                titulo="POR QUANTIDADE DE PEDIDOS" formas={formas}
                valorDe={(f) => f.pedidos} formatar={(n) => String(n)} centro="pedidos"
              />
              <GraficoPagamento
                titulo="POR VALOR (R$)" formas={formas}
                valorDe={(f) => f.valor} formatar={moeda} centro="faturamento"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}