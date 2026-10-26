/* Textos da situação do pagamento (app/core/pagamento_regras.py). */
const STATUS_PAGAMENTO = {
  pendente: "aguardando pagamento",
  aprovado: "pago",
  recusado: "recusado",
  a_receber: "a receber na entrega",
  expirado: "expirado",
  cancelado: "cancelado",
  estornado: "estornado",
  estorno_pendente: "estorno em andamento",
};

export const rotuloPagamento = (status) => STATUS_PAGAMENTO[status] || status || "aguardando pagamento";
