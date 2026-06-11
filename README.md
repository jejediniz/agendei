# Agendei

Sistema web de agendamento de serviços para salões, clínicas, oficinas e consultorias. Projeto de portfólio com interface moderna em português.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL** + **Prisma**
- **Zod** + **React Hook Form**
- **Auth.js** (login admin único)

## Funcionalidades

- Dashboard com métricas e próximos atendimentos
- CRUD de clientes, profissionais e serviços
- Horários disponíveis por profissional
- Agendamentos com bloqueio de conflito de horário
- Agenda visual do dia
- Autenticação simples (admin)

## Pré-requisitos

- Node.js 20+
- Docker (para PostgreSQL) ou instância PostgreSQL local

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Inicie o PostgreSQL:

```bash
docker compose up -d
```

4. Execute as migrations e o seed:

```bash
npm run db:push
npm run db:seed
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Credenciais padrão

- **E-mail:** admin@agendei.com
- **Senha:** admin123

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:push` | Sincroniza schema com o banco |
| `npm run db:seed` | Popula dados de demonstração |
| `npm run db:studio` | Abre Prisma Studio |

## Documentação

Consulte [docs/PLANO-TECNICO.md](docs/PLANO-TECNICO.md) para a documentação técnica completa do projeto.

## Estrutura

```
src/
├── app/           # Rotas (App Router)
├── components/    # Componentes React
├── lib/           # Actions, queries, validações, utils
└── hooks/         # Hooks customizados
```

## Regra de negócio principal

Um profissional não pode ter dois agendamentos ativos (marcado ou confirmado) no mesmo intervalo de horário. Agendamentos cancelados não bloqueiam o horário.
