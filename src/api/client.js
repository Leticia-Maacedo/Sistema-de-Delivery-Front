/**
 * Cliente de API do EntregaFood — fala com o back-end FastAPI
 * (repo: Sistema-de-Delivery-Back).
 *
 * Rotas confirmadas no auth_controller.py:
 *   POST /auth/login                              -> e-mail OU telefone + senha
 *   POST /auth/telefone/solicitar-codigo          -> OTP de login
 *   POST /auth/telefone/verificar-codigo          -> valida OTP e devolve JWT
 *   POST /auth/telefone/cadastro/solicitar-codigo -> OTP de cadastro
 *   POST /auth/telefone/cadastro/confirmar        -> cria conta por telefone
 *   GET  /auth/eu                                 -> usuário logado (protegida)
 *   GET  /auth/google  /auth/facebook             -> inicia OAuth
 *
 * usuario_controller.py:
 *   POST/GET/PUT/DELETE /usuarios
 *
 * local_controller.py (SEM autenticação — exige usuario_id explícito):
 *   POST/GET/PUT/DELETE /locais
 *
 * Fluxo OAuth: o callback redireciona pro front com o token no HASH
 * ({FRONTEND_URL}/#oauth_token=<jwt>). App.jsx lê isso na primeira
 * renderização, salva o token e limpa a URL.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "entregafood_token";
const USUARIO_KEY = "entregafood_usuario";

/* ------------------------------------------------------------------ */
/* Erro de API — telas usam "instanceof ApiError" pra distinguir erro   */
/* de validação/negócio de falha de rede/servidor fora do ar.           */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/* ------------------------------------------------------------------ */
/* Fetch genérico                                                       */
/* ------------------------------------------------------------------ */

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    // FastAPI/Pydantic manda erro de validação (422) como lista em "detail"
    const detalhe = Array.isArray(erro.detail)
      ? erro.detail.map((d) => d.msg).join(" ")
      : erro.detail;
    throw new ApiError(detalhe || `Erro ${res.status} ao chamar ${path}`, res.status, erro.detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** Salva token + usuário de uma resposta TokenResponse do back. */
function guardarSessao(data) {
  if (data?.access_token) saveToken(data.access_token);
  if (data?.usuario) saveUsuario(data.usuario);
  return data;
}

/** Remove tudo que não for dígito — mesma normalização que o back faz. */
export function normalizarTelefone(telefone) {
  return (telefone || "").replace(/\D/g, "");
}

/* ------------------------------------------------------------------ */
/* OAuth (Google / Facebook)                                            */
/* ------------------------------------------------------------------ */

export function getGoogleLoginUrl() {
  return `${API_URL}/auth/google`;
}

export function getFacebookLoginUrl() {
  return `${API_URL}/auth/facebook`;
}

export function loginWithGoogle() {
  window.location.href = getGoogleLoginUrl();
}

export function loginWithFacebook() {
  window.location.href = getFacebookLoginUrl();
}

/**
 * Lê o token que o back devolve depois do OAuth. O auth_controller usa
 * HASH (#oauth_token=...), mas aceitamos query string também, caso o
 * back volte a usar ?oauth_token= / ?oauth_erro= no futuro.
 * Retorna { token, erro }.
 */
export function consumeOAuthResultFromQuery() {
  const hash = window.location.hash || "";
  const params = new URLSearchParams(window.location.search);

  const matchHash = hash.match(/oauth_token=([^&]+)/);
  const token = matchHash ? decodeURIComponent(matchHash[1]) : params.get("oauth_token");
  const erro = params.get("oauth_erro");

  if (token || erro) {
    if (token) saveToken(token);
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("oauth_token");
    url.searchParams.delete("oauth_erro");
    window.history.replaceState({}, "", url.toString());
  }

  return { token, erro };
}

/* ------------------------------------------------------------------ */
/* Login por senha (e-mail OU telefone)                                 */
/* ------------------------------------------------------------------ */

/**
 * O back aceita e-mail ou telefone. Detectamos pelo "@": se o
 * identificador tiver arroba, mandamos como email; senão, como telefone
 * (só os dígitos).
 */
export async function loginWithPassword(identificador, senha) {
  const ehEmail = String(identificador).includes("@");
  const corpo = ehEmail
    ? { email: identificador, senha }
    : { telefone: normalizarTelefone(identificador), senha };

  const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(corpo) });
  return guardarSessao(data);
}

