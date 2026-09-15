import {
  Home, Users, Store, Package, ClipboardList, Truck, CreditCard, BarChart3,
  Settings, Plug, HelpCircle, ListChecks, Search, LogIn, Star,
} from "lucide-react";

export const NAV_CLIENTE = [
  { key: "inicio-categorias", label: "Início", Icon: Home },
  { key: "pagina-principal", label: "Explorar", Icon: Search },
  { key: "restaurantes-cliente", label: "Restaurantes", Icon: Store },
  { key: "historico", label: "Pedidos", Icon: ClipboardList },
  { key: "pagamento", label: "Pagamento", Icon: CreditCard },
  { key: "login", label: "Entrar", Icon: LogIn },
];

/* Telas que existem mas não aparecem no nav (acessadas via fluxo, ex: cadastro) */
export const NAV_CLIENTE_HIDDEN = [
  { key: "cadastro-dados" },
  { key: "cadastro-endereco" },
  { key: "cardapio-restaurante" },
];

export const NAV_PARCEIRO = [
  { key: "area-parceiro", label: "Área do Parceiro", Icon: Store },
  { key: "cardapios", label: "Cardápios", Icon: Package },
  { key: "avaliacoes", label: "Avaliações", Icon: Star },
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