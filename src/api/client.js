const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "ef_token";
const USUARIO_KEY = "ef_usuario";

class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `Erro na API (HTTP ${status})`);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ApiError(resposta.status, dados?.detail);
  }
  return dados;
}

export function salvarSessao(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

export function obterUsuarioSalvo() {
  const bruto = localStorage.getItem(USUARIO_KEY);
  return bruto ? JSON.parse(bruto) : null;
}

export function atualizarUsuarioSalvo(usuario) {
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export const auth = {
  login: (email, senha) => request("/auth/login", { method: "POST", body: { email, senha } }),
  eu: () => request("/auth/eu", { auth: true }),
};

export const usuarios = {
  listar: (tipo) => request(`/usuarios${tipo ? `?tipo=${tipo}` : ""}`),
  obter: (id) => request(`/usuarios/${id}`),
  criar: (dados) => request("/usuarios", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/usuarios/${id}`, { method: "PUT", body: dados }),
  remover: (id) => request(`/usuarios/${id}`, { method: "DELETE" }),
};

export const produtos = {
  listar: () => request("/produtos"),
  criar: (dados) => request("/produtos", { method: "POST", body: dados }),
  atualizar: (id, dados) => request(`/produtos/${id}`, { method: "PUT", body: dados }),
  remover: (id) => request(`/produtos/${id}`, { method: "DELETE" }),
};

export const restaurantes = {
  listar: () => request("/restaurantes"),
};

export { ApiError };
