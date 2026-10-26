import { LayoutGrid, Store, ShoppingCart, CupSoda, Pill, MoreHorizontal } from "lucide-react";

/* Atalhos de categoria da página inicial do cliente. */
export const CATEGORIES = [
  { key: "todos", label: "Todos", Icon: LayoutGrid },
  { key: "restaurantes", label: "Restaurantes", Icon: Store },
  { key: "mercados", label: "Mercados", Icon: ShoppingCart },
  { key: "bebidas", label: "Bebidas", Icon: CupSoda },
  { key: "farmacia", label: "Farmácia", Icon: Pill },
  { key: "mais", label: "Mais", Icon: MoreHorizontal },
];
