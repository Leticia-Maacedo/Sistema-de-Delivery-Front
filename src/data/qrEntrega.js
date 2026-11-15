/**
 * Conteúdo do QR Code da entrega (Backlog — Leitor de QR Code).
 *
 * O cliente mostra o QR na tela de acompanhamento e o entregador (ou o
 * restaurante, na retirada) lê com a câmera. O QR leva o número do pedido
 * junto com o código, para o painel recusar o QR de outro pedido antes de
 * chamar a API. A conferência do código continua no back
 * (POST /pedidos/{id}/entrega/confirmar, com compare_digest).
 */
const PREFIXO = "ENTREGAFOOD";

export const conteudoQrEntrega = (pedidoId, codigo) => `${PREFIXO}:PEDIDO:${pedidoId}:CODIGO:${codigo}`;

/**
 * Lê o texto do QR. Devolve { codigo } se for do pedido certo, { erro } se não.
 * Aceita também só os dígitos (código digitado ou QR antigo).
 */
export function lerQrEntrega(texto, pedidoId) {
  const t = String(texto || "").trim();
  if (/^\d{4,6}$/.test(t)) return { codigo: t };
  const m = t.match(/^ENTREGAFOOD:PEDIDO:(\d+):CODIGO:(\d{4,6})$/);
  if (!m) return { erro: "Este QR Code não é de um pedido do EntregaFood." };
  if (Number(m[1]) !== Number(pedidoId)) return { erro: `Este QR Code é do pedido #${m[1]}, não do #${pedidoId}.` };
  return { codigo: m[2] };
}
