import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AccountType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";
import { getOrganizationBySlug } from "@/lib/queries/public-booking";
import { getCustomerAppointments } from "@/lib/queries/customer-appointments";
import { CustomerAppointmentsList } from "@/components/booking/customer-appointments-list";
import { PublicBookingLayout } from "@/components/booking/public-booking-layout";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MeusAgendamentosPage({ params }: PageProps) {
  const { slug } = await params;

  if (isReservedSlug(slug)) {
    notFound();
  }

  const session = await auth();
  if (!session?.user || session.user.accountType !== AccountType.CUSTOMER) {
    redirect(`/api/auth/signin/google?callbackUrl=/${slug}/meus-agendamentos`);
  }

  const organization = await getOrganizationBySlug(slug);
  if (!organization) {
    notFound();
  }

  const appointments = await getCustomerAppointments(
    organization.id,
    session.user.id,
  );

  return (
    <PublicBookingLayout slug={slug} organizationName={organization.name}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Meus agendamentos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{organization.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${slug}`}>Novo agendamento</Link>
        </Button>
      </div>
      <CustomerAppointmentsList slug={slug} appointments={appointments} />
    </PublicBookingLayout>
  );
}
