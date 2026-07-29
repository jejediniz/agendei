import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/tenant/context";
import { getAllOrganizations } from "@/lib/queries/organizations";
import { formatDate } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "danger"> = {
  TRIAL: "warning",
  ACTIVE: "success",
  PAST_DUE: "danger",
  CANCELLED: "secondary",
  EXPIRED: "secondary",
};

export default async function PlatformPage() {
  await requirePlatformAdmin();
  const organizations = await getAllOrganizations();

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Admin</h1>
          <p className="text-sm text-muted-foreground">
            {organizations.length} estabelecimento(s) cadastrado(s)
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Negócio</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Super Admin</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Criado em</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => {
                const admin = org.members[0]?.user;
                return (
                  <tr key={org.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-medium">{org.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{org.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[org.subscriptionStatus] ?? "secondary"}>
                        {org.subscriptionStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {admin?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(org.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/platform/${org.id}`}>Detalhes</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
