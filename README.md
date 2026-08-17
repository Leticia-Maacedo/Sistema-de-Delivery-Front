# 🍔 EntregaFood — Front-end

Interface web da plataforma EntregaFood, construída em **React 18 + Vite 5**. Consome a API REST do back-end ([Sistema-de-Delivery-Back](https://github.com/Leticia-Maacedo/Sistema-de-Delivery-Back)).

**Sprint 1** — telas de Login, Cadastro e Perfil do Usuário, integradas de ponta a ponta com a API real.
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

## Estrutura do projeto

```
src/
├── api/
│   └── client.js           Cliente HTTP: chama a API, guarda o JWT e o
│                            usuário logado no localStorage
├── components/              Peças reutilizáveis (Field, PageHeader, StatusBadge...)
├── data/
│   ├── mockData.js         Dados fictícios (restaurantes, pedidos) — ainda
│   │                        usados pelas telas que não têm back-end ainda
│   └── navigation.js       Itens do menu lateral
└── views/
    ├── cliente/             ATIVO nesta sprint — é o que aparece no app:
    │   ├── LoginView              e-mail/senha + Google/Facebook
    │   ├── CadastroDadosView      passo 1 do cadastro (cria a conta de verdade)
    │   ├── CadastroTelefoneView   passo 2 (verificação simulada, salva o telefone)
    │   ├── CadastroEnderecoView   passo 3 (ainda só visual, sem back-end)
    │   ├── PerfilView             ver / editar / excluir a própria conta
    │   └── PaginaPrincipalView, PagamentoView, HistoricoView...  (mock)
    ├── parceiro/             Construído, mas OCULTO da navegação nesta sprint
    └── admin/                Construído, mas OCULTO da navegação nesta sprint
```

**Por que Parceiro e Admin existem no código mas não aparecem no app?** A Sprint 1 cobre só o domínio Usuário. As telas de Parceiro (restaurante) e Admin já foram desenhadas, mas ficam reservadas pra quando essas partes do back-end existirem — não fazem sentido expostas a um usuário comum agora.

---

## Funcionalidades implementadas

| Tela | O que faz | Endpoint da API |
|---|---|---|
| **Login** (e-mail/senha) | Autentica e guarda o JWT | `POST /auth/login` |
| **Login social** (Google/Facebook) | Redireciona pro provedor, volta autenticado | `GET /auth/{provedor}/login` |
| **Cadastro · Dados** | Cria a conta e já faz login automático | `POST /usuarios` + `POST /auth/login` |
| **Cadastro · Celular** | Verificação simulada (não é SMS real — veja limitações) e salva o telefone | `PUT /usuarios/{id}` |
| **Meu Perfil** | Ver, editar e excluir a própria conta | `GET /auth/eu`, `PUT /usuarios/{id}`, `DELETE /usuarios/{id}` |

A sessão (token JWT + dados do usuário) fica no `localStorage`, sob as chaves `ef_token` e `ef_usuario`.

---

## Limitações conhecidas

- **Verificação por SMS**: código de 4 dígitos simulado no cadastro, não chega SMS de verdade (o back-end explica o porquê — conta trial do Twilio bloqueia a compra de número sem upgrade pago).
- **Endereço de entrega**: tela existe e navega normalmente, mas não salva nada — o back-end ainda não tem endpoint pra isso.
- **Restaurantes, pedidos, pagamento, histórico**: usam dados fictícios de `data/mockData.js`, não a API. Ficam pra quando essas tabelas ganharem back-end.
- **Sem controle de acesso por rota**: esconder Parceiro/Admin da navegação impede o usuário comum de *chegar* lá clicando, mas não é uma barreira de segurança real (não há back-end pra essas áreas ainda de qualquer forma).

---

## 👥 Equipe

* Leticia da Silva Macedo
* Anna Julia Higa Farincho
* Geovane Soares da Silva
* Richard Ferreira do Nascimento Santos

## 📚 Contexto acadêmico

Projeto desenvolvido para a disciplina de **Desenvolvimento de Sistemas de Informação — Sistemas de Informação**, utilizando metodologia baseada em **Scrum e Sprints**.
