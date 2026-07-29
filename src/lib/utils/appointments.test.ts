import { describe, it, expect } from "vitest";
import type { AppointmentStatus } from "@prisma/client";
import {
  hasOverlap,
  appointmentsOverlap,
  generateAvailableSlots,
  calculateEndAt,
  availabilityRangesOverlap,
} from "./appointments";
import { combineDateAndTime } from "./date";

const DATE = "2026-07-28";
function at(time: string) {
  return combineDateAndTime(DATE, time);
}

describe("hasOverlap", () => {
  it("detecta sobreposição", () => {
    expect(hasOverlap(at("10:00"), at("11:00"), at("10:30"), at("11:30"))).toBe(
      true,
    );
  });
  it("horários encostados não se sobrepõem", () => {
    expect(hasOverlap(at("10:00"), at("11:00"), at("11:00"), at("12:00"))).toBe(
      false,
    );
  });
});

describe("appointmentsOverlap", () => {
  const scheduled = (start: string, end: string) => ({
    startAt: at(start),
    endAt: at(end),
    status: "SCHEDULED" as AppointmentStatus,
  });

  it("ignora agendamentos cancelados", () => {
    const cancelled = {
      startAt: at("10:00"),
      endAt: at("11:00"),
      status: "CANCELLED" as AppointmentStatus,
    };
    expect(appointmentsOverlap([cancelled], at("10:15"), at("10:45"))).toBe(
      false,
    );
  });

  it("bloqueia quando há conflito com agendamento ativo", () => {
    expect(
      appointmentsOverlap([scheduled("10:00", "11:00")], at("10:30"), at("11:30")),
    ).toBe(true);
  });
});

describe("generateAvailableSlots", () => {
  const availability = [{ startTime: "09:00", endTime: "12:00" }];

  it("gera slots de acordo com a duração dentro da janela", () => {
    const slots = generateAvailableSlots(availability, [], 60);
    expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
  });

  it("remove os horários que colidem com um agendamento existente", () => {
    const busy = [
      {
        startAt: at("10:00"),
        endAt: at("11:00"),
        status: "CONFIRMED" as AppointmentStatus,
      },
    ];
    const slots = generateAvailableSlots(availability, busy, 60);
    expect(slots).toEqual(["09:00", "11:00"]);
  });

  it("não gera slot que ultrapasse o fim da janela", () => {
    const slots = generateAvailableSlots(
      [{ startTime: "09:00", endTime: "10:00" }],
      [],
      60,
    );
    expect(slots).toEqual(["09:00"]);
  });
});

describe("calculateEndAt", () => {
  it("soma a duração ao início", () => {
    expect(calculateEndAt(at("10:00"), 90).getTime()).toBe(at("11:30").getTime());
  });
});

describe("availabilityRangesOverlap", () => {
  it("detecta janelas de disponibilidade sobrepostas", () => {
    expect(availabilityRangesOverlap("09:00", "12:00", "11:00", "13:00")).toBe(
      true,
    );
    expect(availabilityRangesOverlap("09:00", "12:00", "12:00", "13:00")).toBe(
      false,
    );
  });
});
