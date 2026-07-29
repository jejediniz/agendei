# Reforma Completa — Agendei

> Documento vivo. Atualizado a cada fase concluída.
> Branch: `feat/reforma-completa-agendei`
> Início: 2026-07-28

---

## 1. Diagnóstico atual

### 1.1 Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16.2.9 (App Router, Server Components, Server Actions) |
| Linguagem | TypeScript 5 (strict) |
| Banco | PostgreSQL + Prisma 6.19 |
| Auth | NextAuth v5 (beta) — credenciais + Google, JWT sessions |
| UI | Tailwind CSS 4 + Radix UI (dialog, select, dropdown, tabs, label) |
| Forms | React Hook Form 7 + Zod 4 |
| Datas | date-fns 4 + date-fns-tz (timezone `America/Sao_Paulo`) |
| Pagamentos | Asaas (assinaturas, sandbox) |
| Ícones | lucide-react |
| Toasts | sonner |

Scripts disponíveis (`package.json`): `dev`, `build` (roda `prisma generate` antes), `start`, `lint`, `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio`.
**Não existe** script `typecheck` nem `test`. (Recomendação: adicionar `typecheck: tsc --noEmit`.)

### 1.2 Arquitetura

- **Multi-tenant** por `Organization`; isolamento via `orgWhere()` (`src/lib/tenant/prisma-scopes.ts`) aplicado nas queries.
- Separação em camadas já existente e boa: `lib/queries` (leitura), `lib/actions` (server actions/escrita), `lib/booking` (regras de agendamento), `lib/validations` (Zod), `lib/tenant` (contexto/escopo), `components/*` (UI por domínio), `components/ui` (design system base).
- Papéis: `PlatformRole.PLATFORM_ADMIN` (dono da plataforma), `MemberRole.SUPER_ADMIN` / `STAFF` (dentro do negócio), `AccountType.BUSINESS` / `CUSTOMER` (cliente final que agenda).
- Timezone fixo `America/Sao_Paulo` (não por organização).

### 1.3 Modelo de dados (Prisma)

`User`, `Organization`, `OrganizationMember`, `Client`, `Professional`, `Service`, `Availability` (semanal recorrente), `Appointment`.

Enums: `AppointmentStatus` (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED), `DayOfWeek`, `PlatformRole`, `MemberRole`, `SubscriptionStatus`, `BusinessType`, `AccountType`.

### 1.4 Funcionalidades existentes (confirmadas no código)

- Cadastro self-service com trial de 14 dias; assinatura mensal via Asaas + webhook.
- Onboarding guiado (wizard) para configuração inicial.
- CRUD: clientes, profissionais, serviços, horários (availability), agendamentos.
- Agenda do dia por profissional (grade), dashboard operacional focado no dia.
- Agendamento público por slug (`/{slug}`): wizard serviço → profissional → data → horário → dados.
- Cliente final com login Google opcional vê/cancela agendamentos (`/{slug}/meus-agendamentos`).
- Prevenção de conflito de horário via transação + checagem de overlap.
- Cálculo de disponibilidade real (availability semanal − agendamentos que bloqueiam).
- Painel da plataforma (`/platform`).
- Skeletons de loading, confirmações antes de ações destrutivas, estados vazios.

### 1.5 Problemas encontrados

**Modelagem de dados**
1. `AppointmentStatus` não tem **NÃO COMPARECEU (NO_SHOW)** nem **EM ATENDIMENTO (IN_PROGRESS)** — pedidos explícitos do produto.
2. Sem vínculo **Profissional ↔ Serviço** (qualquer profissional "faz" qualquer serviço; disponibilidade não considera competência).
3. Sem modelo de **bloqueios / folgas / férias / feriados** (só availability semanal recorrente). Não há como bloquear uma tarde específica.
4. Sem **status de pagamento** no agendamento.
5. Sem **lembretes/notificações** (nem modelo, nem envio).
6. Sem **duração/intervalo (buffer)** entre atendimentos configurável — slot fixo de 30 min hardcoded em `generateAvailableSlots`.
7. Sem múltiplas **unidades/locais** (mencionado como possível, hoje inexistente).

