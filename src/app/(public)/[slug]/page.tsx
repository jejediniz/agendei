import { notFound } from "next/navigation";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";
import {
  getOrganizationBySlug,
  isBookingOpen,
} from "@/lib/queries/public-booking";
import { getCustomerSession } from "@/lib/tenant/customer-context";
import { getServices } from "@/lib/queries/services";
import { getProfessionals } from "@/lib/queries/professionals";
import { PublicBookingWizard } from "@/components/booking/public-booking-wizard";
import { BookingUnavailable } from "@/components/booking/booking-unavailable";
import { PublicBookingLayout } from "@/components/booking/public-booking-layout";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicBookingPage({ params }: PageProps) {
  const { slug } = await params;

  if (isReservedSlug(slug)) {
    notFound();
  }

  const organization = await getOrganizationBySlug(slug);
  if (!organization) {
    notFound();
  }

  if (!isBookingOpen(organization.subscriptionStatus)) {
    return (
      <PublicBookingLayout slug={slug} organizationName={organization.name}>
        <BookingUnavailable organization={organization} reason="subscription" />
      </PublicBookingLayout>
    );
  }

  const [services, professionals, customerSession] = await Promise.all([
    getServices(organization.id, true),
    getProfessionals(organization.id, true),
    getCustomerSession(),
  ]);

  if (services.length === 0 || professionals.length === 0) {
    return (
      <PublicBookingLayout slug={slug} organizationName={organization.name}>
        <BookingUnavailable organization={organization} reason="no-data" />
      </PublicBookingLayout>
    );
  }

  return (
    <PublicBookingLayout slug={slug} organizationName={organization.name}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Agendar com {organization.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o serviço, profissional e horário de sua preferência.
        </p>
      </div>
      <PublicBookingWizard
        organization={organization}
        services={services}
        professionals={professionals}
        customerSession={customerSession}
      />
    </PublicBookingLayout>
  );
}
