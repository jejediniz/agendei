# Agendei

Sistema SaaS de agendamento de serviços para salões, clínicas, oficinas e consultorias.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **PostgreSQL** + **Prisma 6**
- **Auth.js** (multi-tenant)
- **Asaas** (assinaturas)
- **Tailwind CSS 4** + **Zod** + **React Hook Form**

## Funcionalidades SaaS

- Cadastro self-service com **14 dias de trial**
- **Multi-tenant**: cada negócio com dados isolados
- **Super Admin** por estabelecimento
- **Platform Admin** para gerenciar todas as contas
- Onboarding guiado para novos clientes
- Assinatura mensal via Asaas
- CRUD completo: clientes, profissionais, serviços, horários, agendamentos
- Dashboard e agenda visual

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Credenciais de desenvolvimento

| Papel | E-mail | Senha |
|-------|--------|-------|
| Platform Admin | platform@agendei.com | platform123 |
| Super Admin (demo) | admin@agendei.com | admin123 |

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/cadastro` | Criar conta + negócio (trial) |
| `/login` | Entrar |
| `/precos` | Landing de preços |
| `/onboarding` | Configuração inicial |
| `/configuracoes/negocio` | Dados do estabelecimento |
| `/configuracoes/plano` | Assinatura e pagamento |
| `/platform` | Painel da plataforma |

## Asaas (sandbox)

Configure no `.env`:

```
ASAAS_API_KEY=sua_chave_sandbox
ASAAS_WEBHOOK_TOKEN=token_secreto
ASAAS_ENV=sandbox
SUBSCRIPTION_PRICE=79.00
TRIAL_DAYS=14
```

Webhook URL: `https://seu-dominio.com/api/webhooks/asaas`

## Branch

- `main` — versão portfólio (single-tenant)
- `feat/saas-multi-tenant` — versão SaaS comercial

## Documentação

- [docs/PLANO-TECNICO.md](docs/PLANO-TECNICO.md) — plano técnico original
