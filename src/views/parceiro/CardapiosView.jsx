import React, { useState, useEffect, useCallback } from "react";
import { Package, Pencil, Trash2, Plus, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import Toggle from "../../components/Toggle";
import { parceiro, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const VAZIO = { id: null, nome: "", descricao: "", preco: "", disponivel: true };

/**
 * Cardápio do restaurante (Portal do Parceiro) — /parceiro/produtos.
 *
 * Lista os itens do restaurante do dono logado e permite incluir,
 * alterar (nome, descrição, preço), ativar/desativar e excluir. Item que
 * já foi vendido não pode ser excluído (fica no histórico dos pedidos):
 * o back responde 409 e a tela sugere desativar.
 */
export default function CardapiosView({ onGo }) {
  const [itens, setItens] = useState(null);
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [semRestaurante, setSemRestaurante] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setItens(await parceiro.produtos.listar());
      setErro("");
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setSemRestaurante(true);
      else setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o cardápio.");
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  const salvar = async () => {
    setErroForm("");
    const preco = Number(String(form.preco).replace(",", "."));
    if (form.nome.trim().length < 2) return setErroForm("Informe o nome do item.");
    if (!(preco > 0)) return setErroForm("Informe um preço maior que zero.");
    setSalvando(true);
    try {
      const dados = { nome: form.nome.trim(), descricao: form.descricao.trim() || null, preco, disponivel: form.disponivel };
      if (form.id) await parceiro.produtos.alterar(form.id, dados);
      else await parceiro.produtos.criar(dados);
      setForm(null);
      await carregar();
    } catch (e) {
      setErroForm(e instanceof ApiError ? e.message : "Não foi possível salvar o item.");
    } finally {
      setSalvando(false);
    }
  };

  const alternar = async (item) => {
    setErro("");
    try {
      const atualizado = await parceiro.produtos.alterar(item.id, { disponivel: !item.disponivel });
      setItens((lista) => lista.map((i) => (i.id === item.id ? atualizado : i)));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível alterar o item.");
    }
  };

  const excluir = async (item) => {
    setErro("");
    try {
      await parceiro.produtos.remover(item.id);
      setConfirmarExclusao(null);
      await carregar();
    } catch (e) {
      setConfirmarExclusao(null);
      setErro(e instanceof ApiError ? e.message : "Não foi possível excluir o item.");
    }
  };

  if (semRestaurante) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <PageHeader Icon={Package} title="CARDÁPIO" subtitle="Itens do seu restaurante" />
        <div className="ef-card" style={{ ...texto, padding: 18, marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
          Cadastre o seu restaurante antes de montar o cardápio.
          <button className="ef-btn-solid" style={{ marginTop: 12 }} onClick={() => onGo("cadastro-restaurante")}>
            CADASTRAR RESTAURANTE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <PageHeader Icon={Package} title="CARDÁPIO" subtitle="Inclua pratos, altere preços e escolha o que está disponível" />

      {erro && <div role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C", marginTop: 12 }}>{erro}</div>}

      {form ? (
        <div className="ef-card" style={{ padding: 20, marginTop: 18, display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff" }}>{form.id ? "ALTERAR ITEM" : "NOVO ITEM"}</span>
            <button className="ef-icon-btn" aria-label="Fechar" onClick={() => setForm(null)}><X size={14} /></button>
          </div>
          <Field label="NOME" placeholder="X-Salada" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Field label="DESCRIÇÃO (OPCIONAL)" placeholder="Pão, hambúrguer, queijo e salada" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          <Field label="PREÇO (R$)" placeholder="24,90" inputMode="decimal" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
          <label style={{ ...texto, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#d8d8d8" }}>
            <Toggle on={form.disponivel} onClick={() => setForm({ ...form, disponivel: !form.disponivel })} />
            {form.disponivel ? "Disponível para os clientes" : "Indisponível (não aparece no cardápio)"}
          </label>
          {erroForm && <span role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C" }}>{erroForm}</span>}
          <button className="ef-btn-solid" onClick={salvar} disabled={salvando}>
            {salvando ? "SALVANDO..." : form.id ? "SALVAR ALTERAÇÕES" : "INCLUIR NO CARDÁPIO"}
          </button>
        </div>
      ) : (
        <button onClick={() => { setErroForm(""); setForm(VAZIO); }} className="ef-btn-solid" style={{ marginTop: 18 }}>
          <Plus size={14} /> NOVO ITEM
        </button>
      )}

      {itens === null && !erro && <div style={{ ...texto, color: "var(--muted)", marginTop: 18 }}>Carregando cardápio...</div>}
      {itens?.length === 0 && (
        <div className="ef-card" style={{ ...texto, padding: 18, marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
          O cardápio está vazio. Inclua o primeiro item.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {(itens || []).map((it) => (
          <div key={it.id} className="ef-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Toggle on={it.disponivel} onClick={() => alternar(it)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...texto, fontSize: 13, fontWeight: 600, color: it.disponivel ? "#fff" : "var(--muted)" }}>
                  {it.nome}
                  {!it.disponivel && <span style={{ fontSize: 10, marginLeft: 8, color: "#E6534C" }}>INDISPONÍVEL</span>}
                </div>
                <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {fmt(it.preco)}{it.descricao ? ` · ${it.descricao}` : ""}
                </div>
              </div>
              <button
                className="ef-icon-btn"
                aria-label={`Alterar ${it.nome}`}
                onClick={() => {
                  setErroForm("");
                  setForm({ id: it.id, nome: it.nome, descricao: it.descricao || "", preco: String(it.preco).replace(".", ","), disponivel: it.disponivel });
                }}
              >
                <Pencil size={14} />
              </button>
              <button className="ef-icon-btn" aria-label={`Excluir ${it.nome}`} onClick={() => setConfirmarExclusao(it.id)} style={{ color: "#E6534C", borderColor: "#E6534C" }}>
                <Trash2 size={14} />
              </button>
            </div>
            {confirmarExclusao === it.id && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ ...texto, fontSize: 12, color: "#E6534C", flex: 1 }}>Excluir "{it.nome}" do cardápio?</span>
                <button className="ef-btn-outline" style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => setConfirmarExclusao(null)}>CANCELAR</button>
                <button className="ef-btn-outline" style={{ padding: "6px 12px", fontSize: 11, color: "#E6534C", borderColor: "#E6534C" }} onClick={() => excluir(it)}>
                  SIM, EXCLUIR
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
