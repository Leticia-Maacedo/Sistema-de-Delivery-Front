import { useEffect, useState } from "react";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import { ApiError, produtos, restaurantes } from "../../api/client";

export default function ProdutosView() {
  const [lista, setLista] = useState([]);
  const [listaRestaurantes, setListaRestaurantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [restauranteId, setRestauranteId] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      const [listaProdutos, listaDeRestaurantes] = await Promise.all([
        produtos.listar(),
        restaurantes.listar(),
      ]);
      setLista(listaProdutos);
      setListaRestaurantes(listaDeRestaurantes);
      setRestauranteId((atual) => atual || String(listaDeRestaurantes[0]?.id ?? ""));
    } catch {
      setErro("Não foi possível carregar os dados da API.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const limparFormulario = () => {
    setEditandoId(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setDisponivel(true);
  };

  const editar = (produto) => {
    setEditandoId(produto.id);
    setRestauranteId(String(produto.restaurante_id));
    setNome(produto.nome);
    setDescricao(produto.descricao || "");
    setPreco(String(produto.preco));
    setDisponivel(produto.disponivel);
    setErro("");
    setMensagem("");
  };

  const salvar = async () => {
    setErro("");
    setMensagem("");
    if (nome.trim().length < 2) return setErro("O nome precisa ter pelo menos 2 caracteres.");
    if (!preco || Number(preco) <= 0) return setErro("Informe um preço válido.");

    setSalvando(true);
    try {
      if (editandoId) {
        await produtos.atualizar(editandoId, {
          nome, descricao: descricao || null, preco, disponivel,
        });
        setMensagem("Produto atualizado com sucesso.");
      } else {
        await produtos.criar({
          restaurante_id: Number(restauranteId), nome, descricao: descricao || null, preco, disponivel,
        });
        setMensagem("Produto cadastrado com sucesso.");
      }
      limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Excluir este produto?")) return;
    setErro("");
    try {
      await produtos.remover(id);
      if (editandoId === id) limparFormulario();
      await carregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível excluir o produto.");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <PageHeader Icon={Package} title="PRODUTOS" subtitle="Cadastro de produtos do cardápio" />

      <div className="ef-card" style={{ padding: 22, marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "var(--accent)" }}>
          {editandoId ? `EDITANDO PRODUTO #${editandoId}` : "NOVO PRODUTO"}
        </span>

        {!editandoId && (
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Exo 2', sans-serif" }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>RESTAURANTE</span>
            <select
              className="ef-input"
              value={restauranteId}
              onChange={(e) => setRestauranteId(e.target.value)}
            >
              {listaRestaurantes.map((r) => (
                <option key={r.id} value={r.id}>{r.nome_fantasia}</option>
              ))}
            </select>
          </label>
        )}

        <Field label="NOME" placeholder="X-Salada" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Field label="DESCRIÇÃO (OPCIONAL)" placeholder="Pão, hambúrguer, queijo..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="PREÇO (R$)" placeholder="24.90" value={preco} onChange={(e) => setPreco(e.target.value)} />
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Exo 2', sans-serif" }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>DISPONÍVEL</span>
            <select className="ef-input" value={disponivel ? "1" : "0"} onChange={(e) => setDisponivel(e.target.value === "1")}>
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
          </label>
        </div>

        {erro && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--bad, #e05c5c)" }}>{erro}</span>}
        {mensagem && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--good)" }}>{mensagem}</span>}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="ef-btn-solid" onClick={salvar} disabled={salvando || (!editandoId && !restauranteId)}>
            {salvando ? "SALVANDO..." : editandoId ? "SALVAR ALTERAÇÕES" : "CADASTRAR PRODUTO"}
          </button>
          {editandoId && (
            <button className="ef-btn-outline" style={{ width: "auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 6 }} onClick={limparFormulario}>
              <X size={14} /> CANCELAR
            </button>
          )}
        </div>
        {!editandoId && listaRestaurantes.length === 0 && !carregando && (
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "var(--muted)" }}>
            Nenhum restaurante cadastrado ainda — cadastre um em <code>POST /restaurantes</code> antes de criar produtos.
          </span>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: "#fff", letterSpacing: 1 }}>
          PRODUTOS CADASTRADOS {carregando ? "" : `(${lista.length})`}
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {carregando && <span style={{ color: "var(--muted)", fontSize: 13 }}>Carregando...</span>}
          {!carregando && lista.length === 0 && (
            <span style={{ color: "var(--muted)", fontSize: 13 }}>Nenhum produto cadastrado ainda.</span>
          )}
          {lista.map((p) => (
            <div key={p.id} className="ef-card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: "#fff" }}>{p.nome}</span>
                  {!p.disponivel && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "var(--hover)", color: "var(--muted)" }}>INDISPONÍVEL</span>
                  )}
                </div>
                {p.descricao && (
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{p.descricao}</div>
                )}
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "var(--accent)", marginTop: 6 }}>
                  R$ {Number(p.preco).toFixed(2)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ef-btn-outline" style={{ width: "auto", padding: "6px 10px" }} onClick={() => editar(p)}>
                  <Pencil size={14} />
                </button>
                <button
                  className="ef-btn-outline"
                  style={{ width: "auto", padding: "6px 10px", borderColor: "var(--bad, #e05c5c)", color: "var(--bad, #e05c5c)" }}
                  onClick={() => excluir(p.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
