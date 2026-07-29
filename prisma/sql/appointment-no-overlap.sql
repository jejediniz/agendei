-- Rede de segurança final contra dupla reserva do mesmo horário de um profissional.
-- Idempotente: seguro para rodar de novo a cada `db:push` (ex.: depois que alguém
-- rodar `prisma db push` e recriar a extensão/constraint não estiver mais lá).
-- O Prisma DSL não expressa "EXCLUDE" constraints, por isso este SQL é aplicado
-- separadamente (não faz parte do schema.prisma).
--
-- "startAt"/"endAt" são `timestamp(3) without time zone` (sem fuso) — por isso
-- usamos `tsrange`, não `tstzrange`: um cast implícito para timestamptz dentro
-- da expressão do índice dependeria do TimeZone da sessão (STABLE, não
-- IMMUTABLE) e o Postgres recusa a constraint.

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointment_no_overlap'
  ) THEN
    ALTER TABLE "Appointment"
      ADD CONSTRAINT appointment_no_overlap
      EXCLUDE USING gist (
        "professionalId" WITH =,
        tsrange("startAt", "endAt", '[)') WITH &&
      )
      WHERE (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'));
  END IF;
END $$;