export async function fetchUsuarioLogado() {
  if (!getToken()) return null;
  try {
    const usuario = await apiFetch("/auth/eu");
    saveUsuario(usuario);
    return usuario;
  } catch {
    logout();
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* OTP — login por telefone                                             */
/* ------------------------------------------------------------------ */

/** POST /auth/telefone/solicitar-codigo -> { detalhe, codigo_dev } */
export async function solicitarCodigoLoginTelefone(telefone) {
  return apiFetch("/auth/telefone/solicitar-codigo", {
    method: "POST",
    body: JSON.stringify({ telefone: normalizarTelefone(telefone) }),
  });
}

/** POST /auth/telefone/verificar-codigo -> TokenResponse (já salva a sessão) */
export async function verificarCodigoLoginTelefone(telefone, codigo) {
  const data = await apiFetch("/auth/telefone/verificar-codigo", {
    method: "POST",
    body: JSON.stringify({ telefone: normalizarTelefone(telefone), codigo }),
  });
  return guardarSessao(data);
}

/* ------------------------------------------------------------------ */
/* OTP — cadastro por telefone                                          */
/* ------------------------------------------------------------------ */

/** POST /auth/telefone/cadastro/solicitar-codigo -> { detalhe, codigo_dev } */
export async function solicitarCodigoCadastroTelefone({ telefone, tipo = "cliente" }) {
  return apiFetch("/auth/telefone/cadastro/solicitar-codigo", {
    method: "POST",
    body: JSON.stringify({ telefone: normalizarTelefone(telefone), tipo }),
  });
}

/** POST /auth/telefone/cadastro/confirmar -> TokenResponse (já salva a sessão) */
export async function confirmarCadastroTelefone({ telefone, codigo, nome, senha, tipo = "cliente" }) {
  const data = await apiFetch("/auth/telefone/cadastro/confirmar", {
    method: "POST",
    body: JSON.stringify({ telefone: normalizarTelefone(telefone), codigo, nome, senha, tipo }),
  });
  return guardarSessao(data);
}

/* ------------------------------------------------------------------ */
/* Usuários (/usuarios)                                                 */
/* ------------------------------------------------------------------ */

export async function registerUsuario({ nome, email, senha, telefone, tipo = "cliente" }) {
  await apiFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, telefone, tipo }),
  });
  // POST /usuarios não devolve token, só o usuário criado — loga em
  // seguida pra já ter o JWT e o id em cache nas próximas telas.
  return loginWithPassword(email, senha);
}

export async function listarUsuarios({ tipo, limite = 100, pular = 0 } = {}) {
  const params = new URLSearchParams();
  if (tipo) params.set("tipo", tipo);
  params.set("limite", limite);
  params.set("pular", pular);
  return apiFetch(`/usuarios?${params.toString()}`);
}

export async function obterUsuario(id) {
  return apiFetch(`/usuarios/${id}`);
}

export async function atualizarUsuario(id, dados) {
  return apiFetch(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(dados) });
}

export async function removerUsuario(id) {
  return apiFetch(`/usuarios/${id}`, { method: "DELETE" });
}

/** Namespace: usuarios.criar(...), usuarios.listar(...) etc. */
export const usuarios = {
  criar: (dados) => apiFetch("/usuarios", { method: "POST", body: JSON.stringify(dados) }),
  listar: listarUsuarios,
  obter: obterUsuario,
  atualizar: atualizarUsuario,
  remover: removerUsuario,
};

/* ------------------------------------------------------------------ */
/* Endereços (/locais) — o local_controller NÃO usa login, ele espera   */
/* usuario_id explícito. Por isso guardamos o usuário em cache e        */
/* montamos o usuario_id aqui (ver getUsuarioId abaixo).                */
/* ------------------------------------------------------------------ */

export const locais = {
  criar: (dados) => apiFetch("/locais", { method: "POST", body: JSON.stringify(dados) }),
  listar: (usuarioId) => apiFetch(usuarioId ? `/locais?usuario_id=${usuarioId}` : "/locais"),
  obter: (id) => apiFetch(`/locais/${id}`),
  atualizar: (id, dados) => apiFetch(`/locais/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  remover: (id) => apiFetch(`/locais/${id}`, { method: "DELETE" }),
};

/* ------------------------------------------------------------------ */
/* Token + usuário em cache (localStorage)                              */
/* ------------------------------------------------------------------ */

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function saveUsuario(usuario) {
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(USUARIO_KEY) || "null");
  } catch {
    return null;
  }
}

/** Atalho pro caso mais comum: só o id do usuário logado (ou null). */
export function getUsuarioId() {
  return getUsuario()?.id ?? null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}