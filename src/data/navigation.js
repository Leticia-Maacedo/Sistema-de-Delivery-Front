import {
  Home, Users, Store, Package, ClipboardList, Truck, CreditCard, BarChart3,
  Settings, Plug, HelpCircle, ListChecks,
} from "lucide-react";

export const NAV_CLIENTE = [
  { key: "inicio-categorias", label: "Início" },
  { key: "pagina-principal", label: "Explorar" },
  { key: "historico", label: "Pedidos" },
  { key: "pagamento", label: "Pagamento" },
  { key: "login", label: "Entrar" },
];

/* Telas que existem mas não aparecem no nav do topo (acessadas via fluxo, ex: cadastro) */
export const NAV_CLIENTE_HIDDEN = [
  { key: "cadastro-telefone" },
  { key: "cadastro-endereco" },
];

export const NAV_PARCEIRO = [
  { key: "area-parceiro", label: "Área do Parceiro" },
  { key: "cardapios", label: "Cardápios" },
  { key: "avaliacoes", label: "Avaliações" },
];

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

export const ADMIN_TITLES = {
  dashboard: ["Dashboard", "Visão geral do sistema"],
  restaurantes: ["Restaurantes", "Gerencie os restaurantes parceiros"],
  pedidos: ["Pedidos", "Todos os pedidos do sistema"],
  entregas: ["Entregas em Andamento", "Acompanhe as entregas ativas"],
  funcionalidades: ["Funcionalidades", "Principais funcionalidades identificadas no fluxo"],
};