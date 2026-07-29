# Cliente — Login opcional com Google (Opção B)

**Data:** 2026-06-12  
**Status:** Implementada (2026-06-12)

## Decisão

Manter agendamento **sem login** no link `/{slug}` e adicionar **login opcional com Google** para o cliente acompanhar e gerenciar seus agendamentos.

## Princípios

- **Sem fricção:** qualquer pessoa agenda com nome + telefone
- **Com conta:** quem entrar com Google vê seus agendamentos naquele estabelecimento
- **Separar papéis:** usuário de negócio (painel) ≠ usuário cliente (conta Google)
- **Reutilizar Auth.js** já existente, sem segundo sistema de auth

## Modelo de dados

```prisma
enum AccountType {
  BUSINESS
  CUSTOMER
}

model User {
  // campos existentes...
  accountType   AccountType @default(BUSINESS)
  passwordHash  String?     // nullable para clientes OAuth
  googleId      String?     @unique
  image         String?
}

model Client {
  // campos existentes...
  userId String?  // FK opcional → User (accountType CUSTOMER)
  user   User?    @relation(...)
}
```

- **BUSINESS:** cadastro com senha + membership (como hoje)
- **CUSTOMER:** criado via Google OAuth, sem membership
- **Client.userId:** preenchido quando o cliente agenda logado ou quando vincula conta a agendamentos existentes (por e-mail)

## Fluxos

### 1. Agendar sem login (inalterado)

`/{slug}` → wizard → nome + telefone → agendamento criado

### 2. Agendar logado (novo)

Cliente clica **"Entrar com Google"** no header → volta ao `/{slug}` logado → wizard pré-preenche nome/e-mail → `Client` criado/atualizado com `userId`

### 3. Após agendar sem login (novo)

Tela de sucesso exibe: *"Entre com Google para acompanhar seus agendamentos"*

### 4. Ver meus agendamentos

Rota: `/{slug}/meus-agendamentos`

- Requer login como CUSTOMER
- Lista agendamentos onde `Client.userId = session.user.id` e `organization.slug = slug`
- Ações MVP: **visualizar** e **cancelar** (se status SCHEDULED/CONFIRMED)

### 5. Vincular agendamentos antigos

Ao primeiro login com Google no `/{slug}`:

- Se existir `Client` na org com mesmo **e-mail** do Google → associa `userId` automaticamente
- Agendamentos feitos só com telefone (sem e-mail) ficam sem vínculo até o cliente agendar de novo logado (MVP simples)

## Auth.js

- Adicionar provider **Google**
- Callback `signIn`: se e-mail já é BUSINESS → bloquear ou avisar (não misturar papéis)
- JWT/session: novo campo `accountType`
- `loadUserSessionData`: ramo CUSTOMER sem `organizationId`

## Middleware

| Sessão | Rota | Comportamento |
|--------|------|---------------|
| Nenhuma | `/{slug}` | Público (agendar) |
| CUSTOMER | `/{slug}/meus-agendamentos` | Permitido |
| CUSTOMER | `/`, `/clientes`, etc. | Redireciona para último slug ou página de escolha |
| BUSINESS | `/{slug}` | Permitido (como hoje) |

## UI

- Header da página pública: botão **Entrar com Google** / avatar + **Meus agendamentos** / **Sair**
- Página `/{slug}/meus-agendamentos`: lista simples com status e botão cancelar
- Card em configurações do negócio: sem mudança (link já existe)

## Variáveis de ambiente

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_GOOGLE_ID=        # alias se necessário pelo Auth.js
AUTH_GOOGLE_SECRET=
```

## Fora do escopo (MVP)

- SMS / verificação de telefone
- Reagendar pelo cliente
- Conta única vendo agendamentos de **vários** estabelecimentos numa só tela
- Login obrigatório para agendar

## Ordem de implementação

1. Migration Prisma (`AccountType`, `googleId`, `Client.userId`)
2. Google provider + callbacks Auth.js
3. Middleware + tipos de sessão
4. UI login no header público
5. `/{slug}/meus-agendamentos` + cancelamento
6. Pré-preenchimento no wizard + vínculo `userId` no `createPublicBooking`
7. CTA pós-agendamento + `.env.example` + README

## Critérios de aceite

- [ ] Agendar sem login continua funcionando
- [ ] Google login opcional na página pública
- [ ] Cliente logado vê agendamentos do estabelecimento em `/{slug}/meus-agendamentos`
- [ ] Cliente logado pode cancelar agendamento futuro
- [ ] Usuário BUSINESS não é tratado como cliente ao usar Google com mesmo e-mail (mensagem clara)
