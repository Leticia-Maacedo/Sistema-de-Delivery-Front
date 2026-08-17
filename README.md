# 🍔 EntregaFood — Front-end

Interface web da plataforma EntregaFood, construída em **React 18 + Vite 5**. Consome a API REST do back-end ([Sistema-de-Delivery-Back](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back)).

**Sprint 1** — telas de Login, Cadastro e Perfil do Usuário, integradas de ponta a ponta com a API real.
**Extra** — tela de Produtos (CRUD completo, cadastro de cardápio).
**Grupo:** Amigos do Gilberto · Turma A · Faculdade Impacta

---

## Como rodar

### 1. Suba o back-end primeiro

Esse front não funciona sozinho — ele depende da API rodando. Veja o [README do back-end](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back) pra subir o Postgres e a API em `http://localhost:8000`.

### 2. Instale as dependências e rode o front

```bash
npm install
npm run dev
```

Fica em **http://localhost:5173**.

Por padrão, o front conversa com a API em `http://localhost:8000`. Se a sua API estiver em outro endereço, crie um `.env` na raiz do projeto:

```
VITE_API_URL=http://localhost:8000
```

---

## Fluxo da aplicação

A Sprint 1 é só o domínio Usuário, e a interface reflete isso ao pé da letra — **sem menu nenhum até logar**:

```
                    ┌──────────────┐
      (nada salvo)  │    LOGIN     │◄────────────────┐
      no localStorage└──────┬───────┘                  │
                    CADASTRE-SE │ ▲ ENTRAR              │ SAIR
                              ▼ │                      │
                    ┌──────────────┐                  │
                    │ CADASTRO ·   │──cria a conta──►  volta pro LOGIN
                    │   DADOS      │   (não loga        (com mensagem de
                    └──────────────┘    sozinho)         sucesso)

      (usuário logado) ┌──────────────────────────┐
      no localStorage   │ MEU PERFIL  │  PRODUTOS  │  abas depois de logar,
                        │ ver/editar/ │  CRUD do   │  variam por tipo de conta
                        │  excluir    │  cardápio  │  (veja tabela abaixo)
                        └──────────────────────────┘
```

- **Sem sessão**: só existem as telas de Login e Cadastro · Dados, sem barra lateral nem outros links.
- **Cadastro**: escolhe o tipo de conta (Cliente, Motoboy ou Restaurante — Admin não se autocadastra), cria a conta (`POST /usuarios`) e manda de volta pro Login — não loga automaticamente.
- **Login** (e-mail/senha): autentica e mostra as abas do cabeçalho — sempre **Meu Perfil**, mais **Produtos** só pra quem é `restaurante` — com o botão **SAIR**.

### Abas por tipo de conta

| Tipo | Abas visíveis |
|---|---|
| `cliente` | Meu Perfil |
| `entregador` (motoboy) | Meu Perfil |
| `restaurante` | Meu Perfil, Produtos |
| `admin` | Meu Perfil *(não tem tela própria construída ainda; conta é provisionada manualmente, não por autocadastro)* |

As demais telas do protótipo original (Início, Página Principal, Histórico, Pagamento, Cadastro · Celular, Cadastro · Endereço, Parceiro, Admin) continuam no código em `src/views/`, mas não são mais alcançáveis pela navegação — ficam reservadas pra quando as próximas sprints (restaurante, pedido, entrega...) tiverem back-end de verdade.

---

## Funcionalidades implementadas

| Tela | O que faz | Endpoint da API |
|---|---|---|
| **Login** (e-mail/senha) | Autentica e guarda o JWT | `POST /auth/login` |
| **Cadastro · Dados** | Cria a conta e manda de volta pro login | `POST /usuarios` |
| **Meu Perfil** | Ver, editar e excluir a própria conta | `GET /auth/eu`, `PUT /usuarios/{id}`, `DELETE /usuarios/{id}` |
| **Produtos** | Cadastrar, listar, editar e excluir produtos do cardápio | `POST/GET/PUT/DELETE /produtos`, `GET /restaurantes` |
| **Sair** | Limpa a sessão e volta pro login | — |

A sessão (token JWT + dados do usuário) fica no `localStorage`, sob as chaves `ef_token` e `ef_usuario`. `src/api/client.js` centraliza todas as chamadas à API.

---

## Limitações conhecidas

- **Login social (Google/Facebook)**: chegou a ser implementado, mas foi removido — veja o motivo no [README do back-end](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back#limita%C3%A7%C3%B5es-conhecidas). Login é só e-mail/senha.
- **Verificação por SMS e endereço de entrega**: as telas existiam no protótipo original, mas não fazem mais parte do fluxo de cadastro (que agora é só nome/e-mail/senha) — o telefone pode ser preenchido depois em "Meu Perfil".
- **Cadastro de restaurante pela interface**: a tela de Produtos escolhe o restaurante num dropdown, mas não tem um formulário pra criar um restaurante novo — hoje existe um cadastrado via API (`POST /restaurantes`) como exemplo. Se precisar de mais, use o Swagger (`/docs`) do back-end.
- **Pedidos, pagamento, histórico**: ainda são só dados fictícios de `data/mockData.js`; as telas continuam no repositório, mas fora da navegação nesta sprint.
- **Sem controle de acesso por rota**: nada impede alguém de manipular o estado do React pra tentar ver outra tela — o "portão" de login é só de navegação, não é uma barreira de segurança (e não precisa ser, já que não há back-end pra essas áreas ainda).

---

## 👥 Equipe

* Leticia da Silva Macedo
* Anna Julia Higa Farincho
* Geovane Soares da Silva
* Richard Ferreira do Nascimento Santos

## 📚 Contexto acadêmico

Projeto desenvolvido para a disciplina de **Desenvolvimento de Sistemas de Informação — Sistemas de Informação**, utilizando metodologia baseada em **Scrum e Sprints**.
