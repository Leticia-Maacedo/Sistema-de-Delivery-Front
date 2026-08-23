import {
  LogIn, Users, Smartphone, LayoutGrid, ShoppingCart, ClipboardList, MapPin,
  CreditCard, Store, Truck, Star, ListChecks, CheckCircle2, Search, Package,
} from "lucide-react";

/* Principais funcionalidades identificadas no relatório do diagrama de atividades */
export const FEATURES = [
  { titulo: "Login", desc: "Permite ao usuário acessar sua conta.", Icon: LogIn },
  { titulo: "Cadastro", desc: "Permite criar uma nova conta.", Icon: Users },
  { titulo: "Autenticação de dois fatores", desc: "Validação adicional do usuário.", Icon: Smartphone },
  { titulo: "Consulta ao catálogo", desc: "Visualizar produtos disponíveis.", Icon: LayoutGrid },
  { titulo: "Carrinho", desc: "Armazena os produtos selecionados.", Icon: ShoppingCart },
  { titulo: "Realização de pedido", desc: "Finaliza a compra.", Icon: ClipboardList },
  { titulo: "Confirmação de endereço", desc: "Define o local de entrega.", Icon: MapPin },
  { titulo: "Escolha de pagamento", desc: "Define a forma de pagamento.", Icon: CreditCard },
  { titulo: "Envio ao restaurante", desc: "Encaminha as informações do pedido.", Icon: Store },
  { titulo: "Entrega", desc: "Encaminha o pedido ao cliente.", Icon: Truck },
  { titulo: "Avaliação", desc: "Permite avaliar a experiência.", Icon: Star },
  { titulo: "Encerramento", desc: "Finaliza o fluxo da atividade.", Icon: ListChecks },
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