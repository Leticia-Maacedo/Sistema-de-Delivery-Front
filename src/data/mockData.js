import {
  Beef, Fish, Pizza, IceCream, Salad, UtensilsCrossed, Users, Store,
  MapPin, Bell, LayoutGrid, ShoppingCart, CupSoda, Pill, MoreHorizontal,
  CreditCard, Wallet, Banknote,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Pedidos                                                              */
/* ------------------------------------------------------------------ */

export const ORDERS = [
  { id: 2563, cliente: "Ana Silva", restaurante: "Cantinho do Chef", status: "Entregue", total: 61.68, data: "10/08 14:20", endereco: "Rua das Flores, 123 — Vila Madalena, São Paulo - SP", pagamento: "Cartão de Crédito •••• 1234", taxa: 5.99, itens: [
    { nome: "Filé à Parmegiana", qtd: 1, preco: 32.9 }, { nome: "Suco Natural", qtd: 1, preco: 8.9 },
    { nome: "Arroz Branco", qtd: 1, preco: 6.0 }, { nome: "Batata Frita", qtd: 1, preco: 7.9 },
  ]},
  { id: 2562, cliente: "João Pereira", restaurante: "Burger House", status: "Em rota", total: 38.5, data: "10/08 14:18", endereco: "Av. Paulista, 900 — Bela Vista, São Paulo - SP", pagamento: "PIX", taxa: 0, itens: [
    { nome: "Combo Burger", qtd: 1, preco: 29.9 }, { nome: "Refrigerante Lata", qtd: 1, preco: 8.6 },
  ]},
  { id: 2561, cliente: "Maria Santos", restaurante: "Sushi Lovers", status: "Preparando", total: 67.4, data: "10/08 14:10", endereco: "Rua Augusta, 500 — Consolação, São Paulo - SP", pagamento: "Cartão de Débito •••• 9087", taxa: 0, itens: [
    { nome: "Combinado 20 peças", qtd: 1, preco: 59.9 }, { nome: "Hot Roll", qtd: 1, preco: 7.5 },
  ]},
  { id: 2560, cliente: "Lucas Costa", restaurante: "Pizza Station", status: "Confirmado", total: 43.8, data: "10/08 14:05", endereco: "Rua Harmonia, 88 — Vila Madalena, São Paulo - SP", pagamento: "Dinheiro", taxa: 0, itens: [
    { nome: "Pizza Grande Calabresa", qtd: 1, preco: 38.9 }, { nome: "Água com Gás", qtd: 1, preco: 4.9 },
  ]},
  { id: 2559, cliente: "Juliana Lima", restaurante: "Cantinho do Chef", status: "Entregue", total: 29.9, data: "10/08 13:55", endereco: "Rua Fradique Coutinho, 45 — São Paulo - SP", pagamento: "Cartão de Crédito •••• 1234", taxa: 0, itens: [
    { nome: "Brownie com Sorvete", qtd: 2, preco: 14.9 },
  ]},
];

/* ------------------------------------------------------------------ */
/* Restaurantes                                                         */
/* ------------------------------------------------------------------ */

export const RESTAURANTS = [
  { id: 1, nome: "Burger House", cat: "Hamburgueria", rating: 4.8, tempo: "30-40 min", frete: 5.99, Icon: Beef },
  { id: 2, nome: "Sushi Lovers", cat: "Japonesa", rating: 4.9, tempo: "40-50 min", frete: 5.99, Icon: Fish },
  { id: 3, nome: "Cantinho do Chef", cat: "Brasileira", rating: 4.8, tempo: "30-40 min", frete: 5.99, Icon: UtensilsCrossed },
  { id: 4, nome: "Pizza Station", cat: "Pizzaria", rating: 4.7, tempo: "30-40 min", frete: 4.99, Icon: Pizza },
  { id: 5, nome: "Açaí da Praia", cat: "Açaí e Sorvetes", rating: 4.6, tempo: "20-30 min", frete: 4.99, Icon: IceCream },
  { id: 6, nome: "Veggie Green", cat: "Saudável", rating: 4.7, tempo: "30-40 min", frete: 5.99, Icon: Salad },
];

/* ------------------------------------------------------------------ */
/* Entregas                                                             */
/* ------------------------------------------------------------------ */

export const DELIVERIES = [
  { id: 2562, entregador: "Pedro Oliveira", status: "Em rota", janela: "14:45 - 15:00", endereco: "Rua das Flores, 123 - Vila Madalena" },
  { id: 2561, entregador: "Marcos Vinícius", status: "A caminho", janela: "14:30 - 15:15", endereco: "Av. Paulista, 1578 - Bela Vista" },
  { id: 2560, entregador: "Juliana Costa", status: "Saiu para entrega", janela: "14:20 - 15:10", endereco: "Rua Augusta, 500 - Consolação" },
];

/* ------------------------------------------------------------------ */
/* Atividades e integrações (admin)                                     */
/* ------------------------------------------------------------------ */

export const ACTIVITIES = [
  { hora: "14:32", texto: "Usuário João Pereira fez um novo pedido", ref: "#2562" },
  { hora: "14:28", texto: "Restaurante Burger House atualizou cardápio", ref: null },
  { hora: "14:20", texto: "Entrega finalizada com sucesso", ref: "#2563" },
  { hora: "14:15", texto: "Novo usuário cadastrado: Carla Souza", ref: null },
  { hora: "14:05", texto: "Pagamento aprovado", ref: "#2560" },
];

export const INTEGRATIONS = [
  { nome: "Google Maps", status: "Conectado", Icon: MapPin },
  { nome: "Facebook", status: "Conectado", Icon: Users },
  { nome: "Gmail", status: "Conectado", Icon: Bell },
];

export const REVENUE = [
  { d: "04/08", v: 5200 }, { d: "05/08", v: 8700 }, { d: "06/08", v: 6600 },
  { d: "07/08", v: 12430 }, { d: "08/08", v: 6100 }, { d: "09/08", v: 9400 }, { d: "10/08", v: 12000 },
];

/* ------------------------------------------------------------------ */
/* Categorias e pagamento (cliente)                                     */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  { key: "todos", label: "Todos", Icon: LayoutGrid },
  { key: "restaurantes", label: "Restaurantes", Icon: Store },
  { key: "mercados", label: "Mercados", Icon: ShoppingCart },
  { key: "bebidas", label: "Bebidas", Icon: CupSoda },
  { key: "farmacia", label: "Farmácia", Icon: Pill },
  { key: "mais", label: "Mais", Icon: MoreHorizontal },
];

