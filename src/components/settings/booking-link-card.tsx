import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BookingLinkCardProps = {
  slug: string;
};

export function BookingLinkCard({ slug }: BookingLinkCardProps) {
  const path = `/${slug}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const fullUrl = `${baseUrl}${path}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Link de agendamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-slate-600">
          Compartilhe este link para seus clientes agendarem online:
        </p>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-all rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-100"
        >
          {fullUrl}
        </a>
      </CardContent>
    </Card>
  );
}
