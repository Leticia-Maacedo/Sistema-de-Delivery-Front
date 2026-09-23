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

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://entregafood-back-dev.onrender.com";

const TOKEN_KEY = "entregafood_token";
const USUARIO_KEY = "entregafood_usuario";

/* ------------------------------------------------------------------ */
/* Erro de API                                                        */
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
/* Fetch genérico                                                     */
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

    const detalhe = Array.isArray(erro.detail)
      ? erro.detail.map((d) => d.msg).join(" ")
      : erro.detail;

    throw new ApiError(
      detalhe || `Erro ${res.status} ao chamar ${path}`,
      res.status,
      erro.detail
    );
  }

  if (res.status === 204) return null;

  return res.json();
}

/* ------------------------------------------------------------------ */
/* Sessão                                                             */
/* ------------------------------------------------------------------ */

function guardarSessao(data) {
  if (data?.access_token) {
    saveToken(data.access_token);
  }

  if (data?.usuario) {
    saveUsuario(data.usuario);
  }

  return data;
}

export function normalizarTelefone(telefone) {
  return (telefone || "").replace(/\D/g, "");
}

/* ------------------------------------------------------------------ */
/* OAuth (Google / Facebook)                                           */
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

export function consumeOAuthResultFromQuery() {
  const hash = window.location.hash || "";
  const params = new URLSearchParams(window.location.search);

  const matchHash = hash.match(/oauth_token=([^&]+)/);

  const token = matchHash
    ? decodeURIComponent(matchHash[1])
    : params.get("oauth_token");

  const erro = params.get("oauth_erro");

  if (token || erro) {
    if (token) {
      saveToken(token);
    }

    const url = new URL(window.location.href);

    url.hash = "";
    url.searchParams.delete("oauth_token");
    url.searchParams.delete("oauth_erro");

    window.history.replaceState({}, "", url.toString());
  }

  return { token, erro };
}

/* ------------------------------------------------------------------ */
/* Login por senha                                                    */
/* ------------------------------------------------------------------ */

export async function loginWithPassword(identificador, senha) {
  const ehEmail = String(identificador).includes("@");

  const corpo = ehEmail
    ? {
        email: identificador,
        senha,
      }
    : {
        telefone: normalizarTelefone(identificador),
        senha,
      };

  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(corpo),
  });

  return guardarSessao(data);
}

export async function fetchUsuarioLogado() {
  if (!getToken()) {
    return null;
  }

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
/* OTP — login por telefone                                           */
/* ------------------------------------------------------------------ */

export async function solicitarCodigoLoginTelefone(telefone) {
  return apiFetch("/auth/telefone/solicitar-codigo", {
    method: "POST",
    body: JSON.stringify({
      telefone: normalizarTelefone(telefone),
    }),
  });
}

export async function verificarCodigoLoginTelefone(telefone, codigo) {
  const data = await apiFetch("/auth/telefone/verificar-codigo", {
    method: "POST",
    body: JSON.stringify({
      telefone: normalizarTelefone(telefone),
      codigo,
    }),
  });

  return guardarSessao(data);
}

/* ------------------------------------------------------------------ */
/* OTP — cadastro por telefone                                        */
/* ------------------------------------------------------------------ */

export async function solicitarCodigoCadastroTelefone({
  telefone,
  tipo = "cliente",
}) {
  return apiFetch("/auth/telefone/cadastro/solicitar-codigo", {
    method: "POST",
    body: JSON.stringify({
      telefone: normalizarTelefone(telefone),
      tipo,
    }),
  });
}

export async function confirmarCadastroTelefone({
  telefone,
  codigo,
  nome,
  senha,
  tipo = "cliente",
}) {
  const data = await apiFetch("/auth/telefone/cadastro/confirmar", {
    method: "POST",
    body: JSON.stringify({
      telefone: normalizarTelefone(telefone),
      codigo,
      nome,
      senha,
      tipo,
    }),
  });

  return guardarSessao(data);
}

/* ------------------------------------------------------------------ */
/* Usuários (/usuarios)                                               */
/* ------------------------------------------------------------------ */

export async function registerUsuario({
  nome,
  email,
  senha,
  telefone,
  tipo = "cliente",
}) {
  await apiFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify({
      nome,
      email,
      senha,
      telefone,
      tipo,
    }),
  });

  return loginWithPassword(email, senha);
}

export async function listarUsuarios({
  tipo,
  limite = 100,
  pular = 0,
} = {}) {
  const params = new URLSearchParams();

  if (tipo) {
    params.set("tipo", tipo);
  }

  params.set("limite", limite);
  params.set("pular", pular);

  return apiFetch(`/usuarios?${params.toString()}`);
}

export async function obterUsuario(id) {
  return apiFetch(`/usuarios/${id}`);
}

export async function atualizarUsuario(id, dados) {
  return apiFetch(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function removerUsuario(id) {
  return apiFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });
}

