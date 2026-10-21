// Como mostrar o usuário logado no menu, no cabeçalho do admin e na saudação.
const TIPOS = {
  cliente: "Cliente",
  restaurante: "Restaurante",
  entregador: "Entregador",
  admin: "Admin",
};

export function exibicaoUsuario(usuario) {
  if (!usuario) return { nome: "Visitante", primeiroNome: null, inicial: "?", tipo: "Não conectado" };
  const nome = (usuario.nome || usuario.email || usuario.telefone || "Usuário").trim();
  return {
    nome,
    primeiroNome: nome.split(/\s+/)[0],
    inicial: nome.charAt(0).toUpperCase(),
    tipo: TIPOS[usuario.tipo] || usuario.tipo || "",
  };
}
