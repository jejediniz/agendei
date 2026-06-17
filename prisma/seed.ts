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
import { addDays, addMinutes, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const platformEmail = process.env.PLATFORM_ADMIN_EMAIL ?? "platform@agendei.com";
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

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: "Ana Silva",
        phone: "(11) 98765-4321",
        email: "ana.silva@email.com",
      },
    }),
    prisma.client.create({
      data: {
        organizationId: organization.id,
        name: "Carlos Oliveira",
        phone: "(11) 97654-3210",
        email: "carlos@email.com",
      },
    }),
  ]);

  const professionals = await Promise.all([
    prisma.professional.create({
      data: {
        organizationId: organization.id,
        name: "Juliana Santos",
        specialty: "Cabeleireira",
      },
    }),
    prisma.professional.create({
      data: {
        organizationId: organization.id,
        name: "Roberto Lima",
        specialty: "Barbeiro",
      },
    }),
  ]);

  const services = await Promise.all([
    prisma.service.create({
      data: {
        organizationId: organization.id,
        name: "Corte feminino",
        durationMin: 60,
        price: 80,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: organization.id,
        name: "Corte masculino",
        durationMin: 30,
        price: 45,
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
  const apt1 = setMinutes(setHours(tomorrow, 10), 0);

  await prisma.appointment.create({
    data: {
      organizationId: organization.id,
      clientId: clients[0].id,
      professionalId: professionals[0].id,
      serviceId: services[0].id,
      startAt: apt1,
      endAt: addMinutes(apt1, 60),
      status: AppointmentStatus.CONFIRMED,
    },
  });

  console.log("Seed SaaS concluído!");
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
