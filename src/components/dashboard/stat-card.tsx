import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
};

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-display text-2xl font-bold text-foreground">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground/70">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
