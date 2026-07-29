export const AGENDA_VIEW_MODES = ["dia", "semana", "mes"] as const;

export type AgendaViewMode = (typeof AGENDA_VIEW_MODES)[number];

export const AGENDA_VIEW_LABELS: Record<AgendaViewMode, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
};

export function parseAgendaView(value: string | undefined): AgendaViewMode {
  return AGENDA_VIEW_MODES.includes(value as AgendaViewMode)
    ? (value as AgendaViewMode)
    : "dia";
}
