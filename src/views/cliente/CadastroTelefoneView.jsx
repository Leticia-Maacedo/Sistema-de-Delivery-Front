import { useState } from "react";
import { Smartphone } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Field from "../../components/Field";
import {
  solicitarCodigoCadastroTelefone,
  confirmarCadastroTelefone,
  ApiError,
} from "../../api/client";

export default function CadastroTelefoneView({ onGo }) {
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [codigoDev, setCodigoDev] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const obterCadastro = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("entregafood_cadastro_telefone")
      );
    } catch {
      return null;
    }
  };

  const enviarCodigo = async () => {
    setErro("");

    const cadastro = obterCadastro();

    if (!cadastro) {
      setErro("Dados do cadastro não encontrados.");
      return;
    }

    const telefoneLimpo = telefone.replace(/\D/g, "");

    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await solicitarCodigoCadastroTelefone({
        nome: cadastro.nome,
        telefone: telefoneLimpo,
        senha: cadastro.senha,
        tipo: cadastro.tipo,
      });

      setTelefone(telefoneLimpo);
      setEnviado(true);

      // Apenas para ambiente acadêmico/desenvolvimento.
      if (resposta.codigo_dev) {
        setCodigoDev(String(resposta.codigo_dev));
      }
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível conectar ao servidor."
      );
    } finally {
      setCarregando(false);
    }
  };

  const confirmarCodigo = async () => {
    setErro("");

    const cadastro = obterCadastro();

    if (!cadastro) {
      setErro("Dados do cadastro não encontrados.");
      return;
    }

    if (!/^\d{6}$/.test(codigo)) {
      setErro("Digite o código OTP de 6 dígitos.");
      return;
    }

    setCarregando(true);

    try {
      await confirmarCadastroTelefone({
        nome: cadastro.nome,
        telefone,
        senha: cadastro.senha,
        codigo,
        tipo: cadastro.tipo,
      });

      sessionStorage.removeItem(
        "entregafood_cadastro_telefone"
      );

      onGo("cadastro-endereco");
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível confirmar o código."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <PageHeader
        Icon={Smartphone}
        title="VALIDAÇÃO"
        subtitle="Cadastro e verificação por celular"
      />

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
        {!enviado ? (
          <>
            <Field
              label="NÚMERO DE CELULAR"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            {erro && (
              <span
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 12,
                  color: "var(--bad, #e05c5c)",
                }}
              >
                {erro}
              </span>
            )}

            <button
              className="ef-btn-solid"
              onClick={enviarCodigo}
              disabled={carregando || !telefone.trim()}
            >
              {carregando
                ? "ENVIANDO..."
                : "ENVIAR CÓDIGO"}
            </button>
          </>
        ) : (
          <>
            <span
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              Código OTP gerado para {telefone}
            </span>

            {codigoDev && (
              <div
                style={{
                  padding: 12,
                  border: "1px solid var(--accent)",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: 11,
                    color: "var(--muted)",
                  }}
                >
                  CÓDIGO DE DESENVOLVIMENTO
                </span>

                <div
                  style={{
                    marginTop: 7,
                    fontSize: 22,
                    color: "var(--accent)",
                    letterSpacing: 5,
                    fontFamily:
                      "'Press Start 2P', monospace",
                  }}
                >
                  {codigoDev}
                </div>
              </div>
            )}

            <Field
              label="CÓDIGO OTP"
              placeholder="000000"
              value={codigo}
              maxLength={6}
              onChange={(e) =>
                setCodigo(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
            />

            {erro && (
              <span
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 12,
                  color: "var(--bad, #e05c5c)",
                }}
              >
                {erro}
              </span>
            )}

            <button
              className="ef-btn-solid"
              onClick={confirmarCodigo}
              disabled={
                carregando || codigo.length !== 6
              }
            >
              {carregando
                ? "CONFIRMANDO..."
                : "CONFIRMAR CADASTRO"}
            </button>

            <button
              type="button"
              className="ef-btn-outline"
              onClick={enviarCodigo}
              disabled={carregando}
            >
              REENVIAR CÓDIGO
            </button>
          </>
        )}
      </div>
    </div>
  );
}