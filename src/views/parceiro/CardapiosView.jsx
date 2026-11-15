import React, { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { Package, Pencil, Trash2, Plus, X, Boxes, ScanBarcode } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import Toggle from "../../components/Toggle";
// O leitor (html5-qrcode) só é baixado quando a câmera é aberta.
const LeitorCodigo = lazy(() => import("../../components/LeitorCodigo"));
import { parceiro, produtos, ApiError } from "../../api/client";

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const VAZIO = { id: null, nome: "", descricao: "", preco: "", disponivel: true, controlaEstoque: false, estoque: "", estoqueOriginal: null, codigoBarras: "", codigoOriginal: null };
// Até este número o item aparece com o aviso de estoque baixo.
const ESTOQUE_BAIXO = 5;
const soDigitos = (v) => v.replace(/[^0-9]/g, "");

function SeloEstoque({ item }) {
  const base = { fontFamily: "'Exo 2', sans-serif", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, letterSpacing: 0.5 };
  if (item.estoque == null) return <span style={{ ...base, color: "var(--muted)", border: "1px solid var(--border)" }}>SEM CONTROLE DE ESTOQUE</span>;
  if (item.estoque === 0) return <span style={{ ...base, color: "#E6534C", border: "1px solid #E6534C" }}>ESGOTADO</span>;
  const baixo = item.estoque <= ESTOQUE_BAIXO;
  return (
    <span style={{ ...base, color: baixo ? "#F5A623" : "var(--accent)", border: `1px solid ${baixo ? "#F5A623" : "var(--accent)"}` }}>
      ESTOQUE: {item.estoque} {item.estoque === 1 ? "UNIDADE" : "UNIDADES"}{baixo ? " · BAIXO" : ""}
    </span>
  );
}

/**
 * Cardápio do restaurante (Portal do Parceiro) — /parceiro/produtos.
 *
 * Lista os itens do restaurante do dono logado e permite incluir,
 * alterar (nome, descrição, preço), ativar/desativar e excluir. Item que
 * já foi vendido não pode ser excluído (fica no histórico dos pedidos):
 * o back responde 409 e a tela sugere desativar.
 *
 * Estoque (Sprint 4): cada item pode controlar estoque ou não (null = vende
 * sem limite). No formulário o dono liga o controle e informa a contagem;
 * na lista, o botão de estoque registra entrada (chegou mercadoria) ou saída
 * (perda) pelo PATCH /produtos/{id}/estoque, que nunca deixa negativo.
 * Cada pedido baixa o estoque e o cancelamento devolve (feito no back);
 * com 0 o item fica esgotado e some do cardápio do cliente.
 *
 * Código de barras (Backlog): cada item pode guardar o EAN da embalagem
 * (lido pela câmera ou digitado; a API confere o dígito verificador). O botão
 * LER CÓDIGO DE BARRAS acha o item pela embalagem e abre a entrada de estoque;
 * se nenhum item tiver o código, abre o cadastro de um item novo com ele.
 */
export default function CardapiosView({ onGo }) {
  const [itens, setItens] = useState(null);
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState("");
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [semRestaurante, setSemRestaurante] = useState(false);
  const [ajuste, setAjuste] = useState(null); // { id, quantidade, erro, salvando }
  const [leitor, setLeitor] = useState(null); // "buscar" | "form"
  const [destacado, setDestacado] = useState(null);

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
    const estoque = form.controlaEstoque ? Number(form.estoque) : null;
    if (form.controlaEstoque && (form.estoque === "" || !(Number.isInteger(estoque) && estoque >= 0 && estoque <= 99999))) {
      return setErroForm("Informe o estoque: um número inteiro de 0 a 99999.");
    }
    setSalvando(true);
    try {
      const dados = { nome: form.nome.trim(), descricao: form.descricao.trim() || null, preco, disponivel: form.disponivel };
      // Só manda o estoque quando ele mudou, para não sobrescrever uma baixa
      // feita por um pedido enquanto o formulário estava aberto.
      if (!form.id || estoque !== form.estoqueOriginal) dados.estoque = estoque;
      const codigo = form.codigoBarras.trim() || null;
      if (!form.id ? codigo : codigo !== form.codigoOriginal) dados.codigo_barras = codigo;
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

  const registrarAjuste = async (item, sinal) => {
    const quantidade = Number(ajuste?.quantidade);
    if (!ajuste?.quantidade || !(Number.isInteger(quantidade) && quantidade > 0)) {
      setAjuste({ ...ajuste, erro: "Informe a quantidade (número inteiro maior que zero)." });
      return;
    }
    setAjuste({ ...ajuste, erro: "", salvando: true });
    try {
      const r = await produtos.ajustarEstoque(item.id, sinal * quantidade);
      setItens((lista) => lista.map((i) => (i.id === item.id ? { ...i, estoque: r.estoque } : i)));
      setAjuste(null);
    } catch (e) {
      setAjuste({ ...ajuste, salvando: false, erro: e instanceof ApiError ? e.message : "Não foi possível registrar." });
    }
  };

  // Leitor de código de barras: acha o item pela embalagem.
  const codigoLido = async (codigo) => {
    const modo = leitor;
    setLeitor(null);
    if (modo === "form") {
      setForm((f) => ({ ...f, codigoBarras: codigo }));
      return;
    }
    setErro("");
    try {
      const item = await parceiro.produtos.porCodigoBarras(codigo);
      setDestacado(item.id);
      if (item.estoque != null) setAjuste({ id: item.id, quantidade: "", erro: "" });
      setTimeout(() => document.getElementById(`item-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setErroForm("");
        setForm({ ...VAZIO, codigoBarras: codigo });
        setErro(`Nenhum item tem o código ${codigo}. Cadastre o item novo abaixo.`);
      } else setErro(e instanceof ApiError ? e.message : "Não foi possível buscar o código.");
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
      <PageHeader Icon={Package} title="CARDÁPIO" subtitle="Inclua pratos, altere preços, escolha o que está disponível e controle o estoque" />

      <button className="ef-btn-outline" style={{ marginTop: 14, width: "auto" }} onClick={() => setLeitor("buscar")}>
        <ScanBarcode size={14} /> LER CÓDIGO DE BARRAS
      </button>

      {itens?.some((i) => i.estoque != null && i.estoque <= ESTOQUE_BAIXO) && (
        <div className="ef-card" style={{ ...texto, padding: 12, marginTop: 14, fontSize: 12, color: "#d8d8d8", border: "1px solid #F5A623" }}>
          <b style={{ color: "#F5A623" }}>Atenção ao estoque:</b>{" "}
          {itens.filter((i) => i.estoque === 0).length} esgotado(s) e{" "}
          {itens.filter((i) => i.estoque > 0 && i.estoque <= ESTOQUE_BAIXO).length} com {ESTOQUE_BAIXO} unidades ou menos. Itens esgotados não aparecem para os clientes.
        </div>
      )}

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
          <label style={{ ...texto, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#d8d8d8" }}>
            <Toggle on={form.controlaEstoque} onClick={() => setForm({ ...form, controlaEstoque: !form.controlaEstoque })} />
            {form.controlaEstoque ? "Controlar o estoque deste item" : "Sem controle de estoque (vende sem limite)"}
          </label>
          {form.controlaEstoque && (
            <Field label="QUANTIDADE EM ESTOQUE" placeholder="20" inputMode="numeric" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: soDigitos(e.target.value) })} />
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field label="CÓDIGO DE BARRAS (OPCIONAL)" placeholder="7894900011517" inputMode="numeric" value={form.codigoBarras}
                onChange={(e) => setForm({ ...form, codigoBarras: soDigitos(e.target.value).slice(0, 14) })} />
            </div>
            <button type="button" className="ef-btn-outline" aria-label="Ler o código de barras com a câmera" onClick={() => setLeitor("form")} style={{ width: "auto", marginBottom: 2 }}>
              <ScanBarcode size={14} />
            </button>
          </div>
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
          <div key={it.id} id={`item-${it.id}`} className="ef-card" style={{ padding: 14, border: destacado === it.id ? "1px solid var(--accent)" : undefined }}>
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
                <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <SeloEstoque item={it} />
                  {it.codigo_barras && <span style={{ ...texto, fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><ScanBarcode size={11} /> {it.codigo_barras}</span>}
                </div>
              </div>
              {it.estoque != null && (
                <button
                  className="ef-icon-btn"
                  aria-label={`Entrada ou saída de estoque de ${it.nome}`}
                  title="Entrada ou saída de estoque"
                  onClick={() => setAjuste(ajuste?.id === it.id ? null : { id: it.id, quantidade: "", erro: "" })}
                  style={ajuste?.id === it.id ? { color: "var(--accent)", borderColor: "var(--accent)" } : undefined}
                >
                  <Boxes size={14} />
                </button>
              )}
              <button
                className="ef-icon-btn"
                aria-label={`Alterar ${it.nome}`}
                onClick={() => {
                  setErroForm("");
                  setForm({
                    id: it.id, nome: it.nome, descricao: it.descricao || "", preco: String(it.preco).replace(".", ","), disponivel: it.disponivel,
                    controlaEstoque: it.estoque != null, estoque: it.estoque != null ? String(it.estoque) : "", estoqueOriginal: it.estoque ?? null,
                    codigoBarras: it.codigo_barras || "", codigoOriginal: it.codigo_barras ?? null,
                  });
                }}
              >
                <Pencil size={14} />
              </button>
              <button className="ef-icon-btn" aria-label={`Excluir ${it.nome}`} onClick={() => setConfirmarExclusao(it.id)} style={{ color: "#E6534C", borderColor: "#E6534C" }}>
                <Trash2 size={14} />
              </button>
            </div>
            {ajuste?.id === it.id && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ ...texto, fontSize: 12, color: "#d8d8d8" }}>Unidades:</span>
                <input
                  aria-label="Quantidade de unidades"
                  inputMode="numeric"
                  value={ajuste.quantidade}
                  onChange={(e) => setAjuste({ ...ajuste, quantidade: soDigitos(e.target.value), erro: "" })}
                  placeholder="10"
                  style={{ ...texto, width: 80, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--panel)", color: "#fff", fontSize: 12 }}
                />
                <button className="ef-btn-outline" disabled={ajuste.salvando} style={{ padding: "6px 12px", fontSize: 11, color: "var(--accent)", borderColor: "var(--accent)" }} onClick={() => registrarAjuste(it, 1)}>
                  + ENTRADA
                </button>
                <button className="ef-btn-outline" disabled={ajuste.salvando} style={{ padding: "6px 12px", fontSize: 11, color: "#E6534C", borderColor: "#E6534C" }} onClick={() => registrarAjuste(it, -1)}>
                  − SAÍDA
                </button>
                {ajuste.erro && <span role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C", width: "100%" }}>{ajuste.erro}</span>}
              </div>
            )}
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
      {leitor && (
        <Suspense fallback={null}><LeitorCodigo tipo="barras" titulo={leitor === "form" ? "Código de barras do item" : "Achar item pelo código de barras"}
          onLido={codigoLido} onFechar={() => setLeitor(null)} /></Suspense>
      )}
    </div>
  );
}
