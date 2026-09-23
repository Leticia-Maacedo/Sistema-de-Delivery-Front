import {
  LogIn, Users, Smartphone, LayoutGrid, ShoppingCart, ClipboardList, MapPin,
  CreditCard, Store, Truck, Star, ListChecks, CheckCircle2, Search, Package,
} from "lucide-react";

/* Principais funcionalidades identificadas no relatório do diagrama de atividades.
   `pronto` reflete o que já existe no backend (app/controllers/*), não só no front. */
export const FEATURES = [
  { titulo: "Login", desc: "E-mail/senha, telefone com OTP e login social.", Icon: LogIn, pronto: true, endpoint: "POST /auth/login" },
  { titulo: "Cadastro", desc: "Permite criar uma nova conta.", Icon: Users, pronto: true, endpoint: "POST /usuarios" },
  { titulo: "Autenticação de dois fatores", desc: "Código OTP de 6 dígitos por telefone.", Icon: Smartphone, pronto: true, endpoint: "POST /auth/telefone/verificar-codigo" },
  { titulo: "Consulta ao catálogo", desc: "Visualizar restaurantes e itens disponíveis.", Icon: LayoutGrid, pronto: true, endpoint: "GET /consultas/restaurantes/{id}/cardapio" },
  { titulo: "Confirmação de endereço", desc: "Cadastro e edição do endereço de entrega.", Icon: MapPin, pronto: true, endpoint: "POST /locais" },
  { titulo: "Carrinho", desc: "Armazena os produtos selecionados.", Icon: ShoppingCart, pronto: false },
  { titulo: "Realização de pedido", desc: "Finaliza a compra.", Icon: ClipboardList, pronto: false },
  { titulo: "Escolha de pagamento", desc: "Define a forma de pagamento.", Icon: CreditCard, pronto: false },
  { titulo: "Envio ao restaurante", desc: "Encaminha as informações do pedido.", Icon: Store, pronto: false },
  { titulo: "Entrega", desc: "Encaminha o pedido ao cliente.", Icon: Truck, pronto: false },
  { titulo: "Avaliação", desc: "Permite avaliar a experiência.", Icon: Star, pronto: false },
  { titulo: "Encerramento", desc: "Finaliza o fluxo da atividade.", Icon: ListChecks, pronto: false },
];

/* Fluxo do sistema exibido no dashboard admin */
export const FLOW = [
  { label: "Usuário", Icon: Users },
  { label: "Login /\nCadastro", Icon: CheckCircle2 },
  { label: "Explorar", Icon: Search },
  { label: "Restaurantes /\nLojas", Icon: Store },
  { label: "Produtos", Icon: Package },
  { label: "Carrinho", Icon: ShoppingCart },
  { label: "Pagamento", Icon: CreditCard },
  { label: "Pedido\nConfirmado", Icon: CheckCircle2 },
  { label: "Entrega", Icon: Truck },
];