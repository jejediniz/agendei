import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  minutesToTime,
  minutesFromDateInTimezone,
  combineDateAndTime,
  getWeekDays,
  getMonthGridDays,
  addDaysToDateStr,
  addMonthsToDateStr,
  toDateKey,
} from "./date";

describe("parseTimeToMinutes / minutesToTime", () => {
  it("converte ida e volta", () => {
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(minutesToTime(570)).toBe("09:30");
    expect(minutesToTime(0)).toBe("00:00");
  });
});

describe("combineDateAndTime + minutesFromDateInTimezone", () => {
  it("preserva a hora de parede no fuso do negócio", () => {
    const d = combineDateAndTime("2026-07-28", "14:15");
    expect(minutesFromDateInTimezone(d)).toBe(14 * 60 + 15);
    expect(toDateKey(d)).toBe("2026-07-28");
  });
});

describe("getWeekDays", () => {
  it("retorna 7 dias começando na segunda", () => {
    // 2026-07-28 é uma terça-feira
    const days = getWeekDays("2026-07-28");
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2026-07-27"); // segunda
    expect(days[6]).toBe("2026-08-02"); // domingo
    expect(days).toContain("2026-07-28");
  });
});

describe("getMonthGridDays", () => {
  it("cobre semanas completas contendo o mês", () => {
    const grid = getMonthGridDays("2026-07-28");
    expect(grid.length % 7).toBe(0);
    expect(grid.some((d) => d.date === "2026-07-28" && d.inMonth)).toBe(true);
    // primeiro dia da grade é uma segunda-feira
    expect(getWeekDays(grid[0].date)[0]).toBe(grid[0].date);
  });
});

describe("navegação por string de data", () => {
  it("soma dias e meses respeitando o fuso", () => {
    expect(addDaysToDateStr("2026-07-28", 1)).toBe("2026-07-29");
    expect(addDaysToDateStr("2026-07-31", 1)).toBe("2026-08-01");
    expect(addMonthsToDateStr("2026-07-28", 1)).toBe("2026-08-28");
    expect(addMonthsToDateStr("2026-01-31", 1)).toBe("2026-02-28");
  });
});
