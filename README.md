# 🍔 EntregaFood — Front-end

Interface web da plataforma EntregaFood, construída em **React 18 + Vite 5**. Consome a API REST do back-end ([Sistema-de-Delivery-Back](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back)).

**Sprint 1** — telas de Login, Cadastro e Perfil do Usuário, integradas de ponta a ponta com a API real.
**Extra** — três áreas de navegação (Cliente, Parceiro, Admin) com sidebar própria; CRUD completo de Restaurante e de Usuário via API real no painel admin; login por e-mail/senha, telefone (OTP) e social.
**Grupo:** Amigos do Gilberto · Turma A · Faculdade Impacta

**📚 Documentação detalhada:** [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) (roteamento, API client, débitos técnicos) · [`docs/TELAS_E_COMPONENTES.md`](docs/TELAS_E_COMPONENTES.md) (catálogo de toda tela e componente, com o que já usa API real e o que ainda é mock).

---

## Como rodar

### Opção rápida — tudo em Docker (banco + API + front-end)

Não precisa instalar Node nem Python, só o [Docker Desktop](https://www.docker.com/products/docker-desktop/). Clone este repositório e o do back-end lado a lado (mesma pasta-pai):

```bash
git clone https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back.git
git clone https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Front.git
cd Sistema-de-Delivery-Back
cp .env.example .env        # no Windows: copy .env.example .env
docker compose -f docker-compose.full.yml up -d --build
```

Front em **http://localhost:5173**, API em `http://localhost:8000`. Detalhes (volumes, hot-reload, como derrubar) estão no [README do back-end](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back#opção-rápida--tudo-em-docker-banco--api--front-end).

### 1. Suba o back-end primeiro (rodando sem Docker)

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

A navegação **não usa React Router** — `src/App.jsx` guarda a tela atual num
`useState` e troca de tela com um `switch`. A sidebar (esquerda) é sempre
visível, com três áreas:

```
┌───────────────┐   ┌──────────────────────────────────────────────┐
│               │   │                                                │
│   CLIENTE     │   │  Início · Explorar · Restaurantes · Pedidos ·  │
│   PARCEIRO    │──▶│  Pagamento · Entrar          (área Cliente)    │
│  (sidebar     │   │                                                │
│   comum)      │   │  Área do Parceiro · Cardápios · Avaliações     │
│               │   │                                       (Parceiro)│
└───────────────┘   └──────────────────────────────────────────────┘

┌───────────────┐   ┌──────────────────────────────────────────────┐
│    ADMIN      │──▶│  Dashboard · Restaurantes · Pedidos · Entregas │
│  (sidebar     │   │  · Funcionalidades   (só os itens com tela     │
│   própria)    │   │  ligada — ver docs/TELAS_E_COMPONENTES.md)     │
└───────────────┘   └──────────────────────────────────────────────┘
```

Não há mais um "portão" de login que esconde a navegação — a sidebar
aparece mesmo sem sessão ativa; o login/cadastro é só mais uma tela
alcançável pelo item **Entrar** do menu Cliente. Ao carregar, o app verifica
se já existe uma sessão salva no `localStorage` (`isLoggedIn()`) e, se
houver, abre direto na Página Principal.

Nem toda tela do código está no roteador (algumas existem no repositório
mas ainda não têm um `case` correspondente em `App.jsx`, ou dependem de
props que `App.jsx` ainda não passa) — o inventário completo, tela por
tela, com o que é alcançável e o que não é, está em
[`docs/TELAS_E_COMPONENTES.md`](docs/TELAS_E_COMPONENTES.md).

---

## Funcionalidades implementadas

Visão resumida — o catálogo completo (toda tela, todo componente, o que
usa API real vs. dado fictício) está em
[`docs/TELAS_E_COMPONENTES.md`](docs/TELAS_E_COMPONENTES.md).

| Área | Já usa a API real | Ainda usa dado fictício (`data/mockData.js`) |
|---|---|---|
| **Cliente** | Login (e-mail/senha, telefone OTP, Google/Facebook), Cadastro (dados + endereço, com ViaCEP/Nominatim) | Início, Página Principal, Restaurantes (lista/busca), Cardápio do restaurante, Pagamento, Histórico |
| **Parceiro** | Cadastro/edição do próprio restaurante (`parceiro/CardapioRestauranteView.jsx`, ainda não ligada ao roteador) | Área do Parceiro (pedidos), Cardápios, Avaliações |
| **Admin** | Restaurantes (CRUD completo) | Dashboard, Pedidos, Detalhe do Pedido, Entregas |

Usuários (CRUD completo, `usuario_controller.py` no back) e Produtos (CRUD
completo, `produto_controller.py`) já têm tela pronta e integrada à API
real (`UsuariosView.jsx`, `ProdutosView.jsx`), mas nenhuma das duas está
conectada ao roteador do `App.jsx` ainda — ver "Débitos técnicos" em
`docs/ARQUITETURA.md` antes de ligá-las.

A sessão (token JWT + dados do usuário) fica no `localStorage`, sob as
chaves `entregafood_token` e `entregafood_usuario`. `src/api/client.js`
centraliza todas as chamadas à API — nenhuma tela chama `fetch` direto.

---

## Limitações conhecidas

- **Login social (Google/Facebook)**: implementado e funcional na branch `DEV`. Como os aplicativos OAuth estão em modo de teste nos provedores, o acesso pode ficar restrito às contas cadastradas como usuários de teste. Para colegas, professor ou outros usuários testarem o sistema sem configuração adicional, recomenda-se utilizar o login por e-mail e senha.
- **Telas com tela pronta mas fora do roteador**: `UsuariosView` (admin), `ProdutosView`, `CadastroTelefoneView` e `PerfilView` (cliente) já existem e já chamam a API real — mas nenhuma tem um `case` correspondente em `src/App.jsx`, então não são alcançáveis navegando pelo app hoje. `UsuariosView` e `PerfilView` têm, além disso, imports quebrados (`obterUsuarioSalvo` e, no caso de `PerfilView`, mais três funções) que não existem em `client.js` — ver `docs/ARQUITETURA.md` antes de ligar qualquer uma das duas. `src/views/cliente/EnderecosView.jsx` é ainda mais cedo: arquivo vazio.
- **Cadastro/edição de restaurante pela interface**: existe (`src/views/parceiro/CardapioRestauranteView.jsx`, cria `Local` + `Restaurante` via API, com CEP/geocodificação), mas também não está ligada ao roteador ainda — o botão "editar restaurante" em Área do Parceiro já está preparado para chamá-la (prop `onEditRestaurante`) mas `App.jsx` não fornece esse callback.
- **Pedidos, pagamento, histórico, dashboard admin**: ainda usam dados fictícios de `data/mockData.js` — não há endpoint de pedido/pagamento/entrega no back-end ainda (as tabelas existem no schema SQL, mas sem model/controller, ver `docs/BANCO_DE_DADOS.md` do back).
- **Sem controle de acesso por rota**: nada impede alguém de manipular o estado do React pra tentar ver outra tela — a UI não bloqueia nada por tipo de conta; quem protege de verdade é o back-end (que devolve `401`/`403` quando cabe).

Inventário completo e atualizado de todas as telas — o que é real, o que é
mock, o que está conectado e o que não está — em
[`docs/TELAS_E_COMPONENTES.md`](docs/TELAS_E_COMPONENTES.md).

---

## 👥 Equipe

* Leticia da Silva Macedo
* Anna Julia Higa Farincho
* Geovane Soares da Silva
* Richard Ferreira do Nascimento Santos

## 📚 Contexto acadêmico

Projeto desenvolvido para a disciplina de **Desenvolvimento de Sistemas de Informação — Sistemas de Informação**, utilizando metodologia baseada em **Scrum e Sprints**.