**Regras de negócio**
8. `generateAvailableSlots` (`src/lib/utils/appointments.ts`) usa `getHours()/getMinutes()` direto no `Date` do agendamento — isso lê a hora no **timezone do servidor**, não em `America/Sao_Paulo`. Se o servidor não estiver em BRT, o cálculo de bloqueio de slot fica **incorreto**. (O `slots.ts` já usa `minutesFromDateInTimezone` na etapa de filtro final, mas a checagem interna não.) → Bug latente dependente de ambiente.
9. Concorrência: a checagem de conflito é `findFirst` + `create` dentro de `$transaction` sob isolamento padrão (Read Committed). Duas reservas simultâneas do mesmo slot podem, teoricamente, passar. Falta constraint de exclusão no banco (ou isolamento serializável / lock).
10. Slot de 30 min impede serviços que começam em :15/:45 ou grades de 15 min.

**UX / Navegação**
11. Sidebar mistura três visões sobrepostas: **"Agenda do dia"**, **"Agendamentos"** (lista) e **"Horários"** (availability). Confuso — o profissional não sabe onde operar o dia a dia.
12. Não há visão de **semana** nem de **mês** — só o dia. É a lacuna nº 1 para um produto de agenda profissional.
13. Não há seção de **Relatórios/Indicadores** dedicada (faturamento, serviços mais agendados, recorrência).
14. Agenda não permite **criar agendamento clicando num horário vazio** (criação rápida).

**Visual / Design system**
15. Paleta terracota quente + Fraunces (serif). Bonita, porém com forte "personalidade de marca" que pode destoar de um SaaS de produtividade neutro/confiável. **Decisão de identidade pendente** (ver seção 9).
16. **Sem tema escuro.**
17. Fundo com gradientes radiais globais — a evitar segundo o próprio briefing (excesso de gradiente).

**Qualidade / Infra**
18. **Sem testes** (nenhum framework instalado) e **sem script de typecheck**.
19. `.env` real presente na máquina (aberto no editor). Regra: **não tocar em segredos**.

### 1.6 O que está bem-feito (preservar)

- Separação de camadas queries/actions/validations/booking.
- Isolamento multi-tenant consistente via `orgWhere`.
- Transação de criação com checagem de conflito (base sólida; só endurecer concorrência).
- Componentes base (`components/ui`) com CVA, `DataTable` reutilizável, skeletons.
- Tratamento de timezone centralizado em `lib/utils/date.ts` (corrigir só o ponto 8).
- Fluxo público de agendamento já enxuto.

---

## 2. Objetivos da reforma

Transformar o Agendei num SaaS de agendamento **profissional, confiável e comercializável**: agenda como núcleo (dia/semana/mês), regras de disponibilidade confiáveis, painel útil para a rotina, identidade visual de produto, ótima experiência mobile e código sustentável — **sem quebrar dados ou funcionalidades existentes**.

---

## 3. Personas

| Persona | Papel no sistema | Necessidade central |
|---------|------------------|---------------------|
| **Dono(a) do negócio** | `SUPER_ADMIN` | Configurar negócio, ver faturamento/indicadores, gerir equipe. |
| **Profissional/prestador** | `SUPER_ADMIN` ou `STAFF` | Operar a agenda do dia, confirmar/concluir atendimentos. |
| **Recepção/equipe** | `STAFF` | Marcar, remarcar, cancelar, cadastrar cliente rápido. |
| **Cliente final** | `AccountType.CUSTOMER` (login opcional) | Agendar em poucos passos; ver/cancelar seus horários. |

Todos já existem no modelo — não criaremos papéis novos, apenas refinaremos permissões de `STAFF`.

---

## 4. Jornadas principais (a validar/melhorar)

1. Primeiro acesso → onboarding → dashboard (em correção agora: loop de redirect).
2. Configuração do negócio (dados, horário de funcionamento).
3. Cadastro de profissionais (+ vínculo com serviços — novo).
4. Cadastro de serviços (duração, preço, buffer — novo).
5. Definição de horários (availability + bloqueios — novo).
6. Criar agendamento pelo profissional (incl. criação rápida por clique — novo).
7. Agendamento pelo cliente (fluxo público).
8. Remarcação. 9. Cancelamento. 10. Confirmação.
11. Bloqueio de agenda (novo). 12. Visualização do dia/semana/mês.
13. Encerrar atendimento (concluído / não compareceu — novo).
14. Histórico do cliente. 15. Indicadores/relatórios.

