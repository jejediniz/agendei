# Página pública de agendamento — Design Spec

**Data:** 2026-06-12  
**Rota:** `/{slug}`  
**Status:** Implementada (2026-06-12)

## Objetivo

Permitir que clientes finais agendem online pelo link `agendei.com/{slug}` sem login.

## Fluxo

1. Serviço → 2. Profissional → 3. Data/horário → 4. Nome e telefone → 5. Confirmação

## Arquivos novos

- `src/lib/constants/reserved-slugs.ts`
- `src/lib/booking/slots.ts` — lógica compartilhada de slots
- `src/lib/booking/create-appointment.ts` — criação compartilhada
- `src/lib/queries/public-booking.ts`
- `src/lib/validations/public-booking.ts`
- `src/lib/actions/public-booking.ts`
- `src/components/booking/public-booking-wizard.tsx`
- `src/app/(public)/[slug]/page.tsx`

## Regras

- Slugs reservados (login, cadastro, etc.) → 404
- Assinatura EXPIRED/CANCELLED → página indisponível
- Cliente identificado por telefone (cria ou reutiliza na organização)
- Status inicial: SCHEDULED
