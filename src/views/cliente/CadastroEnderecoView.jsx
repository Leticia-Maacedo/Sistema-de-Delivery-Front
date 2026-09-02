import { useEffect, useState } from "react";
import { MapPin, Pencil, Trash2, X, Save } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";

import {
  criarLocal,
  listarLocais,
  atualizarLocal,
  removerLocal,
  fetchUsuarioLogado,
} from "../../api/client";

export default function CadastroEnderecoView({ onGo }) {
  const [usuario, setUsuario] = useState(null);

  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidadeUf, setCidadeUf] = useState("");
  const [tipo, setTipo] = useState("Casa");

  const [locais, setLocais] = useState([]);

  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [enderecoEdicao, setEnderecoEdicao] = useState("");
  const [tipoEdicao, setTipoEdicao] = useState("Casa");
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setErro("");

    try {
      setCarregando(true);

      const usuarioLogado = await fetchUsuarioLogado();

      if (!usuarioLogado) {
        setErro(
          "Não foi possível identificar o usuário logado. Faça login novamente."
        );
        return;
      }

      setUsuario(usuarioLogado);

      const lista = await listarLocais(usuarioLogado.id);

      setLocais(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error(error);

      setErro(
        error?.message ||
          "Não foi possível carregar os endereços cadastrados."
      );
    } finally {
      setCarregando(false);
    }
  }

  function formatarCep(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 5) {
      return numeros;
    }

    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }

  function montarEndereco() {
    const partes = [];

    if (rua.trim()) {
      partes.push(rua.trim());
    }

    if (numero.trim()) {
      partes.push(numero.trim());
    }

    if (complemento.trim()) {
      partes.push(complemento.trim());
    }

    if (bairro.trim()) {
      partes.push(bairro.trim());
    }

    if (cidadeUf.trim()) {
      partes.push(cidadeUf.trim());
    }

    if (cep.trim()) {
      partes.push(`CEP ${cep.trim()}`);
    }

    return partes.join(", ");
  }

  function limparFormulario() {
    setCep("");
    setNumero("");
    setRua("");
    setComplemento("");
    setBairro("");
    setCidadeUf("");
    setTipo("Casa");
  }

  async function salvarEndereco() {
    setErro("");
    setSucesso("");

    if (!usuario) {
      setErro(
        "Não foi possível identificar o usuário logado. Faça login novamente."
      );
      return;
    }

    if (!cep.trim()) {
      setErro("Informe o CEP.");
      return;
    }

    if (!numero.trim()) {
      setErro("Informe o número.");
      return;
    }

    if (!rua.trim()) {
      setErro("Informe a rua.");
      return;
    }

    if (!bairro.trim()) {
      setErro("Informe o bairro.");
      return;
    }

    if (!cidadeUf.trim()) {
      setErro("Informe a cidade e o estado.");
      return;
    }

    try {
      setSalvando(true);

      const endereco = montarEndereco();

      await criarLocal({
        usuario_id: usuario.id,
        endereco,
        tipo,

        // O banco atualmente exige latitude e longitude.
        // Até a integração com Maps, usamos 0.
        latitude: 0,
        longitude: 0,
      });

      setSucesso("Endereço cadastrado com sucesso.");

      limparFormulario();

      const listaAtualizada = await listarLocais(usuario.id);
      setLocais(Array.isArray(listaAtualizada) ? listaAtualizada : []);
    } catch (error) {
      console.error(error);

      setErro(
        error?.message ||
          "Não foi possível salvar o endereço. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(local) {
    setErro("");
    setSucesso("");

    setEditandoId(local.id);
    setEnderecoEdicao(local.endereco || "");
    setTipoEdicao(local.tipo || "Casa");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEnderecoEdicao("");
    setTipoEdicao("Casa");
  }

  async function salvarEdicao(local) {
    setErro("");
    setSucesso("");

    if (!enderecoEdicao.trim()) {
      setErro("Informe o endereço.");
      return;
    }

    try {
      setAtualizando(true);

      await atualizarLocal(local.id, {
        endereco: enderecoEdicao.trim(),
        tipo: tipoEdicao,

        // Mantém as coordenadas que já estavam cadastradas.
        latitude: Number(local.latitude ?? 0),
        longitude: Number(local.longitude ?? 0),
      });

      setSucesso("Endereço atualizado com sucesso.");

      cancelarEdicao();

      const listaAtualizada = await listarLocais(usuario.id);
      setLocais(Array.isArray(listaAtualizada) ? listaAtualizada : []);
    } catch (error) {
      console.error(error);

      setErro(
        error?.message ||
          "Não foi possível atualizar o endereço."
      );
    } finally {
      setAtualizando(false);
    }
  }

  async function excluirEndereco(local) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o endereço "${local.endereco}"?`
    );

    if (!confirmar) {
      return;
    }

    setErro("");
    setSucesso("");

    try {
      await removerLocal(local.id);

      setSucesso("Endereço excluído com sucesso.");

      setLocais((atuais) =>
        atuais.filter((item) => item.id !== local.id)
      );

      if (editandoId === local.id) {
        cancelarEdicao();
      }
    } catch (error) {
      console.error(error);

      setErro(
        error?.message ||
          "Não foi possível excluir o endereço."
      );
    }
  }

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <PageHeader
        Icon={MapPin}
        title="ENDEREÇO"
        subtitle="Cadastro e gerenciamento dos endereços de entrega"
      />

      {/* CADASTRO */}
      <div
        className="ef-card"
        style={{
          padding: 22,
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
          }}
        >
          CADASTRAR NOVO ENDEREÇO
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Field
            label="CEP"
            placeholder="05435-000"
            value={cep}
            maxLength={9}
            onChange={(e) =>
              setCep(formatarCep(e.target.value))
            }
          />

          <Field
            label="NÚMERO"
            placeholder="123"
            value={numero}
            maxLength={20}
            onChange={(e) =>
              setNumero(e.target.value)
            }
          />
        </div>

        <Field
          label="RUA"
          placeholder="Rua das Flores"
          value={rua}
          maxLength={100}
          onChange={(e) =>
            setRua(e.target.value)
          }
        />

        <Field
          label="COMPLEMENTO (OPCIONAL)"
          placeholder="Apto, bloco..."
          value={complemento}
          maxLength={60}
          onChange={(e) =>
            setComplemento(e.target.value)
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Field
            label="BAIRRO"
            placeholder="Vila Madalena"
            value={bairro}
            maxLength={60}
            onChange={(e) =>
              setBairro(e.target.value)
            }
          />

          <Field
            label="CIDADE / UF"
            placeholder="São Paulo - SP"
            value={cidadeUf}
            maxLength={60}
            onChange={(e) =>
              setCidadeUf(e.target.value)
            }
          />
        </div>

        <div>
          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            TIPO DE ENDEREÇO
          </span>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
            }}
          >
            {["Casa", "Trabalho", "Outro"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 12,
                  border: `1px solid ${
                    tipo === t
                      ? "var(--accent)"
                      : "var(--border)"
                  }`,
                  background:
                    tipo === t
                      ? "var(--hover)"
                      : "transparent",
                  color:
                    tipo === t
                      ? "var(--accent)"
                      : "#d8d8d8",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {erro && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #c94a4a",
              fontSize: 12,
              color: "#ff8a8a",
              fontFamily: "'Exo 2', sans-serif",
            }}
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #4caf50",
              fontSize: 12,
              color: "#7edb82",
              fontFamily: "'Exo 2', sans-serif",
            }}
          >
            {sucesso}
          </div>
        )}

        <button
          type="button"
          className="ef-btn-solid"
          disabled={salvando}
          onClick={salvarEndereco}
          style={{
            opacity: salvando ? 0.65 : 1,
            cursor: salvando
              ? "not-allowed"
              : "pointer",
          }}
        >
          {salvando
            ? "SALVANDO..."
            : "SALVAR ENDEREÇO"}
        </button>

        <button
          type="button"
          className="ef-btn-outline"
          onClick={() => onGo("pagina-principal")}
          style={{
            justifyContent: "center",
          }}
        >
          CONTINUAR PARA PÁGINA PRINCIPAL
        </button>
      </div>

      {/* LISTAGEM */}
      <div
        style={{
          marginTop: 24,
        }}
      >
        <div
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          MEUS ENDEREÇOS
        </div>

        {carregando ? (
          <div
            className="ef-card"
            style={{
              padding: 18,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Carregando endereços...
          </div>
        ) : locais.length === 0 ? (
          <div
            className="ef-card"
            style={{
              padding: 18,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Nenhum endereço cadastrado.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {locais.map((local) => (
              <div
                key={local.id}
                className="ef-card"
                style={{
                  padding: 18,
                }}
              >
                {editandoId === local.id ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <Field
                      label="ENDEREÇO COMPLETO"
                      value={enderecoEdicao}
                      onChange={(e) =>
                        setEnderecoEdicao(e.target.value)
                      }
                    />

                    <div>
                      <span
                        style={{
                          fontFamily: "'Exo 2', sans-serif",
                          fontSize: 11,
                          color: "var(--muted)",
                        }}
                      >
                        TIPO
                      </span>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        {["Casa", "Trabalho", "Outro"].map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setTipoEdicao(t)
                              }
                              style={{
                                padding: "8px 14px",
                                borderRadius: 6,
                                cursor: "pointer",
                                border: `1px solid ${
                                  tipoEdicao === t
                                    ? "var(--accent)"
                                    : "var(--border)"
                                }`,
                                background:
                                  tipoEdicao === t
                                    ? "var(--hover)"
                                    : "transparent",
                                color:
                                  tipoEdicao === t
                                    ? "var(--accent)"
                                    : "#d8d8d8",
                              }}
                            >
                              {t}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        className="ef-btn-solid"
                        disabled={atualizando}
                        onClick={() =>
                          salvarEdicao(local)
                        }
                        style={{
                          flex: 1,
                        }}
                      >
                        <Save size={15} />

                        {atualizando
                          ? "SALVANDO..."
                          : "SALVAR ALTERAÇÃO"}
                      </button>

                      <button
                        type="button"
                        className="ef-btn-outline"
                        onClick={cancelarEdicao}
                        style={{
                          flex: 1,
                          justifyContent: "center",
                        }}
                      >
                        <X size={15} />
                        CANCELAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "var(--accent)",
                            fontFamily:
                              "'Exo 2', sans-serif",
                            fontWeight: 700,
                            fontSize: 13,
                            marginBottom: 6,
                          }}
                        >
                          {local.tipo}
                        </div>

                        <div
                          style={{
                            color: "#e5e5e5",
                            fontSize: 13,
                            lineHeight: 1.5,
                          }}
                        >
                          {local.endereco}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <button
                          type="button"
                          className="ef-btn-outline"
                          onClick={() =>
                            iniciarEdicao(local)
                          }
                          style={{
                            padding: "8px 12px",
                            justifyContent: "center",
                          }}
                        >
                          <Pencil size={14} />
                          EDITAR
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirEndereco(local)
                          }
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                            background: "transparent",
                            border:
                              "1px solid #c94a4a",
                            color: "#ff7777",
                            fontFamily:
                              "'Exo 2', sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Trash2 size={14} />
                          EXCLUIR
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}