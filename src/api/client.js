/**
 * Cliente de API do EntregaFood — fala com o back-end FastAPI
 * (repo: Sistema-de-Delivery-Back).
 *
 * Rotas confirmadas no back:
 *   POST   /auth/login              -> login e-mail/senha (auth_controller)
 *   GET    /auth/eu                 -> usuário logado (rota protegida)
 *   GET    /auth/google/login       -> inicia OAuth Google   (oauth_controller)
 *   GET    /auth/google/callback    -> volta do Google
 *   GET    /auth/facebook/login     -> inicia OAuth Facebook
 *   GET    /auth/facebook/callback  -> volta do Facebook
 *   POST   /usuarios                -> cadastro (usuario_controller, RF01)
 *   GET    /usuarios /usuarios/:id  -> listar / consultar
 *   PUT    /usuarios/:id            -> atualizar
 *   DELETE /usuarios/:id            -> encerrar conta (RF06)
 *
 * Fluxo OAuth:
 * 1. Botão redireciona pra GET {API_URL}/auth/{provider}/login.
 * 2. Back-end (Authlib) troca com o provedor e volta pro callback dele mesmo.
 * 3. oauth_controller redireciona pro front como QUERY STRING (não hash!):
 *      sucesso -> {FRONTEND_URL}/?oauth_token=<jwt>
 *      erro    -> {FRONTEND_URL}/?oauth_erro=<mensagem>
 * 4. App.jsx lê isso na primeira renderização, salva o token e limpa a URL.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "entregafood_token";

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
    throw new Error(detalhe || `Erro ${res.status} ao chamar ${path}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/* ------------------------------------------------------------------ */
/* OAuth (Google / Facebook)                                            */
/* ------------------------------------------------------------------ */

export function getGoogleLoginUrl() {
  return `${API_URL}/auth/google/login`;
}

export function getFacebookLoginUrl() {
  return `${API_URL}/auth/facebook/login`;
}

export function loginWithGoogle() {
  window.location.href = getGoogleLoginUrl();
}

export function loginWithFacebook() {
  window.location.href = getFacebookLoginUrl();
}

/**
 * Lê ?oauth_token=... ou ?oauth_erro=... da URL (retorno do back-end),
 * salva o token se houver, e limpa a query string sem recarregar a página.
 * Retorna { token, erro }.
 */
export function consumeOAuthResultFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("oauth_token");
  const erro = params.get("oauth_erro");

  if (token || erro) {
    if (token) saveToken(token);
    const url = new URL(window.location.href);
    url.searchParams.delete("oauth_token");
    url.searchParams.delete("oauth_erro");
    window.history.replaceState({}, "", url.toString());
  }

  return { token, erro };
}

/* ------------------------------------------------------------------ */
/* Autenticação por e-mail/senha                                        */
/* ------------------------------------------------------------------ */

/** POST /auth/login — devolve { access_token, token_type, usuario } */
export async function loginWithPassword(email, senha) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
  saveToken(data.access_token);
  return data;
}

/** GET /auth/eu — rota protegida, dados do usuário logado */
export async function fetchUsuarioLogado() {
  if (!getToken()) return null;
  try {
    return await apiFetch("/auth/eu");
  } catch {
    logout();
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Cadastro de usuário (POST /usuarios)                                 */
/* ------------------------------------------------------------------ */

/**
 * Cadastra o usuário (nome, email, senha, telefone, tipo) e, em seguida,
 * já faz login com a mesma senha — o back não devolve token no cadastro,
 * só o usuário criado (201), então logamos logo depois pra já ter o JWT.
 *
 * tipo: "cliente" | "restaurante" | "entregador" | "admin" (default "cliente")
 */
export async function registerUsuario({ nome, email, senha, telefone, tipo = "cliente" }) {
  await apiFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, telefone, tipo }),
  });
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

/* ------------------------------------------------------------------ */
/* Token (localStorage)                                                 */
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

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}