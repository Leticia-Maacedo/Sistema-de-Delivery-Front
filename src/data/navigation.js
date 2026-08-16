import {
  LayoutGrid, LogIn, Smartphone, MapPin, Home, CreditCard, ClipboardList,
  Store, Package, Star, Truck, ListChecks, Users, Search, CheckCircle2,
} from "lucide-react";

export const NAV_CLIENTE = [
  { key: "inicio-categorias", label: "Início & Categorias", Icon: LayoutGrid },
  { key: "login", label: "Acesso do Usuário", Icon: LogIn },
  { key: "cadastro-telefone", label: "Cadastro · Celular", Icon: Smartphone },
  { key: "cadastro-endereco", label: "Cadastro · Endereço", Icon: MapPin },
  { key: "pagina-principal", label: "Página Principal", Icon: Home },
  { key: "pagamento", label: "Formas de Pagamento", Icon: CreditCard },
  { key: "historico", label: "Histórico de Pedidos", Icon: ClipboardList },
];

export const NAV_PARCEIRO = [
  { key: "area-parceiro", label: "Área do Parceiro", Icon: Store },
  { key: "cardapios", label: "Gerenciar Cardápio", Icon: Package },
  { key: "avaliacoes", label: "Avaliações", Icon: Star },
];

export const NAV_ADMIN = [
  { key: "dashboard", label: "Dashboard", Icon: Home },
  { key: "restaurantes", label: "Restaurantes", Icon: Store },
  { key: "pedidos", label: "Pedidos", Icon: ClipboardList },
  { key: "entregas", label: "Entregas", Icon: Truck },
  { key: "funcionalidades", label: "Funcionalidades", Icon: ListChecks },
];

export const GROUPS = [
  { key: "cliente", label: "App Cliente", nav: NAV_CLIENTE },
  { key: "parceiro", label: "Parceiro", nav: NAV_PARCEIRO },
  { key: "admin", label: "Admin", nav: NAV_ADMIN },
];

export const FLOW = [
  { label: "Usuário", Icon: Users },
  { label: "Login /\nCadastro", Icon: CheckCircle2 },
  { label: "Explorar", Icon: Search },
  { label: "Restaurantes", Icon: Store },
  { label: "Produtos", Icon: Package },
  { label: "Carrinho", Icon: ClipboardList },
  { label: "Pagamento", Icon: CreditCard },
  { label: "Pedido\nConfirmado", Icon: CheckCircle2 },
  { label: "Entrega", Icon: Truck },
];
