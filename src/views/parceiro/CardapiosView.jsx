import { useState } from "react";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Toggle from "../../components/Toggle";
import { MENU_INICIAL, fmt } from "../../data/mockData";

export default function CardapiosView() {
  const [itens, setItens] = useState(MENU_INICIAL);
  const toggle = (id) => setItens((its) => its.map((i) => (i.id === id ? { ...i, disponivel: !i.disponivel } : i)));
  const remove = (id) => setItens((its) => its.filter((i) => i.id !== id));
  const addItem = () => {
    const nome = window.prompt("Nome do novo prato:");
    if (!nome) return;
    setItens((its) => [...its, { id: Date.now(), nome, cat: "Novo item", preco: 0, disponivel: true }]);
  };
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <PageHeader Icon={Package} title="CARDÁPIO" subtitle="Gerencie os itens disponíveis para venda" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {itens.map((it) => (
          <div key={it.id} className="ef-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <Toggle on={it.disponivel} onClick={() => toggle(it.id)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: it.disponivel ? "#fff" : "var(--muted)" }}>{it.nome}</div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)" }}>{it.cat} · {fmt(it.preco)}</div>
            </div>
            <button className="ef-icon-btn"><Pencil size={14} /></button>
            <button className="ef-icon-btn" onClick={() => remove(it.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={addItem} className="ef-btn-outline" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}><Plus size={14} /> NOVO ITEM</button>
    </div>
  );
}
