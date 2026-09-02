/**
 * Cliente de API do EntregaFood.
 */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://entregafood-back-dev.onrender.com";

const TOKEN_KEY = "entregafood_token";

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

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
    throw erroDeRede;
  }

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

/* =========================================================
   GOOGLE / FACEBOOK
   ========================================================= */

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
    if (token) {
      saveToken(token);
    }

    window.history.replaceState({}, "", window.location.pathname);
  }

  return { token, erro };
}

/* =========================================================
   LOGIN E-MAIL OU TELEFONE + SENHA
   ========================================================= */

export async function loginWithPassword(identificador, senha) {
  const valor = identificador.trim();

  const body = valor.includes("@")
    ? { email: valor, senha }
    : { telefone: valor, senha };

  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (data.access_token) {
    saveToken(data.access_token);
  }

  return data;
}

/* =========================================================
   LOGIN POR TELEFONE + OTP
   ========================================================= */

export async function solicitarCodigoLoginTelefone(telefone) {
  return apiFetch("/auth/telefone/solicitar-codigo", {
    method: "POST",
    body: JSON.stringify({
      telefone,
    }),
  });
}

export async function verificarCodigoLoginTelefone(telefone, codigo) {
  const data = await apiFetch("/auth/telefone/verificar-codigo", {
    method: "POST",
    body: JSON.stringify({
      telefone,
      codigo,
    }),
  });

  if (data.access_token) {
    saveToken(data.access_token);
  }

  return data;
}

/* =========================================================
   CADASTRO POR TELEFONE + OTP
   ========================================================= */

export async function solicitarCodigoCadastroTelefone({
  nome,
  telefone,
  senha,
  tipo = "cliente",
}) {
  return apiFetch("/auth/telefone/cadastro/solicitar-codigo", {
    method: "POST",
    body: JSON.stringify({
      nome,
      telefone,
      senha,
      tipo,
    }),
  });
}

export async function confirmarCadastroTelefone({
  nome,
  telefone,
  senha,
  codigo,
  tipo = "cliente",
}) {
  const usuario = await apiFetch("/auth/telefone/cadastro/confirmar", {
    method: "POST",
    body: JSON.stringify({
      nome,
      telefone,
      senha,
      codigo,
      tipo,
    }),
  });

  /*
   * O endpoint de confirmação do cadastro cria o usuário,
   * mas não necessariamente devolve um JWT.
   *
   * Por isso, depois de confirmar o OTP, fazemos o login
   * automaticamente usando telefone + senha.
   *
   * loginWithPassword salva o access_token no localStorage.
   */
  await loginWithPassword(telefone, senha);

  return usuario;
}

/* =========================================================
   USUÁRIO LOGADO
   ========================================================= */

export async function fetchUsuarioLogado() {
  if (!getToken()) {
    return null;
  }

  try {
    return await apiFetch("/auth/eu");
  } catch (error) {
    console.error("Erro ao buscar usuário logado:", error);

    if (error instanceof ApiError && error.status === 401) {
      logout();
    }

    return null;
  }
}

/* =========================================================
   CRUD USUÁRIO
   ========================================================= */

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

  const identificador = email || telefone;

  return loginWithPassword(identificador, senha);
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

/* =========================================================
   CRUD LOCAL / ENDEREÇO
   ========================================================= */

export async function criarLocal(dados) {
  return apiFetch("/locais", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function listarLocais(usuarioId = null) {
  if (usuarioId) {
    return apiFetch(
      `/locais?usuario_id=${encodeURIComponent(usuarioId)}`
    );
  }

  return apiFetch("/locais");
}

export async function obterLocal(id) {
  return apiFetch(`/locais/${id}`);
}

export async function atualizarLocal(id, dados) {
  return apiFetch(`/locais/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function removerLocal(id) {
  return apiFetch(`/locais/${id}`, {
    method: "DELETE",
  });
}

export const locais = {
  criar: criarLocal,
  listar: listarLocais,
  obter: obterLocal,
  atualizar: atualizarLocal,
  remover: removerLocal,
};

/* =========================================================
   TOKEN
   ========================================================= */

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