export const usuarios = {
  criar: (dados) =>
    apiFetch("/usuarios", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  listar: listarUsuarios,

  obter: obterUsuario,

  atualizar: atualizarUsuario,

  remover: removerUsuario,
};

/* ------------------------------------------------------------------ */
/* Endereços (/locais)                                                */
/* ------------------------------------------------------------------ */

export const locais = {
  criar: (dados) =>
    apiFetch("/locais", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  listar: (usuarioId) =>
    apiFetch(
      usuarioId
        ? `/locais?usuario_id=${usuarioId}`
        : "/locais"
    ),

  obter: (id) =>
    apiFetch(`/locais/${id}`),

  atualizar: (id, dados) =>
    apiFetch(`/locais/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  remover: (id) =>
    apiFetch(`/locais/${id}`, {
      method: "DELETE",
    }),
};

/* ------------------------------------------------------------------ */
/* Consultas do cliente (/consultas)                                  */
/* ------------------------------------------------------------------ */
/*
 * Leitura pública para o cliente.
 * Retorna restaurantes aprovados e itens disponíveis,
 * no formato utilizado pelas telas do cliente.
 */

export const consultas = {
  restaurantes: (busca) =>
    apiFetch(
      `/consultas/restaurantes${
        busca
          ? `?busca=${encodeURIComponent(busca)}`
          : ""
      }`
    ),

  restaurante: (id) =>
    apiFetch(`/consultas/restaurantes/${id}`),

  cardapio: (id) =>
    apiFetch(`/consultas/restaurantes/${id}/cardapio`),
};

/* ------------------------------------------------------------------ */
/* Restaurantes (/restaurantes)                                       */
/* ------------------------------------------------------------------ */

export async function criarRestaurante(dados) {
  return apiFetch("/restaurantes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function listarRestaurantes({
  limite = 100,
  pular = 0,
} = {}) {
  const params = new URLSearchParams();

  params.set("limite", limite);
  params.set("pular", pular);

  return apiFetch(`/restaurantes?${params.toString()}`);
}

export async function obterRestaurante(id) {
  return apiFetch(`/restaurantes/${id}`);
}

export async function atualizarRestaurante(id, dados) {
  return apiFetch(`/restaurantes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function removerRestaurante(id) {
  return apiFetch(`/restaurantes/${id}`, {
    method: "DELETE",
  });
}

export const restaurantes = {
  criar: criarRestaurante,
  listar: listarRestaurantes,
  obter: obterRestaurante,
  atualizar: atualizarRestaurante,
  remover: removerRestaurante,
};

/* ------------------------------------------------------------------ */
/* Produtos (/produtos)                                               */
/* ------------------------------------------------------------------ */

export const produtos = {
  criar: (dados) =>
    apiFetch("/produtos", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  listar: (restauranteId) =>
    apiFetch(
      restauranteId
        ? `/produtos?restaurante_id=${restauranteId}`
        : "/produtos"
    ),

  obter: (id) =>
    apiFetch(`/produtos/${id}`),

  atualizar: (id, dados) =>
    apiFetch(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    }),

  remover: (id) =>
    apiFetch(`/produtos/${id}`, {
      method: "DELETE",
    }),
};

/* ------------------------------------------------------------------ */
/* Consultas de restaurantes para o cliente                           */
/* ------------------------------------------------------------------ */

export async function consultarRestaurantes({
  busca,
  limite = 100,
  pular = 0,
} = {}) {
  const params = new URLSearchParams();

  if (busca) {
    params.set("busca", busca);
  }

  params.set("limite", limite);
  params.set("pular", pular);

  return apiFetch(`/consultas/restaurantes?${params.toString()}`);
}

export async function consultarRestaurante(id) {
  return apiFetch(`/consultas/restaurantes/${id}`);
}

export async function consultarCardapio(id) {
  return apiFetch(`/consultas/restaurantes/${id}/cardapio`);
}

/* ------------------------------------------------------------------ */
/* Token + usuário em cache                                           */
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
  localStorage.setItem(
    USUARIO_KEY,
    JSON.stringify(usuario)
  );
}

export function getUsuario() {
  try {
    return JSON.parse(
      localStorage.getItem(USUARIO_KEY) || "null"
    );
  } catch {
    return null;
  }
}

export function getUsuarioId() {
  return getUsuario()?.id ?? null;
}

/* ------------------------------------------------------------------ */
/* Restaurante ativo                                                  */
/* ------------------------------------------------------------------ */

const RESTAURANTE_KEY = "entregafood_restaurante";

export function saveRestauranteAtivo(restaurante) {
  localStorage.setItem(
    RESTAURANTE_KEY,
    JSON.stringify(restaurante)
  );
}

export function getRestauranteAtivo() {
  try {
    return JSON.parse(
      localStorage.getItem(RESTAURANTE_KEY) || "null"
    );
  } catch {
    return null;
  }
}

export function getRestauranteAtivoId() {
  return getRestauranteAtivo()?.id ?? null;
}

/* ------------------------------------------------------------------ */
/* Logout                                                             */
/* ------------------------------------------------------------------ */

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem(RESTAURANTE_KEY);
}
