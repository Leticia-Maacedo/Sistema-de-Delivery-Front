import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import GoogleMapa from "../../components/GoogleMapa";
import { locais, getUsuarioId, ApiError } from "../../api/client";

/** Endereços do cliente (os do tipo "restaurante" são dos parceiros). */
export async function listarEnderecosDoCliente() {
  const lista = await locais.listar(getUsuarioId());
  return lista.filter((l) => l.tipo !== "restaurante");
}

/**
 * Meus endereços — GET/DELETE /locais.
 *
 * Lista os endereços do cliente, mostra o escolhido para entrega no
 * Google Maps e permite cadastrar, alterar, excluir e escolher qual
 * endereço vai nos próximos pedidos.
 */
export default function EnderecosView({ selecionadoId, onSelecionar, onNovo, onAlterar }) {
  const [enderecos, setEnderecos] = useState(null);
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setEnderecos(await listarEnderecosDoCliente());
      setErro("");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar seus endereços.");
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Sem escolha (ou o escolhido foi excluído): vale o último cadastrado, como no back.
  const ativo = enderecos?.find((e) => e.id === selecionadoId) || enderecos?.[enderecos.length - 1] || null;

  const excluir = async (local) => {
    setErro("");
    try {
      await locais.remover(local.id);
      setConfirmarExclusao(null);
      if (local.id === selecionadoId) onSelecionar(null);
      await carregar();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível excluir o endereço.");
    }
  };

  const texto = { fontFamily: "'Exo 2', sans-serif" };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <PageHeader Icon={MapPin} title="ENDEREÇOS" subtitle="Onde você recebe os seus pedidos" />

      {erro && <div role="alert" style={{ ...texto, fontSize: 12, color: "#E6534C", marginTop: 12 }}>{erro}</div>}

      {enderecos === null && !erro && (
        <div style={{ ...texto, color: "var(--muted)", marginTop: 18 }}>Carregando endereços...</div>
      )}

      {enderecos?.length === 0 && (
        <div className="ef-card" style={{ ...texto, padding: 18, marginTop: 18, color: "var(--muted)", fontSize: 13 }}>
          Você ainda não tem endereço cadastrado. Cadastre um para receber pedidos em casa.
        </div>
      )}

      {ativo && (
        <div className="ef-card" style={{ padding: 18, marginTop: 18 }}>
          <div style={{ ...texto, fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
            ENDEREÇO DE ENTREGA DOS PRÓXIMOS PEDIDOS
          </div>
          <GoogleMapa ponto={ativo} altura={220} titulo="Endereço de entrega" />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {(enderecos || []).map((local) => {
          const escolhido = ativo?.id === local.id;
          return (
            <div
              key={local.id}
              className="ef-card"
              style={{ padding: 14, border: escolhido ? "1px solid var(--accent)" : "1px solid var(--border)" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <MapPin size={18} color={escolhido ? "var(--accent)" : "var(--muted)"} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...texto, fontWeight: 700, fontSize: 13, color: "#fff" }}>
                    <span>{local.tipo}</span>
                    {escolhido && (
                      <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 8, letterSpacing: 1 }}>ENTREGA</span>
                    )}
                  </div>
                  <div style={{ ...texto, fontSize: 12, color: "#d8d8d8", marginTop: 4 }}>{local.endereco}</div>
                </div>
              </div>

              {confirmarExclusao === local.id ? (
                <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ ...texto, fontSize: 12, color: "#E6534C", flex: 1 }}>Excluir este endereço?</span>
                  <button className="ef-btn-outline" style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => setConfirmarExclusao(null)}>
                    CANCELAR
                  </button>
                  <button
                    className="ef-btn-outline"
                    style={{ padding: "6px 12px", fontSize: 11, color: "#E6534C", borderColor: "#E6534C" }}
                    onClick={() => excluir(local)}
                  >
                    SIM, EXCLUIR
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {!escolhido && (
                    <button className="ef-btn-outline" style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => onSelecionar(local.id)}>
                      <CheckCircle2 size={13} /> USAR PARA ENTREGA
                    </button>
                  )}
                  <button className="ef-btn-outline" style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => onAlterar(local)}>
                    <Pencil size={13} /> ALTERAR
                  </button>
                  <button
                    className="ef-btn-outline"
                    style={{ padding: "6px 12px", fontSize: 11, color: "#E6534C", borderColor: "#E6534C" }}
                    onClick={() => setConfirmarExclusao(local.id)}
                  >
                    <Trash2 size={13} /> EXCLUIR
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="ef-btn-solid" style={{ marginTop: 16 }} onClick={onNovo}>
        <Plus size={14} /> ADICIONAR ENDEREÇO
      </button>
    </div>
  );
}
