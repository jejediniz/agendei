# Fase 6 — Polimento (Design Spec)

**Data:** 2026-06-12  
**Status:** Implementada (2026-06-12)  
**Próximo passo após aprovação:** Plano de implementação → V2 página pública `/{slug}`

---

## Contexto

O Agendei (branch `feat/saas-multi-tanet`) concluiu as fases 1–5 do [PLANO-TECNICO.md](../../PLANO-TECNICO.md) e a camada SaaS (multi-tenant, billing, onboarding). A Fase 6 está parcialmente feita.

**Já existe:**
- `EmptyState` em todas as tabelas principais
- Toasts via Sonner
- Dialog de confirmação apenas em `client-table.tsx`
- Layout mobile básico (sidebar drawer, colunas ocultas em breakpoints)
- Seed com dados demo (`salao-demo`)
- README funcional sem imagens

**Decisão do usuário:** Fase 6 completa primeiro, depois página pública de agendamento (V2).

---

## Abordagens consideradas

### Confirmações de ações destrutivas

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **A — `ConfirmDialog` reutilizável** (recomendada) | DRY, padrão único, fácil de achar no projeto | Um componente a mais |
| B — Dialog inline em cada tabela | Já funciona em clientes | Duplicação em 5+ arquivos |
| C — Hook `useConfirm` + provider global | API fluente | Over-engineering para o escopo atual |

**Escolha: A** — extrair o padrão já usado em `client-table.tsx` para `src/components/ui/confirm-dialog.tsx`.

### Loading states

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **A — `Skeleton` shadcn + `loading.tsx` por rota** (recomendada) | Padrão Next.js App Router, UX consistente | Arquivos `loading.tsx` por página |
| B — Skeleton só em formulários | Menos arquivos | Listagens sem feedback ao navegar |
| C — Spinner global | Simples | UX inferior |

**Escolha: A** — componente `Skeleton` + `loading.tsx` nas rotas do dashboard que fazem fetch server-side.

### Mobile

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **A — Ajustes pontuais nas tabelas existentes** (recomendada) | Mínimo diff, segue padrão atual | Tabelas ainda scrollam horizontalmente |
| B — Card layout em mobile | Melhor UX em telas pequenas | Refatoração grande das 4 tabelas |
| C — Manter como está | Zero trabalho | Ações de agendamento ficam apertadas no mobile |

**Escolha: A** — foco em ações empilhadas, overflow e touch targets; card layout fica para V2 se necessário.

### README / Screenshots

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **A — `docs/screenshots/` + seção no README** (recomendada) | Portfólio profissional, paths fixos | Captura manual das imagens |
| B — Só texto no README | Rápido | Não cumpre Fase 6 completa |
| C — GIF animado | Impacto visual | Mais trabalho de produção |

**Escolha: A** — README referencia 4–5 screenshots em `docs/screenshots/` com guia de captura em `docs/screenshots/README.md`.

---

## Design detalhado

### 1. Componente `ConfirmDialog`

**Arquivo:** `src/components/ui/confirm-dialog.tsx`

Props:
```ts
type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;       // default: "Confirmar"
  cancelLabel?: string;        // default: "Cancelar"
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
};
```

Reutiliza `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Button` existentes.

### 2. Onde adicionar confirmações

| Componente | Ação | Tipo | Mensagem |
|------------|------|------|----------|
| `appointment-table.tsx` | Cancelar agendamento | destructive | "Cancelar este agendamento? O horário ficará disponível novamente." |
| `appointment-table.tsx` | Concluir agendamento | default | "Marcar este agendamento como concluído?" |
| `availability-manager.tsx` | Excluir faixa de horário | destructive | "Excluir este horário? Esta ação não pode ser desfeita." |
| `professional-table.tsx` | Desativar profissional | default | "Desativar este profissional? Ele não aparecerá em novos agendamentos." |
| `service-table.tsx` | Desativar serviço | default | "Desativar este serviço? Ele não aparecerá em novos agendamentos." |
| `plan-panel.tsx` | Cancelar assinatura | destructive | "Cancelar sua assinatura? Você perderá acesso após o período atual." |
| `client-table.tsx` | Excluir cliente | destructive | (já existe — migrar para `ConfirmDialog`) |

**Não precisa confirmação:** Confirmar agendamento (ação positiva, reversível), Ativar profissional/serviço.

### 3. Skeleton e loading

**Novo:** `src/components/ui/skeleton.tsx` (padrão shadcn)

**Novos loading states:**
- `src/components/layout/table-skeleton.tsx` — skeleton genérico de tabela (5 linhas)
- `src/components/layout/dashboard-skeleton.tsx` — grid de StatCards + lista

**Arquivos `loading.tsx`:**
- `src/app/(dashboard)/loading.tsx` — fallback global do dashboard
- `src/app/(dashboard)/clientes/loading.tsx`
- `src/app/(dashboard)/profissionais/loading.tsx`
- `src/app/(dashboard)/servicos/loading.tsx`
- `src/app/(dashboard)/agendamentos/loading.tsx`
- `src/app/(dashboard)/agenda/loading.tsx`

Formulários client-side mantêm `loading` no botão submit (já existe).

### 4. Ajustes mobile

| Área | Mudança |
|------|---------|
| `appointment-table.tsx` | Ações em `flex-col` no mobile (`sm:flex-row`); botões `size="sm"` com `w-full sm:w-auto` |
| `professional-table.tsx` / `service-table.tsx` | `overflow-x-auto` no wrapper (como `client-table`) |
| `appointment-filters.tsx` / `agenda-filters.tsx` | Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| `dashboard/page.tsx` | Cards de agendamentos com padding reduzido em mobile |

### 5. Fix pendente (pré-requisito)

Commitar correção local de serialização `Service.price` (`Decimal` → `number` via `SerializableService` em `src/lib/queries/services.ts`). Evita bug ao renderizar preços no client.

### 6. README e screenshots

**Estrutura:**
```
docs/screenshots/
  README.md          # Guia: como capturar (npm run dev, login demo, telas)
  dashboard.png
  agenda.png
  agendamentos.png
  clientes.png
  onboarding.png
```

**README.md raiz:** nova seção "Capturas de tela" com as 5 imagens e descrição de cada uma.

> Nota: as imagens PNG serão capturadas manualmente ou via script; o plano inclui placeholders `.gitkeep` até as capturas existirem.

### 7. O que NÃO entra nesta fase

- Página pública `/{slug}` (V2 — próxima spec)
- Card layout completo para tabelas
- Testes automatizados (listado como V2 no plano)
- Deploy em produção (documentar instruções, não executar deploy)

---

## Ordem de implementação

1. Fix `SerializableService` (mudanças locais pendentes)
2. `ConfirmDialog` + migrar confirmações
3. `Skeleton` + `loading.tsx`
4. Ajustes mobile
5. README + estrutura de screenshots

---

## Critérios de aceite

- [ ] Toda ação destrutiva ou irreversível pede confirmação via dialog
- [ ] Navegação entre páginas do dashboard mostra skeleton (não tela branca)
- [ ] Tabelas de agendamentos usáveis em viewport 375px sem sobreposição de botões
- [ ] README referencia screenshots com paths corretos
- [ ] `npm run build` passa sem erros

---

## Próxima feature (após Fase 6)

Spec separada: **Página pública de agendamento** em `/{slug}` — reutilizar `generateAvailableSlots`, criar actions públicas sem `requireSessionContext`, adicionar rota ao middleware.