export const PAYMENT_METHODS = [
  { id: 1, tipo: "Cartão de Crédito", info: "•••• 4231 · Visa", padrao: true, Icon: CreditCard },
  { id: 2, tipo: "Cartão de Débito", info: "•••• 9087 · Mastercard", padrao: false, Icon: CreditCard },
  { id: 3, tipo: "PIX", info: "chave: leticia@email.com", padrao: false, Icon: Wallet },
  { id: 4, tipo: "Dinheiro", info: "pagamento na entrega", padrao: false, Icon: Banknote },
];

/* ------------------------------------------------------------------ */
/* Cardápio e avaliações (parceiro)                                     */
/* ------------------------------------------------------------------ */

export const MENU_INICIAL = [
  { id: 1, nome: "Filé à Parmegiana", cat: "Pratos principais", preco: 32.9, disponivel: true },
  { id: 2, nome: "Feijoada Completa", cat: "Pratos principais", preco: 45.0, disponivel: true },
  { id: 3, nome: "Moqueca de Peixe", cat: "Pratos principais", preco: 52.0, disponivel: false },
  { id: 4, nome: "Suco Natural", cat: "Bebidas", preco: 8.9, disponivel: true },
  { id: 5, nome: "Arroz Branco", cat: "Acompanhamentos", preco: 6.0, disponivel: true },
  { id: 6, nome: "Brownie com Sorvete", cat: "Sobremesas", preco: 14.9, disponivel: true },
];

export const REVIEWS = [
  { id: 1, cliente: "Ana Silva", nota: 5, data: "10/08/2026", comentario: "Comida chegou quentinha e no prazo, o filé estava excelente!", resposta: "Obrigado, Ana! Ficamos muito felizes 💚" },
  { id: 2, cliente: "João Pereira", nota: 4, data: "09/08/2026", comentario: "Muito bom, só achei o tempo de entrega um pouco acima do esperado.", resposta: null },
  { id: 3, cliente: "Maria Santos", nota: 5, data: "08/08/2026", comentario: "Melhor feijoada da região, já é a terceira vez que peço!", resposta: null },
];

/* ------------------------------------------------------------------ */
/* Status visual                                                        */
/* ------------------------------------------------------------------ */

export const STATUS_STYLE = {
  Entregue: { bg: "rgba(29,185,84,0.14)", fg: "#3DDC72", dot: "#3DDC72" },
  "Em rota": { bg: "rgba(230,180,60,0.14)", fg: "#E6B43C", dot: "#E6B43C" },
  "A caminho": { bg: "rgba(230,180,60,0.14)", fg: "#E6B43C", dot: "#E6B43C" },
  "Saiu para entrega": { bg: "rgba(166,255,0,0.12)", fg: "#A6FF00", dot: "#A6FF00" },
  Preparando: { bg: "rgba(230,180,60,0.14)", fg: "#E6B43C", dot: "#E6B43C" },
  Confirmado: { bg: "rgba(122,140,255,0.14)", fg: "#8C9BFF", dot: "#8C9BFF" },
};

export const fmt = (n) => `R$ ${n.toFixed(2).replace(".", ",")}`;