import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, Store, X } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { ApiError, restaurantes } from "../../api/client";

const FORM_INICIAL = {
  local_id: "",
  nome_fantasia: "",
  cnpj: "",
  taxa_entrega_km: "",
  status_aprovacao: "pendente",
};

export default function RestaurantesView() {
  const [lista, setLista] = useState([]);
  const [q, setQ] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

  async function carregarRestaurantes() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await restaurantes.listar();
      setLista(dados);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar os restaurantes."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  const filtrados = useMemo(() => {
    const busca = q.trim().toLowerCase();

    if (!busca) return lista;

    return lista.filter(
      (r) =>
        r.nome_fantasia?.toLowerCase().includes(busca) ||
        r.cnpj?.toLowerCase().includes(busca) ||
        r.status_aprovacao?.toLowerCase().includes(busca)
    );
  }, [lista, q]);

  function abrirCadastro() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErro("");
    setMostrarForm(true);
  }

  function abrirEdicao(restaurante) {
    setEditandoId(restaurante.id);

    setForm({
      local_id: String(restaurante.local_id ?? ""),
      nome_fantasia: restaurante.nome_fantasia ?? "",
      cnpj: restaurante.cnpj ?? "",
      taxa_entrega_km: String(restaurante.taxa_entrega_km ?? ""),
      status_aprovacao: restaurante.status_aprovacao ?? "pendente",
    });

    setErro("");
    setMostrarForm(true);
  }

  function fecharFormulario() {
    if (salvando) return;

    setMostrarForm(false);
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErro("");
  }

  function alterarCampo(event) {
    const { name, value } = event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function salvar(event) {
    event.preventDefault();
    setErro("");

    if (
      !form.nome_fantasia.trim() ||
      !form.cnpj.trim() ||
      !form.taxa_entrega_km
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!editandoId && !form.local_id) {
      setErro("Informe o ID do local.");
      return;
    }

    const taxa = Number(form.taxa_entrega_km);

    if (!Number.isFinite(taxa) || taxa <= 0) {
      setErro("A taxa de entrega por km deve ser maior que zero.");
      return;
    }

    setSalvando(true);

    try {
      if (editandoId) {
        await restaurantes.atualizar(editandoId, {
          nome_fantasia: form.nome_fantasia.trim(),
          cnpj: form.cnpj.trim(),
          taxa_entrega_km: taxa,
          status_aprovacao: form.status_aprovacao,
        });
      } else {
        await restaurantes.criar({
          local_id: Number(form.local_id),
          nome_fantasia: form.nome_fantasia.trim(),
          cnpj: form.cnpj.trim(),
          taxa_entrega_km: taxa,
        });
      }

      setMostrarForm(false);
      setEditandoId(null);
      setForm(FORM_INICIAL);

      await carregarRestaurantes();
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar o restaurante."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(restaurante) {
    const confirmou = window.confirm(
      `Deseja realmente excluir "${restaurante.nome_fantasia}"?`
    );

    if (!confirmou) return;

    setErro("");

    try {
      await restaurantes.remover(restaurante.id);
      await carregarRestaurantes();
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir o restaurante."
      );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          className="ef-card"
          style={{
            flex: 1,
            minWidth: 260,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
          }}
        >
          <Search size={16} color="var(--muted)" />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, CNPJ ou status..."
            className="ef-input"
            style={{ border: "none", padding: 0 }}
          />
        </div>

        <button className="ef-btn-outline" onClick={abrirCadastro}>
          <Plus size={14} />
          NOVO RESTAURANTE
        </button>
      </div>

      {erro && (
        <div
          className="ef-card"
          style={{
            padding: 12,
            border: "1px solid #ff5d5d",
          }}
        >
          <span style={{ fontSize: 12, color: "#ff8a8a" }}>{erro}</span>
        </div>
      )}

      {mostrarForm && (
        <form
          onSubmit={salvar}
          className="ef-card"
          style={{
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong style={{ color: "#fff" }}>
              {editandoId ? "EDITAR RESTAURANTE" : "CADASTRAR RESTAURANTE"}
            </strong>

            <button
              type="button"
              onClick={fecharFormulario}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={18} color="var(--muted)" />
            </button>
          </div>

          {!editandoId && (
            <input
              className="ef-input"
              name="local_id"
              type="number"
              min="1"
              value={form.local_id}
              onChange={alterarCampo}
              placeholder="ID do Local"
              required
            />
          )}

          <input
            className="ef-input"
            name="nome_fantasia"
            value={form.nome_fantasia}
            onChange={alterarCampo}
            placeholder="Nome fantasia"
            minLength={2}
            maxLength={120}
            required
          />

          <input
            className="ef-input"
            name="cnpj"
            value={form.cnpj}
            onChange={alterarCampo}
            placeholder="CNPJ"
            minLength={14}
            maxLength={18}
            required
          />

          <input
            className="ef-input"
            name="taxa_entrega_km"
            type="number"
            min="0.01"
            step="0.01"
            value={form.taxa_entrega_km}
            onChange={alterarCampo}
            placeholder="Taxa de entrega por km"
            required
          />

          {editandoId && (
            <select
              className="ef-input"
              name="status_aprovacao"
              value={form.status_aprovacao}
              onChange={alterarCampo}
            >
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="recusado">Recusado</option>
            </select>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="submit"
              className="ef-btn-outline"
              disabled={salvando}
            >
              {salvando
                ? "SALVANDO..."
                : editandoId
                  ? "SALVAR ALTERAÇÕES"
                  : "CADASTRAR"}
            </button>

            <button
              type="button"
              className="ef-btn-outline"
              onClick={fecharFormulario}
              disabled={salvando}
            >
              CANCELAR
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <div className="ef-card" style={{ padding: 20 }}>
          Carregando restaurantes...
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          title="NÃO ENCONTRADO"
          subtitle="Não encontramos restaurantes para essa busca."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {filtrados.map((r) => (
            <div
              key={r.id}
              className="ef-card"
              style={{ padding: 0, overflow: "hidden" }}
            >
              <div
                style={{
                  height: 100,
                  background: "var(--panel)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Store size={36} color="var(--accent)" />
              </div>

              <div style={{ padding: 14 }}>
                <div
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  {r.nome_fantasia}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span>CNPJ: {r.cnpj}</span>
                  <span>Local: #{r.local_id}</span>
                  <span>Status: {r.status_aprovacao}</span>
                  <span>
                    Taxa/km: R$ {Number(r.taxa_entrega_km).toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  <button
                    className="ef-btn-outline"
                    onClick={() => abrirEdicao(r)}
                  >
                    <Pencil size={13} />
                    EDITAR
                  </button>

                  <button
                    className="ef-btn-outline"
                    onClick={() => excluir(r)}
                  >
                    <Trash2 size={13} />
                    EXCLUIR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}