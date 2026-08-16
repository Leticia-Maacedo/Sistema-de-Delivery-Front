import {
  LogIn, Users, Smartphone, LayoutGrid, Search, ShoppingCart, ClipboardList,
  MapPin, CreditCard, Store, Truck, CheckCircle2, Star, ListChecks,
} from "lucide-react";

export const FEATURES = [
  { titulo: "Login", desc: "Permite ao usuário acessar sua conta.", Icon: LogIn },
  { titulo: "Cadastro", desc: "Permite criar uma nova conta.", Icon: Users },
  { titulo: "Autenticação de dois fatores", desc: "Realiza uma validação adicional do usuário.", Icon: Smartphone },
  { titulo: "Consulta ao catálogo", desc: "Permite visualizar produtos disponíveis.", Icon: LayoutGrid },
  { titulo: "Busca de produtos", desc: "Permite localizar o produto desejado.", Icon: Search },
  { titulo: "Carrinho", desc: "Armazena os produtos selecionados.", Icon: ShoppingCart },
  { titulo: "Realização de pedido", desc: "Permite finalizar a compra.", Icon: ClipboardList },
  { titulo: "Confirmação de endereço", desc: "Define o local de entrega.", Icon: MapPin },
  { titulo: "Escolha de pagamento", desc: "Define a forma de pagamento.", Icon: CreditCard },
  { titulo: "Envio ao restaurante", desc: "Encaminha as informações do pedido.", Icon: Store },
  { titulo: "Entrega", desc: "Permite que o pedido seja encaminhado ao cliente.", Icon: Truck },
  { titulo: "Recebimento", desc: "Registra o recebimento do pedido.", Icon: CheckCircle2 },
  { titulo: "Avaliação", desc: "Permite avaliar a experiência.", Icon: Star },
  { titulo: "Encerramento", desc: "Finaliza o fluxo da atividade.", Icon: ListChecks },
];