---

## 5. Estrutura de navegação proposta

```
Visão geral   (/)                 — painel operacional + resumo do negócio
Agenda        (/agenda)           — dia / semana / mês; criação rápida; filtros; bloqueios
Clientes      (/clientes)
Serviços      (/servicos)
Profissionais (/profissionais)    — inclui horários e bloqueios do profissional
Relatórios    (/relatorios)       — faturamento, serviços top, ocupação (novo)
Configurações (/configuracoes)    — negócio, horário de funcionamento, plano
```

Consolidações:
- **"Agendamentos" (lista)** vira uma aba/visão dentro de **Agenda** (ou lista filtrável), eliminando a duplicidade Agenda-do-dia × Agendamentos.
- **"Horários"** deixa de ser item de topo e passa a viver dentro de **Profissionais** (cada profissional tem seus horários + bloqueios) e/ou **Configurações › Horário de funcionamento**.

---

## 6. Funcionalidades: existentes / melhorar / novas

**Melhorar:** agenda (add semana/mês, criação rápida, cores por status), dashboard (indicadores acionáveis), status do agendamento (add IN_PROGRESS/NO_SHOW), fluxo público (revisão/preço/política), navegação, identidade visual, responsividade, acessibilidade.

**Novas (recomendadas, priorizadas):**
- Vínculo Profissional ↔ Serviço.
- Bloqueios/indisponibilidades pontuais (folga, férias, feriado).
- Buffer/intervalo entre atendimentos e granularidade de slot configurável.
- Status EM ATENDIMENTO e NÃO COMPARECEU.
- Relatórios básicos (faturamento previsto/realizado, serviços mais agendados, taxa de ocupação, no-show).
- Tema escuro (opcional, fase de qualidade).

**Fora de escopo inicial (documentar como futuro):** múltiplas unidades, lista de espera, lembretes automáticos por WhatsApp/e-mail, pagamentos no ato do agendamento, recorrência de agendamentos.

---

## 7. Prioridades

P0 (confiabilidade): corrigir bug de timezone em `generateAvailableSlots`; endurecer concorrência de reserva; finalizar correção do loop de onboarding.
P1 (núcleo): agenda semana/mês + criação rápida; status IN_PROGRESS/NO_SHOW; vínculo profissional↔serviço; bloqueios.
P2 (valor comercial): relatórios; melhorias do fluxo público; buffer/slot configurável.
P3 (acabamento): identidade visual consolidada, tema escuro, acessibilidade, performance.

---

## 8. Riscos técnicos

- **Migrations Prisma**: adicionar valores a enum e novas tabelas é **aditivo e seguro**; nada destrutivo será feito sem apresentar impacto antes. Projeto usa `db push` (sem histórico de migrations versionadas) — cuidado redobrado com dados existentes.
- **Alterar `AppointmentStatus`**: consumidores em `constants/appointment-status.ts`, `BLOCKING_STATUSES`, badges, filtros e queries do dashboard. Mapear todos antes.
- **Contratos de server actions**: usados por formulários client — alterar assinatura exige revisar o consumidor.
- **NextAuth JWT vs Edge**: correção de onboarding em andamento é sensível (Prisma não roda no middleware Edge). Não regредir.
- **Timezone único**: mudar para timezone por organização é maior; manter fixo por ora e documentar.

---

## 9. Decisões técnicas

