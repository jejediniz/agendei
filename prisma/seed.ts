import {
  PrismaClient,
  DayOfWeek,
  AppointmentStatus,
  MemberRole,
  PlatformRole,
  SubscriptionStatus,
  BusinessType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMinutes } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

const TZ = "America/Sao_Paulo";

/**
 * Instante UTC correspondente à hora de parede em America/Sao_Paulo,
 * `daysOffset` dias a partir de hoje. Espelha a lógica de
 * `combineDateAndTime` da aplicação, para a agenda exibir o horário certo
 * independentemente do fuso do servidor onde o seed roda.
 */
function spDateTime(daysOffset: number, hour: number, minute = 0): Date {
  const spNow = toZonedTime(new Date(), TZ);
  const day = addDays(spNow, daysOffset);
  const local = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hour,
    minute,
    0,
    0,
  );
  return fromZonedTime(local, TZ);
}

async function main() {
  const platformEmail =
    process.env.PLATFORM_ADMIN_EMAIL ?? "platform@agendei.com";
  const platformPassword = process.env.PLATFORM_ADMIN_PASSWORD ?? "platform123";
  const demoEmail = process.env.ADMIN_EMAIL ?? "admin@agendei.com";
  const demoPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.client.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const platformHash = await bcrypt.hash(platformPassword, 10);
  const demoHash = await bcrypt.hash(demoPassword, 10);

  await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: platformEmail,
      passwordHash: platformHash,
      platformRole: PlatformRole.PLATFORM_ADMIN,
    },
  });

  const trialEndsAt = addDays(new Date(), 14);

  const organization = await prisma.organization.create({
    data: {
      name: "Salão Demonstração",
      slug: "salao-demo",
      businessType: BusinessType.SALON,
      email: demoEmail,
      phone: "(11) 3333-4444",
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialEndsAt,
      onboardingCompletedAt: new Date(),
      onboardingStep: 4,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Administrador Demo",
      email: demoEmail,
      passwordHash: demoHash,
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: organization.id,
      userId: demoUser.id,
      role: MemberRole.SUPER_ADMIN,
    },
  });

  const clientsData = [
    { name: "Ana Silva", phone: "(11) 98765-4321", email: "ana.silva@email.com" },
    { name: "Carlos Oliveira", phone: "(11) 97654-3210", email: "carlos@email.com" },
    { name: "Mariana Costa", phone: "(11) 96543-2109", email: "mariana.costa@email.com" },
    { name: "João Pereira", phone: "(11) 95432-1098", email: "joao.pereira@email.com" },
    { name: "Beatriz Almeida", phone: "(11) 94321-0987", email: "bia.almeida@email.com" },
    { name: "Rafael Souza", phone: "(11) 93210-9876", email: "rafael.souza@email.com" },
    { name: "Camila Rocha", phone: "(11) 92109-8765", email: "camila.rocha@email.com" },
    { name: "Fernanda Lima", phone: "(11) 91098-7654", email: "fernanda.lima@email.com" },
  ];
  const clients = await Promise.all(
    clientsData.map((data) =>
      prisma.client.create({ data: { organizationId: organization.id, ...data } }),
    ),
  );

  const professionalsData = [
    { name: "Juliana Santos", specialty: "Cabeleireira" },
    { name: "Roberto Lima", specialty: "Barbeiro" },
    { name: "Patrícia Mendes", specialty: "Manicure" },
  ];
  const professionals = await Promise.all(
    professionalsData.map((data) =>
      prisma.professional.create({
        data: { organizationId: organization.id, ...data },
      }),
    ),
  );

  const servicesData = [
    { name: "Corte feminino", durationMin: 60, price: 80 },
    { name: "Corte masculino", durationMin: 30, price: 45 },
    { name: "Escova", durationMin: 45, price: 60 },
    { name: "Coloração", durationMin: 120, price: 180 },
    { name: "Manicure", durationMin: 45, price: 40 },
    { name: "Barba", durationMin: 30, price: 35 },
  ];
  const services = await Promise.all(
    servicesData.map((data) =>
      prisma.service.create({
        data: { organizationId: organization.id, ...data },
      }),
    ),
  );

  const [corteFem, corteMasc, escova, coloracao, manicure, barba] = services;
  const [juliana, roberto, patricia] = professionals;

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

  // Cada item: [profissional, serviço, cliente, offsetDias, hora, minuto, status]
  type Row = [
    (typeof professionals)[number],
    (typeof services)[number],
    (typeof clients)[number],
    number,
    number,
    number,
    AppointmentStatus,
  ];

  const rows: Row[] = [
    // HOJE — agenda povoada com status variados
    [juliana, corteFem, clients[0], 0, 9, 0, AppointmentStatus.COMPLETED],
    [juliana, coloracao, clients[2], 0, 11, 0, AppointmentStatus.CONFIRMED],
    [juliana, escova, clients[4], 0, 15, 0, AppointmentStatus.SCHEDULED],
    [roberto, corteMasc, clients[1], 0, 10, 0, AppointmentStatus.COMPLETED],
    [roberto, barba, clients[3], 0, 14, 0, AppointmentStatus.CONFIRMED],
    [roberto, corteMasc, clients[5], 0, 16, 0, AppointmentStatus.SCHEDULED],
    [patricia, manicure, clients[6], 0, 9, 30, AppointmentStatus.COMPLETED],
    [patricia, manicure, clients[7], 0, 13, 0, AppointmentStatus.CONFIRMED],

    // PRÓXIMOS DIAS — para a visão de semana
    [juliana, corteFem, clients[3], 1, 10, 0, AppointmentStatus.CONFIRMED],
    [roberto, corteMasc, clients[6], 1, 11, 0, AppointmentStatus.SCHEDULED],
    [patricia, manicure, clients[0], 1, 14, 0, AppointmentStatus.SCHEDULED],
    [juliana, escova, clients[5], 2, 9, 0, AppointmentStatus.SCHEDULED],
    [roberto, barba, clients[2], 2, 15, 0, AppointmentStatus.CONFIRMED],
    [juliana, coloracao, clients[7], 3, 13, 0, AppointmentStatus.SCHEDULED],
    [patricia, manicure, clients[4], 4, 10, 0, AppointmentStatus.SCHEDULED],
    [roberto, corteMasc, clients[1], 5, 16, 0, AppointmentStatus.SCHEDULED],
  ];

  // HISTÓRICO — últimos 25 dias, para alimentar os relatórios
  const rotation: Array<[
    (typeof professionals)[number],
    (typeof services)[number],
  ]> = [
    [juliana, corteFem],
    [roberto, corteMasc],
    [patricia, manicure],
    [juliana, escova],
    [roberto, barba],
    [juliana, coloracao],
  ];
  for (let dayAgo = 1; dayAgo <= 25; dayAgo++) {
    const [profA, svcA] = rotation[dayAgo % rotation.length];
    const [profB, svcB] = rotation[(dayAgo + 2) % rotation.length];
    const clientA = clients[dayAgo % clients.length];
    const clientB = clients[(dayAgo + 3) % clients.length];
    // 1 cancelamento a cada 6 dias; o resto concluído.
    const statusA =
      dayAgo % 6 === 0
        ? AppointmentStatus.CANCELLED
        : AppointmentStatus.COMPLETED;
    rows.push([profA, svcA, clientA, -dayAgo, 10, 0, statusA]);
    if (profB !== profA) {
      rows.push([
        profB,
        svcB,
        clientB,
        -dayAgo,
        15,
        0,
        AppointmentStatus.COMPLETED,
      ]);
    }
  }

  for (const [prof, svc, client, offset, hour, minute, status] of rows) {
    const startAt = spDateTime(offset, hour, minute);
    await prisma.appointment.create({
      data: {
        organizationId: organization.id,
        clientId: client.id,
        professionalId: prof.id,
        serviceId: svc.id,
        startAt,
        endAt: addMinutes(startAt, svc.durationMin),
        status,
      },
    });
  }

  console.log("Seed SaaS concluído!");
  console.log(
    `Clientes: ${clients.length} | Profissionais: ${professionals.length} | Serviços: ${services.length} | Agendamentos: ${rows.length}`,
  );
  console.log(`Platform Admin: ${platformEmail} / ${platformPassword}`);
  console.log(`Demo Super Admin: ${demoEmail} / ${demoPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
