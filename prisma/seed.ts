import { PrismaClient, DayOfWeek, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMinutes, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@agendei.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = process.env.ADMIN_NAME ?? "Administrador";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash },
  });

  await prisma.client.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Ana Silva",
        phone: "(11) 98765-4321",
        email: "ana.silva@email.com",
        document: "123.456.789-00",
      },
    }),
    prisma.client.create({
      data: {
        name: "Carlos Oliveira",
        phone: "(11) 97654-3210",
        email: "carlos@email.com",
      },
    }),
    prisma.client.create({
      data: {
        name: "Mariana Costa",
        phone: "(11) 96543-2109",
        notes: "Prefere atendimento pela manhã",
      },
    }),
    prisma.client.create({
      data: {
        name: "João Pereira",
        phone: "(11) 95432-1098",
        email: "joao@email.com",
      },
    }),
  ]);

  const professionals = await Promise.all([
    prisma.professional.create({
      data: {
        name: "Juliana Santos",
        phone: "(11) 91234-5678",
        email: "juliana@agendei.com",
        specialty: "Cabeleireira",
      },
    }),
    prisma.professional.create({
      data: {
        name: "Roberto Lima",
        phone: "(11) 92345-6789",
        email: "roberto@agendei.com",
        specialty: "Barbeiro",
      },
    }),
    prisma.professional.create({
      data: {
        name: "Fernanda Alves",
        specialty: "Manicure",
        active: true,
      },
    }),
  ]);

  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Corte feminino",
        description: "Corte e finalização",
        durationMin: 60,
        price: 80,
      },
    }),
    prisma.service.create({
      data: {
        name: "Corte masculino",
        description: "Corte tradicional",
        durationMin: 30,
        price: 45,
      },
    }),
    prisma.service.create({
      data: {
        name: "Manicure",
        description: "Cutilagem e esmaltação",
        durationMin: 45,
        price: 35,
      },
    }),
    prisma.service.create({
      data: {
        name: "Coloração",
        description: "Coloração completa",
        durationMin: 120,
        price: 180,
      },
    }),
  ]);

  const weekdays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  for (const professional of professionals) {
    for (const day of weekdays) {
      await prisma.availability.create({
        data: {
          professionalId: professional.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
        },
      });
    }
  }

  const tomorrow = addDays(new Date(), 1);
  const appointmentDate = setMinutes(setHours(tomorrow, 10), 0);

  await prisma.appointment.create({
    data: {
      clientId: clients[0].id,
      professionalId: professionals[0].id,
      serviceId: services[0].id,
      startAt: appointmentDate,
      endAt: addMinutes(appointmentDate, 60),
      status: AppointmentStatus.CONFIRMED,
    },
  });

  const apt2Start = setMinutes(setHours(tomorrow, 14), 0);
  await prisma.appointment.create({
    data: {
      clientId: clients[1].id,
      professionalId: professionals[1].id,
      serviceId: services[1].id,
      startAt: apt2Start,
      endAt: addMinutes(apt2Start, 30),
      status: AppointmentStatus.SCHEDULED,
    },
  });

  console.log("Seed concluído com sucesso!");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