- **Identidade visual (DECIDIDO — Jessica delegou):** paleta "SaaS profissional, calma". Base **neutra fria** (canvas `#f4f5f6`, cards brancos), primária **teal-petróleo `#0e6e64`** (marca/ações), acento **esmeralda `#2f8f6b`** (sucesso/confirmação). Tipografia mantida (Fraunces em títulos, DM Sans no corpo). Gradientes radiais globais **removidos**. Contraste do texto sobre a primária = 6.1:1 (AA/AAA). Motivo: transmite confiança e produtividade sem cair no "azul-SaaS genérico"; paleta análoga = coesa e calma.
- Granularidade de slot: tornar configurável por serviço/organização (default 30 min). _(pendente — Fase 4)_
- Concorrência: constraint de exclusão Postgres (`btree_gist`) vs. transação serializável vs. advisory lock. _(pendente aprovação)_
- **Tema escuro:** adiado para a Fase 6 (exige varredura das cores utilitárias fixas nos componentes; ativar agora deixaria a UI pela metade).

---

## 10. Fases de implementação

Cada fase termina com: `lint` + typecheck (`tsc --noEmit`) + `build` verdes, revisão do diff, atualização deste doc e commit pequeno.

### Fase 0 — Fundação de qualidade (rápida)
- Adicionar script `typecheck`.
- Corrigir P0 de timezone em `generateAvailableSlots`.
- Finalizar/validar correção do loop de onboarding (trabalho em andamento preservado).
- Endurecer concorrência de reserva (documentar abordagem e impacto antes).

### Fase 1 — Fundação e identidade visual
- Consolidar design tokens (cores, tipografia, espaçamento, sombras, raios) conforme decisão da seção 9.
- Padronizar componentes base: button, input, select, card, badge, dialog, alertas, estados (loading/empty/erro).
- Remover gradientes globais excessivos; tema escuro (se aprovado).

### Fase 2 — Estrutura principal
- Nova navegação (seção 5); layout, header, sidebar, versão mobile; painel inicial acionável.

### Fase 3 — Agenda (núcleo)
- Visões dia/semana/mês; criação rápida por clique; filtros (profissional/serviço); cores por status; bloqueios; detalhes/edição por painel; status novos.

### Fase 4 — Gestão
- Clientes, serviços (duração/buffer/preço), profissionais (+ serviços + horários + bloqueios), configurações (horário de funcionamento).

### Fase 5 — Experiência do cliente
- Fluxo público revisado: serviço → profissional → data → horário → dados → revisão (preço, duração, política) → confirmação; cancelar/remarcar.

### Fase 6 — Qualidade
- Acessibilidade (teclado, contraste, rótulos, leitores de tela), responsividade, performance, testes essenciais (regras de disponibilidade/conflito), revisão geral.

---

## 11. Critérios de aceite (globais)

- Nenhuma funcionalidade existente correta foi removida sem justificativa.
- `lint`, `tsc --noEmit` e `build` verdes ao fim de cada fase.
- Textos ao usuário em pt-BR; TypeScript sem `any` novo.
- Agenda com dia/semana/mês operável no desktop e mobile.
- Regras de disponibilidade e conflito confiáveis (cobertas por teste).
- Estados de loading/erro/vazio/sucesso presentes nas telas tocadas.
- Nenhuma alteração destrutiva no banco sem impacto apresentado e aprovado.

---

## 12. Registro de andamento

