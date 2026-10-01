import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import { cesta } from "../../api/client";

export default function CestaView({ onBack, onFinalizar }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [alterandoId, setAlterandoId] = useState(null);

  const carregarCesta = async () => {
    try {
      setErro("");
      setCarregando(true);

      const resposta = await cesta.consultar();
      setDados(resposta);
    } catch (err) {
      setErro(err.message || "Não foi possível carregar a cesta.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCesta();
  }, []);

  const alterarQuantidade = async (item, novaQuantidade) => {
    if (alterandoId !== null) return;

    try {
      setErro("");
      setAlterandoId(item.produto_id);

      let resposta;

      if (novaQuantidade <= 0) {
        resposta = await cesta.remover(item.produto_id);
      } else {
        resposta = await cesta.alterarQuantidade(
          item.produto_id,
          novaQuantidade
        );
      }

      setDados(resposta);
    } catch (err) {
      setErro(err.message || "Não foi possível alterar a quantidade.");
    } finally {
      setAlterandoId(null);
    }
  };

  const removerItem = async (produtoId) => {
    if (alterandoId !== null) return;

    try {
      setErro("");
      setAlterandoId(produtoId);

      const resposta = await cesta.remover(produtoId);
      setDados(resposta);
    } catch (err) {
      setErro(err.message || "Não foi possível remover o produto.");
    } finally {
      setAlterandoId(null);
    }
  };

  const formatarMoeda = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (carregando) {
    return (
      <div
        style={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <LoaderCircle size={30} />
        <span style={{ color: "var(--muted)" }}>
          Carregando cesta...
        </span>
      </div>
    );
  }

  const itens = dados?.itens || [];
  const cestaVazia = itens.length === 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          className="ef-btn-outline"
          onClick={onBack}
          style={{
            width: 42,
            height: 42,
            padding: 0,
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={17} />
        </button>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShoppingCart size={20} color="var(--accent)" />

            <h1
              style={{
                margin: 0,
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 24,
              }}
            >
              MINHA CESTA
            </h1>
          </div>

          <div
            style={{
              marginTop: 4,
              color: "var(--muted)",
              fontSize: 12,
            }}
          >
            Confira os produtos antes de continuar.
          </div>
        </div>
      </div>

      {erro && (
        <div
          className="ef-card"
          style={{
            marginBottom: 18,
            padding: 14,
            border: "1px solid #b94a48",
          }}
        >
          <div style={{ color: "#ff8a80", fontSize: 13 }}>
            {erro}
          </div>

          <button
            type="button"
            className="ef-btn-outline"
            onClick={carregarCesta}
            style={{ marginTop: 10 }}
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {cestaVazia ? (
        <div
          className="ef-card"
          style={{
            padding: 40,
            textAlign: "center",
          }}
        >
          <ShoppingCart
            size={42}
            color="var(--muted)"
            style={{ marginBottom: 12 }}
          />

          <h2
            style={{
              margin: "0 0 8px",
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 18,
            }}
          >
            SUA CESTA ESTÁ VAZIA
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Escolha produtos de um restaurante para adicioná-los à cesta.
          </p>

          <button
            type="button"
            className="ef-btn"
            onClick={onBack}
          >
            ESCOLHER PRODUTOS
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {itens.map((item) => {
              const alterando = alterandoId === item.produto_id;

              return (
                <div
                  key={item.id}
                  className="ef-card"
                  style={{
                    padding: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                    opacity: alterando ? 0.65 : 1,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Exo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {item.nome}
                    </div>

                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: 12,
                        marginTop: 5,
                      }}
                    >
                      {formatarMoeda(item.preco_unitario)} cada
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 700,
                        color: "var(--accent)",
                      }}
                    >
                      {formatarMoeda(item.subtotal)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="ef-btn-outline"
                      disabled={alterando}
                      onClick={() =>
                        alterarQuantidade(
                          item,
                          item.quantidade - 1
                        )
                      }
                      style={{
                        width: 36,
                        height: 36,
                        padding: 0,
                        justifyContent: "center",
                      }}
                    >
                      <Minus size={14} />
                    </button>

                    <span
                      style={{
                        minWidth: 28,
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {item.quantidade}
                    </span>

                    <button
                      type="button"
                      className="ef-btn-outline"
                      disabled={alterando}
                      onClick={() =>
                        alterarQuantidade(
                          item,
                          item.quantidade + 1
                        )
                      }
                      style={{
                        width: 36,
                        height: 36,
                        padding: 0,
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={14} />
                    </button>

                    <button
                      type="button"
                      className="ef-btn-outline"
                      disabled={alterando}
                      onClick={() =>
                        removerItem(item.produto_id)
                      }
                      title="Remover produto"
                      style={{
                        width: 36,
                        height: 36,
                        padding: 0,
                        justifyContent: "center",
                        marginLeft: 4,
                      }}
                    >
                      {alterando ? (
                        <LoaderCircle size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="ef-card"
            style={{
              marginTop: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 11,
                    textTransform: "uppercase",
                  }}
                >
                  Total da cesta
                </div>

                <div
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: 25,
                    fontWeight: 800,
                    marginTop: 4,
                  }}
                >
                  {formatarMoeda(dados?.total)}
                </div>
              </div>

              <ShoppingCart
                size={26}
                color="var(--accent)"
              />
            </div>

            <button
              type="button"
              className="ef-btn"
              onClick={onFinalizar}
              style={{
                width: "100%",
                justifyContent: "center",
              }}
            >
              CONTINUAR PARA PAGAMENTO
            </button>
          </div>
        </>
      )}
    </div>
  );
}