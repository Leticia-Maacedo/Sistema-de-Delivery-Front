import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Field from "../../components/Field";
import {
  loginWithGoogle,
  loginWithFacebook,
  loginWithPassword,
  solicitarCodigoLoginTelefone,
  verificarCodigoLoginTelefone,
  ApiError,
} from "../../api/client";

export default function LoginView({
  onGo,
  erroInicial = "",
}) {
  const [modo, setModo] = useState("senha");

  const [showPw, setShowPw] = useState(false);
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");

  const [telefoneOtp, setTelefoneOtp] = useState("");
  const [codigoOtp, setCodigoOtp] = useState("");
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [codigoDev, setCodigoDev] = useState("");

  const [erro, setErro] = useState(erroInicial);
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = async () => {
    setErro("");

    if (!identificador.trim()) {
      setErro("Informe seu e-mail ou telefone.");
      return;
    }

    if (!senha) {
      setErro("Informe sua senha.");
      return;
    }

    setCarregando(true);

    try {
      await loginWithPassword(
        identificador,
        senha
      );

      onGo("pagina-principal");
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  const enviarOtpLogin = async () => {
    setErro("");

    const telefone = telefoneOtp.replace(/\D/g, "");

    if (telefone.length < 10 || telefone.length > 11) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }

    setCarregando(true);

    try {
      const resposta =
        await solicitarCodigoLoginTelefone(telefone);

      setTelefoneOtp(telefone);
      setOtpEnviado(true);

      if (resposta.codigo_dev) {
        setCodigoDev(String(resposta.codigo_dev));
      }
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível gerar o código."
      );
    } finally {
      setCarregando(false);
    }
  };

  const confirmarOtpLogin = async () => {
    setErro("");

    if (!/^\d{6}$/.test(codigoOtp)) {
      setErro("Digite o código OTP de 6 dígitos.");
      return;
    }

    setCarregando(true);

    try {
      await verificarCodigoLoginTelefone(
        telefoneOtp,
        codigoOtp
      );

      onGo("pagina-principal");
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível validar o código."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto 0" }}>
      <div
        style={{
          textAlign: "center",
          marginBottom: 28,
        }}
      >
        <div
          className="ef-logo"
          style={{ fontSize: 26 }}
        >
          ENTREGA
          <span style={{ color: "var(--accent)" }}>
            FOOD
          </span>
        </div>

        <p
          style={{
            fontFamily: "'Exo 2', sans-serif",
            color: "var(--muted)",
            fontSize: 12,
            marginTop: 8,
            letterSpacing: 1,
          }}
        >
          SISTEMA DE DELIVERY
        </p>
      </div>

      <div
        className="ef-card"
        style={{
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={
              modo === "senha"
                ? "ef-btn-solid"
                : "ef-btn-outline"
            }
            style={{ flex: 1 }}
            onClick={() => {
              setModo("senha");
              setErro("");
            }}
          >
            SENHA
          </button>

          <button
            type="button"
            className={
              modo === "otp"
                ? "ef-btn-solid"
                : "ef-btn-outline"
            }
            style={{ flex: 1 }}
            onClick={() => {
              setModo("otp");
              setErro("");
            }}
          >
            TELEFONE / OTP
          </button>
        </div>

        {modo === "senha" ? (
          <>
            <Field
              label="E-MAIL OU TELEFONE"
              placeholder="seu@email.com ou 11999999999"
              value={identificador}
              onChange={(e) =>
                setIdentificador(e.target.value)
              }
            />

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                SENHA
              </span>

              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="ef-input"
                  style={{ width: "100%" }}
                  value={senha}
                  onChange={(e) =>
                    setSenha(e.target.value)
                  }
                />

                <button
                  onClick={() =>
                    setShowPw((s) => !s)
                  }
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 9,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  type="button"
                >
                  {showPw ? (
                    <EyeOff
                      size={15}
                      color="var(--muted)"
                    />
                  ) : (
                    <Eye
                      size={15}
                      color="var(--muted)"
                    />
                  )}
                </button>
              </div>
            </label>

            {erro && (
              <span
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: 12,
                  color: "#E6534C",
                }}
              >
                {erro}
              </span>
            )}

            <button
              className="ef-btn-solid"
              onClick={handleEntrar}
              disabled={carregando}
            >
              {carregando
                ? "ENTRANDO..."
                : "ENTRAR"}
            </button>
          </>
        ) : (
          <>
            {!otpEnviado ? (
              <>
                <Field
                  label="TELEFONE"
                  placeholder="(11) 99999-9999"
                  value={telefoneOtp}
                  onChange={(e) =>
                    setTelefoneOtp(e.target.value)
                  }
                />

                {erro && (
                  <span
                    style={{
                      fontFamily:
                        "'Exo 2', sans-serif",
                      fontSize: 12,
                      color: "#E6534C",
                    }}
                  >
                    {erro}
                  </span>
                )}

                <button
                  className="ef-btn-solid"
                  onClick={enviarOtpLogin}
                  disabled={carregando}
                >
                  {carregando
                    ? "ENVIANDO..."
                    : "ENVIAR CÓDIGO"}
                </button>
              </>
            ) : (
              <>
                {codigoDev && (
                  <div
                    style={{
                      padding: 12,
                      border:
                        "1px solid var(--accent)",
                      borderRadius: 6,
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'Exo 2', sans-serif",
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
                  value={codigoOtp}
                  onChange={(e) =>
                    setCodigoOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                />

                {erro && (
                  <span
                    style={{
                      fontFamily:
                        "'Exo 2', sans-serif",
                      fontSize: 12,
                      color: "#E6534C",
                    }}
                  >
                    {erro}
                  </span>
                )}

                <button
                  className="ef-btn-solid"
                  onClick={confirmarOtpLogin}
                  disabled={
                    carregando ||
                    codigoOtp.length !== 6
                  }
                >
                  {carregando
                    ? "VALIDANDO..."
                    : "ENTRAR COM OTP"}
                </button>

                <button
                  type="button"
                  className="ef-btn-outline"
                  onClick={enviarOtpLogin}
                  disabled={carregando}
                >
                  REENVIAR CÓDIGO
                </button>
              </>
            )}
          </>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "2px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "var(--border)",
            }}
          />

          <span
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 10,
              color: "var(--muted)",
            }}
          >
            OU CONTINUE COM
          </span>

          <div
            style={{
              flex: 1,
              height: 1,
              background: "var(--border)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="ef-btn-outline"
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            onClick={loginWithGoogle}
          >
            GOOGLE
          </button>

          <button
            className="ef-btn-outline"
            style={{
              flex: 1,
              justifyContent: "center",
            }}
            onClick={loginWithFacebook}
          >
            FACEBOOK
          </button>
        </div>

        <span
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: 12,
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          Ainda não tem conta?{" "}
          <span
            style={{
              color: "var(--accent)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() =>
              onGo("cadastro-dados")
            }
          >
            Cadastre-se
          </span>
        </span>
      </div>
    </div>
  );
}