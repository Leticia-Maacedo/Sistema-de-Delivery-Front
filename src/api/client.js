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
/* Erro de API — algumas telas usam "instanceof ApiError" pra distinguir */
/* um erro de validação/negócio (back respondeu, mas com erro) de uma    */
/* falha de rede/servidor fora do ar.                                   */
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
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (erroDeRede) {
    // back-end fora do ar, sem CORS, sem internet etc — não é ApiError,
    // é falha de conexão mesmo (útil pro "e instanceof ApiError" das telas).
    throw erroDeRede;
  }

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
 * Lê ?oauth_token=... ou ?oauth_erro=... da URL (retorno do back-end),
 * salva o token se houver, e limpa a query string sem recarregar a página.
 * Retorna { token, erro }.
 */
export function consumeOAuthResultFromQuery() {
  const queryParams = new URLSearchParams(window.location.search);

  let token = queryParams.get("oauth_token");
  let erro = queryParams.get("oauth_erro");

  if (!token && window.location.hash.startsWith("#oauth_token=")) {
    token = window.location.hash.replace("#oauth_token=", "");
  }

  if (!erro && window.location.hash.startsWith("#oauth_erro=")) {
    erro = window.location.hash.replace("#oauth_erro=", "");
  }

  if (token || erro) {
    if (token) saveToken(token);

    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
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

/**
 * Mesmas operações acima, só que agrupadas num namespace — algumas telas
 * (ex: CadastroDadosView) importam assim: `usuarios.criar(...)`.
 * POST /usuarios só cria a conta, não loga automaticamente — se quiser
 * logar em seguida, chame loginWithPassword(email, senha) depois.
 */
export const usuarios = {
  criar: (dados) => apiFetch("/usuarios", { method: "POST", body: JSON.stringify(dados) }),
  listar: listarUsuarios,
  obter: obterUsuario,
  atualizar: atualizarUsuario,
  remover: removerUsuario,
};

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