| Data | Fase | Mudança | Commit |
|------|------|---------|--------|
| 2026-07-28 | — | Branch criada; diagnóstico; este documento. | docs |
| 2026-07-28 | 0 | Script `typecheck`; correção do bug de timezone em `generateAvailableSlots` (agora usa `minutesFromDateInTimezone`); correção do erro de lint em `login-form` (setState fora do effect). Build/lint/typecheck verdes. | fix |
| 2026-07-28 | 1 | Nova identidade visual via tokens (`globals.css`): base neutra fria + primária teal-petróleo + acento esmeralda; gradientes globais removidos; cores de status harmonizadas (Confirmado→teal, Cancelado→slate). Sem tocar em componentes (re-skin por token). Build/lint/typecheck verdes. | feat |
| 2026-07-28 | 2 | Navegação reorganizada em grupos (Visão geral · Operação · Cadastros · Análise · Configurações); Agenda vira hub com abas Calendário/Lista (`AgendaSectionTabs`); "Agendamentos" e "Horários" saem do topo (Horários → Configurações); nova página **Relatórios** com indicadores reais de 30 dias (`queries/reports.ts`); dashboard enxuto e focado no dia com atalhos. Build/lint/typecheck verdes. | feat |
| 2026-07-28 | — | Seed enriquecido: 8 clientes, 3 profissionais, 6 serviços, 62 agendamentos (hoje/semana/histórico) no fuso SP. | chore |
| 2026-07-28 | 3a | Agenda com **visões Dia / Semana / Mês** (seletor + navegação anterior/próximo/hoje na toolbar); nova visão semanal (`AgendaWeekGrid`) e mensal/calendário (`AgendaMonthGrid`); **criação rápida** ao clicar em horário vazio na grade do dia (pré-preenche data/profissional/hora em `/agendamentos/novo`); card de agendamento extraído para reuso (`AgendaAppointmentCard`); helpers de semana/mês em `date.ts`; query por intervalo (`getAppointmentsInRange`). Build/lint/typecheck verdes. | feat |
| 2026-07-28 | 3b | Novos status **Em atendimento** (IN_PROGRESS) e **Não compareceu** (NO_SHOW) no enum (db push aditivo, sem perda de dados). Atualizados: cores/labels, `BLOCKING_STATUSES` (IN_PROGRESS bloqueia; NO_SHOW libera), transições válidas, botões do diálogo de detalhes, filtros, stats do dashboard e relatórios. Seed com exemplos dos novos status. Build/lint/typecheck verdes. | feat |
| 2026-07-28 | 4 | **Vínculo Profissional↔Serviço** (tabela `ProfessionalService`, db push aditivo). Regra retrocompatível: profissional **sem** vínculos atende todos; **com** vínculos, só os selecionados. Cálculo de slots e criação de agendamento validam o vínculo; formulário de profissional ganha seleção de serviços; formulário de agendamento filtra profissionais pelo serviço; seed com vínculos. Build/lint/typecheck verdes. | feat |
| 2026-07-28 | 5 | Fluxo público respeita o vínculo profissional↔serviço (só mostra quem realiza o serviço); passo final vira **revisão** com serviço, profissional, data/hora, duração, valor e política de cancelamento/contato. Cancelamento pelo cliente já existia. Build/lint/typecheck verdes. | feat |
| 2026-07-28 | 6 | **Testes** com Vitest (14 casos) cobrindo regras de disponibilidade/conflito (`generateAvailableSlots`, `hasOverlap`, `appointmentsOverlap`) e utilidades de data/fuso (semana/mês/navegação); scripts `test`/`test:watch`. Corrigidos avisos de lint (imports não usados, `aria-pressed` no seletor de dia). Lint 0 erros / 4 avisos (padrões do React Hook Form). Build/typecheck/testes verdes. | test |
| 2026-07-29 | 7 | **Concorrência de reserva**: exclusion constraint Postgres (`btree_gist`, `EXCLUDE USING gist` sobre `professionalId` + `tsrange(startAt,endAt)`, filtrada pelos status bloqueantes) como rede de segurança final contra dupla reserva, complementando (não substituindo) a checagem em nível de app. SQL idempotente em `prisma/sql/appointment-no-overlap.sql`, encadeado no script `db:push`. `create-appointment.ts` e `updateAppointmentStatus` tratam a violação da constraint e o deadlock (40P01, comportamento documentado do Postgres sob inserção concorrente em índice GiST) com retentativas + jitter (`runWithOverlapGuard`), convertendo em mensagem de "horário ocupado" para o usuário. Validado com testes de estresse manuais (60/60 corridas de 2 tentativas simultâneas resultaram em exatamente 1 sucesso, 0 dupla-reserva). Build/lint/typecheck/testes verdes. | fix |

### Ainda em aberto (não bloqueiam)

- **Tema escuro:** exige varredura das cores utilitárias fixas; planejado para a Fase 10.
- ~~**Concorrência de reserva**~~ — concluído na Fase 7.
- **Buffer entre atendimentos + granularidade de slot:** planejado para a Fase 8.
- **Remarcação self-service:** planejado para a Fase 9 (hoje o cliente cancela e reagenda do zero).

### Pendências de aprovação (não executadas)

- **Trabalho de onboarding em andamento** (6 arquivos + `post-onboarding-redirect.tsx`): preservado no working tree, **não commitado** (código de auth em iteração pela Jessica).
