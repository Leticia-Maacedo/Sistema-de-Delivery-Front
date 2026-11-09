/**
 * Cálculos dos relatórios (tela "Relatórios"): receita bruta, quantidade de
 * pedidos, ticket médio e formas de pagamento.
 *
 * A fonte é a lista de GET /pedidos/painel?incluir_finalizados=true — o admin
 * vê todos os pedidos, e o restaurante só os dos próprios restaurantes. Os
 * filtros e as somas são feitos aqui no front, sem rota nova no back.
 *
 * Dinheiro é somado em centavos (inteiros) para não acumular erro de ponto
 * flutuante (ex.: 0,1 + 0,2).
 */

// Mesma regra do faturamento do painel do parceiro (parceiro_controller):
// só o pedido cancelado fica de fora das somas.
export const STATUS_FORA_DO_RELATORIO = ["cancelado"];

export const moeda = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const percentual = (parte, total) =>
  total > 0 ? `${((parte / total) * 100).toFixed(1).replace(".", ",")}%` : "—";

const centavos = (valor) => Math.round(Number(valor || 0) * 100);
const nomeDoRestaurante = (p) => p.restaurante_nome || `Restaurante #${p.restaurante_id}`;
// criado_em vem como "AAAA-MM-DDTHH:MM:SS": os 10 primeiros caracteres são o dia,
// e datas nesse formato comparam certo como texto (sem problema de fuso).
const diaDoPedido = (p) => String(p.criado_em || "").slice(0, 10);

/** Tira os cancelados e aplica busca por restaurante e período (datas "AAAA-MM-DD", inclusivas). */
export function filtrarPedidos(pedidos, { busca = "", dataInicial = "", dataFinal = "" } = {}) {
  const termo = busca.trim().toLowerCase();
  return pedidos.filter((p) => {
    if (STATUS_FORA_DO_RELATORIO.includes(p.status)) return false;
    if (termo && !nomeDoRestaurante(p).toLowerCase().includes(termo)) return false;
    const dia = diaDoPedido(p);
    if (dataInicial && dia < dataInicial) return false;
    if (dataFinal && dia > dataFinal) return false;
    return true;
  });
}

/** Uma linha por restaurante: pedidos, faturamento (receita bruta) e ticket médio. */
export function resumoPorRestaurante(pedidos) {
  const mapa = new Map();
  for (const p of pedidos) {
    const r = mapa.get(p.restaurante_id) || {
      id: p.restaurante_id, nome: nomeDoRestaurante(p), pedidos: 0, centavos: 0,
    };
    r.pedidos += 1;
    r.centavos += centavos(p.valor_total);
    mapa.set(p.restaurante_id, r);
  }
  return [...mapa.values()].map((r) => ({
    id: r.id,
    nome: r.nome,
    pedidos: r.pedidos,
    faturamento: r.centavos / 100,
    ticketMedio: r.pedidos ? r.centavos / r.pedidos / 100 : 0,
  }));
}

/** Total geral a partir do resumo por restaurante. */
export function totalGeral(resumo) {
  const pedidos = resumo.reduce((soma, r) => soma + r.pedidos, 0);
  const faturamento = resumo.reduce((soma, r) => soma + Math.round(r.faturamento * 100), 0) / 100;
  return { pedidos, faturamento, ticketMedio: pedidos ? faturamento / pedidos : 0 };
}

/** Ordena por uma coluna (texto em ordem alfabética pt-BR, números pelo valor). */
export function ordenar(linhas, chave, direcao = "desc") {
  const sinal = direcao === "asc" ? 1 : -1;
  return [...linhas].sort((a, b) =>
    typeof a[chave] === "string"
      ? sinal * a[chave].localeCompare(b[chave], "pt-BR")
      : sinal * (a[chave] - b[chave])
  );
}

const ROTULOS_PAGAMENTO = { cartao: "Cartão", pix: "PIX", dinheiro: "Dinheiro" };

export const rotuloPagamento = (forma) =>
  ROTULOS_PAGAMENTO[forma] || (forma ? forma.charAt(0).toUpperCase() + forma.slice(1) : "Não informado");

/** Pedidos e valor por forma de pagamento, da que mais faturou para a que menos faturou. */
export function porFormaPagamento(pedidos) {
  const mapa = new Map();
  for (const p of pedidos) {
    const chave = p.forma_pagamento || "";
    const f = mapa.get(chave) || { chave, rotulo: rotuloPagamento(p.forma_pagamento), pedidos: 0, centavos: 0 };
    f.pedidos += 1;
    f.centavos += centavos(p.valor_total);
    mapa.set(chave, f);
  }
  return [...mapa.values()]
    .map((f) => ({ chave: f.chave, rotulo: f.rotulo, pedidos: f.pedidos, valor: f.centavos / 100 }))
    .sort((a, b) => b.valor - a.valor);
}