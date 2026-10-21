import {
  Home, Users, Store, Package, ClipboardList, Truck, CreditCard, BarChart3,
  Settings, Plug, HelpCircle, ListChecks, Search, LogIn, Star, Briefcase,
} from "lucide-react";

/*
 * Cada tipo de usuário tem a sua própria experiência, como no iFood:
 * - visitante e cliente: o app/site de pedidos;
 * - restaurante: o Portal do Parceiro;
 * - entregador: o app do entregador;
 * - admin: o painel administrativo (layout próprio, NAV_ADMIN_SIDEBAR).
 * `menu` aparece na barra lateral; `telas` são todas as telas que o papel
 * pode abrir (menu + telas internas). Fora delas, o App volta para `inicio`.
 */

const TELAS_LOJA = ["inicio-categorias", "pagina-principal", "restaurantes-cliente", "cardapio-restaurante", "produto-detalhe"];

export const PAPEIS = {
  visitante: {
    titulo: "CLIENTE",
    inicio: "inicio-categorias",
    menu: [
      { key: "inicio-categorias", label: "Início", Icon: Home },
      { key: "pagina-principal", label: "Explorar", Icon: Search },
      { key: "restaurantes-cliente", label: "Restaurantes", Icon: Store },
      { key: "login", label: "Entrar", Icon: LogIn },
    ],
    telas: [...TELAS_LOJA, "login", "login-parceiro", "cadastro-dados", "cadastro-telefone"],
  },
  cliente: {
    titulo: "CLIENTE",
    inicio: "pagina-principal",
    menu: [
      { key: "inicio-categorias", label: "Início", Icon: Home },
      { key: "pagina-principal", label: "Explorar", Icon: Search },
      { key: "restaurantes-cliente", label: "Restaurantes", Icon: Store },
      { key: "historico", label: "Pedidos", Icon: ClipboardList },
      { key: "pagamento", label: "Pagamento", Icon: CreditCard },
    ],
    telas: [
      ...TELAS_LOJA, "cadastro-endereco", "cesta", "pedido-tipo-pagamento", "pedido-cartao",
      "pedido-confirmado", "acompanhar-pedido", "historico", "pagamento",
    ],
  },
  restaurante: {
    titulo: "PORTAL DO PARCEIRO",
    inicio: "painel-entregas",
    menu: [
      { key: "painel-entregas", label: "Pedidos", Icon: ClipboardList },
      { key: "area-parceiro", label: "Meu restaurante", Icon: Store },
      { key: "cardapios", label: "Cardápio", Icon: Package },
      { key: "avaliacoes", label: "Avaliações", Icon: Star },
    ],
    telas: ["painel-entregas", "area-parceiro", "cadastro-restaurante", "cardapios", "avaliacoes"],
  },
  entregador: {
    titulo: "ENTREGADOR",
    inicio: "painel-entregas",
    menu: [{ key: "painel-entregas", label: "Entregas", Icon: Truck }],
    telas: ["painel-entregas"],
  },
};

/** Link do visitante para a entrada de restaurantes e entregadores. */
export const LINK_PORTAL_PARCEIRO = { key: "login-parceiro", label: "Portal do Parceiro", Icon: Briefcase };

export const NAV_ADMIN_SIDEBAR = [
  { key: "dashboard", label: "Dashboard", Icon: Home },
  { key: "usuarios", label: "Usuários", Icon: Users },
  { key: "restaurantes", label: "Restaurantes", Icon: Store },
  { key: "produtos", label: "Produtos", Icon: Package },
  { key: "pedidos", label: "Pedidos", Icon: ClipboardList },
  { key: "entregas", label: "Entregas", Icon: Truck },
  { key: "pagamentos", label: "Pagamentos", Icon: CreditCard },
  { key: "relatorios", label: "Relatórios", Icon: BarChart3 },
  { key: "configuracoes", label: "Configurações", Icon: Settings },
  { key: "integracoes", label: "Integrações", Icon: Plug },
  { key: "suporte", label: "Suporte", Icon: HelpCircle },
  { key: "funcionalidades", label: "Funcionalidades", Icon: ListChecks },
];

PAPEIS.admin = {
  inicio: "dashboard",
  telas: [...NAV_ADMIN_SIDEBAR.map((n) => n.key), "pedido-detalhe"],
};

/** Tela para onde mandar o papel quando ele tenta abrir `view`. */
export function telaPermitida(papel, view) {
  const regras = PAPEIS[papel] || PAPEIS.visitante;
  if (regras.telas.includes(view)) return view;
  // Visitante tentando algo de cliente (cesta, pedidos...): pede login.
  if (papel === "visitante" && PAPEIS.cliente.telas.includes(view)) return "login";
  return regras.inicio;
}

export const ADMIN_TITLES = {
  dashboard: ["Dashboard", "Visão geral do sistema"],
  restaurantes: ["Restaurantes", "Gerencie os restaurantes parceiros"],
  pedidos: ["Pedidos", "Todos os pedidos do sistema"],
  entregas: ["Entregas em Andamento", "Acompanhe as entregas ativas"],
  funcionalidades: ["Funcionalidades", "Principais funcionalidades identificadas no fluxo"],
};